<template>
  <div class="drawer-box">
    <BasicDrawer
      :title="drawerTitle"
      placement="right"
      :closable="true"
      :visible="drawerVisible"
      :width="900"
      @close="handleClose"
    >
      <template #content>
        <div class="drawer-content">
          <div class="search-container">
            <InputSearch
              v-model:value="searchText"
              :placeholder="searchPlaceholder"
              @search="handleSearch"
              enterButton
              class="search-btn"
            />
          </div>

          <div class="table-container">
            <BasicTable
              :columns="searchColumns"
              :data-source="searchBackData"
              :pagination="paginationConfig"
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelectChange }"
              row-key="id"
              bordered
              class="search-table-list"
            >
              <template #businessType="{ record }">
                {{ handleBusinessType(record) }}
              </template>
              <template #sourceVoucherType="{ text }">
                {{ conversionOrderName(text) }}
              </template>
            </BasicTable>

            <BasicTable
              v-show="searchDetailsHover"
              :columns="searchColumnsDetails"
              :data-source="searchBackDataDetails"
              bordered
              :pagination="false"
              :row-selection="{ selectedRowKeys: selectedRowKeysDetail, onChange: handleSelectChangeDetail, getCheckboxProps: () => ({ disabled: true }) }"
              row-key="id"
              class="search-table-list"
            >
              <template #sourceVoucherType="{ text }">
                {{ conversionOrderName(text) }}
              </template>
            </BasicTable>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="drawer-footer">
          <Button type="primary" @click="handleSubmit">确定</Button>
        </div>
      </template>
    </BasicDrawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { BasicDrawer, BasicTable, Button, InputSearch } from '/@/components/index';
import { list as listDesign } from '@/api/erp/voucherDesign';
import { list as listSearch } from '@/api/purchase/voucherDesign';
import { deepCopy } from '@/utils/tool/object';
import { IdFieldToNameField } from '@/utils/customize';
import { conversionOrderName } from '@/utils/tool/parametric-switch';
import { deleteMainCommonFild } from '@/utils/voucherUtils';
import { useRouter } from 'vue-router';
import { useMessage } from '/@/hooks/web/useMessage';

// Props
const props = defineProps({
  unitData: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  unitsDataDetails: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  businessType: {
    type: Number,
  },
  parentSourceCode: {
    type: String,
  },
  productionPlanToSalesOrder: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['editClickOrder']);

// Router
const router = useRouter();

// Message
const message = useMessage();

// State
const drawerVisible = ref(false);
const drawerTitle = ref('搜索列表');
const sourceCode = ref('');
const searchText = ref('');
const searchPlaceholder = ref('');
const searchArray = ref<Record<string, any>[]>([]);
const dynamicFormData = ref<Record<string, any>[]>([]);
const searchBackData = ref<Record<string, any>[]>([]);
const searchBackDataDetails = ref<Record<string, any>[]>([]);
const searchDetailsHover = ref(false);
const selectedRowKeys = ref<string[]>([]);
const selectedRowKeysDetail = ref<string[]>([]);
const selectedRowKeysDetailList = ref<Record<string, any>[]>([]);
const ischoose = ref(false);
const voucherState = ref<number | null>(null);
const choiceBusinessType = ref<number | null>(null);
const mouseIndex = ref<number | null>(null);
const bhaos = ref<Record<string, any>[]>([]);
const newArrListBh = ref<string[]>([]);

// Pagination
const paginationConfig = reactive<Partial<PaginationProps>>({
  current: 1,
  pageSize: 10,
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  onChange: (current, pageSize) => {
    paginationConfig.current = current;
    paginationConfig.pageSize = pageSize;
    handleSearch();
  },
  onShowSizeChange: (current, pageSize) => {
    paginationConfig.current = current;
    paginationConfig.pageSize = pageSize;
    handleSearch();
  },
});

// Box post data
const boxPostData = reactive<Record<string, any>>({
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

// Watch selectedRowKeysDetail
watch(selectedRowKeysDetail, (val) => {
  const arr = val.map((item) => {
    return searchBackDataDetails.value.find((item1) => item1.id === item);
  }).filter(Boolean);
  selectedRowKeysDetailList.value = arr as Record<string, any>[];
});

// Methods
function handleClose() {
  drawerVisible.value = false;
}

function handleSubmit() {
  const record: Record<string, any> = { detailList: selectedRowKeysDetailList.value };
  const list: Record<string, any>[] = [];

  bhaos.value.forEach((element) => {
    element.detailList.forEach((ele: Record<string, any>) => {
      ele.sourceVoucherId = element.id;
      ele.crmId = element.crmId;
      ele.crmName = element.crmName;
      list.push(ele);
    });
  });

  list.forEach((ele) => {
    record.detailList.forEach((element: Record<string, any>) => {
      element.crmName = ele.crmName;
      element.crmId = ele.crmId;
    });
  });

  drawerVisible.value = false;

  for (let i = 0; i < record.detailList.length; i++) {
    const item = record.detailList[i];

    if (router.currentRoute.value.path === '/production/productionPlan') {
      item.sourceVoucherId = list[i].sourceVoucherId;
      item.sourceVoucherCode = list[i].voucherCode;
      item.sourceVoucherType = 'SaleOrder';
      item.saleOrderDetailId = item.id;
      item.sourceDetailId = item.id;
      item.needDate = item.deliveryDate;
      item.planEndDate = item.deliveryDate;
      item.orderId = '';
      item.id = '';
    }

    item.sourceVoucherDate = record.voucherDate;

    const { businessType } = postData;

    if (businessType === 1) {
      item.baseQuantity = Math.abs(item.baseQuantity) - (item.cumRetQuantity || 0);
    } else if (router.currentRoute.value.path !== '/production/productionPlan') {
      if (businessType === 2) {
        item.baseQuantity = Math.abs(item.baseQuantity) - (item.cumExecuteQuantity || 0);
      } else if (businessType === 4) {
        item.baseQuantity = Math.abs(item.baseQuantity) - (item.cumInvoiceQuantity || 0);
      } else if (businessType === 6) {
        item.baseQuantity = Math.abs(item.baseQuantity) - (item.cumQualityCheckQuantity || 0);
      }
    }

    item.orgBaseQuantity = item.baseQuantity;

    if (businessType === 2 || businessType === 4) {
      if (item.unitExchangeRate) {
        const total = Number(item.baseQuantity) / Number(item.unitExchangeRate);
        item.subQuantity = total.toFixed(4);
      }

      if (item.estimatedPrice) {
        item.estimatedAmount = (item.baseQuantity * item.estimatedPrice).toFixed(2);
      } else if (item.estimatedAmount) {
        item.estimatedPrice = (item.estimatedAmount / item.baseQuantity).toFixed(2);
      }

      if (item.baseQuantity && item.price && item.taxRate) {
        const tax = (Number(item.baseQuantity) * Number(item.price) * Number(item.taxRate)) / 100;
        item.tax = tax.toFixed(4);
      }

      if (item.baseQuantity && item.price) {
        const total = Number(item.baseQuantity) * Number(item.price);
        item.amount = total.toFixed(2);
      }

      if (item.baseQuantity && item.includeTaxPrice) {
        const total = Number(item.baseQuantity) * Number(item.includeTaxPrice);
        item.includeTaxAmount = total.toFixed(2);
      }
    }
  }

  emit('editClickOrder', record, 'ischoose');
}

function handleSelectChange(selectedRowKeysVal: string[], selectedRows: Record<string, any>[]) {
  selectedRowKeys.value = selectedRowKeysVal;
  bhaos.value = selectedRows;

  const arr: string[] = [];
  searchBackDataDetails.value.forEach((i) => {
    selectedRowKeysVal.forEach((j) => {
      if (i.orderId === j) {
        arr.push(i.id);
      }
    });
  });
  selectedRowKeysDetail.value = arr;

  const newArrListBhVal: string[] = [];
  selectedRows.map((item) => {
    newArrListBhVal.push(item.voucherCode);
    item.detailList.forEach((ele: Record<string, any>) => {
      ele.voucherCode = item.voucherCode;
    });
  });

  newArrListBh.value = newArrListBhVal;
}

function handleSelectChangeDetail(selectedRowKeysVal: string[]) {
  selectedRowKeysDetail.value = selectedRowKeysVal;
}

function handleSearch() {
  const data = { ...postData };

  for (let i = 0; i < searchArray.value.length; i++) {
    searchArray.value[i].value = searchText.value;
  }

  data.designSearchDtos = [];
  for (let i = 0; i < dynamicFormData.value.length; i++) {
    let found = false;
    for (let j = 0; j < searchArray.value.length; j++) {
      if (dynamicFormData.value[i].code === searchArray.value[j].code) {
        data.designSearchDtos.push(searchArray.value[j]);
        found = true;
        break;
      }
    }
    if (!found) {
      data.designSearchDtos.push(dynamicFormData.value[i]);
    }
  }

  listSearch(data).then((response) => {
    if (response.code === 200) {
      const backdData = response.data.records;
      paginationConfig.total = response.data.total;
      searchBackData.value = backdData;

      if (router.currentRoute.value.path === '/production/productionPlan') {
        const detaileList: Record<string, any>[] = [];
        searchBackData.value.forEach((record) => {
          // 处理各种状态显示
          if (record.outboundStatus === 1) {
            record.outboundStatusId = record.outboundStatus;
            record.outboundStatus = '未发货';
          } else if (record.outboundStatus === 2) {
            record.outboundStatusId = record.outboundStatus;
            record.outboundStatus = '部分发货';
          } else if (record.outboundStatus === 3) {
            record.outboundStatusId = record.outboundStatus;
            record.outboundStatus = '全部发货';
          }

          if (record.paymentStatus === 1) {
            record.paymentStatusId = record.paymentStatus;
            record.paymentStatus = '未收款';
          } else if (record.paymentStatus === 2) {
            record.paymentStatusId = record.paymentStatus;
            record.paymentStatus = '部分收款';
          } else if (record.paymentStatus === 3) {
            record.paymentStatusId = record.paymentStatus;
            record.paymentStatus = '全部收款';
          }

          if (record.executionStatus === 1) {
            record.executionStatusId = record.executionStatus;
            record.executionStatus = '未执行';
          } else if (record.executionStatus === 2) {
            record.executionStatusId = record.executionStatus;
            record.executionStatus = '已计划';
          } else if (record.executionStatus === 3) {
            record.executionStatusId = record.executionStatus;
            record.executionStatus = '生产中';
          } else if (record.executionStatus === 4) {
            record.executionStatusId = record.executionStatus;
            record.executionStatus = '已完工';
          }

          if (record.releaseState === 1) {
            record.releaseStateId = record.releaseState;
            record.releaseState = '未生单';
          } else if (record.releaseState === 2) {
            record.releaseStateId = record.releaseState;
            record.releaseState = '已生单';
          }

          if (record.closedState === 0) {
            record.closedStateId = record.closedState;
            record.closedState = '关闭';
          } else if (record.closedState === 1) {
            record.closedStateId = record.closedState;
            record.closedState = '打开';
          }

          if (record.voucherState === 0) {
            record.closedStateId = record.voucherState;
            record.voucherState = '待审核';
          } else if (record.voucherState === 1) {
            record.closedStateId = record.voucherState;
            record.voucherState = '已审核';
          }

          record.detailList.forEach((item) => {
            const item1 = { ...item };
            detaileList.push(item1);
          });
        });
        searchBackDataDetails.value = showDetailes(detaileList);
      } else {
        searchBackDataDetails.value = [];
        mouseIndex.value = null;
      }
    }
  });
}

function handleDynamicData() {
  const data = { source: sourceCode.value };

  listDesign(data).then((response) => {
    if (response.code === 200) {
      dynamicFormData.value = response.data;

      if (dynamicFormData.value.length > 0) {
        handleSearchColumns();
        handleSearchArray();
      }

      if (searchColumnsDetails.value.length > 0) {
        handleSearch();
      }
    } else {
      message.error('获取动态表单数据失败');
    }
  });
}

function handleSearchArray() {
  const data: Record<string, any>[] = [];
  for (let i = 0; i < dynamicFormData.value.length; i++) {
    const item = dynamicFormData.value[i];
    if (
      (item.dataTab === '表头' || item.dataTab === '表尾') &&
      item.isSearch &&
      item.columnType === '文本'
    ) {
      data.push(item);
    }
  }

  if (data.length > 0) {
    searchPlaceholder.value = data.map((o) => o.name).join('/');
    searchArray.value = [...data];
  } else {
    message.error('没有可以搜索的条件');
  }
}

// 动态生成表格列
const searchColumns = ref<TableColumnProps[]>([]);
const searchColumnsDetails = ref<TableColumnProps[]>([]);

function handleSearchColumns() {
  const dynamicFormAllData = dynamicFormData.value.filter((item) => {
    return (item.dataTab === '表头' || item.dataTab === '表尾') && item.onOff === true;
  });

  const dynamicFormAllDataDetails = dynamicFormData.value.filter((item) => {
    return item.dataTab === '明细' && item.onOff === true;
  });

  // 表头列
  const columns: TableColumnProps[] = [];
  dynamicFormAllData.forEach((element) => {
    let code = element.code;
    if (element.columnType === '搜索选择') {
      code = IdFieldToNameField(element.code);
    }

    const item: TableColumnProps = {
      title: element.name,
      dataIndex: code,
      width: 130,
      ellipsis: true,
    };

    if (element.code === 'businessType') {
      item.slots = { customRender: 'businessType' };
    } else if (element.code === 'sourceVoucherType') {
      item.slots = { customRender: 'sourceVoucherType' };
    }

    columns.push(item);
  });

  searchColumns.value = columns;

  // 明细列
  const detailColumns: TableColumnProps[] = [];
  dynamicFormAllDataDetails.forEach((element) => {
    let code = element.code;
    if (element.columnType === '搜索选择') {
      code = IdFieldToNameField(element.code);
    }

    const item: TableColumnProps = {
      title: element.name,
      dataIndex: code,
      width: 100,
      ellipsis: true,
    };

    if (element.code === 'sourceVoucherType') {
      item.slots = { customRender: 'sourceVoucherType' };
    }

    detailColumns.push(item);
  });

  searchColumnsDetails.value = detailColumns;
}

function showDetailes(itemdata: Record<string, any>[]) {
  const { unitsDataDetails, unitData } = props;
  const list = [...itemdata];

  for (let i = 0; i < list.length; i++) {
    // 处理单位转换
    for (const key in unitsDataDetails) {
      const unit = unitsDataDetails[key];
      if (list[i].baseUnit === unit.id) {
        list[i].baseUnit = unit.name;
      }

      if (list[i].subUnit === unit.id) {
        list[i].subUnit = unit.name;
      }
    }

    for (const key in unitData) {
      const unit = unitData[key];
      if (list[i].baseUnit === unit.id) {
        list[i].baseUnit = unit.name;
      }
    }
  }

  return list;
}

function handleBusinessType(record: Record<string, any>) {
  let back = '';
  dynamicFormData.value.forEach((item) => {
    if (item.code === 'businessType') {
      const val = JSON.parse(item.val);
      const a = val.filter((c: Record<string, any>) => c.key === record.businessType);
      if (a.length > 0) {
        back = a[0].label;
      }
    }
  });
  return back;
}

// 打开抽屉
function openDrawer(sourceCodeVal: string, ischooseVal: boolean, title?: string, voucherStateVal?: number, businessTypeVal?: number) {
  ischoose.value = ischooseVal;
  drawerTitle.value = title || '搜索列表';
  voucherState.value = voucherStateVal || null;
  choiceBusinessType.value = businessTypeVal || null;
  sourceCode.value = sourceCodeVal;

  handleDynamicData();

  drawerVisible.value = true;

  nextTick(() => {
    // 聚焦搜索框
  });
}

// 打开抽屉(带参数)
function openDrawerWithParams(boxPostDataVal: Record<string, any>) {
  selectedRowKeys.value = [];
  newArrListBh.value = [];
  selectedRowKeysDetail.value = [];
  bhaos.value = [];

  Object.keys(postData).forEach((key) => delete postData[key]);
  boxPostDataVal.page = {
    current: paginationConfig.current,
    size: paginationConfig.pageSize,
  };

  Object.assign(boxPostData, boxPostDataVal);
  Object.assign(postData, boxPostData);

  const { sourceCode: sourceCodeVal, title } = boxPostDataVal;
  sourceCode.value = sourceCodeVal;
  drawerTitle.value = title || '搜索列表';

  handleDynamicData();
  drawerVisible.value = true;

  nextTick(() => {
    // 聚焦搜索框
  });
}

// 暴露方法
defineExpose({
  openDrawer,
  openDrawerWithParams,
  handleClose,
});
</script>

<style lang="less" scoped>
.drawer-box {
  .search-btn {
    margin-top: 10px;
  }

  .search-table-list {
    .ant-table-body {
      min-height: 120px !important;
      cursor: pointer;
    }
  }

  .drawer-content {
    padding-bottom: 80px;
  }

  .table-container {
    margin-top: 16px;
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px 16px;
    border-top: 1px solid #e8e8e8;
  }
}
</style>