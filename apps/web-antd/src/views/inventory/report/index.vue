<template>
  <div class="inventory-report-container">
    <Card title="库存报表" :bordered="false">
      <template #extra>
        <a-button @click="handleExport">导出报表</a-button>
      </template>

      <Form layout="inline" :model="searchForm" @submit.prevent="handleSearch">
        <FormItem label="报表类型" name="reportType">
          <Select v-model:value="searchForm.reportType" style="width: 180px;" @change="handleReportTypeChange">
              <SelectOption value="inventoryQuery">现存量查询</SelectOption>
              <SelectOption value="inoutRunning">出入库流水</SelectOption>
              <SelectOption value="inoutSummariz">出入库汇总</SelectOption>
              <SelectOption value="inventoryBook">库存台账</SelectOption>
              <SelectOption value="inventorySpectaculars">库存可视化看板</SelectOption>
              <SelectOption value="sendingReceiving">收发存汇总表</SelectOption>
              <SelectOption value="inventoryAnalysis">库存分析</SelectOption>
            </Select>
        </FormItem>
        <FormItem v-if="showWarehouseFilter" label="仓库" name="warehouseId">
          <Select v-model:value="searchForm.warehouseId" style="width: 180px;">
            <!-- 仓库选项将通过API加载 -->
          </Select>
        </FormItem>
        <FormItem v-if="showDateRangeFilter" label="日期范围" name="dateRange">
          <RangePicker v-model:value="searchForm.dateRange" style="width: 240px;" />        </FormItem>
        <FormItem>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
        </FormItem>
      </Form>

      <component :is="currentReportComponent" :searchParams="searchParams" />    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { Card, Form, FormItem, Select, SelectOption, RangePicker, Button } from 'ant-design-vue';
// 导入报表组件
import InventoryQuery from './inventoryQuery.vue';
import InoutRunning from './inoutRunning.vue';
import InoutSummariz from './inoutSummariz.vue';
import InventoryBook from './inventoryBook.vue';
import InventorySpectaculars from './inventorySpectaculars.vue';
import SendingReceiving from './sendingReceiving.vue';
// 假设有一个库存分析组件
const InventoryAnalysis = { template: '<div>库存分析报表（待实现）</div>' };

// 查询表单
const searchForm = reactive({
  reportType: 'inventoryQuery',
  warehouseId: '',
  dateRange: [],
});

// 当前报表组件
const currentReportComponent = computed(() => {
  switch (searchForm.reportType) {
    case 'inventoryQuery':
      return InventoryQuery;
    case 'inoutRunning':
      return InoutRunning;
    case 'inoutSummariz':
      return InoutSummariz;
    case 'inventoryBook':
      return InventoryBook;
    case 'inventorySpectaculars':
      return InventorySpectaculars;
    case 'sendingReceiving':
      return SendingReceiving;
    case 'inventoryAnalysis':
    default:
      return InventoryAnalysis;
  }
});

// 是否显示仓库筛选
const showWarehouseFilter = computed(() => {
  // 根据报表类型决定是否显示仓库筛选
  return true; // 默认显示
});

// 是否显示日期范围筛选
const showDateRangeFilter = computed(() => {
  // 现存量查询可能不需要日期范围
  return searchForm.reportType !== 'inventoryQuery';
});

// 处理报表类型变更
const handleReportTypeChange = () => {
  // 重置相关筛选条件
  searchForm.warehouseId = '';
  searchForm.dateRange = [];
};

// 处理查询
const handleSearch = () => {
  // 这里可以添加查询逻辑，或由各个报表组件自行处理
};

// 处理重置
const handleReset = () => {
  searchForm.reportType = 'inventoryQuery';
  searchForm.warehouseId = '';
  searchForm.dateRange = [];
};

// 处理导出
const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('导出报表:', searchForm.reportType);
};

// 传递给子组件的搜索参数
const searchParams = computed(() => ({
  ...searchForm,
  startDate: searchForm.dateRange[0]?.format('YYYY-MM-DD'),
  endDate: searchForm.dateRange[1]?.format('YYYY-MM-DD'),
}));
</script>

<style scoped lang="less">
.inventory-report-container {
  padding: 24px;
}
</style>