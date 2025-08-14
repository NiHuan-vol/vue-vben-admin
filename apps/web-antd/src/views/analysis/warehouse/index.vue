<template>
  <div class="c-large-table">
    <a-table
      :loading="loading"
      :columns="columns"
      :row-key="record => record.id"
      :data-source="tableData"
      :row-selection="selected ? { selectedRowKeys: selectedRowKeys, onChange: handleSelect, onSelectAll: handleSelectAll } : null"
      @change="handleTableChange"
      :pagination="pagination"
      bordered
    >
      <template #name="name"> {{ name.first }} {{ name.last }} </template>
      <template #text="text">  </template>
    </a-table>
    <!-- 虚拟滚动条 -->
    <div class="sc" :style="{height: tableHeight+'px'}">
      <div class="scbc" :style="{height: totalHeight+'px'}"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { TableProps } from 'ant-design-vue/es/table';

type TableRow = { id: string | number; [key: string]: any };

export default {
  name: 'WarehouseAnalysis',
};

const ROWS = 15;          // 局部渲染的数据条数
const HEIGHT = 29.6;      // 每行的高度
const TABLEHEIGHT = 446;  // 表格可视高度

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Array as () => TableRow[],
    default: [],
  },
  columns: {
    type: Array as () => TableProps['columns'],
    default: [],
  },
  pagination: {
    type: Object,
    default: () => ({
      current: 1,
      pageSize: 20,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['20', '50', '100', '200', '500', '1000', '2000'],
    }),
  },
  rows: {
    // 可视区域展示多少行
    type: Number,
    default: ROWS,
  },
  rowHeight: {
    // 每行的高度
    type: Number,
    default: HEIGHT,
  },
  tableHeight: {
    // 可视区域高度
    type: Number,
    default: TABLEHEIGHT,
  },
  selected: {
    // 是否可选
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['onShowSizeChange', 'onChange', 'selectChange']);

const scrollEle = ref<HTMLElement | null>(null);
const tableData = ref<TableRow[]>([]);
const selectedRowKeys = ref<string[] | number[]>([]);
const totalHeight = ref(446);  // 数据总高度
const idx = ref(0);            // 当前开始下标

watch(
  () => props.dataSource,
  () => {
    const { dataSource, rows, rowHeight } = props;
    tableData.value = dataSource.length > rows ? dataSource.slice(0, rows) : dataSource;
    totalHeight.value = dataSource.length * rowHeight;
  },
  { immediate: true }
);

onMounted(() => {
  scrollEle.value = document.querySelector('.c-large-table .sc .scbc');
  const scrollContainer = document.querySelector('.c-large-table .sc');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  const scrollContainer = document.querySelector('.c-large-table .sc');
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
});

const onShowSizeChange = (current: number, pageSize: number) => {
  emit('onShowSizeChange', current, pageSize);
};

const pageChange = (current: number, pageSize: number) => {
  emit('onChange', current, pageSize);
};

const handleTableChange = () => {
  // 处理表格变化
};

const handleSelect = (selectedRowKeys: string[] | number[], selectedRows: TableRow[]) => {
  selectedRowKeys.value = selectedRowKeys;
  if (props.selected) {
    emit('selectChange', selectedRowKeys, selectedRows);
  }
};

// 注意全选，需要手动填充数据
const handleSelectAll = (selected: boolean, selectedRows: TableRow[]) => {
  let keys: string[] | number[] = [];
  let dates: TableRow[] = [];
  if (selected) {
    keys = props.dataSource.map(item => item.id);
    dates = [...props.dataSource];
  }
  handleSelect(keys, dates);
};

// 监听虚拟滚轮变化，计算展示的数据
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const { scrollTop, scrollHeight } = target;
  const lenMax = props.dataSource.length;
  let nIdx: number;

  if (scrollTop === 0) {
    tableData.value = props.dataSource.slice(0, props.rows);
    idx.value = 0;
  } else if (scrollTop === scrollHeight - props.tableHeight) {
    nIdx = lenMax - props.rows;
    tableData.value = props.dataSource.slice(nIdx, nIdx + props.rows);
    idx.value = nIdx;
  } else {
    nIdx = Math.ceil((scrollTop * lenMax) / scrollHeight);
    if (nIdx !== idx.value && nIdx <= lenMax - props.rows) {
      tableData.value = props.dataSource.slice(nIdx, nIdx + props.rows);
      idx.value = nIdx;
    }
  }
};
</script>

<style lang="less" scoped>
.c-large-table {
  position: relative;
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 4px 10px;
  }
  .sc {
    position: absolute;
    top: 28px;
    right: -6px;
    width: 16px;
    overflow-x: hidden;
    overflow-y: scroll;
    .scbc {
      border-radius: 2px;
      background-color: #f1f1f1;
    }
  }
}
</style>