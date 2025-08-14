<template>
  <div class="select-business-container">
    <BasicTable
      :columns="columns"
      :data-source="dataSource"
      :row-selection="rowSelection"
      :pagination="false"
      bordered
      rowKey="id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTable } from '@/components/Table';
import { BasicTable, TableColumn } from '@/components';

// 国际化
const { t } = useI18n();

// Props
const props = defineProps({
  value: {
    type: Array as () => any[],
    default: () => [],
  },
  disableKeys: {
    type: Array as () => string[],
    default: () => [],
  },
  dataSource: {
    type: Array as () => any[],
    default: () => [],
  },
});

// Emit
const emit = defineEmits(['update:value']);

// 选中的行keys
const selectedRowKeys = ref<string[]>([]);

// 表格列配置
const columns: TableColumn[] = [
  {
    title: '客户名称',
    dataIndex: 'crmName',
    key: 'crmName',
    width: 120,
  },
  {
    title: '商机名称',
    dataIndex: 'title',
    key: 'businessTitle',
    width: 120,
  },
  {
    title: '商机编号',
    dataIndex: 'projectNo',
    key: 'projectNo',
    width: 120,
  },
  {
    title: '销售阶段',
    dataIndex: 'saleStage',
    key: 'saleStage',
    width: 120,
  },
  {
    title: '预计收入(元)',
    dataIndex: 'anticipatedRevenue',
    key: 'anticipatedRevenue',
    width: 120,
    formatter: (value: number) => {
      return value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
    },
  },
];

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[], rows: any[]) => {
    selectedRowKeys.value = keys;
    emit('update:value', rows);
  },
  getCheckboxProps: (record: any) => ({
    disabled: props.disableKeys.includes(record.id),
  }),
}));

// 监听value变化
watch(
  () => props.value,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      selectedRowKeys.value = newValue.map((item: any) => item.id);
    } else {
      selectedRowKeys.value = [];
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="less">
.select-business-container {
  .ant-table {
    min-height: 200px;
  }

  .ant-table-body {
    height: 100%;
  }

  .ant-table-selection-column .ant-checkbox-disabled .ant-checkbox-inner {
    border-color: #f0f0f0;
  }
}
</style>