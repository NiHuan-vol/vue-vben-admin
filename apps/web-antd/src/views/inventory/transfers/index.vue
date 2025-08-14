<template>
  <div class="inventory-transfers-container">
    <BasicTable
      title="库存调拨单"
      :columns="columns"
      :request="loadTransfersData"
      :rowKey="(row) => row.id"
      :actionColumn="actionColumn"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">新增调拨单</a-button>
        <a-button @click="handleExport">导出</a-button>
      </template>
    </BasicTable>

    <TransfersModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { BasicTable } from '@/components/Table';
import { Button } from 'ant-design-vue';
import TransfersModal from './components/TransfersModal.vue';
import { getTransferCode, saveTransfer } from '@/api/inventory';

// 表格列定义
const columns = [
  { title: '调拨单号', dataIndex: 'code' },
  { title: '调出仓库', dataIndex: 'sourceWarehouseName' },
  { title: '调入仓库', dataIndex: 'targetWarehouseName' },
  { title: '调拨日期', dataIndex: 'transferDate' },
  { title: '制单人', dataIndex: 'createBy' },
  { title: '状态', dataIndex: 'status', slot: 'status' },
];

// 操作列定义
const actionColumn = {
  width: 150,
  title: '操作',
  dataIndex: 'action',
  slots: {
    default: 'action',
  },
};

// 模态框状态
const modalVisible = ref(false);
const modalTitle = ref('新增调拨单');

// 加载调拨单数据
const loadTransfersData = async (params) => {
  // TODO: 实现加载调拨单列表的API调用
  return {
    items: [],
    total: 0
  };
};

// 处理新增
const handleAdd = async () => {
  // 获取单据编号
  const res = await getTransferCode();
  if (res.success) {
    modalTitle.value = '新增调拨单';
    modalVisible.value = true;
  }
};

// 处理编辑
const handleEdit = (record) => {
  modalTitle.value = '编辑调拨单';
  modalVisible.value = true;
};

// 处理删除
const handleDelete = async (record) => {
  // TODO: 实现删除逻辑
};

// 处理审核
const handleExamine = async (record) => {
  // TODO: 实现审核逻辑
};

// 处理导出
const handleExport = () => {
  // TODO: 实现导出逻辑
};

// 处理成功回调
const handleSuccess = () => {
  modalVisible.value = false;
  // 刷新表格数据
};
</script>

<style scoped lang="less">
.inventory-transfers-container {
  padding: 24px;
}
</style>