<template>
  <div class="drawer-box">
    <Drawer
      title={drawerTitle}
      wrapClassName="drawer-box"
      placement="right"
      :closable="true"
      :visible="drawerVisible"
      :afterVisibleChange="afterVisibleChange"
      @close="onClose"
      width={900}
    >
      <Row :gutter="[0, 16]">
        <Col :span="24">
          <InputSearch
            class="search-btn"
            v-model:value={searchText}
            :placeholder={searchPlaceholder}
            ref="searchInput"
            @search="searchList"
            enter-button
          />
        </Col>
      </Row>
      <Row :gutter="[0, 16]">
        <Col :span="24">
          <Table
            rowKey="id"
            :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
            class="search-table-list"
            :columns="searchCloums"
            :scroll="{ x: 500, y: 500 }"
            :data-source="searchBackData"
            :rowClassName="rowClassName"
            bordered
            :pagination="pagination"
          >
            <template #businessType="{ text, record }">
              {{ handleBusinessType(record) }}
            </template>
            <template #sourceVoucherType="{ text }">
              {{ conversionOrderName(text) }}
            </template>
          </Table>
        </Col>
        <Col :span="24" v-show="searchDetailsHover.length > 0">
          <Table
            rowKey="id"
            :row-selection="{ selectedRowKeysDetail, onChange: onSelectChangeDetail }"
            class="search-table-list"
            :columns="searchCloumsDetails"
            :scroll="{ x: 500, y: 500 }"
            :data-source="searchBackDataDetails"
            bordered
            :pagination="false"
          >
            <template #sourceVoucherType="{ text }">
              {{ conversionOrderName(text) }}
            </template>
          </Table>
        </Col>
      </Row>
      <div
        :style="{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }"
      >
        <Button type="primary" @click="onSubmit">
          确定
        </Button>
      </div>
    </Drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Drawer, Row, Col, InputSearch, Table, Button, message } from 'ant-design-vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

// 类型定义
interface RecordType {
  id: string;
  voucherCode: string;
  voucherDate: string;
  detailList: Array<{ id: string; baseQuantity: number; [key: string]: any }>;
  [key: string]: any;
}

interface DetailRecordType {
  id: string;
  [key: string]: any;
}

// 国际化
const { t } = useI18n();
const store = useStore();
const route = useRoute();
const messageApi = message.useMessage();

// Props
const props = defineProps<{
  unitData: Record<string, any>;
  unitsDataDetails: Record<string, any>;
  businessType: number;
  parentSourceCode: string;
  productionPlanToSalesOrder: boolean;
}>();

// Emit
const emit = defineEmits<{
  (e: 'editClickOrder', record: RecordType, flag: string): void;
}>();

// 响应式数据
const searchInput = ref<InputSearchInstance | null>(null);
const selectedRowKeys = ref<string[]>([]);
const selectedRowKeysDetail = ref<string[]>([]);
const sourceCode = ref<string>('');
const drawerVisible = ref<boolean>(false);
const drawerTitle = ref<string>('搜索列表');
const dynamicFormData = ref<Array<Record<string, any>>>([]);
const searchArray = ref<Array<Record<string, any>>>([]);
const searchPlaceholder = ref<string>('');
const searchText = ref<string>('');
const searchCloums = ref<Array<Record<string, any>>>([]);
const searchCloumsDetails = ref<Array<Record<string, any>>>([]);
const searchBackData = ref<Array<RecordType>>([]);
const searchDetailsHover = ref<Array<Record<string, any>>>([]);
const searchBackDataDetails = ref<Array<DetailRecordType>>([]);
const ischoose = ref<boolean>(false);
const voucherState = ref<number | null>(null);
const selectedRowMainKeys = ref<string[] | null>(null);
const selectedRowMainData = ref<RecordType | null>(null);
const selectedRowDetailsKeys = ref<string[] | null>(null);
const selectedRowDetailsData = ref<Array<DetailRecordType> | null>(null);
const mouseIndex = ref<number | null>(null);
const selectedRowKeysDetailList = ref<Array<string[]>>([]);

// 分页数据
const pagination = reactive<{
  size: string;
  defaultPageSize: number;
  current: number;
  pageSize: number;
  total: number;
  showTotal: (total: number) => JSX.Element;
  onChange: (page: number, pageSize: number) => void;
  showQuickJumper: boolean;
  showLessItems: boolean;
  choiceBusinessType: number | null;
}>({
  size: 'small',
  defaultPageSize: 10,
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => (
    <div>
      共 {total} 条数据，每页
      <Input
        style={{ height: '22px !important', width: '3.2rem' }}
        value={pagination.pageSize}
        min={1}
        max={10}
        size='small'
        step={1}
        onPressEnter={(e) => changePageSize(e)}
      />
      条
    </div>
  ),
  onChange: (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;

    boxPostData.page = {
      current: pagination.current,
      size: pagination.pageSize,
    };

    Object.assign(postData, boxPostData);
    searchList();
  },
  showQuickJumper: true,
  showLessItems: true,
  choiceBusinessType: null,
});

// 选单默认参数
const boxPostData = reactive<{
  designSearchDtos: Array<Record<string, any>>;
  page: {
    current: number;
    size: number;
  };
  businessType: number;
  someBusinessType: string;
  startVoucherState: number;
  endVoucherState: number;
}>({
  designSearchDtos: [],
  page: {
    current: 1,
    size: 10,
  },
  businessType: 2, // 1:退货业务 2：非退货业务 3: 退货 + 非退货 4: 发票
  someBusinessType: '0', // 指定业务类型 默认 0
  startVoucherState: 0,
  endVoucherState: 10,
});

const postData = reactive<Record<string, any>>({});

// 方法
const afterVisibleChange = (visible: boolean) => {
  // 可在这里添加 visible 变化后的逻辑
};

const onClose = () => {
  drawerVisible.value = false;
};

const searchList = () => {
  // 搜索列表的实现
  // 这里需要调用 API 获取数据
  // 示例代码，实际需根据项目 API 调整
  /*
  listSearch(postData)
    .then((res) => {
      searchBackData.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    })
    .catch((error) => {
      messageApi.error('搜索失败');
      console.error('搜索失败:', error);
    });
  */
};

const onSelectChange = (selectedRowKeys: string[]) => {
  selectedRowKeys.value = selectedRowKeys;
};

const onSelectChangeDetail = (selectedRowKeysDetail: string[]) => {
  selectedRowKeysDetail.value = selectedRowKeysDetail;
};

const rowClassName = (record: RecordType, index: number) => {
  // 行样式逻辑
  return '';
};

const handleBusinessType = (record: RecordType) => {
  // 处理业务类型显示
  return '';
};

const conversionOrderName = (text: string) => {
  // 转换订单名称
  return '';
};

const showDetailes = (detaileList: Array<DetailRecordType>) => {
  searchBackDataDetails.value = detaileList;
};

const changePageSize = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const pageSize = parseInt(input.value, 10);
  if (!isNaN(pageSize) && pageSize > 0 && pageSize <= 10) {
    pagination.pageSize = pageSize;
    pagination.current = 1;

    boxPostData.page = {
      current: pagination.current,
      size: pagination.pageSize,
    };

    Object.assign(postData, boxPostData);
    searchList();
  } else {
    messageApi.warning('请输入1-10之间的页码');
    input.value = pagination.pageSize.toString();
  }
};

const onSubmit = () => {
  // 提交逻辑
  if (selectedRowKeys.value.length === 0) {
    messageApi.warning('请选择数据');
    return;
  }

  // 查找选中的记录
  const selectedRecord = searchBackData.value.find(
    (item) => item.id === selectedRowKeys.value[0]
  );

  if (selectedRecord) {
    // 深拷贝记录
    const record = { ...selectedRecord };

    // 处理记录数据
    record.sourceVoucherId = record.id;
    record.sourceVoucherCode = record.voucherCode;
    record.sourceVoucherDate = record.voucherDate;
    record.sourceVoucherType = sourceCode.value;

    if (route.path === '/production/productionPlan') {
      record.saleOrderId = record.id;
      record.saleOrderCode = record.voucherCode;
    }

    // 处理明细数据
    if (record.detailList && record.detailList.length > 0) {
      record.detailList = record.detailList.map((item) => {
        const newItem = { ...item };

        if (route.path === '/production/productionPlan') {
          newItem.saleOrderDetailId = newItem.id;
          newItem.needDate = newItem.deliveryDate;
          newItem.planEndDate = newItem.deliveryDate;
          newItem.crmName = record.crmName;
        }

        newItem.sourceVoucherId = record.id;
        newItem.sourceVoucherCode = record.voucherCode;
        newItem.sourceVoucherDate = record.voucherDate;
        newItem.sourceVoucherType = record.sourceVoucherType;

        const { businessType } = postData;
        if (businessType === 1) {
          newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumRetQuantity || 0);
        } else if (businessType === 2) {
          newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumExecuteQuantity || 0);
        } else if (businessType === 4) {
          newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumInvoiceQuantity || 0);
        } else if (businessType === 6) {
          newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumQualityCheckQuantity || 0);
        }

        newItem.orgBaseQuantity = newItem.baseQuantity;

        // 计算各种数量
        if (businessType === 2 || businessType === 4) {
          if (newItem.unitExchangeRate) {
            newItem.subQuantity = (Number(newItem.baseQuantity) / Number(newItem.unitExchangeRate)).toFixed(4);
          }

          if (newItem.estimatedPrice) {
            newItem.estimatedAmount = (newItem.baseQuantity * newItem.estimatedPrice).toFixed(2);
          } else if (newItem.estimatedAmount) {
            newItem.estimatedPrice = (newItem.estimatedAmount / newItem.baseQuantity).toFixed(2);
          }

          if (newItem.baseQuantity && newItem.price && newItem.taxRate) {
            const tax = Number(newItem.baseQuantity) * Number(newItem.price) * Number(newItem.taxRate) / 100;
            newItem.tax = tax.toFixed(4);
          }

          if (newItem.baseQuantity && newItem.price) {
            newItem.amount = (newItem.baseQuantity * newItem.price).toFixed(2);
          }

          if (newItem.baseQuantity && newItem.includeTaxPrice) {
            newItem.includeTaxAmount = (newItem.baseQuantity * newItem.includeTaxPrice).toFixed(2);
          }
        }

        return newItem;
      });
    }

    emit('editClickOrder', record, 'ischoose');
    drawerVisible.value = false;
  }
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 路由变化时的处理
  }
);

// 自定义行点击事件
const customClick = (record: RecordType, index: number) => ({
  on: {
    mouseenter: (event: MouseEvent) => {
      if (route.path !== '/production/productionPlan') {
        event.preventDefault();
        mouseIndex.value = index;
        searchDetailsHover.value = [record];
        const detaileList = record.detailList.map((item) => ({ ...item }));
        showDetailes(detaileList);
      }
    },
    click: (event: MouseEvent) => {
      event.preventDefault();
      const recordCopy = { ...record };

      drawerVisible.value = false;

      recordCopy.sourceVoucherId = recordCopy.id;
      recordCopy.sourceVoucherCode = recordCopy.voucherCode;
      recordCopy.sourceVoucherDate = recordCopy.voucherDate;
      recordCopy.sourceVoucherType = sourceCode.value;

      if (route.path === '/production/productionPlan') {
        recordCopy.saleOrderId = recordCopy.id;
        recordCopy.saleOrderCode = recordCopy.voucherCode;
      }

      if (recordCopy.detailList && recordCopy.detailList.length > 0) {
        recordCopy.detailList = recordCopy.detailList.map((item) => {
          const newItem = { ...item };

          if (route.path === '/production/productionPlan') {
            newItem.saleOrderDetailId = newItem.id;
            newItem.needDate = newItem.deliveryDate;
            newItem.planEndDate = newItem.deliveryDate;
            newItem.crmName = recordCopy.crmName;
          }

          newItem.sourceVoucherId = recordCopy.id;
          newItem.sourceVoucherCode = recordCopy.voucherCode;
          newItem.sourceVoucherDate = recordCopy.voucherDate;
          newItem.sourceVoucherType = recordCopy.sourceVoucherType;

          const { businessType } = postData;
          if (businessType === 1) {
            newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumRetQuantity || 0);
          } else if (businessType === 2) {
            newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumExecuteQuantity || 0);
          } else if (businessType === 4) {
            newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumInvoiceQuantity || 0);
          } else if (businessType === 6) {
            newItem.baseQuantity = Math.abs(newItem.baseQuantity) - (newItem.cumQualityCheckQuantity || 0);
          }

          newItem.orgBaseQuantity = newItem.baseQuantity;

          if (businessType === 2 || businessType === 4) {
            if (newItem.unitExchangeRate) {
              newItem.subQuantity = (Number(newItem.baseQuantity) / Number(newItem.unitExchangeRate)).toFixed(4);
            }

            if (newItem.estimatedPrice) {
              newItem.estimatedAmount = (newItem.baseQuantity * newItem.estimatedPrice).toFixed(2);
            } else if (newItem.estimatedAmount) {
              newItem.estimatedPrice = (newItem.estimatedAmount / newItem.baseQuantity).toFixed(2);
            }

            if (newItem.baseQuantity && newItem.price && newItem.taxRate) {
              const tax = Number(newItem.baseQuantity) * Number(newItem.price) * Number(newItem.taxRate) / 100;
              newItem.tax = tax.toFixed(4);
            }

            if (newItem.baseQuantity && newItem.price) {
              newItem.amount = (newItem.baseQuantity * newItem.price).toFixed(2);
            }

            if (newItem.baseQuantity && newItem.includeTaxPrice) {
              newItem.includeTaxAmount = (newItem.baseQuantity * newItem.includeTaxPrice).toFixed(2);
            }
          }

          return newItem;
        });
      }

      emit('editClickOrder', recordCopy, 'ischoose');
    },
  },
});

// 使用计算属性获取发票数据
const invoiceData = computed(() => {
  return store.state.order.invoiceData;
});

// 初始化
onMounted(() => {
  Object.assign(postData, boxPostData);
});
</script>

<style lang="less">
.drawer-box {
  .search-btn {
    margin-bottom: 16px;
  }

  .search-table-list {
    margin-bottom: 16px;
  }
}
</style>