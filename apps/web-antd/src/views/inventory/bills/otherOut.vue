<template>
  <div class="other-out-bill-container">
    <!-- 按钮区 -->
    <BtnsWrapper
      :isFull="true"
      :leftBtns="leftBtns"
      :rightBtns="rightBtns"
      :searchBar="searchBar"
      :tabMenu="tabMenu"
      @handleTabChange="handleTabChange"
    />

    <!-- 列表视图 -->
    <div v-if="activeTab === 'list'" class="bill-list-container">
      <BasicTable
        :columns="columns"
        :request="handleTableRequest"
        :rowKey="'record.id'"
        :rowSelection="{ type: 'checkbox', selectedRowKeys: selectedRowKeys, onChange: handleRowSelectChange }"
        :pagination="paginationConfig"
        :loading="loading"
        @register="registerTable"
      >
        <template #action="{ record }">
          <TableAction :actions="getTableAction(record)" />
        </template>
      </BasicTable>
    </div>

    <!-- 订单视图 -->
    <div v-if="activeTab === 'order'" class="bill-order-container">
      <OrderDynamicForm
        ref="orderFormRef"
        :formData="formData"
        :billType="billType"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>

    <!-- 明细视图 -->
    <div v-if="activeTab === 'detail'" class="bill-detail-container">
      <DynamicList
        ref="dynamicListRef"
        :dataSource="detailList"
        :columns="detailColumns"
        :editable="editable"
        :showSummary="true"
        @editChange="handleEditChange"
        @addRow="handleAddRow"
        @deleteRow="handleDeleteRow"
      />
    </div>

    <!-- 统计视图 -->
    <div v-if="activeTab === 'statistics'" class="bill-statistics-container">
      <BasicTable
        :columns="statisticsColumns"
        :dataSource="statisticsData"
        :showSummary="true"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Button, message } from 'ant-design-vue';
import { BasicTable, useTable, TableAction } from '@/components/Table';
import { BtnsWrapper } from '@/components/BtnsWrapper';
import { OrderDynamicForm } from '@/components/OrderDynamicForm';
import { DynamicList } from '@/components/DynamicList';
import { EditableCell } from '@/components/EditableCell';
import { ProMixin } from '@/mixins/ProMixin';
import { getOtherOutList, saveOtherOut, deleteOtherOut, examineOtherOut, getOtherOutCode, confirmOtherOut, submitOtherOut, exportOtherOutData, importOtherOutData, downloadOtherOutTemplate } from '@/api/inventory/otherOut';
import { useDictStore } from '@/store/modules/dict';
import { useUserStore } from '@/store/modules/user';
import { DATE_TIME_FORMAT } from '@/utils/dateUtil';

// 混合ProMixin
const proMixin = new ProMixin();
const { getDictByCode, formatDictValue } = proMixin;

// 路由和存储
const router = useRouter();
const route = useRoute();
const dictStore = useDictStore();
const userStore = useUserStore();
const { currentUser } = userStore;

// 状态管理
const activeTab = ref('list');
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);
const billType = ref('otherOut');
const editable = ref(true);

// 表单数据
const formData = reactive<Record<string, any>>({
  id: '',
  code: '',
  warehouseId: '',
  warehouseName: '',
  billDate: new Date(),
  remark: '',
  creator: currentUser?.name || '',
  status: '0', // 0: 草稿, 1: 已提交, 2: 已审核, 3: 已确认
  detailList: []
});

// 列表数据
const detailList = ref<Record<string, any>[]>([]);
const statisticsData = ref<Record<string, any>[]>([]);

// 表格注册
const [registerTable, { reload, setProps }] = useTable();
const orderFormRef = ref<ComponentRef>(null);
const dynamicListRef = ref<ComponentRef>(null);

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// 搜索条件
const searchBar = reactive({
  fields: [
    {
      label: '单据编号',
      field: 'code',
      component: 'Input',
      componentProps: { placeholder: '请输入单据编号' }
    },
    {
      label: '仓库',
      field: 'warehouseId',
      component: 'Select',
      componentProps: {
        placeholder: '请选择仓库',
        options: dictStore.getDict('warehouse') || []
      }
    },
    {
      label: '单据日期',
      field: 'billDate',
      component: 'RangePicker',
      componentProps: { format: DATE_TIME_FORMAT }
    },
    {
      label: '状态',
      field: 'status',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { value: '0', label: '草稿' },
          { value: '1', label: '已提交' },
          { value: '2', label: '已审核' },
          { value: '3', label: '已确认' }
        ]
      }
    }
  ],
  onSearch: handleSearch
});

// 左侧按钮
const leftBtns = computed(() => [
  {
    label: '新增',
    type: 'primary',
    onClick: handleAdd
  },
  {
    label: '批量删除',
    type: 'default',
    onClick: handleBatchDelete,
    disabled: selectedRowKeys.value.length === 0
  },
  {
    label: '导入',
    type: 'default',
    onClick: handleImport
  },
  {
    label: '导出',
    type: 'default',
    onClick: handleExport
  }
]);

// 右侧按钮
const rightBtns = computed(() => [
  {
    label: '刷新',
    icon: 'RefreshOutlined',
    onClick: () => reload()
  }
]);

// 标签菜单
const tabMenu = [
  { key: 'list', label: '列表视图' },
  { key: 'order', label: '订单视图' },
  { key: 'detail', label: '明细视图' },
  { key: 'statistics', label: '统计视图' }
];

// 表格列
const columns = [
  {
    title: '单据编号',
    dataIndex: 'code',
    width: 180
  },
  {
    title: '仓库',
    dataIndex: 'warehouseName',
    width: 120
  },
  {
    title: '单据日期',
    dataIndex: 'billDate',
    width: 180
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => formatDictValue([{ value: '0', label: '草稿' }, { value: '1', label: '已提交' }, { value: '2', label: '已审核' }, { value: '3', label: '已确认' }], text)
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180
  },
  {
    title: '操作',
    width: 150,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
];

// 明细列
const detailColumns = [
  {
    title: '物料编码',
    dataIndex: 'materialCode',
    width: 120,
    editable: true,
    component: 'Input'
  },
  {
    title: '物料名称',
    dataIndex: 'materialName',
    width: 180,
    editable: true,
    component: 'Input'
  },
  {
    title: '规格型号',
    dataIndex: 'spec',
    width: 150,
    editable: true,
    component: 'Input'
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 80,
    editable: true,
    component: 'Input'
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    width: 100,
    editable: true,
    component: 'InputNumber',
    componentProps: { min: 0, step: 0.01 }
  },
  {
    title: '单价',
    dataIndex: 'price',
    width: 100,
    editable: true,
    component: 'InputNumber',
    componentProps: { min: 0, step: 0.01, precision: 2 }
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 100,
    customRender: ({ text, record }) => {
      return (record.quantity * record.price).toFixed(2);
    }
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 150,
    editable: true,
    component: 'Input'
  },
  {
    title: '操作',
    width: 80,
    slots: { customRender: 'action' }
  }
];

// 统计列
const statisticsColumns = [
  {
    title: '物料编码',
    dataIndex: 'materialCode',
    width: 120
  },
  {
    title: '物料名称',
    dataIndex: 'materialName',
    width: 180
  },
  {
    title: '规格型号',
    dataIndex: 'spec',
    width: 150
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 80
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    width: 100,
    summaryFunc: (data: any[]) => {
      return data.reduce((sum, item) => sum + Number(item.quantity || 0), 0).toFixed(2);
    }
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 100,
    summaryFunc: (data: any[]) => {
      return data.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2);
    }
  }
];

// 处理标签切换
function handleTabChange(key: string) {
  activeTab.value = key;
}

// 处理表格请求
async function handleTableRequest(params: any) {
  loading.value = true;
  try {
    const res = await getOtherOutList({
      ...params,
      ...searchBar.fields.reduce((obj, field) => {
        obj[field.field] = field.value;
        return obj;
      }, {})
    });
    if (res.code === 0) {
      paginationConfig.total = res.data.total;
      return res.data.records;
    } else {
      message.error(res.msg);
      return [];
    }
  } catch (error) {
    message.error('获取数据失败');
    return [];
  } finally {
    loading.value = false;
  }
}

// 处理搜索
function handleSearch() {
  paginationConfig.current = 1;
  reload();
}

// 处理行选择
function handleRowSelectChange(keys: string[]) {
  selectedRowKeys.value = keys;
}

// 获取表格操作
function getTableAction(record: any) {
  const actions = [
    {
      label: '查看',
      onClick: () => handleView(record)
    },
    {
      label: '编辑',
      onClick: () => handleEdit(record),
      disabled: record.status !== '0'
    },
    {
      label: '删除',
      onClick: () => handleDelete(record),
      disabled: record.status !== '0'
    },
    {
      label: '提交',
      onClick: () => handleSubmitBill(record),
      disabled: record.status !== '0'
    },
    {
      label: '审核',
      onClick: () => handleExamine(record),
      disabled: record.status !== '1'
    },
    {
      label: '确认',
      onClick: () => handleConfirm(record),
      disabled: record.status !== '2'
    }
  ];
  return actions;
}

// 处理新增
async function handleAdd() {
  // 获取单据编号
  const res = await getOtherOutCode();
  if (res.code === 0) {
    formData.id = '';
    formData.code = res.data;
    formData.warehouseId = '';
    formData.warehouseName = '';
    formData.billDate = new Date();
    formData.remark = '';
    formData.status = '0';
    formData.detailList = [];
    detailList.value = [];
    activeTab.value = 'order';
  } else {
    message.error(res.msg);
  }
}

// 处理查看
function handleView(record: any) {
  formData.id = record.id;
  formData.code = record.code;
  formData.warehouseId = record.warehouseId;
  formData.warehouseName = record.warehouseName;
  formData.billDate = new Date(record.billDate);
  formData.remark = record.remark;
  formData.status = record.status;
  detailList.value = record.detailList || [];
  editable.value = false;
  activeTab.value = 'order';
}

// 处理编辑
function handleEdit(record: any) {
  formData.id = record.id;
  formData.code = record.code;
  formData.warehouseId = record.warehouseId;
  formData.warehouseName = record.warehouseName;
  formData.billDate = new Date(record.billDate);
  formData.remark = record.remark;
  formData.status = record.status;
  detailList.value = record.detailList || [];
  editable.value = true;
  activeTab.value = 'order';
}

// 处理删除
async function handleDelete(record: any) {
  const confirmResult = await message.confirm('确定要删除该单据吗？');
  if (confirmResult) {
    const res = await deleteOtherOut({ id: record.id });
    if (res.code === 0) {
      message.success('删除成功');
      reload();
    } else {
      message.error(res.msg);
    }
  }
}

// 处理批量删除
async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的单据');
    return;
  }
  const confirmResult = await message.confirm(`确定要删除选中的${selectedRowKeys.value.length}条单据吗？`);
  if (confirmResult) {
    const res = await deleteOtherOut({ ids: selectedRowKeys.value });
    if (res.code === 0) {
      message.success('删除成功');
      selectedRowKeys.value = [];
      reload();
    } else {
      message.error(res.msg);
    }
  }
}

// 处理提交
async function handleSubmit() {
  if (!formData.warehouseId) {
    message.error('请选择仓库');
    return;
  }
  if (detailList.value.length === 0) {
    message.error('请添加明细');
    return;
  }
  formData.detailList = detailList.value;
  const res = await saveOtherOut(formData);
  if (res.code === 0) {
    message.success('保存成功');
    formData.id = res.data;
    activeTab.value = 'list';
    reload();
  } else {
    message.error(res.msg);
  }
}

// 处理提交单据
async function handleSubmitBill(record: any) {
  const confirmResult = await message.confirm('确定要提交该单据吗？');
  if (confirmResult) {
    const res = await submitOtherOut({ id: record.id });
    if (res.code === 0) {
      message.success('提交成功');
      reload();
    } else {
      message.error(res.msg);
    }
  }
}

// 处理审核
async function handleExamine(record: any) {
  const confirmResult = await message.confirm('确定要审核该单据吗？');
  if (confirmResult) {
    const res = await examineOtherOut({ id: record.id });
    if (res.code === 0) {
      message.success('审核成功');
      reload();
    } else {
      message.error(res.msg);
    }
  }
}

// 处理确认
async function handleConfirm(record: any) {
  const confirmResult = await message.confirm('确定要确认该单据吗？');
  if (confirmResult) {
    const res = await confirmOtherOut({ id: record.id });
    if (res.code === 0) {
      message.success('确认成功');
      reload();
    } else {
      message.error(res.msg);
    }
  }
}

// 处理取消
function handleCancel() {
  activeTab.value = 'list';
}

// 处理编辑变更
function handleEditChange(row: any, field: string, value: any) {
  row[field] = value;
  // 如果数量或单价改变，重新计算金额
  if (field === 'quantity' || field === 'price') {
    row.amount = (row.quantity * row.price).toFixed(2);
  }
}

// 处理添加行
function handleAddRow() {
  detailList.value.push({
    materialCode: '',
    materialName: '',
    spec: '',
    unit: '',
    quantity: 0,
    price: 0,
    amount: 0,
    remark: ''
  });
}

// 处理删除行
function handleDeleteRow(index: number) {
  detailList.value.splice(index, 1);
}

// 处理导出
function handleExport() {
  exportOtherOutData({
    ...searchBar.fields.reduce((obj, field) => {
      obj[field.field] = field.value;
      return obj;
    }, {})
  });
}

// 处理导入
function handleImport() {
  // 这里应该打开文件选择对话框
  // 实际项目中可以使用ant-design-vue的Upload组件
  message.info('导入功能待实现');
}

// 处理下载模板
function handleDownloadTemplate() {
  downloadOtherOutTemplate();
}

// 生命周期
onMounted(() => {
  // 初始化字典
  dictStore.loadDict('warehouse');
});
</script>

<style lang="less" scoped>
@import '@/assets/less/voucher.less';

.other-out-bill-container {
  padding: 16px;
}

.bill-list-container,
.bill-order-container,
.bill-detail-container,
.bill-statistics-container {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}
</style>