<template>
  <div class="search-group-detail-mask" v-if="visible">
    <div class="search-group-detail-modal">
      <div class="search-group-detail-header">
        <h3>{{ title }}</h3>
        <button class="search-group-detail-close" @click="handleCancel">×</button>
      </div>
      <div class="search-group-detail-body">
        <a-form layout="inline" :model="searchForm" @finish="handleSearch">
          <a-form-item v-for="item in searchFields" :key="item.name" :label="item.label" :name="item.name">
            <a-input v-if="item.type === 'input'" v-model:value="searchForm[item.name]" :placeholder="`请输入${item.label}`" />
            <a-select v-else-if="item.type === 'select'" v-model:value="searchForm[item.name]" :placeholder="`请选择${item.label}`">
              <a-select-option v-for="option in item.options" :key="option.value" :value="option.value">{{ option.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">查询</a-button>
            <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
          </a-form-item>
        </a-form>
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :pagination="pagination"
          @change="handleTableChange"
          rowKey="id"
          @row-dblclick="handleSelect"
        />
      </div>
      <div class="search-group-detail-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleConfirm" :disabled="!selectedItem">确认</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue';
import { Button, Form, Input, Select, Table } from 'ant-design-vue';
import { FormItem, SelectOption } from 'ant-design-vue/es';
import { useMessage } from '/@/hooks/web/useMessage';
import { getInventoryList } from '@/api/inventory';

// 定义props
const props = defineProps({
  record: {
    type: Object,
    default: () => {},
  },
  inputValue: String,
  componentName: {
    type: String,
    required: true,
  },
});

// 定义emits
const emit = defineEmits(['clickItem', 'close']);

// 组件状态
const visible = ref(false);
const title = ref('选择物料');
const searchForm = ref({});
const searchFields = ref([]);
const columns = ref([]);
const dataSource = ref([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});
const selectedItem = ref(null);
const { createMessage } = useMessage();

// 设置参数
const setParams = (params) => {
  // 可以根据传入的参数调整组件行为
};

// 显示模态框
const showModal = () => {
  visible.value = true;
  initComponent();
};

// 初始化组件
const initComponent = () => {
  if (props.componentName === 'inventory') {
    title.value = '选择物料';
    searchFields.value = [
      { name: 'code', label: '物料编码', type: 'input' },
      { name: 'name', label: '物料名称', type: 'input' },
      { name: 'specification', label: '规格型号', type: 'input' },
    ];
    columns.value = [
      { title: '物料编码', dataIndex: 'code' },
      { title: '物料名称', dataIndex: 'name' },
      { title: '规格型号', dataIndex: 'specification' },
      { title: '单位', dataIndex: 'unitName' },
      { title: '当前库存', dataIndex: 'inventoryQuantity' },
    ];
    // 初始化搜索表单
    searchForm.value = { code: '', name: '', specification: '' };
    // 执行搜索
    handleSearch();
  }
  // 可以根据不同的componentName初始化不同的配置
};

// 处理搜索
const handleSearch = () => {
  if (props.componentName === 'inventory') {
    getInventoryList({
      ...searchForm.value,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      warehouseId: props.record?.warehouseId,
    }).then(res => {
      if (res.success) {
        dataSource.value = res.data.items;
        pagination.total = res.data.total;
      }
    });
  }
};

// 处理重置
const handleReset = () => {
  searchFields.value.forEach(field => {
    searchForm.value[field.name] = '';
  });
  pagination.current = 1;
  handleSearch();
};

// 处理表格分页变化
const handleTableChange = (paginationObj) => {
  pagination.current = paginationObj.current;
  pagination.pageSize = paginationObj.pageSize;
  handleSearch();
};

// 处理选择项
const handleSelect = (record) => {
  selectedItem.value = record;
};

// 处理确认
const handleConfirm = () => {
  if (selectedItem.value) {
    emit('clickItem', selectedItem.value);
    visible.value = false;
  } else {
    createMessage.warning('请选择一条记录');
  }
};

// 处理取消
const handleCancel = () => {
  visible.value = false;
  emit('close');
};

// 生命周期
onMounted(() => {
  // 初始化为物料搜索
  if (props.componentName === 'inventory') {
    initComponent();
  }
});

// 暴露方法
defineExpose({
  showModal,
  setParams,
});
</script>

<style scoped>
.search-group-detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.search-group-detail-modal {
  width: 800px;
  max-height: 700px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.search-group-detail-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-group-detail-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.search-group-detail-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.search-group-detail-body {
  padding: 16px 24px;
  overflow-y: auto;
  flex: 1;
}

.search-group-detail-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>