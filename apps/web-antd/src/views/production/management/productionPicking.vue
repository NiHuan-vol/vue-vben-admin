<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <btns-wrapper
          @submitClick="submitClick"
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
        >
          <template #neworder>
            <a-dropdown class="btns" key="new" style="display:block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增
                  <a-icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
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
        </btns-wrapper>
      </div>

      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>

        <section v-show="showModel === 'list'">
          <dynamicList
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
            <span class="audit-status" v-show="voucherState === 2">{{ voucherState === 2 ? '已确认' : '' }}</span>
          </div>

          <a-form-model :layout="formLayout">
            <div class="header-box">
              <order-dynamic-form
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"></div>
            </div>

            <div class="table-box">
              <a-table
                id="bills_tb"
                :columns="columns"
                :data-source="dataSource"
                :customRow="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                :size="small"
                bordered
              >
                <template #number v-if="isRouterAlive" slot-scope="{ text, record, index }">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
                <template v-for="col in slotArray" :key="col" :slot="col" slot-scope="{ text, record, index }">
                  <div data-key="">
                    <editable-cell
                      v-if="isRouterAlive"
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
              <div class="edit-mask" v-show="editMask"></div>
            </div>

            <div class="footer-box">
              <order-dynamic-form
                :FormData="orderFooterData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-footer" v-show="editMask"></div>
            </div>
          </a-form-model>
        </section>

        <section v-show="showModel === 'detail'">
          <dynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :businessType="businessType"
            :basePostData="basePostData"
          />
        </section>

        <section v-show="showModel === 'statistical'">
          <dynamicListDetails
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

      <drawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder" />
    </div>

    <!-- 加载中 -->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>

    <print-modal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint" />

    <!-- 选加工单 -->
    <drag-modal v-model="visibleTips" @cancel="cancel" @ok="ok" :title="'选择生产订单'" :width="1100">
      <section>
        <a-form-model :layout="formLayout">
          <a-row class="order-dynamic-form-wrapper">
            <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="单据日期">
                <a-range-picker style="width:220px;" @change="(date, dateString) => onChangeDate(date, dateString, 1)" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="加工单号">
                <a-input v-model="searchData.productionWorkCode" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="销售订单编号">
                <a-input v-model="searchData.saleOrderCode" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="预计开工日期">
                <a-range-picker style="width:220px;" @change="(date, dateString) => onChangeDate(date, dateString, 2)" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="生产车间">
                <a-input-search v-model="searchData.officeName" placeholder="请选择生产车间" size="small" @search="() => handleSearch('choiceOfficeRef')" />
                <form-search-group ref="choiceOfficeRef" :dynamicData="{ code: 'office', name: '生产车间', val: 'office', value: searchData.officeName }" @clickItem="setValueTips" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="产品名称">
                <a-input-search v-model="searchData.inventoryName" placeholder="请选择产品" size="small" @search="() => handleSearch('choiceInventoryRef')" />
                <form-search-group ref="choiceInventoryRef" :dynamicData="{ code: 'inventory', name: '产品名称', val: 'inventory', value: searchData.inventoryName }" @clickItem="setValueTips" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
        <div style="text-align:right">
          <a-button type="primary" icon="search" @click="searchBillsWork">搜索</a-button>
        </div>
      </section>

      <section>
        <p>产成品明细</p>
        <div style="min-height:230px">
          <a-table :columns="columnsChoiceHeader" :data-source="workOrderMain" bordered :pagination="false" :row-selection="rowSelectionMain" :scroll="{ x: 1000, y: 260 }" />
        </div>

        <p class="margin-top-10">物料明细</p>
        <div style="min-height:230px">
          <a-table :columns="columnsChoiceDetails" :data-source="workOrderDetail" bordered :pagination="false" :row-selection="rowSelectionDetails" :scroll="{ x: 1000, y: 260 }" />
        </div>
      </section>

      <template #footer>
        <div>
          <a-button type="primary" @click="ok">确认</a-button>
          <a-button @click="cancel" class="margin-left-10">关闭</a-button>
        </div>
      </template>
    </drag-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, defineComponent } from 'vue';
import { save, submitApi, examine, remove, getCode, choiceDispatch, submitOrder } from '@/api/production/picking';
import { Pro } from '@/mixins/procurement/pro';
import FormSearchGroup from '@/components/Form/FormSearchGroup';
import getDate from '@/utils/tool/date';
import { useRoute, useRouter } from 'vue-router';

// 基础数据定义
const basePostData = reactive<{[key: string]: any}>({
  dataSource: 'RRS',
  someBusinessType: '4',
});

const sourceCode = ref('RRS');
const reportCodeDetail = ref('RRS_Detail_Report');
const reportCodeStatistical = ref('RRS_Statistic_Report');
const reportCodeList = ref('RRS_List_Report');
const dataSourceCode = ref('RRS');
const businessType = ref(4);
const isPRF = ref(true);
const checkType = ref('is_material'); // 生产耗用
const productCheckType = ref('is_made_self'); // 产品属性：自制

// 样式配置
const grid = reactive({
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 8
});

const formLayout = ref('inline');
const labelCol = ref({ span: 8 });
const wrapperCol = ref({ span: 14 });

// 搜索条件
const searchData = reactive<{[key: string]: any}>({
  dataSource: 'ProductionWork',
  businessType: 4,
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

// 其他状态数据
const workOrderMain = ref<any[]>([]);
const workOrderDetail = ref<any[]>([]);
const workOrderDetailShow = ref<any[]>([]);
const selectedRowKeysMain = ref<string[]>([]);
const selectedRowsMain = ref<any[]>([]);
const selectedRowKeysDetails = ref<string[]>([]);
const selectedRowsDetails = ref<any[]>([]);
const visibleTips = ref(false);
const isRouterAlive = ref(true);
const showModel = ref('list');
const orderId = ref('');
const voucherState = ref(0);
const editMask = ref(false);
const loading = ref(false);
const printVisible = ref(false);
const incomingPrintData = ref<any>({});
const visible = ref(false);
const left = ref(0);
const top = ref(0);
const voucherTitle = ref('生产领料单');
const orderHeaderData = reactive<{[key: string]: any}>({});
const orderFooterData = reactive<{[key: string]: any}>({});
const dataSource = ref<any[]>([]);
const slotArray = ref<string[]>([]);
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<{[key: string]: any}>({});
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);

// 表格列配置
const columns = ref<any[]>([
  { title: '序号', dataIndex: 'number', scopedSlots: { customRender: 'number' }, width: 50, align: 'center' },
  // 需要根据实际情况补充其他列
]);

const columnsChoiceHeader = ref<any[]>([
  {
    title: '序号',
    dataIndex: '',
    width: 40,
    customRender: ({ record, index }: { record: any, index: number }) => <span>{index + 1}</span>,
    align: 'center'
  },
  { title: '加工单号', dataIndex: 'voucherCode', width: 120 },
  { title: '单据日期', dataIndex: 'voucherDate' },
  { title: '生产车间名称', dataIndex: 'officeName' },
  { title: '产品编码', dataIndex: 'inventoryCode' },
  // 需要根据实际情况补充其他列
]);

const columnsChoiceDetails = ref<any[]>([
  // 物料明细列配置
]);

// 行选择配置
const rowSelectionMain = ref<{[key: string]: any}>({
  selectedRowKeys: selectedRowKeysMain.value,
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
    selectedRowKeysMain.value = selectedRowKeys;
    selectedRowsMain.value = selectedRows;
  },
});

const rowSelectionDetails = ref<{[key: string]: any}>({
  selectedRowKeys: selectedRowKeysDetails.value,
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
    selectedRowKeysDetails.value = selectedRowKeys;
    selectedRowsDetails.value = selectedRows;
  },
});

// 生命周期钩子
onMounted(() => {
  // 初始化逻辑
  initData();
});

onUnmounted(() => {
  isRouterAlive.value = false;
});

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 这里可以添加初始化数据的逻辑
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    loading.value = false;
  }
};

// 核心业务逻辑方法
const newForecast = () => {
  // 新增预测
  showModel.value = 'order';
  orderId.value = '';
  voucherState.value = 0;
  // 重置表单数据
  Object.keys(orderHeaderData).forEach(key => {
    orderHeaderData[key] = '';
  });
  Object.keys(orderFooterData).forEach(key => {
    orderFooterData[key] = '';
  });
  dataSource.value = [];
};

const choiceBillsWork = () => {
  // 选择生产订单
  visibleTips.value = true;
};

const searchBillsWork = async () => {
  // 搜索生产订单
  loading.value = true;
  try {
    // 实现搜索逻辑
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    loading.value = false;
  }
};

const ok = () => {
  // 确认选择生产订单
  // 处理选中的数据
  visibleTips.value = false;
};

const cancel = () => {
  // 取消选择
  visibleTips.value = false;
};

const handleSearch = (refName: string) => {
  // 处理搜索
  const ref = (getCurrentInstance()?.refs as any)[refName];
  if (ref) {
    ref.show();
  }
};

const setValueTips = (data: any, type: string) => {
  // 设置搜索值
  if (type === 'office') {
    searchData.officeId = data.id;
    searchData.officeName = data.name;
  } else if (type === 'inventory') {
    searchData.inventoryId = data.id;
    searchData.inventoryName = data.name;
  }
};

const handleAdd = () => {
  // 新增行
  dataSource.value.push({
    // 新增行的默认数据
  });
};

const handleDelete = () => {
  // 删除行
  // 实现删除逻辑
};

const submitClick = () => {
  // 提交
};

const searchClick = () => {
  // 搜索
};

const printOrder = () => {
  // 打印订单
};

const switchList = () => {
  // 切换列表
};

const submitServer = () => {
  // 提交到服务器
};

const clickEdit = () => {
  // 点击编辑
};

const deleteOrder = () => {
  // 删除订单
};

const getIdByData = () => {
  // 通过数据获取ID
};

const auditClick = () => {
  // 审核点击
};

const turnThePage = () => {
  // 翻页
};

const syncOrder = () => {
  // 同步订单
};

const submitOrder = () => {
  // 提交订单
};

const exportDetail = () => {
  // 导出明细
};

const editClickOrder = () => {
  // 编辑点击订单
};

const onChangeTime = () => {
  // 时间变化
};

const setValue = () => {
  // 设置值
};

const onTableChange = () => {
  // 表格变化
};

const choiceAddData = () => {
  // 选择添加数据
};

const onCellChange = () => {
  // 单元格变化
};

const customClick = () => {
  // 自定义点击
};

const cancelPrint = () => {
  // 取消打印
  printVisible.value = false;
};

const onChangeDate = () => {
  // 日期变化
};
</script>

<style lang="less" scoped>
.content-wrapper {
  padding: 16px;
}

.btn-wrapper {
  margin-bottom: 16px;
}

.documents-wrapper {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
}

.header-box,
.footer-box {
  margin-bottom: 16px;
}

.table-box {
  margin-bottom: 16px;
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
  z-index: 1000;
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
}

// 更多样式定义
</style>