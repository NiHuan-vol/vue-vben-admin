<template>
  <div class="inventory-bills-container">
    <BasicTable
      title="库存单据列表"
      :columns="columns"
      :request="loadBillsData"
      :rowKey="(row) => row.id"
      :actionColumn="actionColumn"
      :useSearchForm="true"
      :formConfig="formConfig"
      :sortOptions="sortOptions"
      :pagination="pagination"
      @register="registerTable"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">新增单据</a-button>
        <a-button @click="handleExport">导出</a-button>
      </template>
      <template #action="{ record }">
        <a-button size="small" @click="handleEdit(record)">编辑</a-button>
        <a-button size="small" danger @click="handleDelete(record)">删除</a-button>
        <a-button size="small" @click="handleView(record)">查看</a-button>
      </template>
      <template #type="{ record }">
        <span :class="{ 'tag-success': record.type === 1, 'tag-warning': record.type === 2, 'tag-info': record.type === 3 }">
          {{ record.type === 1 ? '入库单' : record.type === 2 ? '出库单' : '调拨单' }}
        </span>
      </template>
      <template #status="{ record }">
        <span :class="{ 'tag-success': record.status === 1, 'tag-warning': record.status === 2, 'tag-danger': record.status === 3 }">
          {{ record.status === 1 ? '已审核' : record.status === 2 ? '未审核' : '已作废' }}
        </span>
      </template>
    </BasicTable>

    <BillsModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :billId="currentBillId"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { BasicTable, useTable } from '@/components/Table';
import { Button, message } from 'ant-design-vue';
import BillsModal from './components/BillsModal.vue';
import { getInventoryList, deleteBill } from '@/api/inventory';
import { dateUtil } from '@/utils/dateUtil';

// 表格注册
const [registerTable, { reload, setProps }] = useTable();

// 表格列定义
const columns = [
  { title: '单据编号', dataIndex: 'code', sorter: true },
  { title: '单据类型', dataIndex: 'type', slot: 'type', filters: [
    { text: '入库单', value: 1 },
    { text: '出库单', value: 2 },
    { text: '调拨单', value: 3 },
  ], filterMultiple: false },
  { title: '仓库', dataIndex: 'warehouseName', sorter: true, filters: true },
  { title: '创建人', dataIndex: 'createBy', sorter: true },
  { title: '创建时间', dataIndex: 'createTime', sorter: true, valueType: 'date' },
  { title: '状态', dataIndex: 'status', slot: 'status', filters: [
    { text: '已审核', value: 1 },
    { text: '未审核', value: 2 },
    { text: '已作废', value: 3 },
  ], filterMultiple: false },
];

// 操作列定义
const actionColumn = {
  width: 180,
  title: '操作',
  dataIndex: 'action',
  fixed: 'right',
  slots: {
    default: 'action',
  },
};

// 表单配置
const formConfig = {
  labelWidth: 120,
  schemas: [
    {
      field: 'code',
      label: '单据编号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入单据编号',
      },
    },
    {
      field: 'type',
      label: '单据类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择单据类型',
        options: [
          { label: '入库单', value: 1 },
          { label: '出库单', value: 2 },
          { label: '调拨单', value: 3 },
        ],
      },
    },
    {
      field: 'warehouseId',
      label: '仓库',
      component: 'Select',
      componentProps: {
        placeholder: '请选择仓库',
        options: [],
        showSearch: true,
        filterOption: (input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
      },
    },
    {
      field: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '已审核', value: 1 },
          { label: '未审核', value: 2 },
          { label: '已作废', value: 3 },
        ],
      },
    },
    {
      field: 'createTime',
      label: '创建时间',
      component: 'RangePicker',
      componentProps: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD',
      },
    },
  ],
};

// 排序配置
const sortOptions = {
  defaultSort: {
    field: 'createTime',
    order: 'desc',
  },
};

// 分页配置
const pagination = {
  pageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 条数据`,
};

// 模态框状态
const modalVisible = ref(false);
const modalTitle = ref('新增单据');
const currentBillId = ref('');

// 加载单据数据
const loadBillsData = async (params) => {
  // 处理日期范围
  if (params.createTime && Array.isArray(params.createTime)) {
    params.startTime = dateUtil(params.createTime[0]).format('YYYY-MM-DD HH:mm:ss');
    params.endTime = dateUtil(params.createTime[1]).format('YYYY-MM-DD HH:mm:ss');
    delete params.createTime;
  }

  const res = await getInventoryList(params);
  return res;
};

// 处理新增
const handleAdd = () => {
  currentBillId.value = '';
  modalTitle.value = '新增单据';
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = (record) => {
  currentBillId.value = record.id;
  modalTitle.value = '编辑单据';
  modalVisible.value = true;
};

// 处理查看
const handleView = (record) => {
  currentBillId.value = record.id;
  modalTitle.value = '查看单据';
  modalVisible.value = true;
};

// 处理删除
const handleDelete = async (record) => {
  try {
    const res = await deleteBill({ id: record.id });
    if (res.success) {
      message.success('删除成功');
      reload();
    } else {
      message.error(res.message || '删除失败');
    }
  } catch (error) {
    message.error('删除失败');
    console.error('删除单据失败:', error);
  }
};

// 处理导出
const handleExport = async () => {
  try {
    // 获取当前表格参数
    const tableParams = await (window as any).getTableParams();
    // 调用导出API
    const res = await exportBills(tableParams);
    if (res.success) {
      message.success('导出成功');
      // 处理文件下载
      const blob = new Blob([res.data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `库存单据_${dateUtil().format('YYYYMMDDHHmmss')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      message.error(res.message || '导出失败');
    }
  } catch (error) {
    message.error('导出失败');
    console.error('导出单据失败:', error);
  }
};

// 处理成功回调
const handleSuccess = () => {
  modalVisible.value = false;
  reload();
};
</script>

<style scoped lang="less">
.inventory-bills-container {
  padding: 24px;
}

.tag-success {
  color: #52c41a;
  background-color: #f6ffed;
  border-color: #b7eb8f;
  display: inline-block;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
}

.tag-warning {
  color: #faad14;
  background-color: #fffbe6;
  border-color: #ffe58f;
  display: inline-block;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
}

.tag-info {
  color: #1890ff;
  background-color: #e6f7ff;
  border-color: #91d5ff;
  display: inline-block;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
}

.tag-danger {
  color: #f5222d;
  background-color: #fff1f0;
  border-color: #ffccc7;
  display: inline-block;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  border-radius: 4px;
}
</style>