<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <BtnsWrapper
          @searchClick="searchClick"
          :showModel="showModel"
          :orderId="orderId"
          :voucherState="voucherState"
          :editMask="editMask"
          :createUserId="createUserId"
          @printOrder="printOrder"
          @switchList="switchList"
          @submitServer="submitServer"
          @clickEdit="clickEdit"
          @deleteOrder="deleteOrder"
          @getIdByData="getIdByData"
          @auditClick="auditClick"
          @turnThePage="turnThePage"
          @syncOrder="syncOrder"
          @submitOrder="submitOrder"
          @exportDetail="exportDetail"
          :hasImport="true"
          @importDataFun="importDataFun"
        >
          <template slot="submit">
            <a-dropdown class="btns" key="submit" style="display:block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <Icon class="btns-icon" icon="check-circle" />
                <div class="btns-text">提交
                  <Icon type="down" style="vertical-align:middle;" />
                </div>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="0">
                  <a href="javascript:void(0)" @click="submitOrder(0)">提交</a>
                </a-menu-item>
                <a-menu-item key="1">
                  <a href="javascript:void(0)" @click="submitOrder(-1)">撤回提交</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </BtnsWrapper>
      </div>
      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">库存期初结存</h3>
        <div>
          <span class="audit-status" v-show="voucherState===2">已审核</span>
          <span class="audit-status" v-show="voucherState===0">待审核</span>
        </div>
        <section v-show="showModel==='list'"><!--列表-->
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            @switchList="switchList"
            @dblclick="getIdByData"
            :reportCode="reportCodeList"
          ></DynamicList>
        </section>
        <section v-show="showModel==='order'">
          <OrderDynamicForm
            :FormData="orderHeaderData"
            @changetime="onChangeTime"
            @clickItem="setValue"
          ></OrderDynamicForm>
          <div class="edit-mask-header" v-show="editMask"></div>
          <div class="table-box mt-4">
            <BasicTable
              id="bills_tb"
              :columns="columns"
              :dataSource="dataSource"
              :customRow="customClick"
              :scroll="{ x: 1000, y: 347 }"
              :pagination="false"
              @change="onTableChange"
              :size="'small'"
              bordered
            >
              <template #number="{ text, record, index }">
                <div v-if="index === dataSource.length-1">合计</div>
                <div v-else>{{index+1}}</div>
              </template>
              <template v-for="col in slotArray" :key="col" :slot="col" slot-scope="{ text, record, index }">
                <EditableCell
                  :checkType="checkType"
                  :text="text"
                  :col="col"
                  :index="index"
                  :record="record"
                  :dataSource="dataSource"
                  :unitsDataDetails="unitsDataDetails"
                  :unitsAssistSelect="unitsAssistSelect"
                  :dynamicAllData="dynamicFormData"
                  :dynamicFormDataMap="dynamicFormDataMap"
                  @choiceAddData="(index, col, data) => choiceAddData(index, col, data)"
                  @change="(index, col, value) => onCellChange(index, col, value)"
                  @newAddData="handleAdd"
                />
              </template>
            </BasicTable>
            <div class="edit-mask" v-show="editMask"></div>
          </div>
          <div class="footer-box mt-4">
            <OrderDynamicForm
              :FormData="orderFooterData"
              @changetime="onChangeTime"
              @clickItem="setValue"
            ></OrderDynamicForm>
            <div class="edit-mask-footer" v-show="editMask"></div>
          </div>
        </section>
        <section v-show="showModel==='detail'">
          <!--明细-->
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          ></DynamicListDetails>
        </section>
      </div>
      <div class="contextmenu-box">
        <!-- 右键菜单 -->
        <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
          <li @click="handleAdd()">新增行</li>
          <li @click="handleDelete()">删除行</li>
        </ul>
      </div>
      <DrawerBox
        ref="searchList"
        :unitData="unitData"
        :unitsData="unitsData"
        :unitsDataDetails="unitsDataDetails"
        @editClickOrder="editClickOrder"
      ></DrawerBox>
      <ImportModal
        ref="importModal"
        v-if="importVisible"
        @uploadSuccess="uploadSuccess"
        @cancelImport="cancelImport"
      ></ImportModal>
    </div>
    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    ></PrintModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { BasicTable } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
import { saveInitialInventory, getInitialInventoryDetail, deleteInitialInventory, auditInitialInventory, submitInitialInventoryOrder, getInitialInventoryCode, importInitialInventory, getInitialInventoryPage, exportInitialInventory } from '/@/api/inventory/bills';
import { useMessage } from '/@/hooks/web/useMessage';
import { usePermission } from '/@/hooks/web/usePermission';

// 引入组件
const BtnsWrapper = defineAsyncComponent(() => import('/@/components/BtnsWrapper/index.vue'));
const DynamicList = defineAsyncComponent(() => import('/@/components/DynamicList/index.vue'));
const OrderDynamicForm = defineAsyncComponent(() => import('/@/components/OrderDynamicForm/index.vue'));
const EditableCell = defineAsyncComponent(() => import('/@/components/EditableCell/index.vue'));
const DynamicListDetails = defineAsyncComponent(() => import('/@/components/DynamicListDetails/index.vue'));
const DrawerBox = defineAsyncComponent(() => import('/@/components/DrawerBox/index.vue'));
const PrintModal = defineAsyncComponent(() => import('/@/components/PrintModal/index.vue'));
const ImportModal = defineAsyncComponent(() => import('/@/components/ImportModal/index.vue'));

// 权限检查
const { hasPermission } = usePermission();

// 基础数据
const showModel = ref<'list'|'order'|'detail'>('list');
const orderId = ref<string>('');
const voucherState = ref<number>(-1);
const editMask = ref<boolean>(true);
const createUserId = ref<string>('');
const isSource = ref<boolean>(false);
const loading = ref<boolean>(false);
const printVisible = ref<boolean>(false);
const importVisible = ref<boolean>(false);
const incomingPrintData = ref<any>({});
const isSaveRun = ref<boolean>(true);
const sourceVoucherData = ref<any>({});
const isRouterAlive = ref<boolean>(true);
const visible = ref<boolean>(false);
const left = ref<number>(0);
const top = ref<number>(0);
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<Map<string, any>>(new Map());
const formLayout = ref<'horizontal'|'vertical'>('horizontal');
const small = ref<'default'|'middle'|'small'>('small');
const permissions = ref<string[]>([]);
const btn_grid = ref<{
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}>({
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
  xl: 4,
});

// 表格数据
const dataSource = ref<any[]>([]);
const columns = ref<any[]>([]);
const slotArray = ref<string[]>([]);
const orderHeaderData = ref<any[]>([]);
const orderFooterData = ref<any[]>([]);

// 查询条件
const basePostData = reactive<{
  businessType: string;
  [key: string]: any;
}>({
  businessType: '01',
});

const sourceCode = ref<string>('InventoryBalance');
const reportCodeDetail = ref<string>('InventoryBalance_Detail_Report');
const reportCodeList = ref<string>('InventoryBalance_List_Report');
const checkType = ref<string>('inventory'); // 库存

const route = useRoute();
const { createMessage } = useMessage();

// 生命周期
onMounted(() => {
  // 初始化表格列
  initColumns();
  // 初始化表单数据
  initForm(0);
  // 检查路由
  checkRoute();
  // 获取权限
  getPermissions();
  // 初始化加载列表数据
  getList();
});

// 检查路由
function checkRoute() {
  // 可以在这里处理路由参数
}

// 获取权限
function getPermissions() {
  // 模拟获取权限
  permissions.value = ['inventoryBalance:save', 'inventoryBalance:delete', 'inventoryBalance:examine'];
}

// 初始化表格列
function initColumns() {
  columns.value = [
    { title: '序号', dataIndex: 'number', width: 60, slot: 'number' },
    { title: '仓库', dataIndex: 'warehouseName', width: 120 },
    { title: '物料编码', dataIndex: 'materialCode', width: 120 },
    { title: '物料名称', dataIndex: 'materialName', width: 150 },
    { title: '规格型号', dataIndex: 'specification', width: 120 },
    { title: '单位', dataIndex: 'unitName', width: 80 },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      width: 100, 
      slot: 'quantity',
      editable: !editMask.value
    },
    { 
      title: '单价', 
      dataIndex: 'unitPrice', 
      width: 100, 
      slot: 'unitPrice',
      editable: !editMask.value
    },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { 
      title: '批次', 
      dataIndex: 'batch', 
      width: 100, 
      slot: 'batch',
      editable: !editMask.value
    },
    { 
      title: '备注', 
      dataIndex: 'remark', 
      width: 150, 
      slot: 'remark',
      editable: !editMask.value
    },
    { 
      title: '操作', 
      width: 80, 
      slot: 'operation',
      customRender: ({ record, index }) => {
        return (
          <a-button 
            size="small" 
            type="primary" 
            danger 
            onClick={() => handleDeleteRow(index)} 
            disabled={editMask.value}
          >
            删除
          </a-button>
        );
      }
    }
  ];

  slotArray.value = ['quantity', 'unitPrice', 'batch', 'remark', 'operation'];
}

// 初始化表单数据
function initForm(type: number) {
  orderHeaderData.value = [
    { label: '单据编号', field: 'code', value: '', required: true },
    { label: '单据日期', field: 'date', value: new Date(), required: true },
    { label: '仓库', field: 'warehouseName', value: '', required: true },
    { label: '仓库编码', field: 'warehouseCode', value: '' },
    { label: '仓库ID', field: 'warehouseId', value: '', required: true },
    { label: '负责人', field: 'managerName', value: '' },
  ];

  orderFooterData.value = [
    { label: '合计数量', field: 'totalQuantity', value: '0' },
    { label: '合计金额', field: 'totalAmount', value: '0' },
    { label: '制单人', field: 'creatorName', value: '' },
    { label: '制单日期', field: 'createTime', value: '' },
    { label: '审核人', field: 'auditorName', value: '' },
    { label: '审核日期', field: 'auditTime', value: '' },
    { label: '备注', field: 'remark', value: '' },
  ];

  // 清空表格数据
  dataSource.value = [];
  // 添加一行空数据
  if (type === 1) {
    handleAdd();
  }
}

// 新增
function newForecast() {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = true;
  voucherState.value = -1;
  sourceVoucherData.value = {}; // 清空来源数据
  initForm(1);
  isSource.value = false;

  // 获取单据编号
  getInitialInventoryCode().then(response => {
    loading.value = false;
    if (response.code === 200) {
      const codeItem = orderHeaderData.value.find(item => item.field === 'code');
      if (codeItem) {
        codeItem.value = response.data;
      }
    } else {
      createMessage.error(response.message || '获取单据编号失败');
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('获取单据编号失败');
  });
}

// 保存
function submitServer() {
  if (!isSaveRun.value) {
    return;
  }

  // 检查是否有重复物料
  const materialIds = dataSource.value.map(item => item.materialId).filter(Boolean);
  const uniqueMaterialIds = new Set(materialIds);
  if (materialIds.length !== uniqueMaterialIds.size) {
    createMessage.warning('库存期初设置不允许出现相同的物料！');
    return;
  }

  // 构建请求数据
  const requestData = {
    id: orderId.value || undefined,
    code: orderHeaderData.value.find(item => item.field === 'code')?.value,
    date: orderHeaderData.value.find(item => item.field === 'date')?.value,
    warehouseId: orderHeaderData.value.find(item => item.field === 'warehouseId')?.value,
    remark: orderFooterData.value.find(item => item.field === 'remark')?.value,
    details: dataSource.value.map(item => ({
      materialId: item.materialId,
      materialCode: item.materialCode,
      materialName: item.materialName,
      specification: item.specification,
      unitId: item.unitId,
      unitName: item.unitName,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unitPrice || 0),
      amount: Number(item.amount || 0),
      batch: item.batch,
      remark: item.remark,
    })),
  };

  isSaveRun.value = false;
  loading.value = true;

  saveInitialInventory(requestData).then(response => {
    loading.value = false;
    if (response.code === 200) {
      createMessage.success('保存成功');
      editMask.value = true;
      isSaveRun.value = true;
      if (!orderId.value) {
        getIdByData(); // 获取最新一条数据
      }
    } else {
      createMessage.error(response.message || '保存失败');
      isSaveRun.value = true;
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('保存失败');
    isSaveRun.value = true;
  });
}

// 单据提交
function submitOrder(type: number) {
  const data = {
    id: orderId.value,
    status: type, // 状态 -1:撤回提交,0:提交
  };

  if (!orderId.value) {
    createMessage.warning('请先选择单据');
    return;
  }

  loading.value = true;
  submitInitialInventoryOrder(data).then(response => {
    loading.value = false;
    if (response.code === 200) {
      createMessage.success(type === 0 ? '提交成功' : '撤回提交成功');
      getIdByData(); // 重新获取数据
    } else {
      createMessage.error(response.message || (type === 0 ? '提交失败' : '撤回提交失败'));
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error(type === 0 ? '提交失败' : '撤回提交失败');
  });
}

// 获取单据详情
function getIdByData(id?: string) {
  if (id) {
    orderId.value = id;
  } else if (!orderId.value) {
    // 如果没有id，获取最新一条数据
    // 这里可以调用API获取最新单据
    createMessage.warning('请先选择单据');
    return;
  }

  loading.value = true;
  getInitialInventoryDetail(orderId.value).then(response => {
    loading.value = false;
    if (response.code === 200 && response.data) {
      const data = response.data;
      // 填充表头数据
      orderHeaderData.value.forEach(item => {
        if (data[item.field] !== undefined) {
          item.value = data[item.field];
        }
      });

      // 填充表尾数据
      orderFooterData.value.forEach(item => {
        if (data[item.field] !== undefined) {
          item.value = data[item.field];
        }
      });

      // 填充表格数据
      dataSource.value = data.details || [];

      // 设置单据状态
      voucherState.value = data.status || -1;
      createUserId.value = data.createUserId || '';

      // 如果是来源单据
      isSource.value = !!data.sourceId;
    } else {
      createMessage.error(response.message || '获取单据详情失败');
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('获取单据详情失败');
  });
}

// 删除单据
function deleteOrder() {
  if (!orderId.value) {
    createMessage.warning('请先选择单据');
    return;
  }

  loading.value = true;
  deleteInitialInventory(orderId.value).then(response => {
    loading.value = false;
    if (response.code === 200) {
      createMessage.success('删除成功');
      showModel.value = 'list';
    } else {
      createMessage.error(response.message || '删除失败');
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('删除失败');
  });
}

// 审核单据
function auditClick(type: number) {
  if (!orderId.value) {
    createMessage.warning('请先选择单据');
    return;
  }

  const data = {
    id: orderId.value,
    status: type, // 1:审核通过, 0:弃审
  };

  loading.value = true;
  auditInitialInventory(data).then(response => {
    loading.value = false;
    if (response.code === 200) {
      createMessage.success('审核成功');
      getIdByData(); // 重新获取数据
    } else {
      createMessage.error(response.message || '审核失败');
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('审核失败');
  });
}

// 表格单元格变更
function onCellChange(index: number, col: string, value: any) {
  if (dataSource.value[index]) {
    dataSource.value[index][col] = value;
    // 计算金额
    if (col === 'quantity' || col === 'unitPrice') {
      const quantity = Number(dataSource.value[index].quantity || 0);
      const unitPrice = Number(dataSource.value[index].unitPrice || 0);
      dataSource.value[index].amount = (quantity * unitPrice).toFixed(2);
    }
    // 计算合计
    calculateTotal();
  }
}

// 计算合计
function calculateTotal() {
  let totalQuantity = 0;
  let totalAmount = 0;

  dataSource.value.forEach(item => {
    totalQuantity += Number(item.quantity || 0);
    totalAmount += Number(item.amount || 0);
  });

  orderFooterData.value.forEach(item => {
    if (item.field === 'totalQuantity') {
      item.value = totalQuantity.toFixed(2);
    }
    if (item.field === 'totalAmount') {
      item.value = totalAmount.toFixed(2);
    }
  });
}

// 新增行
function handleAdd() {
  const newRow = {
    warehouseName: orderHeaderData.value.find(item => item.field === 'warehouseName')?.value || '',
    materialCode: '',
    materialName: '',
    specification: '',
    unitName: '',
    quantity: 0,
    unitPrice: 0,
    amount: 0,
    batch: '',
    remark: '',
  };

  dataSource.value.push(newRow);
  calculateTotal();
}

// 删除单行
function handleDeleteRow(index: number) {
  if (index >= 0 && index < dataSource.value.length) {
    // 检查是否是合计行
    if (dataSource.value[index].warehouseName === '合计') {
      createMessage.warning('不能删除合计行');
      return;
    }
    
    dataSource.value.splice(index, 1);
    // 重新计算合计
    calculateTotal();
    createMessage.success('删除成功');
  }
}

// 删除行
function handleDelete() {
  // 找到当前选中的行
  const selectedRowKeys = [];
  const selectedRows = dataSource.value.filter(item => item.selected);
  
  if (selectedRows.length === 0) {
    createMessage.warning('请先选择要删除的行');
    return;
  }
  
  // 从数据源中删除选中的行
  dataSource.value = dataSource.value.filter(item => !item.selected);
  
  // 重新计算合计
  calculateTotal();
  
  createMessage.success(`成功删除${selectedRows.length}行`);
}

// 切换视图
function switchList(model: 'list'|'order'|'detail') {
  showModel.value = model;
}

// 搜索
function searchClick(params: any) {
  Object.assign(basePostData, params);
  // 调用列表刷新
}

// 打印订单
function printOrder() {
  printVisible.value = true;
  // 准备打印数据
  incomingPrintData.value = {
    // 打印相关数据
  };
}

// 取消打印
function cancelPrint() {
  printVisible.value = false;
}

// 导出明细
function exportDetail() {
  // 实现导出逻辑
}

// 导入数据
function importDataFun() {
  importVisible.value = true;
}

// 日期格式化函数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 导出明细
function exportDetail() {
  if (!orderId.value) {
    createMessage.warning('请先选择要导出的单据');
    return;
  }

  // 获取仓库ID
  let warehouseId = '';
  for (let i = 0; i < orderHeaderData.value.length; i++) {
    if (orderHeaderData.value[i].field === 'warehouseId') {
      warehouseId = orderHeaderData.value[i].value;
      break;
    }
  }

  if (!warehouseId) {
    createMessage.warning('请选择仓库');
    return;
  }

  loading.value = true;

  // 获取日期
  let date = '';
  for (let i = 0; i < orderHeaderData.value.length; i++) {
    if (orderHeaderData.value[i].field === 'date') {
      date = orderHeaderData.value[i].value;
      break;
    }
  }

  exportInitialInventory({
    id: orderId.value,
    warehouseId: warehouseId,
    date: date ? new Date(date).toISOString().split('T')[0] : undefined
  })
    .then((response) => {
      loading.value = false;
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // 格式化文件名，包含单据编号和当前日期
      const code = orderHeaderData.value.find(item => item.field === 'code')?.value || '';
      a.download = `库存期初结存明细_${code || orderId.value}_${formatDate(new Date())}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      createMessage.success('导出成功');
    })
    .catch((error) => {
      loading.value = false;
      createMessage.error('导出失败: ' + (error.message || '未知错误'));
    });
}

// 上传成功
function uploadSuccess(file: File) {
  importVisible.value = false;
  loading.value = true;
  const warehouseId = orderHeaderData.value.find(item => item.field === 'warehouseId')?.value;

  if (!warehouseId) {
    createMessage.warning('请先选择仓库');
    loading.value = false;
    return;
  }

  importInitialInventory({ file, warehouseId }).then(response => {
    loading.value = false;
    if (response.code === 200) {
      createMessage.success('导入成功');
      // 刷新数据
      getIdByData();
    } else {
      createMessage.error(response.message || '导入失败');
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('导入失败');
  });
}

// 取消导入
function cancelImport() {
  importVisible.value = false;
}

// 获取列表数据
function getList(currentPage: number = 1, pageSize: number = 20) {
  const warehouseId = orderHeaderData.value.find(item => item.field === 'warehouseId')?.value;
  if (!warehouseId) {
    createMessage.warning('请先选择仓库');
    return;
  }

  loading.value = true;
  getInitialInventoryPage({
    warehouseId,
    current: currentPage,
    size: pageSize
  }).then(response => {
    loading.value = false;
    if (response.code === 200) {
      const data = response.data;
      dataSource.value = data.records || [];
      // 处理合计行
      if (dataSource.value.length > 0) {
        const totalRow = {
          warehouseName: '合计',
          quantity: data.totalQuantity || 0,
          amount: data.totalAmount || 0
        };
        dataSource.value.push(totalRow);
      }
    } else {
      createMessage.error(response.message || '获取列表数据失败');
    }
  }).catch((e) => {
    loading.value = false;
    createMessage.error('获取列表数据失败');
  });
}

// 其他方法...
function onChangeTime(date: any) {
  // 处理日期变更
}

function setValue(field: string, value: any) {
  // 设置表单值
}

function customClick(record: any, index: number) {
  // 自定义行点击
  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      visible.value = true;
      left.value = e.clientX;
      top.value = e.clientY;
    },
  };
}

function onTableChange(pagination: any, filters: any, sorter: any) {
  // 表格变更
}

function turnThePage(page: number) {
  // 翻页
}

function syncOrder() {
  // 同步订单
}

function clickEdit() {
  editMask.value = false;
}

function editClickOrder(id: string) {
  orderId.value = id;
  getIdByData(id);
  showModel.value = 'order';
}
</script>

<style scoped>
/* 样式定义 */
.content-wrapper {
  padding: 16px;
}

.btn-wrapper {
  margin-bottom: 16px;
}

.btns {
  display: inline-block;
  margin-right: 8px;
}

.btns-icon {
  margin-right: 4px;
}

.btns-text {
  display: inline-block;
  vertical-align: middle;
}

.documents-wrapper {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.table-box {
  margin-top: 16px;
}

.footer-box {
  margin-top: 16px;
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.1);
  z-index: 1000;
}

.contextmenu {
  position: absolute;
  z-index: 100;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 100px;
}

.contextmenu li {
  padding: 6px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background-color: #f5f5f5;
}
</style>