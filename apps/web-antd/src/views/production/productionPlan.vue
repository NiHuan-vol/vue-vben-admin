<template>
  <div class="content-wrapper">
    <BasicPageHeader
      :title="'计划管理'"
      :sub-title="'主生产计划'"
      :show-breadcrumb="true"
    />

    <div class="requisition-set-wrapper p-4 bg-white rounded-md shadow-sm mt-4">
      <!-- 按钮区域 -->
      <div class="btn-wrapper flex flex-wrap gap-2 mb-4">
        <BasicButton
          type="primary"
          @click="handleNewForecast"
          :icon="<FileAddOutlined />"
        >
          新增
        </BasicButton>

        <Dropdown
          :menuItems="newOrderMenuItems"
          trigger="click"
          @select="handleNewOrderSelect"
        >
          <BasicButton
            :icon="<FileAddOutlined />"
            type="primary"
            ghost
          >
            新增
            <DownOutlined class="ml-1" />
          </BasicButton>
        </Dropdown>

        <Dropdown
          :menuItems="closeMenuItems"
          trigger="click"
          @select="handleCloseSelect"
        >
          <BasicButton
            :icon="<CloseOutlined />"
            type="primary"
            ghost
          >
            关闭
            <DownOutlined class="ml-1" />
          </BasicButton>
        </Dropdown>

        <Dropdown
          :menuItems="releaseMenuItems"
          trigger="click"
          @select="handleReleaseSelect"
        >
          <BasicButton
            :icon="<SendOutlined />"
            type="primary"
            ghost
            :disabled="![1, 2, 3].includes(num)"
          >
            下达
            <DownOutlined class="ml-1" />
          </BasicButton>
        </Dropdown>

        <Dropdown
          :menuItems="mergeSplitMenuItems"
          trigger="click"
          @select="handleMergeSplitSelect"
        >
          <BasicButton
            :icon="<SnippetsOutlined />"
            type="primary"
            ghost
            :disabled="voucherState === -1 || voucherState === 0"
          >
            合拆
            <DownOutlined class="ml-1" />
          </BasicButton>
        </Dropdown>

        <BasicButton
          type="primary"
          ghost
          @click="handleSubmitOrder"
          :disabled="!orderId || (voucherState === -1 && submitType === -1)"
        >
          提交
        </BasicButton>

        <BasicButton
          type="primary"
          ghost
          @click="handleAuditClick"
          :disabled="!orderId || voucherState === 1"
        >
          审核
        </BasicButton>

        <BasicButton
          type="primary"
          danger
          ghost
          @click="handleDelete"
          :disabled="!orderId || voucherState !== -1"
        >
          删除
        </BasicButton>
      </div>

      <!-- 状态显示 -->
      <div class="mb-4">
        <span
          class="audit-status px-2 py-1 rounded-full text-sm"
          :class="{
            'bg-yellow-100 text-yellow-800': voucherState === 0,
            'bg-green-100 text-green-800': voucherState === 1,
            'bg-gray-100 text-gray-800': voucherState === 10,
          }"
        >
          {{ voucherState === 0 ? '待审核' : voucherState === 1 ? '已审核' : '关闭' }}
        </span>
      </div>

      <!-- 视图切换 -->
      <Tabs
        v-model:value="showModel"
        type="card"
        size="middle"
        @change="handleTabChange"
      >
        <TabPane key="list" title="列表">
          <BasicTable
            :columns="listColumns"
            :data-source="listData"
            :pagination="{ pageSize: 10 }"
            @dblclick-row="handleRowDblClick"
          />
        </TabPane>
        <TabPane key="order" title="订单">
          <div v-if="orderId">
            <!-- 订单表单 -->
            <div class="header-box mb-4">
              <Form
                :model="orderHeaderData"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                layout="inline"
              >
                <!-- 表头字段 -->
                <FormItem label="单据编号" prop="voucherCode">
                  <Input v-model:value="orderHeaderData.voucherCode" disabled />
                </FormItem>
                <FormItem label="单据日期" prop="voucherDate">
                  <DatePicker v-model:value="orderHeaderData.voucherDate" />
                </FormItem>
                <FormItem label="计划员" prop="plannerName">
                  <Input v-model:value="orderHeaderData.plannerName" />
                </FormItem>
                <FormItem label="状态" prop="statusName">
                  <Input v-model:value="orderHeaderData.statusName" disabled />
                </FormItem>
              </Form>
            </div>

            <!-- 表格数据 -->
            <BasicTable
              ref="tableRef"
              :columns="orderColumns"
              :data-source="dataSource"
              :row-selection="{ selectedRowKeys, onChange: handleSelectChange }"
              :scroll="{ x: 1000, y: 400 }"
              :pagination="false"
              bordered
            >
              <template #number="{ index }">
                <div v-if="index === dataSource.length - 1">合计</div>
                <div v-else>{{ index + 1 }}</div>
              </template>
              <template #inventoryCode="{ record }">
                <Input v-model:value="record.inventoryCode" />
              </template>
              <template #inventoryName="{ record }">
                <Input v-model:value="record.inventoryName" />
              </template>
              <template #planQuantity="{ record }">
                <InputNumber v-model:value="record.planQuantity" />
              </template>
            </BasicTable>

            <!-- 表尾信息 -->
            <div class="footer-box mt-4">
              <Form
                :model="orderFooterData"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                layout="inline"
              >
                <FormItem label="备注" prop="remark">
                  <Input.TextArea v-model:value="orderFooterData.remark" />
                </FormItem>
              </Form>
            </div>
          </div>
          <div v-else class="text-center py-10">
            请选择或新增订单
          </div>
        </TabPane>
        <TabPane key="detail" title="明细">
          <BasicTable :columns="detailColumns" :data-source="detailData" />
        </TabPane>
        <TabPane key="statistical" title="统计">
          <BasicTable :columns="statisticalColumns" :data-source="statisticalData" />
        </TabPane>
      </Tabs>
    </div>

    <!-- 拆分物料模态框 -->
    <Modal
      v-model:visible="visibleSplit"
      title="拆分物料"
      @ok="handleSplitSubmit"
      @cancel="handleSplitCancel"
    >
      <div v-if="splitData">
        <p>物料编码: {{ splitData.inventoryCode }}</p>
        <p>物料名称: {{ splitData.inventoryName }}</p>
        <p>当前数量: {{ splitData.planQuantity }}</p>
        <div class="mt-4">
          <BasicTable
            :columns="splitColumns"
            :data-source="splitDataSource"
            :pagination="false"
          >
            <template #splitQuantity="{ record, index }">
              <InputNumber
                v-model:value="record.splitQuantity"
                :min="1"
                :max="splitData.planQuantity - getSumBefore(index)"
              />
            </template>
          </BasicTable>
          <div class="mt-2 text-right">
            已拆分: {{ getTotalSplit() }} / {{ splitData.planQuantity }}
          </div>
        </div>
      </div>
    </Modal>

    <!-- 加载中 -->
    <Loading v-if="loading" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { BasicTable, TableColumn } from '/@/components/Table';
import { Tabs, TabPane } from 'ant-design-vue';
import {
  BasicButton,
  BasicPageHeader,
  Dropdown,
  Form,
  FormItem,
  Input,
  InputNumber,
  DatePicker,
  Modal,
  Loading,
} from '/@/components';
import {
  FileAddOutlined,
  CloseOutlined,
  SendOutlined,
  SnippetsOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { useRouter } from 'vue-router';
import moment from 'moment';

// 响应式数据
const showModel = ref('list');
const orderId = ref('');
const voucherState = ref(-1);
const closedState = ref(1);
const loading = ref(false);
const editMask = ref(true);
const selectedRowKeys = ref<string[]>([]);
const selectedRowKeysList = ref<any[]>([]);
const listArr = ref<any[]>([]);
const num = ref(0);
const visibleSplit = ref(false);
const splitData = ref<any>(null);
const splitDataSource = ref<any[]>([]);
const submitType = ref(0);

// 数据
const listData = ref<any[]>([]);
const dataSource = ref<any[]>([]);
const detailData = ref<any[]>([]);
const statisticalData = ref<any[]>([]);

// 表单数据
const orderHeaderData = reactive({
  voucherCode: '',
  voucherDate: moment().format('YYYY-MM-DD'),
  plannerName: '',
  statusName: '',
});

const orderFooterData = reactive({
  remark: '',
});

// 菜单配置
const newOrderMenuItems = [
  { key: '0', label: '新增' },
  { key: '1', label: '选销售订单' },
];

const closeMenuItems = [
  { key: '0', label: '打开' },
  { key: '1', label: '关闭' },
];

const releaseMenuItems = [
  { key: '0', label: '下达生产', disabled: num.value !== 2 },
  { key: '1', label: '下达委外', disabled: num.value !== 3 },
  { key: '2', label: '下达请购', disabled: num.value !== 1 },
];

const mergeSplitMenuItems = [
  { key: '0', label: '合并' },
  { key: '1', label: '拆分' },
];

// 表格列配置
const listColumns: TableColumn[] = [
  { title: '序号', width: 50, customRender: ({ index }) => index + 1 },
  { title: '单据编号', dataIndex: 'voucherCode' },
  { title: '单据日期', dataIndex: 'voucherDate' },
  { title: '计划员', dataIndex: 'plannerName' },
  { title: '状态', dataIndex: 'statusName' },
  { title: '创建人', dataIndex: 'createUserName' },
  { title: '创建时间', dataIndex: 'createTime' },
];

const orderColumns: TableColumn[] = [
  { title: '序号', width: 50, dataIndex: 'number', slots: { customRender: 'number' } },
  { title: '物料编码', dataIndex: 'inventoryCode', slots: { customRender: 'inventoryCode' } },
  { title: '物料名称', dataIndex: 'inventoryName', slots: { customRender: 'inventoryName' } },
  { title: '规格型号', dataIndex: 'inventorySpecification' },
  { title: '单位', dataIndex: 'unitName' },
  { title: '计划数量', dataIndex: 'planQuantity', slots: { customRender: 'planQuantity' } },
  { title: '已下达数量', dataIndex: 'releasedQuantity' },
  { title: '计划开始日期', dataIndex: 'planBeginDate' },
  { title: '计划完成日期', dataIndex: 'planEndDate' },
  { title: '业务类型', dataIndex: 'bussessPlanName' },
];

const detailColumns: TableColumn[] = [
  { title: '序号', width: 50, customRender: ({ index }) => index + 1 },
  { title: '物料编码', dataIndex: 'inventoryCode' },
  { title: '物料名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'inventorySpecification' },
  { title: '单位', dataIndex: 'unitName' },
  { title: '数量', dataIndex: 'quantity' },
];

const statisticalColumns: TableColumn[] = [
  { title: '物料编码', dataIndex: 'inventoryCode' },
  { title: '物料名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'inventorySpecification' },
  { title: '单位', dataIndex: 'unitName' },
  { title: '总数量', dataIndex: 'totalQuantity' },
];

const splitColumns: TableColumn[] = [
  { title: '序号', width: 50, customRender: ({ index }) => index + 1 },
  { title: '拆分数量', dataIndex: 'splitQuantity', slots: { customRender: 'splitQuantity' } },
  { title: '备注', dataIndex: 'remark' },
];

// 注入依赖
const message = useMessage();
const router = useRouter();

// 生命周期
onMounted(() => {
  // 模拟加载列表数据
  fetchListData();
});

// 方法
const fetchListData = () => {
  // 模拟API调用
  listData.value = [
    {
      id: '1',
      voucherCode: 'PP2023001',
      voucherDate: '2023-05-10',
      plannerName: '张三',
      statusName: '已审核',
      createUserName: '系统管理员',
      createTime: '2023-05-10 10:30:00',
    },
    // 更多数据...
  ];
};

const handleTabChange = (key: string) => {
  showModel.value = key;
  if (key === 'list') {
    fetchListData();
  }
};

const handleRowDblClick = (record: any) => {
  orderId.value = record.id;
  showModel.value = 'order';
  // 模拟加载订单数据
  loadOrderData(record.id);
};

const loadOrderData = (id: string) => {
  loading.value = true;
  // 模拟API调用
  setTimeout(() => {
    orderHeaderData.voucherCode = 'PP2023001';
    orderHeaderData.voucherDate = '2023-05-10';
    orderHeaderData.plannerName = '张三';
    orderHeaderData.statusName = '已审核';

    dataSource.value = [
      {
        id: '1',
        inventoryCode: 'M001',
        inventoryName: '产品A',
        inventorySpecification: '规格1',
        unitName: '个',
        planQuantity: 100,
        releasedQuantity: 50,
        planBeginDate: '2023-05-15',
        planEndDate: '2023-05-20',
        bussessPlanId: 2,
        bussessPlanName: '自制',
      },
      // 更多数据...
      { id: 'total', inventoryCode: '合计', planQuantity: 100, releasedQuantity: 50 },
    ];

    loading.value = false;
  }, 500);
};

const handleNewForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  voucherState.value = -1;
  orderId.value = '';
  orderHeaderData.voucherCode = '';
  orderHeaderData.voucherDate = moment().format('YYYY-MM-DD');
  orderHeaderData.plannerName = '';
  orderHeaderData.statusName = '待保存';
  dataSource.value = [{ id: '1', inventoryCode: '', inventoryName: '', planQuantity: 0 }];
};

const handleNewOrderSelect = (key: string) => {
  if (key === '0') {
    handleNewForecast();
  } else if (key === '1') {
    // 选销售订单逻辑
    message.info('选销售订单功能待实现');
  }
};

const handleCloseSelect = (key: string) => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  const type = key === '0' ? 1 : 10;
  // 模拟API调用
  message.success(`订单${type === 1 ? '打开' : '关闭'}成功`);
  loadOrderData(orderId.value);
};

const handleReleaseSelect = (key: string) => {
  if (listArr.value.length === 0) {
    message.warning('请先选择数据');
    return;
  }

  const typeMap = ['ReleaseProduction', 'AssignOutsourcing', 'ReleaseProcurement'];
  const typeTextMap = ['生产', '委外', '请购'];
  // 模拟API调用
  message.success(`成功下达${typeTextMap[Number(key)]}订单`);
};

const handleMergeSplitSelect = (key: string) => {
  if (key === '0') {
    // 合并
    if (selectedRowKeysList.value.length < 2) {
      message.warning('请至少选择2条物料合并');
      return;
    }

    const inventoryCodes = [...new Set(selectedRowKeysList.value.map((item) => item.inventoryCode))];
    if (inventoryCodes.length > 1) {
      message.warning('不同物料，不能合并');
      return;
    }

    // 模拟API调用
    message.success('合并成功');
    loadOrderData(orderId.value);
  } else if (key === '1') {
    // 拆分
    if (selectedRowKeysList.value.length === 0) {
      message.warning('请选择拆分的物料');
      return;
    }

    if (selectedRowKeysList.value.length > 1) {
      message.warning('只能选择一种物料拆分');
      return;
    }

    splitData.value = selectedRowKeysList.value[0];
    splitDataSource.value = [{ splitQuantity: 0, remark: '' }];
    visibleSplit.value = true;
  }
};

const handleSubmitOrder = () => {
  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === -1 && submitType.value === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  // 模拟API调用
  message.success(submitType.value === 0 ? '提交成功' : '撤回提交成功');
  submitType.value = -submitType.value;
  loadOrderData(orderId.value);
};

const handleAuditClick = () => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  // 模拟API调用
  message.success('审核成功');
  voucherState.value = 1;
  loadOrderData(orderId.value);
};

const handleDelete = () => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除当前订单吗？',
    onOk: () => {
      // 模拟API调用
      message.success('删除成功');
      orderId.value = '';
      showModel.value = 'list';
      fetchListData();
    },
  });
};

const handleSelectChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRowKeysList.value = rows;
  listArr.value = rows;

  if (rows.length > 0) {
    determineNum(rows);
  } else {
    num.value = 0;
  }
};

const determineNum = (rows: any[]) => {
  const planIds = rows.map((item) => item.bussessPlanId);
  const uniqueIds = [...new Set(planIds)];

  if (uniqueIds.length !== 1) {
    num.value = 0;
    return;
  }

  num.value = uniqueIds[0];
};

const handleSplitSubmit = () => {
  const totalSplit = getTotalSplit();
  if (totalSplit !== splitData.value.planQuantity) {
    message.warning('拆分数量总和必须等于原数量');
    return;
  }

  // 模拟API调用
  message.success('拆分成功');
  visibleSplit.value = false;
  loadOrderData(orderId.value);
};

const handleSplitCancel = () => {
  visibleSplit.value = false;
  splitDataSource.value = [];
};

const getSumBefore = (index: number) => {
  return splitDataSource.value
    .slice(0, index)
    .reduce((sum, item) => sum + (item.splitQuantity || 0), 0);
};

const getTotalSplit = () => {
  return splitDataSource.value.reduce((sum, item) => sum + (item.splitQuantity || 0), 0);
};
</script>

<style lang="less" scoped>
.requisition-set-wrapper {
  width: calc(100% - 20px);
  margin: 0 auto;
}

.audit-status {
  display: inline-block;
}

.header-box,
.footer-box {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}

.btn-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>"