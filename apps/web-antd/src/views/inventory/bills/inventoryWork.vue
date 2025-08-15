<template>
  <div class="inventory-work-container">
    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <a-button type="primary" @click="newProcess" :disabled="voucherState !== 0">
        <Icon icon="ant-design:plus-outlined" /> 新增
      </a-button>
      <a-button type="primary" @click="submit" :disabled="!canSubmit">
        <Icon icon="ant-design:save-outlined" /> 保存
      </a-button>
      <a-button @click="editClick" :disabled="voucherState !== 1 && voucherState !== 3">
        <Icon icon="ant-design:edit-outlined" /> 修改
      </a-button>
      <a-button danger @click="removeData" :disabled="voucherState !== 0 && voucherState !== 2">
        <Icon icon="ant-design:delete-outlined" /> 删除
      </a-button>
      <a-button @click="firstClick" :disabled="voucherState !== 1 && voucherState !== 4">
        <Icon icon="ant-design:check-outlined" /> 复核
      </a-button>
      <a-button @click="auditClick" :disabled="voucherState !== 2 && voucherState !== 5">
        <Icon icon="ant-design:eye-outlined" /> 监盘
      </a-button>
      <a-button @click="exportInventoryWork">
        <Icon icon="ant-design:download-outlined" /> 导出明细
      </a-button>
    </div>

    <!-- 视图切换 -->
    <div class="view-switch">
      <a-radio-group v-model:value="currentView" @change="switchList">
        <a-radio value="list">列表视图</a-radio>
        <a-radio value="order">订单视图</a-radio>
      </a-radio-group>
    </div>

    <!-- 列表视图 -->
    <div v-if="currentView === 'list'" class="list-view">
      <div class="search-form">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item label="单据编号" name="voucherCode">
            <a-input v-model:value="searchForm.voucherCode" placeholder="请输入单据编号" />
          </a-form-item>
          <a-form-item label="仓库" name="warehouseId">
            <a-select v-model:value="searchForm.warehouseId" placeholder="请选择仓库">
              <a-select-option v-for="item in warehouseList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="盘点日期" name="date">
            <a-range-picker v-model:value="searchForm.date" />
          </a-form-item>
          <a-form-item label="状态" name="status">
            <a-select v-model:value="searchForm.status" placeholder="请选择状态">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">草稿</a-select-option>
              <a-select-option value="1">已保存</a-select-option>
              <a-select-option value="2">已复核</a-select-option>
              <a-select-option value="3">已驳回</a-select-option>
              <a-select-option value="4">已取消复核</a-select-option>
              <a-select-option value="5">已监盘</a-select-option>
              <a-select-option value="6">已取消监盘</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">查询</a-button>
            <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table
        :columns="columnsList"
        :data-source="dataSource"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
        @row-dblclick="editClick"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'action'">
            <div class="table-actions">
              <a @click.stop="editClick(record)">编辑</a>
              <a @click.stop="viewDetails(record)" style="margin-left: 8px">查看</a>
              <a @click.stop="removeData(record.id)" style="margin-left: 8px; color: #ff4d4f">删除</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 订单视图 -->
    <div v-else-if="currentView === 'order'" class="order-view">
      <div class="order-header">
        <div class="order-basic-info">
          <div class="info-item">
            <span class="label">单据编号：</span>
            <span class="value">{{ formData.voucherCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">仓库：</span>
            <a-select v-model:value="formData.warehouseId" placeholder="请选择仓库" :disabled="!editMask">
              <a-select-option v-for="item in warehouseList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </div>
          <div class="info-item">
            <span class="label">盘点日期：</span>
            <a-date-picker v-model:value="formData.checkDate" :disabled="!editMask" />
          </div>
          <div class="info-item">
            <span class="label">盘点人：</span>
            <a-select v-model:value="formData.checkerId" placeholder="请选择盘点人" :disabled="!editMask">
              <a-select-option v-for="item in userList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </div>
          <div class="info-item">
            <span class="label">状态：</span>
            <span class="value">{{ statusMap[formData.status] }}</span>
          </div>
        </div>
        <div class="order-remark">
          <span class="label">备注：</span>
          <a-input-textarea v-model:value="formData.remark" :disabled="!editMask" rows="2" />
        </div>
      </div>

      <div class="order-table">
        <a-button type="primary" @click="handlInputArchives" :disabled="!editMask" style="margin-bottom: 16px">
          <Icon icon="ant-design:plus-outlined" /> 选择物料
        </a-button>
        <a-table
          :columns="columns"
          :data-source="formData.details"
          :pagination="false"
          rowKey="id"
          bordered
          :components="components"
          @cell-dblclick="onCellDblClick"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'action'">
              <a @click.stop="handleDelete(index)" style="color: #ff4d4f">删除</a>
            </template>
            <template v-else-if="column.dataIndex === 'inventoryQuantity' && editMask">
              <editable-cell
                :value="record.inventoryQuantity"
                :on-change="(value) => onCellChange(record, 'inventoryQuantity', value)"
                :disabled="!editMask"
              />
            </template>
            <template v-else-if="column.dataIndex === 'checkQuantity' && editMask">
              <editable-cell
                :value="record.checkQuantity"
                :on-change="(value) => onCellChange(record, 'checkQuantity', value)"
                :disabled="!editMask"
              />
            </template>
            <template v-else-if="column.dataIndex === 'locationName' && editMask">
              <editable-cell
                :value="record.locationName"
                :on-change="(value) => onCellChange(record, 'locationName', value)"
                :disabled="!editMask"
              />
            </template>
          </template>
        </a-table>
      </div>

      <div class="order-footer">
        <div class="total-info">
          <span>物料总数：{{ formData.details.length }}</span>
          <span style="margin-left: 24px">盘点差异：{{ differenceCount }}</span>
        </div>
      </div>
    </div>

    <!-- 物料档案弹窗 -->
    <archives-modal
      ref="archivesModal"
      :visible="archivesVisible"
      @cancel="handlCloseArchives"
      @confirm="choiceAddData"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { EditableCell } from '@/components/table';
import { Icon } from '@vben/icons';
import ArchivesModal from './components/ArchivesModal.vue';
import {
  saveInventoryWork,
  getInventoryWorkDetail,
  deleteInventoryWork,
  getInventoryWorkCode,
  pageInventoryWork,
  listSearchInventoryWork,
  firstExamineInventoryWork,
  secondExamineInventoryWork,
  exportInventoryWork,
  getInventory
} from '@/api/inventory/inventoryWork';
import { getWarehouseList } from '@/api/inventory/warehouse';
import { getUserList } from '@/api/system/user';

// 状态定义
const currentView = ref('list');
const editMask = ref(false);
const voucherState = ref(0);
const archivesVisible = ref(false);
const formData = reactive<{
  id?: string;
  voucherCode?: string;
  warehouseId?: string;
  checkerId?: string;
  checkDate?: string;
  status?: number;
  remark?: string;
  details?: any[];
}>({
  details: []
});
const searchForm = reactive({
  voucherCode: '',
  warehouseId: '',
  date: [],
  status: ''
});
const dataSource = ref<any[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});
const warehouseList = ref<any[]>([]);
const userList = ref<any[]>([]);
const archivesModal = ref<InstanceType<typeof ArchivesModal>>();
const statusMap = {
  0: '草稿',
  1: '已保存',
  2: '已复核',
  3: '已驳回',
  4: '已取消复核',
  5: '已监盘',
  6: '已取消监盘'
};

// 计算属性
const canSubmit = computed(() => {
  return editMask.value && formData.warehouseId && formData.checkDate && formData.details?.length > 0;
});

const differenceCount = computed(() => {
  return formData.details?.filter(item => item.inventoryQuantity !== item.checkQuantity).length || 0;
});

// 表格列定义
const columnsList = [
  { title: '单据编号', dataIndex: 'voucherCode', key: 'voucherCode' },
  { title: '仓库', dataIndex: 'warehouseName', key: 'warehouseName' },
  { title: '盘点日期', dataIndex: 'checkDate', key: 'checkDate' },
  { title: '盘点人', dataIndex: 'checkerName', key: 'checkerName' },
  { title: '状态', dataIndex: 'status', key: 'status', customRender: ({ text }) => statusMap[text] },
  { title: '操作', dataIndex: 'action', key: 'action', width: 150 }
];

const columns = [
  { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'materialName', key: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unitName', key: 'unitName', width: 80 },
  { title: '货位', dataIndex: 'locationName', key: 'locationName', width: 120 },
  { title: '账面数量', dataIndex: 'inventoryQuantity', key: 'inventoryQuantity', width: 100 },
  { title: '盘点数量', dataIndex: 'checkQuantity', key: 'checkQuantity', width: 100 },
  { title: '差异数量', dataIndex: 'differenceQuantity', key: 'differenceQuantity', width: 100, customRender: ({ record }) => record.checkQuantity - record.inventoryQuantity },
  { title: '差异比例', dataIndex: 'differenceRate', key: 'differenceRate', width: 100, customRender: ({ record }) => record.inventoryQuantity ? `${((record.checkQuantity - record.inventoryQuantity) / record.inventoryQuantity * 100).toFixed(2)}%` : '0%' },
  { title: '合理损耗率', dataIndex: 'reasonableLossRate', key: 'reasonableLossRate', width: 100, customRender: ({ text }) => `${text || 0}%` },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80 }
];

// 组件定义
const components = {
  body: {
    cell: EditableCell
  }
};

// 生命周期
onMounted(() => {
  tableInit();
  loadWarehouseList();
  loadUserList();
});

// 方法定义
function tableInit() {
  pageInventoryWork({
    pageNum: pagination.current,
    pageSize: pagination.pageSize
  }).then(res => {
    if (res.success) {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    }
  });
}

function loadWarehouseList() {
  getWarehouseList({}).then(res => {
    if (res.success) {
      warehouseList.value = res.data;
    }
  });
}

function loadUserList() {
  getUserList({}).then(res => {
    if (res.success) {
      userList.value = res.data;
    }
  });
}

function switchList() {
  if (currentView.value === 'order' && !formData.id) {
    newProcess();
  }
}

function newProcess() {
  editMask.value = true;
  voucherState.value = 0;
  formData.id = undefined;
  formData.voucherCode = '';
  formData.warehouseId = '';
  formData.checkerId = '';
  formData.checkDate = new Date().toISOString().split('T')[0];
  formData.status = 0;
  formData.remark = '';
  formData.details = [];

  getInventoryWorkCode().then(res => {
    if (res.success) {
      formData.voucherCode = res.data;
    }
  });
}

function submit() {
  saveInventoryWork(formData).then(res => {
    if (res.success) {
      formData.id = res.data;
      editMask.value = false;
      voucherState.value = 1;
      formData.status = 1;
      tableInit();
      message.success('保存成功');
    }
  });
}

function editClick(record?: any) {
  if (record) {
    getInventoryWorkDetail(record.id).then(res => {
      if (res.success) {
        Object.assign(formData, res.data);
        editMask.value = true;
        voucherState.value = res.data.status;
        currentView.value = 'order';
      }
    });
  } else {
    editMask.value = true;
  }
}

function removeData(id?: string) {
  const deleteId = id || formData.id;
  if (!deleteId) return;

  message.confirm('确定要删除这条记录吗？', {
    okText: '确定',
    cancelText: '取消',
    onOk() {
      deleteInventoryWork(deleteId).then(res => {
        if (res.success) {
          message.success('删除成功');
          tableInit();
          if (!id) {
            newProcess();
          }
        }
      });
    }
  });
}

function firstClick() {
  const params = {
    id: formData.id,
    status: voucherState.value === 1 ? 2 : 4
  };

  firstExamineInventoryWork(params).then(res => {
    if (res.success) {
      formData.status = params.status;
      voucherState.value = params.status;
      message.success(params.status === 2 ? '复核成功' : '取消复核成功');
    }
  });
}

function auditClick() {
  const params = {
    id: formData.id,
    status: voucherState.value === 2 ? 5 : 6
  };

  secondExamineInventoryWork(params).then(res => {
    if (res.success) {
      formData.status = params.status;
      voucherState.value = params.status;
      message.success(params.status === 5 ? '监盘成功' : '取消监盘成功');
    }
  });
}

function exportInventoryWork() {
  exportInventoryWork({ id: formData.id }).then(res => {
    if (res) {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `盘点作业明细_${formData.voucherCode || new Date().getTime()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
}

function handlInputArchives() {
  archivesVisible.value = true;
  if (formData.warehouseId) {
    archivesModal.value?.setParams({
      warehouseId: formData.warehouseId
    });
  }
}

function handlCloseArchives() {
  archivesVisible.value = false;
}

function choiceAddData(data: any[]) {
  if (data && data.length > 0) {
    // 处理选择的物料数据
    const newDetails = data.map(item => ({
      id: undefined,
      materialId: item.id,
      materialCode: item.code,
      materialName: item.name,
      specification: item.specification,
      unitId: item.unitId,
      unitName: item.unitName,
      inventoryQuantity: item.inventoryQuantity || 0,
      checkQuantity: item.inventoryQuantity || 0,
      locationName: item.locationName || '',
      reasonableLossRate: item.reasonableLossRate || 0
    }));

    // 合并数据，避免重复
    const existingIds = formData.details?.map(item => item.materialId) || [];
    const uniqueNewDetails = newDetails.filter(item => !existingIds.includes(item.materialId));

    if (formData.details) {
      formData.details = [...formData.details, ...uniqueNewDetails];
    } else {
      formData.details = uniqueNewDetails;
    }
  }
  archivesVisible.value = false;
}

function handleSearch() {
  listSearchInventoryWork({
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
    if (key === 'date') {
      searchForm[key] = [];
    } else {
      searchForm[key] = '';
    }
  });
  handleSearch();
}

function handleTableChange(paginationObj: any) {
  pagination.current = paginationObj.current;
  pagination.pageSize = paginationObj.pageSize;
  handleSearch();
}

function onCellChange(record: any, field: string, value: any) {
  record[field] = value;
}

function onCellDblClick(record: any, column: any) {
  if (editMask.value && (column.dataIndex === 'inventoryQuantity' || column.dataIndex === 'checkQuantity' || column.dataIndex === 'locationName')) {
    // 双击编辑逻辑
  }
}

function handleDelete(index: number) {
  formData.details?.splice(index, 1);
}

function viewDetails(record: any) {
  getInventoryWorkDetail(record.id).then(res => {
    if (res.success) {
      Object.assign(formData, res.data);
      editMask.value = false;
      voucherState.value = res.data.status;
      currentView.value = 'order';
    }
  });
}

function rowClassName(record: any) {
  return record.status === 5 ? 'success-row' : '';
}
</script>

<style scoped>
.inventory-work-container {
  padding: 16px;
}

.action-buttons {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.view-switch {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.order-header {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.order-basic-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.label {
  font-weight: bold;
  margin-right: 8px;
  width: 80px;
  text-align: right;
}

.value {
  flex: 1;
}

.order-remark {
  margin-top: 16px;
}

.order-table {
  margin-bottom: 16px;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.total-info {
  display: flex;
  gap: 24px;
}

.success-row {
  background-color: #e6f7ff;
}

.table-actions {
  display: flex;
}
</style>