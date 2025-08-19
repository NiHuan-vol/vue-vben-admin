<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮 -->
      <div class="btn-wrapper flex flex-wrap gap-2 mb-4">
        <Dropdown placement="bottomRight">
          <Button type="primary" icon={<FileAddOutlined />}>新增</Button>
          <template #overlay>
            <Menu>
              <MenuItem key="0" @click="handleNewForecast">
                <span>新增采购入库单</span>
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>

        <Dropdown placement="bottomRight" v-if="voucherState === 1">
          <Button type="primary" icon={<SnippetsOutlined />}>生单</Button>
          <template #overlay>
            <Menu>
              <MenuItem key="0" @click="generateBills('PurchaseInvoice')">
                <span>生成采购发票</span>
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>

        <Button v-if="showModel === 'order' && !editMask" type="primary" @click="handleSubmit">保存</Button>
        <Button v-if="showModel === 'order' && voucherState === 0" type="success" @click="handleSubmitOrder(0)">提交</Button>
        <Button v-if="showModel === 'order' && voucherState === -1" type="warning" @click="handleSubmitOrder(-1)">撤回提交</Button>
        <Button v-if="showModel === 'order' && voucherState === 0" type="default" @click="handleAuditClick(1)">审核</Button>
        <Button v-if="showModel === 'order' && voucherState === 1" type="default" @click="handleAuditClick(0)">弃审</Button>
        <Button v-if="showModel === 'order' && editMask" type="danger" @click="handleDelete">删除</Button>
        <Button v-if="showModel === 'order'" type="default" @click="handlePrint">打印</Button>
        <Button v-if="showModel === 'list'" type="default" @click="handleExport">导出</Button>
        <Button v-if="showModel === 'order'" type="default" @click="switchToList">返回列表</Button>
      </div>

      <!-- 加载中 -->
      <Spin v-if="loading" tip="加载中..." />

      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>

        <!-- 列表视图 -->
        <section v-show="showModel === 'list'">
          <DynamicList
            ref="dynamicListRef"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            @switchList="switchToList"
            @dblclick="handleRowDblClick"
            :reportCode="reportCodeList"
          />
        </section>

        <!-- 订单视图 -->
        <section v-show="showModel === 'order'">
          <div class="mb-2">
            <span v-if="voucherState === 0" class="audit-status待审核">待审核</span>
            <span v-if="voucherState === 1" class="audit-status已审核">已审核</span>
            <span v-if="voucherState === 2" class="audit-status已入库">已入库</span>
            <span v-if="voucherState === 10" class="audit-status已关闭">已关闭</span>
          </div>

          <Form :layout="formLayout">
            <div class="header-box mb-4 p-3 bg-gray-50 rounded-md">
              <DynamicForm
                :formData="orderHeaderData"
                @change-time="handleChangeTime"
                @click-item="handleSetValue"
              />
              <div class="edit-mask-header" v-show="editMask"></div>
            </div>

            <div class="table-box mb-4">
              <BasicTable
                ref="detailTableRef"
                :columns="columns"
                :dataSource="dataSource"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                :size="'small'"
                bordered
                @change="handleTableChange"
                :customRow="customRow"
              >
                <template #number="{ index }">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
                <template v-for="col in slotArray" :key="col" :slot="col">
                  <div>
                    <EditableCell
                      :checkType="checkType"
                      :text="dataSource[index][col]"
                      :col="col"
                      :index="index"
                      :record="dataSource[index]"
                      :dataSource="dataSource"
                      :unitsDataDetails="unitsDataDetails"
                      :unitsAssistSelect="unitsAssistSelect"
                      :dynamicAllData="dynamicFormData"
                      :dynamicFormDataMap="dynamicFormDataMap"
                      @choice-add-data="handleChoiceAddData"
                      @change="handleCellChange"
                      @new-add-data="handleAddRow"
                    />
                  </div>
                </template>
              </BasicTable>
              <div class="edit-mask" v-show="editMask"></div>
            </div>

            <div class="footer-box p-3 bg-gray-50 rounded-md">
              <DynamicForm
                :formData="orderFooterData"
                @change-time="handleChangeTime"
                @click-item="handleSetValue"
              />
              <div class="edit-mask-footer" v-show="editMask"></div>
            </div>
          </Form>
        </section>

        <!-- 明细视图 -->
        <section v-show="showModel === 'detail'">
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>

        <!-- 统计视图 -->
        <section v-show="showModel === 'statistical'">
          <DynamicListDetails
            ref="statisticalSearchRef"
            :reportCode="reportCodeStatistical"
            :componentType="2"
            :basePostData="basePostData"
          />
        </section>
      </div>

      <!-- 右键菜单 -->
      <div class="contextmenu-box"></div>

      <DrawerBox
        ref="searchListRef"
        :unitData="unitData"
        :unitsData="unitsData"
        :unitsDataDetails="unitsDataDetails"
        @editClickOrder="handleEditClickOrder"
      />
    </div>

    <!-- 打印模态框 -->
    <PrintModal
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="handleCancelPrint"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { Card, Button, Dropdown, Menu, MenuItem, Spin, Form, Modal, Drawer } from 'ant-design-vue';
import { FileAddOutlined, SnippetsOutlined, PrinterOutlined, ExportOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
import { BasicTable } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { purchaseSave, examine, purchaseDelete, getCode, submitOrder, getList, getDetail } from '/@/api/inventory/inout';
import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
import { formatToThousands } from '/@/utils/numberUtil';
import { proMixin } from '/@/mixins/procurement/pro';
import DynamicForm from '/@/components/DynamicForm/index.vue';
import DynamicList from '/@/components/DynamicList/index.vue';
import DynamicListDetails from '/@/components/DynamicListDetails/index.vue';
import EditableCell from '/@/components/EditableCell/index.vue';
import PrintModal from '/@/components/PrintModal/index.vue';
import DrawerBox from '/@/components/DrawerBox/index.vue';

// 混合mixin
const { initForm, ...mixinMethods } = proMixin();

// 响应式数据
const showModel = ref('list'); // list, order, detail, statistical
const editMask = ref(true);
const loading = ref(false);
const voucherState = ref(-1); // -1: 未提交, 0: 待审核, 1: 已审核, 2: 已入库, 10: 关闭
const orderId = ref('');
const sourceCode = ref('PurchaseReceiveVoucher');
const reportCodeDetail = ref('PurchaseReceiveVoucher_Detail_Report');
const reportCodeStatistical = ref('PurchaseReceiveVoucher_Statistic_Report');
const reportCodeList = ref('PurchaseReceiveVoucher_List_Report');
const voucherTitle = ref('采购入库单');
const receiptNumber = ref('');
const isSaveRun = ref(false);
const printVisible = ref(false);
const incomingPrintData = ref<any>({});
const sourceVoucherData = ref<any>({});
const message = useMessage();
const formLayout = ref('horizontal');
const checkType = ref('is_purchasing');
const receiveDeliverType = ref(1); // 1入，2出
const isHideWherehouse = ref(true); // 隐藏明细当中的仓库和仓库编码
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);
const unitsDataDetails = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<Map<string, any>>(new Map());
const unitsAssistSelect = ref<any[]>([]);
const slotArray = ref<string[]>(['materialCode', 'materialName', 'specification', 'unitName', 'quantity', 'price', 'amount', 'warehouseName']);

// 表格数据
const dataSource = ref<any[]>([]);
const columns = ref<any[]>([
  { title: '序号', dataIndex: 'number', key: 'number', width: 60, slot: 'number' },
  { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode', width: 120, slot: 'materialCode' },
  { title: '物料名称', dataIndex: 'materialName', key: 'materialName', width: 180, slot: 'materialName' },
  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 150, slot: 'specification' },
  { title: '单位', dataIndex: 'unitName', key: 'unitName', width: 80, slot: 'unitName' },
  { title: '入库数量', dataIndex: 'quantity', key: 'quantity', width: 100, slot: 'quantity' },
  { title: '单价', dataIndex: 'price', key: 'price', width: 100, slot: 'price' },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, formatter: formatMoney },
  { title: '仓库', dataIndex: 'warehouseName', key: 'warehouseName', width: 120, slot: 'warehouseName' },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, slot: 'remark' },
]);

// 表单数据
const orderHeaderData = ref<any[]>([]);
const orderFooterData = ref<any[]>([]);

// 分页数据
const basePostData = reactive<any>({
  current: 1,
  size: 10,
  sourceCode: sourceCode.value,
  someBusinessType: null,
});

// 格式化金额
function formatMoney(value: number) {
  return formatToThousands(value, 2);
}

// 自定义行点击
function customRow(record: any, index: number) {
  return {
    on: {
      dblclick: () => handleRowDblClick(record),
    },
  };
}

// 新增采购入库单
function handleNewForecast() {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {};
  initForm(1);
  getBillCode();
}

// 获取单据编号
function getBillCode() {
  const data = { sourceCode: sourceCode.value };
  getCode(data)
    .then((res) => {
      if (res.code === 200) {
        receiptNumber.value = res.message;
        setTimeout(() => {
          for (let i = 0; i < orderHeaderData.value.length; i++) {
            if (orderHeaderData.value[i].code === 'voucherCode') {
              orderHeaderData.value[i].onEdit = false;
              orderHeaderData.value[i].value = receiptNumber.value;
            }
          }
        }, 500);
      }
    })
    .catch((error) => {
      console.error('获取单据编号失败:', error);
    });
}

// 保存采购入库单
function handleSubmit() {
  if (isSaveRun.value) return;
  isSaveRun.value = true;

  const requestData = { ...mixinMethods.getFormData(), details: dataSource.value };

  purchaseSave(requestData)
    .then((response) => {
      if (response.code === 200) {
        message.success('保存成功');
        editMask.value = true;
        isSaveRun.value = false;
        if (!orderId.value) {
          getLatestData();
        }
      } else {
        message.error(response.message);
        isSaveRun.value = false;
      }
    })
    .catch(() => {
      isSaveRun.value = false;
    });
}

// 提交采购入库单
function handleSubmitOrder(type: number) {
  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === -1 && type === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  const data = { id: orderId.value, status: type };

  submitOrder(data)
    .then((res) => {
      if (res.code === 200) {
        if (type === 0) {
          message.success('提交成功');
        } else {
          message.success('撤回提交成功');
        }
        getLatestData();
      }
    })
    .catch((error) => {
      console.error('提交失败:', error);
    });
}

// 审核采购入库单
function handleAuditClick(type: number) {
  const requestData = { id: orderId.value, status: type };

  if (type === 1) {
    Modal.confirm({
      title: '提示',
      content: (
        <div>
          请审核<span style="color:red;">申请入库数量</span>是否正确<br />
          申请入库后，此单自动进入库存管理中，是否申请入库？
        </div>
      ),
      onOk: () => {
        examine(requestData)
          .then((response) => {
            if (response.code === 200) {
              message.success('申请入库成功');
              getLatestData();
            } else {
              message.warning(response.message);
            }
          })
          .catch((error) => {
            console.error('审核失败:', error);
          });
      },
    });
  } else {
    examine(requestData)
      .then((response) => {
        if (response.code === 200) {
          if (type === 0) {
            message.success('弃审成功');
          }
          getLatestData();
        } else {
          message.warning(response.message);
        }
      })
      .catch((error) => {
        console.error('审核失败:', error);
      });
  }
}

// 删除采购入库单
function handleDelete() {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该采购入库单吗？',
    onOk: () => {
      const postData = { id: orderId.value };

      purchaseDelete(postData)
        .then((response) => {
          if (response.code === 200) {
            message.success('删除成功');
            orderId.value = '';
            getLatestData();
          } else {
            message.error(response.message);
          }
        })
        .catch((error) => {
          console.error('删除失败:', error);
        });
    },
  });
}

// 生成采购发票
function generateBills(type: string) {
  if (!orderId.value) {
    message.warning('请先选择采购入库单');
    return;
  }

  // 实现生成单据逻辑
  message.info('生成采购发票功能开发中');
}

// 打印采购入库单
function handlePrint() {
  // 准备打印数据
  incomingPrintData.value = {
    orderId: orderId.value,
    voucherCode: receiptNumber.value,
    // 其他打印所需数据
  };
  printVisible.value = true;
}

// 取消打印
function handleCancelPrint() {
  printVisible.value = false;
}

// 导出采购入库单
function handleExport() {
  // 实现导出逻辑
  message.info('导出功能开发中');
}

// 切换到列表视图
function switchToList() {
  showModel.value = 'list';
  loadListData();
}

// 加载列表数据
function loadListData() {
  loading.value = true;

  getList(basePostData)
    .then((response) => {
      if (response.code === 200) {
        // 处理列表数据
      }
      loading.value = false;
    })
    .catch((error) => {
      console.error('加载列表失败:', error);
      loading.value = false;
    });
}

// 获取最新数据
function getLatestData() {
  const postData = { ...basePostData, current: 1, size: 1 };

  getList(postData)
    .then((response) => {
      if (response.code === 200 && response.data.records.length > 0) {
        const latestData = response.data.records[0];
        orderId.value = latestData.id;
        loadDetailData(orderId.value);
      }
    })
    .catch((error) => {
      console.error('获取最新数据失败:', error);
    });
}

// 加载详情数据
function loadDetailData(id: string) {
  loading.value = true;

  getDetail(id)
    .then((response) => {
      if (response.code === 200) {
        const data = response.data;
        voucherState.value = data.status;
        orderHeaderData.value = data.headerData;
        orderFooterData.value = data.footerData;
        dataSource.value = data.details;
        // 其他数据处理
      }
      loading.value = false;
    })
    .catch((error) => {
      console.error('加载详情失败:', error);
      loading.value = false;
    });
}

// 表格行双击事件
function handleRowDblClick(record: any) {
  orderId.value = record.id;
  showModel.value = 'order';
  editMask.value = true;
  loadDetailData(record.id);
}

// 表格变化事件
function handleTableChange(pagination: any) {
  // 处理表格变化
}

// 处理动态表单时间变化
function handleChangeTime(time: any, field: string) {
  // 实现时间变化逻辑
}

// 设置表单值
function handleSetValue(field: string, value: any) {
  // 实现设置表单值逻辑
}

// 处理单元格变化
function handleCellChange(index: number, col: string, value: any) {
  dataSource.value[index][col] = value;
  // 触发重新渲染
  dataSource.value = [...dataSource.value];
}

// 处理选择添加数据
function handleChoiceAddData(index: number, col: string, data: any) {
  // 实现选择添加数据逻辑
}

// 添加行
function handleAddRow() {
  const newRow = {
    // 新行默认数据
  };
  dataSource.value.push(newRow);
  // 触发重新渲染
  dataSource.value = [...dataSource.value];
}

// 编辑点击订单
function handleEditClickOrder(data: any) {
  // 处理编辑点击订单逻辑
}

// 初始加载
onMounted(() => {
  loadListData();
});

// 组件卸载
onUnmounted(() => {
  // 清理工作
});
</script>

<style lang="less" scoped>
@import '~@/style/purchase/voucher.less';

.content-wrapper {
  padding: 16px;

  .btn-wrapper {
    margin-bottom: 16px;
  }

  .audit-status待审核 {
    display: inline-block;
    padding: 2px 8px;
    background-color: #faad14;
    color: white;
    border-radius: 4px;
    font-size: 12px;
  }

  .audit-status已审核 {
    display: inline-block;
    padding: 2px 8px;
    background-color: #52c41a;
    color: white;
    border-radius: 4px;
    font-size: 12px;
  }

  .audit-status已入库 {
    display: inline-block;
    padding: 2px 8px;
    background-color: #1890ff;
    color: white;
    border-radius: 4px;
    font-size: 12px;
  }

  .audit-status已关闭 {
    display: inline-block;
    padding: 2px 8px;
    background-color: #f5222d;
    color: white;
    border-radius: 4px;
    font-size: 12px;
  }

  .header-box,
  .footer-box {
    margin-bottom: 16px;
  }

  .table-box {
    overflow: hidden;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
}
</style>