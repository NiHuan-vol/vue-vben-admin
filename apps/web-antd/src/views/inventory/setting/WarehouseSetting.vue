<template>
  <div class="warehouse-setting-container">
    <BasicTable
      title="仓库管理"
      :columns="columns"
      :request="loadWarehouseData"
      :rowKey="(row) => row.id"
      :actionColumn="actionColumn"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">新增仓库</a-button>
        <a-button @click="handleExport">导出</a-button>
      </template>

      <template #action="{ record }">
        <a-button size="small" @click="handleEdit(record)">编辑</a-button>
        <a-button size="small" danger @click="handleDelete(record)">删除</a-button>
      </template>
    </BasicTable>

    <WarehouseModal
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
import WarehouseModal from './components/WarehouseModal.vue';
// 导入仓库相关的API
import { getWarehouseList } from '@/api/inventory/warehouse';
import { exportBills } from '@/api/inventory';

// 表格列定义
const columns = [
  { title: '仓库编码', dataIndex: 'code' },
  { title: '仓库名称', dataIndex: 'name' },
  { title: '负责人', dataIndex: 'manager' },
  { title: '联系电话', dataIndex: 'phone' },
  { title: '地址', dataIndex: 'address' },
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
const modalTitle = ref('新增仓库');

// 加载仓库数据
const loadWarehouseData = async (params) => {
  const res = await getWarehouseList(params);
  return res.data;
};

// 处理新增
const handleAdd = () => {
  modalTitle.value = '新增仓库';
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = (record) => {
  modalTitle.value = '编辑仓库';
  modalVisible.value = true;
  // 这里可以设置编辑的数据
};

// 处理删除
const handleDelete = async (record) => {
  try {
    // 可以添加确认对话框
    // await deleteWarehouse({ id: record.id });
    // 刷新表格数据
  } catch (error) {
    console.error('删除失败:', error);
  }
};

// 处理导出
const handleExport = async () => {
  try {
    // 调用导出API
    const res = await exportBills({ type: 'warehouse' });
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '仓库数据.xlsx');
    document.body.appendChild(link);
    link.click();
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出失败:', error);
  }
};

// 处理成功回调
const handleSuccess = () => {
  modalVisible.value = false;
  // 刷新表格数据
  // 这里可以添加刷新表格的逻辑
};
</script>

<style scoped lang="less">
.warehouse-setting-container {
  padding: 24px;
}
</style>