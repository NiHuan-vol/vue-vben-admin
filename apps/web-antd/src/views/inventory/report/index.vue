<template>
  <div class="inventory-report-container">
    <Card title="库存报表" :bordered="false">
      <template #extra>
        <a-button @click="handleExport">导出报表</a-button>
      </template>

      <Form layout="inline" :model="searchForm" @submit.prevent="handleSearch">
        <FormItem label="报表类型" name="reportType">
          <Select v-model:value="searchForm.reportType" style="width: 180px;">
            <SelectOption value="inventoryQuery">现存量查询</SelectOption>
            <SelectOption value="inoutRunning">出入库流水</SelectOption>
            <SelectOption value="inventoryAnalysis">库存分析</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="仓库" name="warehouseId">
          <Select v-model:value="searchForm.warehouseId" style="width: 180px;">
            <!-- 仓库选项将通过API加载 -->
          </Select>
        </FormItem>
        <FormItem label="日期范围" name="dateRange">
          <RangePicker v-model:value="searchForm.dateRange" style="width: 240px;" />
        </FormItem>
        <FormItem>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 8px;" @click="handleReset">重置</a-button>
        </FormItem>
      </Form>

      <BasicTable
        :columns="columns"
        :request="loadReportData"
        :rowKey="(row) => row.id"
      />
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { BasicTable } from '@/components/Table';
import { Card, Form, FormItem, Select, SelectOption, RangePicker, Button } from 'ant-design-vue';
import { queryInventory } from '@/api/inventory';

// 查询表单
const searchForm = reactive({
  reportType: 'inventoryQuery',
  warehouseId: '',
  dateRange: [],
});

// 表格列定义
const columns = [
  { title: '商品编码', dataIndex: 'inventoryCode' },
  { title: '商品名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'specification' },
  { title: '仓库', dataIndex: 'warehouseName' },
  { title: '库存数量', dataIndex: 'quantity' },
  { title: '单位', dataIndex: 'unitName' },
  { title: '最近入库时间', dataIndex: 'lastInTime' },
  { title: '最近出库时间', dataIndex: 'lastOutTime' },
];

// 加载报表数据
const loadReportData = async (params) => {
  // 合并查询参数
  const queryParams = {
    ...params,
    ...searchForm,
    startDate: searchForm.dateRange[0]?.format('YYYY-MM-DD'),
    endDate: searchForm.dateRange[1]?.format('YYYY-MM-DD'),
  };

  const res = await queryInventory(queryParams);
  return res;
};

// 处理查询
const handleSearch = () => {
  // 触发表格重新加载数据
};

// 处理重置
const handleReset = () => {
  searchForm.reportType = 'inventoryQuery';
  searchForm.warehouseId = '';
  searchForm.dateRange = [];
  // 触发表格重新加载数据
};

// 处理导出
const handleExport = () => {
  // TODO: 实现导出逻辑
};
</script>

<style scoped lang="less">
.inventory-report-container {
  padding: 24px;
}
</style>