<template>
  <div class="production-demand">
    <!-- 顶部按钮区域 -->
    <div class="header-button-group">
      <a-button v-if="!isEdit" type="primary" @click="handleNew">新增</a-button>
      <a-button v-if="isEdit" type="primary" @click="handleSave">保存</a-button>
      <a-button v-if="isEdit" @click="handleCancel">取消</a-button>
      <a-button v-if="voucherState === -1 && isEdit" @click="handleSubmit">提交</a-button>
      <a-button v-if="voucherState === 0 && !isEdit" @click="handleAudit(1)">审核</a-button>
      <a-button v-if="voucherState === 1 && !isEdit" @click="handleAudit(0)">弃审</a-button>
      <a-button v-if="!isEdit" @click="handleDelete">删除</a-button>
      <a-button @click="handleSearch">搜索</a-button>
      <a-button @click="handleReset">重置</a-button>
    </div>

    <!-- 单据头部信息 -->
    <div class="voucher-header">
      <a-form layout="inline" :model="formData">
        <a-form-item label="单据编号">
          <a-input v-model:value="formData.voucherCode" disabled />
        </a-form-item>
        <a-form-item label="单据日期">
          <a-date-picker v-model:value="formData.voucherDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="MRP运算方案">
          <a-select v-model:value="formData.chooseSchemeId" style="width: 100%"
            @change="handleSchemeChange">
            <a-select-option v-for="item in schemeList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="运算状态">
          <a-input v-model:value="formData.operationState" disabled />
        </a-form-item>
        <a-form-item label="运算时间">
          <a-date-picker v-model:value="formData.operationDate" style="width: 100%" disabled />
        </a-form-item>
        <a-form-item label="单据状态">
          <a-input v-model:value="formData.voucherStateText" disabled />
        </a-form-item>
      </a-form>
    </div>

    <!-- 单据来源切换 -->
    <div class="source-switch">
      <a-radio-group v-model:value="showModel" @change="handleSourceChange">
        <a-radio value="order">销售订单</a-radio>
        <a-radio value="plan">生产计划</a-radio>
      </a-radio-group>
    </div>

    <!-- 销售订单表格 -->
    <div v-if="showModel === 'order'" class="table-container">
      <a-table
        :columns="orderColumns"
        :data-source="orderDataSource"
        :row-selection="{ selectedRowKeys: selectedRowKeysMain, onChange: handleOrderSelectChange }"
        row-key="id"
      />
    </div>

    <!-- 生产计划表格 -->
    <div v-if="showModel === 'plan'" class="table-container">
      <a-table
        :columns="planColumns"
        :data-source="planDataSource"
        :row-selection="{ selectedRowKeys: selectedRowKeysMain, onChange: handlePlanSelectChange }"
        row-key="id"
      />
    </div>

    <!-- 明细表格 -->
    <div class="detail-table-container">
      <a-table
        :columns="detailColumns"
        :data-source="detailDataSource"
        row-key="id"
        :pagination="false"
      >
        <template #operation="{ record, index }">
          <a-button size="small" @click="handleDeleteDetail(index)">删除</a-button>
        </template>
        <template #bussessPlan="{ record }">
          <a-select v-model:value="record.bussessPlanId" style="width: 100%">
            <a-select-option value="1">采购</a-select-option>
            <a-select-option value="2">自制</a-select-option>
            <a-select-option value="3">委外</a-select-option>
          </a-select>
        </template>
        <template #baseQuantity="{ record }">
          <a-input-number v-model:value="record.baseQuantity" style="width: 100%"
            @change="handleQuantityChange(record)" />
        </template>
      </a-table>
    </div>

    <!-- 运算按钮 -->
    <div class="operation-button">
      <a-button type="primary" @click="startOperation" :disabled="voucherState !== 1">开始运算</a-button>
    </div>

    <!-- 运算进度弹窗 -->
    <a-modal v-model:visible="startVisible" title="运算进度" :footer="null">
      <div class="progress-container">
        <a-progress :percent="runNewPercentage" status="active" />
        <p v-if="runNewPercentage < 100">正在运算中，请稍候...</p>
        <p v-else>运算完成！即将跳转到生产建议页面...</p>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { mrpSave, mrpSubmit, mrpExamine, mrpDelete, getSchemeList, getOrderList, getPlanList, startOper } from '/@/api/production/demand';
import { formatDate } from '/@/utils/date';

// 状态定义
const store = useStore();
const router = useRouter();
const orderId = ref<string>('');
const isEdit = ref<boolean>(false);
const voucherState = ref<number>(-1);
const showModel = ref<string>('order');
const selectedRowKeysMain = ref<string[]>([]);
const selectedRowKeysDetails = ref<string[]>([]);
const startVisible = ref<boolean>(false);
const runNewPercentage = ref<number>(0);
const isSaveRun = ref<boolean>(false);

// 数据定义
const formData = reactive<{[key: string]: any}>({
  voucherCode: '',
  voucherDate: new Date(),
  chooseSchemeId: '',
  operationState: 0,
  operationDate: '',
  voucherStateText: '未提交',
});

const schemeList = ref<any[]>([]);
const orderDataSource = ref<any[]>([]);
const planDataSource = ref<any[]>([]);
const detailDataSource = ref<any[]>([]);
const startComputedData = reactive<{id: string, mrpData: any[]}>({ id: '', mrpData: [] });

// 列定义
const orderColumns = [
  { title: '订单编号', dataIndex: 'voucherCode' },
  { title: '客户名称', dataIndex: 'customerName' },
  { title: '订单日期', dataIndex: 'voucherDate', customRender: ({ text }) => formatDate(text) },
  { title: '交货日期', dataIndex: 'deliveryDate', customRender: ({ text }) => formatDate(text) },
  { title: '订单状态', dataIndex: 'voucherState', customRender: ({ text }) => {
    return text === 1 ? '已审核' : text === 0 ? '已提交' : '未提交';
  }},
];

const planColumns = [
  { title: '计划编号', dataIndex: 'voucherCode' },
  { title: '计划名称', dataIndex: 'planName' },
  { title: '计划日期', dataIndex: 'voucherDate', customRender: ({ text }) => formatDate(text) },
  { title: '计划状态', dataIndex: 'voucherState', customRender: ({ text }) => {
    return text === 1 ? '已审核' : text === 0 ? '已提交' : '未提交';
  }},
];

const detailColumns = [
  { title: '物料编码', dataIndex: 'inventoryCode' },
  { title: '物料名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'specification' },
  { title: '主计量单位', dataIndex: 'baseUnitName' },
  { title: '数量', dataIndex: 'baseQuantity', slots: { customRender: 'baseQuantity' } },
  { title: '业务类型', dataIndex: 'bussessPlanId', slots: { customRender: 'bussessPlan' } },
  { title: '操作', slots: { customRender: 'operation' }, width: 80 },
];

// 生命周期
onMounted(() => {
  getSchemeList().then(res => {
    if (res.code === 200) {
      schemeList.value = res.data;
    }
  });
  loadOrderData();
  loadPlanData();
});

onUnmounted(() => {
  orderId.value = '';
});

// 计算属性
const voucherStateText = computed(() => {
  return voucherState.value === 1 ? '已审核' : voucherState.value === 0 ? '已提交' : '未提交';
});

// 方法
function handleNew() {
  isEdit.value = true;
  orderId.value = '';
  formData.voucherCode = '';
  formData.voucherDate = new Date();
  formData.chooseSchemeId = '';
  formData.operationState = 0;
  formData.operationDate = '';
  voucherState.value = -1;
  detailDataSource.value = [];
  selectedRowKeysMain.value = [];
  selectedRowKeysDetails.value = [];
}

function handleSave() {
  // 表单验证
  if (!formData.chooseSchemeId) {
    message.warning('请选择MRP运算方案');
    return;
  }

  if (detailDataSource.value.length === 0) {
    message.warning('请选择单据来源');
    return;
  }

  const params = {
    businessType: 'MRP',
    voucherCode: formData.voucherCode,
    voucherState: voucherState.value,
    voucherDate: formData.voucherDate,
    chooseSchemeName: schemeList.value.find(item => item.id === formData.chooseSchemeId)?.name || '',
    operationState: formData.operationState,
    operationDate: formData.operationDate,
    createUserId: store.state.user.info.id,
    createUserName: store.state.user.info.name,
    dataSource: 'MrpOperation',
    maMrpOperationDetailList: detailDataSource.value.map(item => ({
      ...item,
      bussessPlan: item.bussessPlanId,
      baseUnit: item.baseUnitNumber,
      sourceVoucherType: showModel.value === 'order' ? 'SaleOrder' : 'MasterProductionSchedule',
    })),
  };

  if (orderId.value) {
    params.id = orderId.value;
  }

  mrpSave(params).then(res => {
    if (res.code === 200) {
      message.success('保存成功');
      isEdit.value = false;
      isSaveRun.value = true;
      orderId.value = res.data.id;
      getDetailData();
    } else {
      message.warning('保存失败');
    }
  });
}

function handleCancel() {
  isEdit.value = false;
  if (orderId.value) {
    getDetailData();
  } else {
    detailDataSource.value = [];
    selectedRowKeysMain.value = [];
  }
}

function handleSubmit() {
  if (!orderId.value) {
    message.warning('请先保存单据');
    return;
  }

  const data = {
    id: orderId.value,
    status: 0,
  };

  mrpSubmit(data).then(res => {
    if (res.code === 200) {
      message.success('提交成功');
      voucherState.value = 0;
      formData.voucherStateText = '已提交';
      isEdit.value = false;
    }
  });
}

function handleAudit(type: number) {
  const requestData = {
    id: orderId.value,
    status: type,
  };

  mrpExamine(requestData).then(response => {
    if (response.code === 200) {
      if (type === 1) {
        message.success('审核成功');
        voucherState.value = 1;
        formData.voucherStateText = '已审核';
      } else {
        message.success('弃审成功');
        voucherState.value = 0;
        formData.voucherStateText = '已提交';
      }
    }
  });
}

function handleDelete() {
  if (!orderId.value) {
    message.warning('请选择要删除的单据');
    return;
  }

  const postData = {
    id: orderId.value,
  };

  mrpDelete(postData).then(response => {
    if (response.code === 200) {
      message.success('删除成功');
      orderId.value = '';
      voucherState.value = 0;
      formData = { ...initialFormData };
      detailDataSource.value = [];
    } else {
      message.error(response.message);
    }
  });
}

function handleSearch() {
  // 搜索逻辑
  loadOrderData();
  loadPlanData();
}

function handleReset() {
  // 重置逻辑
  formData.chooseSchemeId = '';
  selectedRowKeysMain.value = [];
  selectedRowKeysDetails.value = [];
  detailDataSource.value = [];
}

function handleSourceChange(e: any) {
  showModel.value = e.target.value;
  selectedRowKeysMain.value = [];
  detailDataSource.value = [];
}

function handleSchemeChange(value: string) {
  formData.chooseSchemeId = value;
}

function loadOrderData() {
  getOrderList().then(res => {
    if (res.code === 200) {
      orderDataSource.value = res.data;
    }
  });
}

function loadPlanData() {
  getPlanList().then(res => {
    if (res.code === 200) {
      planDataSource.value = res.data;
    }
  });
}

function handleOrderSelectChange(keys: string[], records: any[]) {
  selectedRowKeysMain.value = keys;
  if (records.length > 0) {
    // 加载订单明细
    detailDataSource.value = records.map(record => ({
      id: record.id,
      inventoryCode: record.inventoryCode,
      inventoryName: record.inventoryName,
      specification: record.specification,
      baseUnitName: record.baseUnitName,
      baseUnitNumber: record.baseUnit,
      baseQuantity: record.quantity,
      bussessPlanId: 2, // 默认自制
      orderId: record.id,
    }));
  } else {
    detailDataSource.value = [];
  }
}

function handlePlanSelectChange(keys: string[], records: any[]) {
  selectedRowKeysMain.value = keys;
  if (records.length > 0) {
    // 加载计划明细
    detailDataSource.value = records.map(record => ({
      id: record.id,
      inventoryCode: record.inventoryCode,
      inventoryName: record.inventoryName,
      specification: record.specification,
      baseUnitName: record.baseUnitName,
      baseUnitNumber: record.baseUnit,
      baseQuantity: record.planQuantity,
      bussessPlanId: 2, // 默认自制
      orderId: record.id,
    }));
  } else {
    detailDataSource.value = [];
  }
}

function handleDeleteDetail(index: number) {
  detailDataSource.value.splice(index, 1);
}

function handleQuantityChange(record: any) {
  // 数量变更处理逻辑
}

function startOperation() {
  if (voucherState.value !== 1) {
    message.warning('单据未审核，不能运算');
    return;
  }

  startComputedData.id = orderId.value;
  startComputedData.mrpData = detailDataSource.value.map(item => ({
    ...item,
    operationQuantity: item.baseQuantity,
    operationNumber: item.baseQuantity,
    baseUnit: item.baseUnitNumber,
  }));

  if (!startComputedData.id) {
    message.warning('请选择MRP运算方案');
    return;
  }

  if (startComputedData.mrpData.length === 0) {
    message.warning('请选择单据来源');
    return;
  }

  startVisible.value = true;
  runNewPercentage.value = 0;

  const timer = setInterval(() => {
    runNewPercentage.value += Math.round(Math.random());
    if (runNewPercentage.value >= 98) {
      clearInterval(timer);
    }
  }, 50);

  startOper(startComputedData).then(res => {
    if (res.code === 200) {
      runNewPercentage.value = 100;
      setTimeout(() => {
        startVisible.value = false;
        const data = res.data.map((element: any) => ({
          ...element,
          baseUnit: element.baseUnitName,
          baseUnitId: element.baseUnit,
          bussessPlanId: element.bussessPlan,
          bussessPlan: element.bussessPlan === 1 ? '采购' : element.bussessPlan === 2 ? '自制' : '委外',
          releaseStateId: element.releaseState,
          releaseState: element.releaseState === 1 ? '未下达' : element.releaseState === 2 ? '部分下达' : '全部下达',
        }));

        store.commit('SET_MRP', data);

        router.push({
          path: '/production/management/productionOrder',
          query: { numbers: 4 },
        });
      }, 200);
    }
  }).catch(err => {
    startVisible.value = false;
  });
}

function getDetailData() {
  // 获取详情数据
}

// 初始表单数据
const initialFormData = {
  voucherCode: '',
  voucherDate: new Date(),
  chooseSchemeId: '',
  operationState: 0,
  operationDate: '',
  voucherStateText: '未提交',
};
</script>

<style lang="less" scoped>
.production-demand {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .header-button-group {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .voucher-header {
    margin-bottom: 16px;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .source-switch {
    margin-bottom: 16px;
    padding: 8px 0;
  }

  .table-container {
    margin-bottom: 16px;
    height: 300px;
    overflow: auto;
  }

  .detail-table-container {
    margin-bottom: 16px;
    flex: 1;
    overflow: auto;
  }

  .operation-button {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }

  .progress-container {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
      margin-top: 16px;
      color: #1890ff;
    }
  }
}
</style>