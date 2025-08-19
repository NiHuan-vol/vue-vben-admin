<template>
  <div class="content-wrapper a-base-container">
    <Card title="采购订单">
      <!-- 按钮区域 -->
      <div class="btn-wrapper flex flex-wrap gap-2 mb-4">
        <Dropdown placement="bottomRight">
          <Button type="primary" icon={<FileAddOutlined />}>新增</Button>
          <template #overlay>
            <Menu>
              <MenuItem key="0" @click="handleNewForecast">
                <span>新增采购订单</span>
              </MenuItem>
              <MenuItem key="1" @click="handleChoiceBillsFromPurchaseRequisition">
                <span>选请购单</span>
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>

        <Dropdown placement="bottomRight" v-if="voucherState === 1">
          <Button type="primary" icon={<SnippetsOutlined />}>生单</Button>
          <template #overlay>
            <Menu>
              <MenuItem key="0" @click="generateBills('PuArrival')">
                <span>生成到货通知单</span>
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>

        <Dropdown placement="bottomRight" v-if="voucherState === 1 || voucherState === 10">
          <Button type="primary" icon={<CloseOutlined />}>关闭</Button>
          <template #overlay>
            <Menu>
              <MenuItem key="0" @click="handleClose(1)">
                <span>打开</span>
              </MenuItem>
              <MenuItem key="1" @click="handleClose(10)">
                <span>关闭</span>
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

      <!-- 列表视图 -->
      <div v-else-if="showModel === 'list'" class="list-view">
        <BasicTable
          ref="tableRef"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          @change="handleTableChange"
          @row-dblclick="handleRowDblClick"
          rowKey="id"
        />
      </div>

      <!-- 表单视图 -->
      <div v-else-if="showModel === 'order'" class="order-view">
        <div class="mb-2">
          <span v-if="voucherState === 0" class="audit-status待审核">待审核</span>
          <span v-else-if="voucherState === 1" class="audit-status已审核">已审核</span>
          <span v-else-if="voucherState === 10" class="audit-status已关闭">已关闭</span>
        </div>

        <!-- 表单头部 -->
        <div class="header-box mb-4 p-3 bg-gray-50 rounded-md">
          <DynamicForm
            :businessType="businessType"
            :formData="orderHeaderData"
            @change-time="handleChangeTime"
            @click-item="handleSetValue"
          />
        </div>

        <!-- 表格内容 -->
        <div class="table-box mb-4">
          <BasicTable
            ref="detailTableRef"
            :columns="detailColumns"
            :dataSource="dataSource"
            :scroll="{ x: 1000, y: 347 }"
            :pagination="false"
            bordered
            size="small"
          >
            <template #number="{ index }">
              <div v-if="index === dataSource.length - 1">合计</div>
              <div v-else>{{ index + 1 }}</div>
            </template>
            <template v-for="col in slotArray" :key="col" :slot="col">
              <div v-if="!editMask">
                {{ col === 'price' ? formatMoney(dataSource[index][col]) : dataSource[index][col] }}
              </div>
              <EditableCell
                v-else
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
            </template>
          </BasicTable>
        </div>

        <!-- 表单底部 -->
        <div class="footer-box p-3 bg-gray-50 rounded-md">
          <DynamicForm
            :formData="orderFooterData"
            @change-time="handleChangeTime"
            @click-item="handleSetValue"
          />
        </div>
      </div>

      <!-- 明细视图 -->
      <div v-else-if="showModel === 'detail'" class="detail-view">
        <DynamicListDetails
          ref="detailSearchRef"
          :reportCode="reportCodeDetail"
          :componentType="1"
          :basePostData="basePostData"
        />
      </div>

      <!-- 统计视图 -->
      <div v-else-if="showModel === 'statistical'" class="statistical-view">
        <DynamicListDetails
          ref="statisticalSearchRef"
          :reportCode="reportCodeStatistical"
          :componentType="2"
          :basePostData="basePostData"
        />
      </div>
    </Card>

    <!-- 打印模态框 -->
    <Modal
      v-model:visible="printVisible"
      title="打印采购订单"
      width={800}
      @ok="handlePrintConfirm"
      @cancel="handleCancelPrint"
    >
      <PrintComponent :printData="printData" />
    </Modal>

    <!-- 选单抽屉 -->
    <Drawer
      v-model:visible="drawerVisible"
      title="选请购单"
      placement="right"
      width={800}
    >
      <DynamicList
        ref="selectListRef"
        :basePostData="selectPostData"
        :sourceCode="'PurchaseRequisition'"
        @select-data="handleSelectData"
        @close="drawerVisible = false"
      />
    </Drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Card, Button, Dropdown, Menu, MenuItem, Spin, Modal, Drawer } from 'ant-design-vue';
import { FileAddOutlined, SnippetsOutlined, CloseOutlined, PrinterOutlined, ExportOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
import { BasicTable } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { save, examine, remove, getCode, submitOrder, closed, getList, getDetail } from '/@/api/purchase/purchaseOrderMain';
import { usePermission } from '/@/hooks/web/usePermission';
import { formatToDate, formatToDateTime } from '/@/utils/dateUtil';
import { formatToThousands } from '/@/utils/numberUtil';
import { proMixin } from '/@/mixins/procurement/pro';
import DynamicForm from '/@/components/DynamicForm/index.vue';
import EditableCell from '/@/components/EditableCell/index.vue';
import DynamicList from '/@/components/DynamicList/index.vue';
import DynamicListDetails from '/@/components/DynamicListDetails/index.vue';
import PrintComponent from '/@/components/PrintComponent/index.vue';

// 混合mixin
const { initForm, loadData, ...mixinMethods } = proMixin();

// 响应式数据
const showModel = ref('list'); // list, order, detail, statistical
const editMask = ref(true);
const loading = ref(false);
const voucherState = ref(-1); // -1: 未提交, 0: 待审核, 1: 已审核, 10: 关闭
const orderId = ref('');
const sourceCode = ref('PurchaseOrder');
const reportCodeDetail = ref('PurchaseOrder_Detail_Report');
const reportCodeStatistical = ref('PurchaseOrder_Statistic_Report');
const reportCodeList = ref('PurchaseOrder_List_Report');
const businessType = ref(2); // 非退货业务
const checkType = ref('is_purchasing');
const voucherTitle = ref('采购订单');
const receiptNumber = ref('');
const printVisible = ref(false);
const printData = ref<any>({});
const sourceVoucherData = ref<any>({});
const isSaveRun = ref(false);
const drawerVisible = ref(false);
const message = useMessage();
const { hasPermission } = usePermission();
const isDetailVendorId = ref(true); // 隐藏明细中的供应商

// 表格数据
const dataSource = ref<any[]>([]);
const columns = ref<any[]>([
  { title: '采购订单号', dataIndex: 'voucherCode', key: 'voucherCode', width: 140 },
  { title: '订单日期', dataIndex: 'voucherDate', key: 'voucherDate', width: 120, formatter: formatToDate },
  { title: '供应商', dataIndex: 'supplierName', key: 'supplierName', width: 180 },
  { title: '部门', dataIndex: 'deptName', key: 'deptName', width: 120 },
  { title: '制单人', dataIndex: 'creatorName', key: 'creatorName', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, formatter: formatStatus },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 180 },
]);

const detailColumns = ref<any[]>([
  { title: '序号', dataIndex: 'number', key: 'number', width: 60, slot: 'number' },
  { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode', width: 120, slot: 'materialCode' },
  { title: '物料名称', dataIndex: 'materialName', key: 'materialName', width: 180, slot: 'materialName' },
  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 150, slot: 'specification' },
  { title: '单位', dataIndex: 'unitName', key: 'unitName', width: 80, slot: 'unitName' },
  { title: '订单数量', dataIndex: 'quantity', key: 'quantity', width: 100, slot: 'quantity' },
  { title: '单价', dataIndex: 'price', key: 'price', width: 100, slot: 'price' },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, formatter: formatMoney },
  { title: '交货日期', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 120, slot: 'deliveryDate', formatter: formatToDate },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, slot: 'remark' },
]);

// 表单数据
const orderHeaderData = ref<any[]>([]);
const orderFooterData = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<Map<string, any>>(new Map());
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any[]>([]);
const slotArray = ref<string[]>(['materialCode', 'materialName', 'specification', 'unitName', 'quantity', 'price', 'deliveryDate', 'remark']);

// 分页数据
const pagination = reactive<{ current: number; pageSize: number; total: number }>({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 基础查询数据
const basePostData = reactive<any>({
  current: 1,
  size: 10,
  sourceCode: sourceCode.value,
});

// 选单查询数据
const selectPostData = reactive<any>({
  sourceCode: 'PurchaseRequisition',
  title: '选请购单',
  businessType: 2, // 非退货业务
  someBusinessType: '0',
  startVoucherState: 0,
  endVoucherState: 10,
  current: 1,
  size: 10,
});

// 格式化状态
function formatStatus(status: number) {
  switch (status) {
    case -1: return '未提交';
    case 0: return '待审核';
    case 1: return '已审核';
    case 10: return '已关闭';
    default: return '未知';
  }
}

// 格式化金额
function formatMoney(value: number) {
  return formatToThousands(value, 2);
}

// 新增采购订单
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
  getCode().then((res) => {
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
  });
}

// 保存采购订单
function handleSubmit() {
  if (isSaveRun.value) return;
  isSaveRun.value = true;

  const requestData = { ...mixinMethods.getFormData(), orderDetailList: dataSource.value };

  save(requestData)
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

// 提交采购订单
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

// 审核采购订单
function handleAuditClick(type: number) {
  const requestData = { id: orderId.value, status: type };

  examine(requestData)
    .then((response) => {
      if (response.code === 200) {
        if (type === 1) {
          message.success('审核成功');
        } else if (type === 0) {
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

// 删除采购订单
function handleDelete() {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该采购订单吗？',
    onOk: () => {
      const postData = { id: orderId.value };

      remove(postData)
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

// 关闭/打开订单
function handleClose(type: number) {
  const data = { id: orderId.value, status: type };

  closed(data)
    .then((res) => {
      if (res.code === 200) {
        message.success('操作成功');
        editMask.value = true;
        isSaveRun.value = true;
        getLatestData();
      } else {
        message.error(res.message);
        isSaveRun.value = true;
      }
    })
    .catch((error) => {
      console.error('操作失败:', error);
      isSaveRun.value = true;
    });
}

// 生成到货通知单
function generateBills(type: string) {
  if (!orderId.value) {
    message.warning('请先选择采购订单');
    return;
  }

  // 实现生成单据逻辑
  message.info('生成到货通知单功能开发中');
}

// 打印采购订单
function handlePrint() {
  // 准备打印数据
  printData.value = {
    orderId: orderId.value,
    voucherCode: receiptNumber.value,
    voucherDate: formatToDate(new Date()),
    // 其他打印所需数据
  };
  printVisible.value = true;
}

// 处理打印确认
function handlePrintConfirm() {
  // 执行打印逻辑
  printVisible.value = false;
}

// 取消打印
function handleCancelPrint() {
  printVisible.value = false;
}

// 导出采购订单
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
  basePostData.current = pagination.current;
  basePostData.size = pagination.pageSize;

  getList(basePostData)
    .then((response) => {
      if (response.code === 200) {
        dataSource.value = response.data.records;
        pagination.total = response.data.total;
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
  const postData = { current: 1, size: 1, sourceCode: sourceCode.value };

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
        dataSource.value = data.detailList;
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

// 表格分页变化
function handleTableChange(pagination: any) {
  Object.assign(pagination, pagination);
  loadListData();
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

// 选择请购单
function handleChoiceBillsFromPurchaseRequisition() {
  drawerVisible.value = true;
  // 重置选单查询条件
  selectPostData.current = 1;
  selectPostData.size = 10;
}

// 处理选单数据
function handleSelectData(selectData: any) {
  if (selectData && selectData.length > 0) {
    // 处理选中的请购单数据
    const selected = selectData[0];
    orderId.value = '';
    sourceVoucherData.value = selected;
    showModel.value = 'order';
    editMask.value = false;
    // 初始化表单并加载选单数据
    initForm(1, selected);
  }
  drawerVisible.value = false;
}

// 初始加载
onMounted(() => {
  loadListData();
});
</script>

<style lang="less" scoped>
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