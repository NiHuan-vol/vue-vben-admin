<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <BtnsWrapper
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
            <Dropdown class="btns" key="new" style="display:block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <Icon class="btns-icon" type="file-add" />
                <div class="btns-text">
                  新增
                  <Icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
                </div>
              </a>
              <Menu slot="overlay">
                <MenuItem key="0">
                  <a href="javascript:void(0)" @click="newForecast">新增</a>
                </MenuItem>
                <MenuItem key="1">
                  <a href="javascript:void(0)" @click="choiceBillsWork">选生产订单</a>
                </MenuItem>
              </Menu>
            </Dropdown>
          </template>
        </BtnsWrapper>
      </div>

      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>

        <!-- 列表视图 -->
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

        <!-- 订单视图 -->
        <section v-show="showModel === 'order'">
          <div>
            <span class="audit-status" v-show="voucherState === 0">待审核</span>
            <span class="audit-status" v-show="voucherState === 1 || voucherState === 10">{{ voucherState === 1 ? '已审核' : '关闭' }}</span>
            <span class="audit-status" v-show="voucherState === 2">{{ voucherState === 2 ? '已确认' : '' }}</span>
          </div>

          <Form :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"></div>
            </div>

            <div class="table-box">
              <Table
                id="bills_tb"
                :columns="columns"
                :data-source="dataSource"
                :customRow="customClick"
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
                <template v-for="col in slotArray" :slot="col" #default="{ text, record, index }">
                  <div data-key="">
                    <EditableCell
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
                      @choiceAddData="(col, $event) => choiceAddData(index, col, $event)"
                      @change="(col, $event) => onCellChange(index, col, $event)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </Table>
              <div class="edit-mask" v-show="editMask"></div>
            </div>

            <div class="footer-box">
              <OrderDynamicForm
                :FormData="orderFooterData"
                @changetime="onChangeTime"
                @clickItem="setValue"
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
            :businessType="businessType"
            :basePostData="basePostData"
          />
        </section>

        <!-- 统计视图 -->
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

      <!-- 右键菜单 -->
      <div class="contextmenu-box">
        <ul
          v-show="visible"
          :style="{ left: left + 'px', top: top + 'px' }"
          class="contextmenu"
        >
          <li @click="handleAdd()">新增行</li>
          <li @click="handleDelete()">删除行</li>
        </ul>
      </div>

      <!-- 抽屉组件 -->
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
      <Spin class="loading-content" tip="加载中..." />
    </div>

    <!-- 打印模态框 -->
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />

    <!-- 选生产任务单模态框 -->
    <DragModal
      v-model:visible="visibleTips"
      @cancel="cancel"
      @ok="ok"
      :title="'选生产订单'"
      :width="1100"
    >
      <section>
        <!-- 搜索条件 -->
        <Form :layout="formLayout">
          <Row class="order-dynamic-form-wrapper">
            <Col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <FormItem :label-col="labelCol" :wrapper-col="wrapperCol" label="单据日期">
                <RangePicker
                  style="width: 220px"
                  @change="(date, dateString) => onChangeDate(date, dateString, 1)"
                />
              </FormItem>
            </Col>
            <Col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <FormItem :label-col="labelCol" :wrapper-col="wrapperCol" label="加工单号">
                <Input v-model:value="searchData.productionWorkCode" />
              </FormItem>
            </Col>
            <Col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <FormItem :label-col="labelCol" :wrapper-col="wrapperCol" label="销售订单编号">
                <Input v-model:value="searchData.saleOrderCode" />
              </FormItem>
            </Col>
            <Col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <FormItem :label-col="labelCol" :wrapper-col="wrapperCol" label="预计开工日期">
                <RangePicker
                  style="width: 220px"
                  @change="(date, dateString) => onChangeDate(date, dateString, 2)"
                />
              </FormItem>
            </Col>
            <Col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <FormItem :label-col="labelCol" :wrapper-col="wrapperCol" label="生产车间">
                <InputSearch
                  v-model:value="searchData.officeName"
                  placeholder="请选择生产车间"
                  size="small"
                  @search="handleSearch('choiceOfficeRef')"
                />
                <FormSearchGroup
                  ref="choiceOfficeRef"
                  :dynamicData="{ code: 'office', name: '生产车间', val: 'office', value: searchData.officeName }"
                  @clickItem="setValueTips"
                />
              </FormItem>
            </Col>
            <Col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
              <FormItem :label-col="labelCol" :wrapper-col="wrapperCol" label="产品名称">
                <InputSearch
                  v-model:value="searchData.inventoryName"
                  placeholder="请选择产品"
                  size="small"
                  @search="handleSearch('choiceInventoryRef')"
                />
                <FormSearchGroup
                  ref="choiceInventoryRef"
                  :dynamicData="{ code: 'inventory', name: '产品名称', val: 'inventory', value: searchData.inventoryName }"
                  @clickItem="setValueTips"
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div style="text-align: right">
          <Button type="primary" icon="search" @click="searchBillsWork">搜索</Button>
        </div>
      </section>

      <section>
        <!-- 列表 -->
        <p>产成品明细</p>
        <div style="min-height: 230px">
          <Table
            :columns="columnsChoiceHeader"
            :data-source="workOrderMain"
            bordered
            :pagination="false"
            :row-selection="rowSelectionMain"
            :scroll="{ x: 1000, y: 260 }"
          />
        </div>

        <p class="margin-top-10">物料明细</p>
        <div style="min-height: 230px">
          <Table
            :columns="columnsChoiceDetails"
            :data-source="workOrderDetail"
            bordered
            :pagination="false"
            :row-selection="rowSelectionDetails"
            :scroll="{ x: 1000, y: 260 }"
          />
        </div>
      </section>

      <template #footer>
        <div>
          <Button type="primary" @click="ok">确认</Button>
          <Button @click="cancel" class="margin-left-10">关闭</Button>
        </div>
      </template>
    </DragModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button, Table, Form, Input, InputSearch, RangePicker, Spin, Dropdown, Menu, MenuItem, Icon } from 'ant-design-vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { save, submitApi, examine, remove, getCode, choiceDispatch, submitOrder } from '@/api/production/picking';
import pro from '@/mixins/procurement/pro';
import FormSearchGroup from '@/components/Form/FormSearchGroup';
import getDate from '@/utils/tool/date';

// 类型定义
interface ColumnType {
  title: string;
  dataIndex: string;
  key?: string;
  width?: number;
  customRender?: (text: any, record: any, index: number) => any;
  align?: 'left' | 'center' | 'right';
}

// 国际化
const { t } = useI18n();
const store = useStore();
const route = useRoute();
const router = useRouter();

// 响应式数据
const dyList = ref<any>(null);
const searchList = ref<any>(null);
const printDom = ref<any>(null);
const choiceOfficeRef = ref<any>(null);
const choiceInventoryRef = ref<any>(null);
const detailSearchRef = ref<any>(null);
const statisticalSearchRef = ref<any>(null);

// 基础数据
const basePostData = reactive<{
  dataSource: string;
  someBusinessType: string;
}>({
  dataSource: 'RRS',
  someBusinessType: '6',
});

const sourceCode = ref<string>('RRS');
const reportCodeDetail = ref<string>('RRS_Detail_Report');
const reportCodeStatistical = ref<string>('RRS_Statistic_Report');
const reportCodeList = ref<string>('RRS_List_Report');
const dataSourceCode = ref<string>('RRS');
const businessType = ref<number>(6);
const isPRF = ref<boolean>(true);
const checkType = ref<string>('is_material'); // 生产耗用
const productCheckType = ref<string>('is_made_self'); // 产品属性：自制

// 样式数据
const grid = reactive<{
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}>({
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 8,
});

const formLayout = ref<string>('inline');
const labelCol = reactive<{
  span: number;
}>({ span: 8 });

const wrapperCol = reactive<{
  span: number;
}>({ span: 14 });

// 搜索条件
const searchData = reactive<{
  dataSource: string;
  businessType: number;
  officeId: number | null;
  officeName: string | null;
  inventoryId: number | null;
  inventoryName: string | null;
  expectStartDateEnd: string | null;
  expectStartDateStart: string | null;
  saleOrderCode: string | null;
  productionWorkCode: string | null;
  voucherCode: string | null;
  voucherDateEnd: string | null;
  voucherDateStart: string | null;
}>({
  dataSource: 'ProductionWork',
  businessType: 6,
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
}));

// 表格数据
const workOrderMain = ref<Array<any>>([]);
const workOrderDetail = ref<Array<any>>([]);
const workOrderDetailShow = ref<Array<any>>([]);

// 选中的数据
const selectedRowKeysMain = ref<Array<string>>([]);
const selectedRowsMain = ref<Array<any>>([]);
const selectedRowKeysDetails = ref<Array<string>>([]);
const selectedRowsDetails = ref<Array<any>>([]);

// 模态框状态
const visibleTips = ref<boolean>(false);
const showModel = ref<string>('list');
const orderId = ref<string>('');
const voucherState = ref<number>(0);
const editMask = ref<boolean>(false);
const voucherTitle = ref<string>('生产补料单');
const loading = ref<boolean>(false);
const printVisible = ref<boolean>(false);
const incomingPrintData = ref<Array<any>>([]);
const visible = ref<boolean>(false);
const left = ref<number>(0);
const top = ref<number>(0);
const isRouterAlive = ref<boolean>(true);

// 表格列配置
const columns = ref<ColumnType[]>([]);
const slotArray = ref<Array<string>>([]);
const dataSource = ref<Array<any>>([]);
const orderHeaderData = ref<Array<any>>([]);
const orderFooterData = ref<Array<any>>([]);
const unitsDataDetails = ref<Record<string, any>>({});
const unitsAssistSelect = ref<Array<any>>([]);
const dynamicFormData = ref<Array<any>>([]);
const dynamicFormDataMap = ref<Record<string, any>>({});

// 选单表格列配置
const columnsChoiceHeader = ref<ColumnType[]>([
  {
    title: '序号',
    dataIndex: '',
    width: 40,
    customRender: (text, record, index) => <span>{index + 1}</span>,
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
]);

const columnsChoiceDetails = ref<ColumnType[]>([]);

// 行选择配置
const rowSelectionMain = reactive<{
  selectedRowKeys: string[];
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => void;
}>({
  selectedRowKeys: selectedRowKeysMain.value,
  onChange: (selectedRowKeys, selectedRows) => {
    selectedRowKeysMain.value = selectedRowKeys;
    selectedRowsMain.value = selectedRows;
  },
});

const rowSelectionDetails = reactive<{
  selectedRowKeys: string[];
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => void;
}>({
  selectedRowKeys: selectedRowKeysDetails.value,
  onChange: (selectedRowKeys, selectedRows) => {
    selectedRowKeysDetails.value = selectedRowKeys;
    selectedRowsDetails.value = selectedRows;
  },
});

// 方法
const newForecast = () => {
  // 新增操作
};

const choiceBillsWork = () => {
  visibleTips.value = true;
};

const searchBillsWork = () => {
  // 搜索生产订单
};

const handleSearch = (refName: string) => {
  // 处理搜索
  const refInstance = refName === 'choiceOfficeRef' ? choiceOfficeRef : choiceInventoryRef;
  if (refInstance.value) {
    refInstance.value.open();
  }
};

const setValueTips = (data: any) => {
  // 设置搜索值
};

const onChangeDate = (date: any, dateString: string[], type: number) => {
  // 处理日期变更
};

const ok = () => {
  // 确认选单
};

const cancel = () => {
  visibleTips.value = false;
};

const submitClick = () => {
  // 提交操作
};

const searchClick = () => {
  // 搜索操作
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
  // 编辑操作
};

const deleteOrder = () => {
  // 删除订单
};

const getIdByData = () => {
  // 通过数据获取ID
};

const auditClick = () => {
  // 审核操作
};

const turnThePage = () => {
  // 翻页操作
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

const editClickOrder = (record: any, flag: string) => {
  // 编辑点击订单
};

const onChangeTime = (time: string, field: string) => {
  // 时间变更
};

const setValue = (data: any, field: string) => {
  // 设置值
};

const onTableChange = (pagination: any, filters: any, sorter: any) => {
  // 表格变更
};

const choiceAddData = (index: number, col: string, data: any) => {
  // 选择添加数据
};

const onCellChange = (index: number, col: string, value: any) => {
  // 单元格变更
};

const handleAdd = () => {
  // 添加行
};

const handleDelete = () => {
  // 删除行
};

const customClick = (record: any, index: number) => ({
  // 自定义行点击
  on: {
    contextmenu: (e: MouseEvent) => {
      e.preventDefault();
      left.value = e.clientX;
      top.value = e.clientY;
      visible.value = true;
    },
    click: () => {
      visible.value = false;
    },
  },
});

const cancelPrint = () => {
  printVisible.value = false;
};

// 生命周期
onMounted(() => {
  // 初始化
});

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 路由变化时的处理
  }
);
</script>

<style lang="less">
.content-wrapper {
  .requisition-set-wrapper {
    .btn-wrapper {
      margin-bottom: 16px;
      .btns {
        display: inline-block;
        margin-right: 8px;
        .btns-icon {
          margin-right: 4px;
        }
        .btns-text {
          display: inline-block;
        }
      }
    }

    .documents-wrapper {
      background: #fff;
      padding: 16px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .header-box,
      .footer-box {
        margin-bottom: 16px;
      }

      .table-box {
        margin-bottom: 16px;
      }

      .audit-status {
        display: inline-block;
        margin-right: 8px;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      .audit-status[v-show="voucherState === 0"] {
        background: #fff3cd;
        color: #856404;
      }

      .audit-status[v-show="voucherState === 1 || voucherState === 10"] {
        background: #d4edda;
        color: #155724;
      }

      .audit-status[v-show="voucherState === 2"] {
        background: #cce5ff;
        color: #004085;
      }
    }

    .contextmenu-box {
      position: fixed;
      z-index: 1000;
      .contextmenu {
        background: #fff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 4px 0;
        min-width: 120px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        li {
          padding: 6px 16px;
          cursor: pointer;
          &:hover {
            background: #f5f5f5;
          }
        }
      }
    }

    .loading-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      .loading-content {
        font-size: 16px;
      }
    }
  }
}

.margin-top-10 {
  margin-top: 10px;
}

.margin-left-10 {
  margin-left: 10px;
}
</style>