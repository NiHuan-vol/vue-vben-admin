<!-- 生产管理->生产退料 -->
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
          :sourceCode="sourceCode"
          :isRefund="true"
        >
          <template #neworder>
            <a-dropdown class="btns" key="new" style="display: block">
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">
                  新增
                  <Icon type="down" style="color: rgb(24, 144, 255); vertical-align: middle;" />
                </div>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="0">
                  <a href="javascript:void(0)" @click="newForecast">新增</a>
                </a-menu-item>
                <a-menu-item key="1">
                  <a href="javascript:void(0)" @click="choiceBillsWork">选生产订单</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </BtnsWrapper>
      </div>

      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>

        <section v-show="showModel === 'list'">
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            :dataSourceCode="dataSourceCode"
            @switchList="switchList"
            @editClickOrder="editClickOrder"
            :businessType="businessType"
            :reportCode="reportCodeList"
          />
        </section>

        <section v-show="showModel === 'order'">
          <div>
            <span class="audit-status" v-show="voucherState === 0">待审核</span>
            <span class="audit-status" v-show="voucherState === 1 || voucherState === 10">{{ voucherState === 1 ? '已审核' : '关闭' }}</span>
            <span class="audit-status" v-show="voucherState === 2">已确认</span>
          </div>

          <a-form :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"><!-- 遮罩 --></div>
            </div>

            <div class="table-box">
              <a-table
                id="bills_tb"
                :columns="columns"
                :data-source="dataSource"
                :custom-row="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                size="small"
                bordered
              >
                <template #number="{ text, record, index }">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
                <template v-for="col in slotArray" :key="col" #"{{ col }}"="{ text, record, index }">
                  <div data-key="">
                    <EditableCell
                      :checkType="checkType"
                      :productCheckType="productCheckType"
                      :text="text"
                      :col="col"
                      :index="index"
                      :record="record"
                      :dataSource="dataSource"
                      :unitsDataDetails="unitsDataDetails"
                      :unitsAssistSelect="unitsAssistSelect"
                      :dynamicAllData="dynamicFormData"
                      :dynamicFormDataMap="dynamicFormDataMap"
                      @choiceAddData="(index, col, event) => choiceAddData(index, col, event)"
                      @change="(index, col, event) => onCellChange(index, col, event)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </a-table>
              <div class="edit-mask" v-show="editMask"><!-- 遮罩 --></div>
            </div>

            <div class="footer-box">
              <OrderDynamicForm
                :FormData="orderFooterData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-footer" v-show="editMask"><!-- 遮罩 --></div>
            </div>
          </a-form>
        </section>

        <section v-show="showModel === 'detail'">
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :businessType="businessType"
            :basePostData="basePostData"
          />
        </section>

        <section v-show="showModel === 'statistical'">
          <DynamicListDetails
            ref="statisticalSearchRef"
            :reportCode="reportCodeStatistical"
            :componentType="2"
            :businessType="businessType"
            :basePostData="basePostData"
          />
        </section>
      </div>

      <div class="contextmenu-box">
        <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
          <li @click="handleAdd">新增行</li>
          <li @click="handleDelete">删除行</li>
        </ul>
      </div>

      <DrawerBox
        ref="searchList"
        :unitData="unitData"
        :unitsData="unitsData"
        :unitsDataDetails="unitsDataDetails"
        @editClickOrder="editClickOrder"
      />
    </div>

    <!-- 加载中 -->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>

    <!-- 打印弹窗 -->
    <PrintModal
      v-if="printVisible"
      ref="printDom"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />

    <!-- 选生产任务单 -->
    <DragModal
      v-model="visibleTips"
      @cancel="cancel"
      @ok="ok"
      :title="'选生产订单'"
      :width="1100"
    >
      <section>
        <!-- 搜索条件 -->
        <a-form :layout="formLayout">
          <a-row class="order-dynamic-form-wrapper">
            <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
              <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="单据日期">
                <a-range-picker style="width: 220px;" @change="(date, dateString) => onChangeDate(date, dateString, 1)" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
              <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="加工单号">
                <a-input v-model="searchData.productionWorkCode" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
              <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="销售订单编号">
                <a-input v-model="searchData.saleOrderCode" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
              <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="预计开工日期">
                <a-range-picker style="width: 220px;" @change="(date, dateString) => onChangeDate(date, dateString, 2)" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
              <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="生产车间">
                <a-input-search v-model="searchData.officeName" placeholder="请选择生产车间" size="small" @search="() => handleSearch('choiceOfficeRef')" />
                <FormSearchGroup ref="choiceOfficeRef" :dynamicData="{ code: 'office', name: '生产车间', val: 'office', value: searchData.officeName }" @clickItem="setValueTips" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
              <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="产品名称">
                <a-input-search v-model="searchData.inventoryName" placeholder="请选择产品" size="small" @search="() => handleSearch('choiceInventoryRef')" />
                <FormSearchGroup ref="choiceInventoryRef" :dynamicData="{ code: 'inventory', name: '产品名称', val: 'inventory', value: searchData.inventoryName }" @clickItem="setValueTips" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <div style="text-align: right;">
          <a-button type="primary" icon="search" @click="searchBillsWork">搜索</a-button>
        </div>
      </section>

      <section>
        <!-- 列表 -->
        <p>产成品明细</p>
        <div style="min-height: 230px;">
          <a-table
            :columns="columnsChoiceHeader"
            :data-source="workOrderMain"
            bordered
            :pagination="false"
            :row-selection="rowSelectionMain"
            :scroll="{ x: 1000, y: 260 }"
          />
        </div>

        <p class="margin-top-10">物料明细</p>
        <div style="min-height: 230px;">
          <a-table
            :columns="columnsChoiceDetails"
            :data-source="workOrderDetail"
            bordered
            :pagination="false"
            :row-selection="rowSelectionDetails"
            :scroll="{ x: 1000, y: 260 }"
          />
        </div>
      </section>

      <template slot="footer">
        <div>
          <a-button type="primary" @click="ok">确认</a-button>
          <a-button @click="cancel" class="margin-left-10">关闭</a-button>
        </div>
      </template>
    </DragModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import { save, submitApi, examine, remove, getCode, choiceDispatch, submitOrder as submitOrderApi } from '@/api/production/picking';
import { useProMixin } from '@/mixins/procurement/pro';
import { Icon } from '@ant-design/icons-vue';
import { Button, Dropdown, Menu, Table, Form } from 'ant-design-vue';
import FormSearchGroup from '@/components/Form/FormSearchGroup.vue';
import getDate from '@/utils/tool/date';

// 组件定义
const BtnsWrapper = defineAsyncComponent(() => import('@/components/BtnsWrapper.vue'));
const DynamicList = defineAsyncComponent(() => import('@/components/DynamicList.vue'));
const DynamicListDetails = defineAsyncComponent(() => import('@/components/DynamicListDetails.vue'));
const OrderDynamicForm = defineAsyncComponent(() => import('@/components/OrderDynamicForm.vue'));
const EditableCell = defineAsyncComponent(() => import('@/components/EditableCell.vue'));
const DrawerBox = defineAsyncComponent(() => import('@/components/DrawerBox.vue'));
const PrintModal = defineAsyncComponent(() => import('@/components/PrintModal.vue'));
const DragModal = defineAsyncComponent(() => import('@/components/DragModal.vue'));

// 使用mixin
const { pro } = useProMixin();

// 响应式数据
const sourceCode = ref('RRS');
const reportCodeDetail = ref('RRS_Detail_Report');
const reportCodeStatistical = ref('RRS_Statistic_Report');
const reportCodeList = ref('RRS_List_Report');
const dataSourceCode = ref('RRS');
const businessType = ref(5);
const isPRF = ref(true);
const checkType = ref('is_material'); // 生产耗用
const productCheckType = ref('is_made_self'); // 产品属性：自制

// 样式相关
const grid = reactive({
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 8,
});
const formLayout = ref('inline');
const labelCol = ref({ span: 8 });
const wrapperCol = ref({ span: 14 });

// 搜索条件
const searchData = reactive({
  dataSource: 'ProductionWork',
  businessType: 5,
  officeId: null,
  officeName: null,
  inventoryId: null,
  inventoryName: null,
  expectStartDateEnd: null,
  expectStartDateStart: null,
  saleOrderCode: null,
  productionWorkCode: null,
  voucherCode: null,
  voucherDateEnd: null,
  voucherDateStart: null,
});

// 表格数据
const workOrderMain = ref<any[]>([]);
const workOrderDetail = ref<any[]>([]);
const workOrderDetailShow = ref<any[]>([]);
const selectedRowKeysMain = ref<number[]>([]);
const selectedRowsMain = ref<any[]>([]);
const selectedRowKeysDetails = ref<number[]>([]);
const selectedRowsDetails = ref<any[]>([]);

// 其他状态
const visibleTips = ref(false);
const loading = ref(false);
const printVisible = ref(false);
const incomingPrintData = ref<any>({});
const visible = ref(false);
const left = ref(0);
const top = ref(0);
const showModel = ref('list');
const orderId = ref('');
const voucherState = ref(0);
const editMask = ref(false);
const voucherTitle = ref('生产退料单');
const orderHeaderData = ref<any>({});
const orderFooterData = ref<any>({});
const basePostData = ref<any>({});
const columns = ref<any[]>([]);
const slotArray = ref<string[]>([]);
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<any>({});
const receiptNumber = ref('');
const isSaveRun = ref(true);
const sourceVoucherData = ref<any>({});

// 状态管理
const store = useStore();
const { proxy } = getCurrentInstance() as any;

// 计算属性
const rowSelectionMain = computed(() => ({
  columnWidth: 40,
  selectedRowKeys: selectedRowKeysMain.value,
  onChange: onSelectChangeMain,
}));

const rowSelectionDetails = computed(() => ({
  columnWidth: 40,
  selectedRowKeys: selectedRowKeysDetails.value,
  onChange: onSelectChangeDetails,
}));

// 表格列定义
const columnsChoiceHeader = ref<any[]>([
  {
    title: '序号',
    dataIndex: '',
    width: 40,
    customRender: ({ text, record, index }: any) => <span>{index + 1}</span>,
    align: 'center',
  },
  {
    title: '加工单号',
    dataIndex: 'voucherCode',
    width: 120,
  },
  {
    title: '单据日期',
    dataIndex: 'voucherDate',
  },
  {
    title: '生产车间名称',
    dataIndex: 'officeName',
  },
  {
    title: '产品编码',
    dataIndex: 'inventoryCode',
  },
  {
    title: '产品名称',
    dataIndex: 'inventoryName',
  },
  {
    title: '规格型号',
    dataIndex: 'inventorySpecification',
  },
  {
    title: '主计量',
    dataIndex: 'baseUnitName',
  },
  {
    title: '加工数量',
    dataIndex: 'baseQuantity',
  },
  {
    title: '完工数量',
    dataIndex: 'cumExecuteQuantity',
  },
]);

const columnsChoiceDetails = ref<any[]>([
  {
    title: '序号',
    dataIndex: '',
    width: 40,
    customRender: ({ text, record, index }: any) => <span>{index + 1}</span>,
    align: 'center',
  },
  {
    title: '加工单号',
    dataIndex: 'voucherCode',
    width: 120,
  },
  {
    title: '预出仓库',
    dataIndex: 'warehouseName',
  },
  {
    title: '材料编码',
    dataIndex: 'inventoryCode',
  },
  {
    title: '材料名称',
    dataIndex: 'inventoryName',
  },
  {
    title: '材料规格型号',
    dataIndex: 'inventorySpecification',
  },
  {
    title: '主计量',
    dataIndex: 'baseUnitName',
  },
  {
    title: '计划数量',
    dataIndex: 'plannedQuantity',
  },
  {
    title: '累积领用数量',
    dataIndex: 'cumPickQuantity',
  },
  {
    title: '已退数量',
    dataIndex: 'cumRetQuantity',
  },
  {
    title: '可退数量',
    dataIndex: 'cumPickQuantity',
    customRender: ({ text, record, index }: any) => record.cumPickQuantity - record.cumRetQuantity,
  },
  {
    title: '产品编码',
    dataIndex: 'productionInventoryCode',
  },
  {
    title: '产品名称',
    dataIndex: 'productionInventoryName',
  },
  {
    title: '产品规格型号',
    dataIndex: 'productionInventorySpecification',
  },
]);

// 方法定义
const newForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {}; // 清空来源数据
  initForm(1);
};

const submit = async (requestData: any) => {
  loading.value = true;
  try {
    const response = await save(requestData);
    if (response.code === 200) {
      proxy.$message.success('保存成功');
      editMask.value = true;
      isSaveRun.value = true;
      if (!orderId.value) {
        getIdByData(); // 获取最新一条数据
      }
    } else {
      proxy.$message.error(response.message);
      isSaveRun.value = true;
    }
  } catch (error) {
    proxy.$message.error('保存失败');
    isSaveRun.value = true;
    console.error('submit error:', error);
  } finally {
    loading.value = false;
  }
};

const submitOrder = async (type: number) => {
  const data = {
    id: orderId.value,
    status: type, // 状态 -1:撤回提交,0:提交
  };

  if (!orderId.value) {
    proxy.$message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === -1 && type === -1) {
    proxy.$message.warning('该单据未提交无需撤回提交');
    return;
  }

  try {
    const res = await submitOrderApi(data);
    if (res.code === 200) {
      if (type === 0) {
        proxy.$message.success('提交成功');
      } else {
        proxy.$message.success('撤回提交成功');
      }
      getIdByData();
    }
  } catch (error) {
    proxy.$message.error('提交操作异常');
    console.error('submitOrder error:', error);
  }
};

const auditClick = async (type: number) => {
  const requestData = {
    id: orderId.value,
    status: type,
  };

  try {
    const response = await examine(requestData);
    if (response.code === 200) {
      if (type === 1) {
        proxy.$message.success('审核成功');
        getIdByData();
      }
      if (type === 0) {
        proxy.$message.success('弃审成功');
        getIdByData();
      }
    } else {
      proxy.$message.warning(response.message);
    }
  } catch (error) {
    proxy.$message.error('审核操作异常');
    console.error('auditClick error:', error);
  }
};

const removeOrder = async (postData: any) => {
  try {
    const response = await remove(postData);
    if (response.code === 200) {
      proxy.$message.success('删除成功');
      orderId.value = '';
      voucherState.value = 0;
      getIdByData(); // 获取最新一条数据
    } else {
      proxy.$message.error(response.message);
    }
  } catch (error) {
    proxy.$message.error('删除操作异常');
    console.error('remove error:', error);
  }
};

const getCode = async () => {
  try {
    const res = await getCode();
    if (res.code === 200) {
      receiptNumber.value = res.message;
      for (let i = 0; i < orderHeaderData.value.length; i++) {
        if (orderHeaderData.value[i].code === 'voucherCode') {
          orderHeaderData.value[i].onEdit = false;
          orderHeaderData.value[i].value = receiptNumber.value;
        }
      }
    }
  } catch (error) {
    console.error('getCode error:', error);
  }
};

const onSelectChangeMain = (selectedRowKeys: number[], selectedRows: any[]) => {
  selectedRowKeysMain.value = selectedRowKeys;
  selectedRowsMain.value = selectedRows;
};

const onSelectChangeDetails = (selectedRowKeys: number[], selectedRows: any[]) => {
  selectedRowKeysDetails.value = selectedRowKeys;
  selectedRowsDetails.value = selectedRows;
};

const searchBillsWork = async () => {
  // 实现搜索逻辑
};

const ok = () => {
  // 选单确认逻辑
};

const cancel = () => {
  visibleTips.value = false;
};

const choiceBillsWork = () => {
  visibleTips.value = true;
};

const handleSearch = (refName: string) => {
  // 处理搜索逻辑
};

const setValueTips = (data: any) => {
  // 设置搜索值
};

const onChangeDate = (date: any, dateString: string[], type: number) => {
  // 日期变更处理
};

const onChangeTime = (date: any, dateString: string, code: string) => {
  // 时间变更处理
};

const setValue = (data: any, code: string) => {
  // 设置值
};

const initForm = (type: number) => {
  // 初始化表单
};

const getIdByData = async () => {
  // 获取数据
};

const searchClick = () => {
  showModel.value = 'list';
};

const switchList = (value: string) => {
  showModel.value = value;
};

const editClickOrder = (id: string) => {
  orderId.value = id;
  showModel.value = 'order';
  // 加载订单数据
};

const clickEdit = () => {
  editMask.value = false;
};

const deleteOrder = () => {
  if (!orderId.value) {
    proxy.$message.warning('请先选择一条记录');
    return;
  }
  proxy.$confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      removeOrder({ id: orderId.value });
    })
    .catch(() => {});
};

const printOrder = () => {
  // 打印订单
};

const cancelPrint = () => {
  printVisible.value = false;
};

const exportDetail = () => {
  // 导出明细
};

const onTableChange = (pagination: any, filters: any, sorter: any) => {
  // 表格变化处理
};

const customClick = (record: any, index: number) => {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault();
      visible.value = true;
      left.value = e.clientX;
      top.value = e.clientY;
    },
  };
};

const choiceAddData = (index: number, col: string, event: any) => {
  // 选择添加数据
};

const onCellChange = (index: number, col: string, event: any) => {
  if (dataSource.value[index]) {
    dataSource.value[index][col] = event;
    dataSource.value = [...dataSource.value];
  }
};

const handleAdd = () => {
  dataSource.value.push({});
  dataSource.value = [...dataSource.value];
};

const handleDelete = () => {
  // 删除行
};

const submitServer = () => {
  // 提交服务器
};

const turnThePage = () => {
  // 翻页
};

const syncOrder = () => {
  // 同步订单
};

// 监听搜索数据变化
watch(
  searchData,
  (data) => {
    if (data.officeName === '') {
      data.officeId = '';
    }
    if (data.inventoryName === '') {
      data.inventoryId = '';
    }
  },
  { deep: true }
);
</script>

<style lang="less" scoped>
@import '~@/style/setting/business.less';

.btn-wrapper {
  margin-bottom: 16px;
}

.report-box {
  padding: 20px;
  text-align: center;

  .icon {
    font-size: 36px;
  }

  .item-box {
    cursor: pointer;
    margin-top: 30px;
  }

  .item-box:hover {
    color: @primary-color;
  }

  .item-text {
    margin-top: 10px;
    font-size: 13px;
  }
}

.contextmenu-box {
  position: fixed;
  z-index: 100;
}

.contextmenu {
  width: 120px;
  margin: 0;
  padding: 5px 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style-type: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.contextmenu li {
  padding: 6px 12px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 8px;
  border-radius: 4px;
  font-size: 12px;
  &[v-show="voucherState === 0"] {
    background-color: #faad14;
    color: #fff;
  }
  &[v-show="voucherState === 1"] {
    background-color: #52c41a;
    color: #fff;
  }
  &[v-show="voucherState === 10"] {
    background-color: #8c8c8c;
    color: #fff;
  }
  &[v-show="voucherState === 2"] {
    background-color: #1890ff;
    color: #fff;
  }
}
</style>