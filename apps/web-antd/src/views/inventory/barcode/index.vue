<template>
  <div class="inventory-barcode-container">
    <BasicTable
      title="条码管理"
      :columns="columns"
      :request="loadBarcodeData"
      :rowKey="(row) => row.id"
      :actionColumn="actionColumn"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">生成条码</a-button>
        <a-button @click="handlePrint">打印条码</a-button>
      </template>
    </BasicTable>

    <BarcodeModal
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
import BarcodeModal from './components/BarcodeModal.vue';
import { getBarcodeList } from '@/api/inventory';

// 表格列定义
const columns = [
  { title: '条码', dataIndex: 'code' },
  { title: '商品名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'specification' },
  { title: '批次', dataIndex: 'batch' },
  { title: '生成时间', dataIndex: 'createTime' },
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
const modalTitle = ref('生成条码');

// 加载条码数据
const loadBarcodeData = async (params) => {
  const res = await getBarcodeList(params);
  return res;
};

// 处理新增
const handleAdd = () => {
  modalTitle.value = '生成条码';
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = (record) => {
  modalTitle.value = '编辑条码';
  modalVisible.value = true;
};

// 处理删除
const handleDelete = async (record) => {
  // TODO: 实现删除逻辑
};

// 处理打印
const handlePrint = () => {
  // TODO: 实现打印逻辑
};

// 处理成功回调
const handleSuccess = () => {
  modalVisible.value = false;
  // 刷新表格数据
};
</script>

<style scoped lang="less">
.inventory-barcode-container {
  padding: 24px;
}
</style>