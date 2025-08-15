<template>
  <a-modal
    v-model:visible="visible"
    title="选择物料"
    :width="800"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="archives-modal-container">
      <div class="search-form">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item label="物料编码" name="materialCode">
            <a-input v-model:value="searchForm.materialCode" placeholder="请输入物料编码" />
          </a-form-item>
          <a-form-item label="物料名称" name="materialName">
            <a-input v-model:value="searchForm.materialName" placeholder="请输入物料名称" />
          </a-form-item>
          <a-form-item label="规格型号" name="specification">
            <a-input v-model:value="searchForm.specification" placeholder="请输入规格型号" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">查询</a-button>
            <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      />

      <div class="footer-buttons">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleConfirm" :disabled="selectedRowKeys.length === 0">确定</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import { getInventory } from '@/api/inventory/inventoryWork';

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  params: {
    type: Object,
    default: () => ({})
  }
});

// 定义emits
const emit = defineEmits(['cancel', 'confirm']);

// 状态定义
const searchForm = reactive({
  materialCode: '',
  materialName: '',
  specification: '',
  warehouseId: props.params.warehouseId || ''
});
const dataSource = ref<any[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);

// 监听params变化
watch(
  () => props.params,
  (newParams) => {
    if (newParams.warehouseId) {
      searchForm.warehouseId = newParams.warehouseId;
      handleSearch();
    }
  },
  { immediate: true }
);

// 表格列定义
const columns = [
  { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode' },
  { title: '物料名称', dataIndex: 'materialName', key: 'materialName' },
  { title: '规格型号', dataIndex: 'specification', key: 'specification' },
  { title: '单位', dataIndex: 'unitName', key: 'unitName' },
  { title: '库存数量', dataIndex: 'inventoryQuantity', key: 'inventoryQuantity' },
  { title: '货位', dataIndex: 'locationName', key: 'locationName' },
  { title: 'ABC分类', dataIndex: 'abcClass', key: 'abcClass' }
];

// 方法定义
function handleSearch() {
  getInventory({
    ...searchForm,
    pageNum: pagination.current,
    pageSize: pagination.pageSize
  }).then(res => {
    if (res.success) {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    }
  });
}

function handleReset() {
  Object.keys(searchForm).forEach(key => {
    if (key === 'warehouseId') return; // 保留仓库ID
    searchForm[key] = '';
  });
  handleSearch();
}

function handleTableChange(paginationObj: any) {
  pagination.current = paginationObj.current;
  pagination.pageSize = paginationObj.pageSize;
  handleSearch();
}

function onSelectChange(keys: string[], rows: any[]) {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
}

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  emit('confirm', selectedRows.value);
}

// 初始加载数据
if (props.visible && searchForm.warehouseId) {
  handleSearch();
}

// 对外暴露的方法
defineExpose({
  setParams(newParams: any) {
    Object.assign(searchForm, newParams);
    handleSearch();
  },
  closeModel() {
    emit('cancel');
  },
  handleEnter() {
    handleSearch();
  }
});
</script>

<style scoped>
.archives-modal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-form {
  margin-bottom: 16px;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}
</style>