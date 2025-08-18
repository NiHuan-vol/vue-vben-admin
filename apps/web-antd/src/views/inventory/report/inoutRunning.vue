<template>
  <div class="inventory-report-container">
    <Card title="出入库流水" :bordered="false">
      <template #extra>
        <a-button @click="handleExport">导出报表</a-button>
      </template>

      <Form layout="inline" :model="searchForm" @submit.prevent="handleSearch">
        <FormItem label="日期类型" name="dateType">
          <RadioGroup v-model:value="searchForm.dateType">
            <Radio value="date">日期</Radio>
            <Radio value="period">期间</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem v-if="searchForm.dateType === 'date'" label="日期范围" name="dateRange">
          <RangePicker v-model:value="searchForm.dateRange" style="width: 240px;" />
        </FormItem>

        <FormItem v-else label="期间范围" name="periodRange">
          <Select v-model:value="searchForm.startPeriod" style="width: 120px; margin-right: 8px;">
            <SelectOption v-for="item in periodData" :key="item.id" :value="item.id">
              {{ item.currentYear }}-{{ item.currentPeriod }}
            </SelectOption>
          </Select>
          至
          <Select v-model:value="searchForm.endPeriod" style="width: 120px; margin-left: 8px;">
            <SelectOption v-for="item in periodData" :key="item.id" :value="item.id">
              {{ item.currentYear }}-{{ item.currentPeriod }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem label="仓库" name="warehouseId">
          <Select v-model:value="searchForm.warehouseId" style="width: 180px;">
            <!-- 仓库选项将通过API加载 -->
          </Select>
        </FormItem>

        <FormItem label="业务类型" name="businessTypes">
          <Select v-model:value="searchForm.businessTypes" mode="multiple" style="width: 180px;">
            <SelectOption v-for="item in businessTypesArray" :key="item.code" :value="item.code">
              {{ item.name }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem label="单据类型" name="dataSources">
          <Select v-model:value="searchForm.dataSources" mode="multiple" style="width: 180px;">
            <SelectOption v-for="item in dataSourcesArray" :key="item.code" :value="item.code">
              {{ item.name }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem label="物料编码" name="inventoryCode">
          <InputGroup compact>
            <Input v-model:value="searchForm.inventoryCodeStart" placeholder="开始编码" style="width: 80px;" />
            <Input v-model:value="searchForm.inventoryCodeEnd" placeholder="结束编码" style="width: 80px; margin-left: 8px;" />
          </InputGroup>
        </FormItem>

        <FormItem label="物料名称" name="inventoryName">
          <Input v-model:value="searchForm.inventoryName" style="width: 180px;" />
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
        :pagination="pagination"
        :scroll-x="1200"
      />
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { BasicTable } from '@/components/Table';
import { Card, Form, FormItem, Select, SelectOption, Input, InputGroup, Radio, RadioGroup, RangePicker, Button } from 'ant-design-vue';
import { exportPostAction, postAction } from '@/api/manage';
import { list as ListPeriod } from '@/api/erp/period';

// 查询表单
const searchForm = reactive({
  dateType: 'date',
  dateRange: [],
  startPeriod: '',
  endPeriod: '',
  warehouseId: '',
  businessTypes: [],
  dataSources: [],
  inventoryCodeStart: '',
  inventoryCodeEnd: '',
  inventoryName: '',
  inventorySpecification: '',
});

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 业务类型和单据类型数据
const businessTypesArray = ref([
  { name: '普通采购', code: 1 },
  { name: '固定资产', code: 2 },
  { name: '普通销售', code: 3 },
  { name: '领料', code: 4 },
  { name: '退料', code: 5 },
  { name: '补料', code: 6 },
  { name: '生成完工', code: 9 },
  { name: '产品退库', code: 94 },
  { name: '委外产品退库', code: 95 },
  { name: '销售退货', code: 98 },
  { name: '采购退货', code: 99 },
  { name: '库存期初', code: 100 },
]);

const dataSourcesArray = ref([
  { name: '库存期初', code: 'PeriodStartOfStock' },
  { name: '采购入库', code: 'PurchaseReceiveVoucher' },
  { name: '产成品入库', code: 'ProductReceiveVoucher' },
  { name: '委外入库', code: 'DelegateReceiveVoucher' },
  { name: '其他入库', code: 'OtherReceiveVoucher' },
  { name: '销售出库', code: 'SaleDispatchVoucher' },
  { name: '材料出库', code: 'MaterialDispatchVoucher' },
  { name: '委外出库', code: 'DelegateDispatchVoucher' },
  { name: '其他出库', code: 'OtherDispatchVoucher' },
]);

// 会计期间数据
const periodData = ref([]);

// 表格列定义
const columns = [
  { title: '出入库日期', dataIndex: 'inDate', width: 100, align: 'center' },
  {
    title: '单据类型',
    dataIndex: 'dataSource',
    width: 80,
    customRender: ({ text, record }) => {
      if (record.businessType === 5) return '材料退货';
      if (record.businessType === 98) return '销售退货';
      if (record.businessType === 99) return '采购退货';
      if (record.businessType === 94) return '产品退库';
      if (record.businessType === 95) return '委外产品退库';
      const item = dataSourcesArray.value.find(item => item.code === text);
      return item ? item.name : text;
    },
  },
  { title: '单据编号', dataIndex: 'voucherCode', width: 100, align: 'left' },
  { title: '仓库', dataIndex: 'warehouseName', width: 120, align: 'center' },
  {
    title: '出入库类别',
    dataIndex: 'receiveDeliverType',
    width: 60,
    align: 'center',
    customRender: ({ text }) => text === 1 ? '入库' : '出库',
  },
  { title: '物料编码', dataIndex: 'inventoryCode', width: 80, align: 'left' },
  { title: '物料名称', dataIndex: 'inventoryName', width: 90, align: 'left' },
  { title: '规格型号', dataIndex: 'inventorySpecification', width: 80, align: 'left' },
  { title: '计量单位', dataIndex: 'baseUnitName', width: 50, align: 'left' },
  { title: '业务单位', dataIndex: 'partnerName', width: 100, align: 'left' },
  {
    title: '入库',
    children: [
      {
        title: '数量',
        dataIndex: 'baseQuantity',
        width: 80,
        align: 'right',
        customRender: ({ text, record }) => record.receiveDeliverType === 1 ? text : '',
      },
      {
        title: '单价',
        dataIndex: 'price',
        width: 80,
        align: 'right',
        customRender: ({ text, record }) => record.receiveDeliverType === 1 ? text : '',
      },
      {
        title: '金额',
        dataIndex: 'amount',
        width: 80,
        align: 'right',
        customRender: ({ text, record }) => record.receiveDeliverType === 1 ? text : '',
      },
    ],
  },
  {
    title: '出库',
    children: [
      {
        title: '数量',
        dataIndex: 'baseQuantity',
        width: 80,
        align: 'right',
        customRender: ({ text, record }) => record.receiveDeliverType === 2 ? text : '',
      },
      {
        title: '单价',
        dataIndex: 'price',
        width: 80,
        align: 'right',
        customRender: ({ text, record }) => record.receiveDeliverType === 2 ? text : '',
      },
      {
        title: '金额',
        dataIndex: 'amount',
        width: 80,
        align: 'right',
        customRender: ({ text, record }) => record.receiveDeliverType === 2 ? text : '',
      },
    ],
  },
];

// 加载报表数据
const loadReportData = async (params) => {
  const queryParams = {
    ...params,
    page: {
      current: pagination.currentPage,
      size: pagination.pageSize,
    },
    inOutDateStart: searchForm.dateRange[0]?.format('YYYY-MM-DD'),
    inOutDateEnd: searchForm.dateRange[1]?.format('YYYY-MM-DD'),
    startPeriod: searchForm.startPeriod,
    endPeriod: searchForm.endPeriod,
    warehouseIds: searchForm.warehouseId ? [searchForm.warehouseId] : [],
    businessTypes: searchForm.businessTypes,
    dataSources: searchForm.dataSources,
    inventoryCodeStart: searchForm.inventoryCodeStart,
    inventoryCodeEnd: searchForm.inventoryCodeEnd,
    inventoryName: searchForm.inventoryName,
    inventorySpecification: searchForm.inventorySpecification,
  };

  const res = await postAction('/inOut/recordMain/statisticInOutRecordDetailVo', queryParams);
  if (res.code === 200) {
    pagination.total = res.data.total;
    return res.data.records;
  }
  return [];
};

// 处理查询
const handleSearch = () => {
  // 触发表格重新加载数据
};

// 处理重置
const handleReset = () => {
  searchForm.dateType = 'date';
  searchForm.dateRange = [];
  searchForm.startPeriod = '';
  searchForm.endPeriod = '';
  searchForm.warehouseId = '';
  searchForm.businessTypes = [];
  searchForm.dataSources = [];
  searchForm.inventoryCodeStart = '';
  searchForm.inventoryCodeEnd = '';
  searchForm.inventoryName = '';
  searchForm.inventorySpecification = '';
  // 触发表格重新加载数据
};

// 处理导出
const handleExport = async () => {
  const queryParams = {
    inOutDateStart: searchForm.dateRange[0]?.format('YYYY-MM-DD'),
    inOutDateEnd: searchForm.dateRange[1]?.format('YYYY-MM-DD'),
    startPeriod: searchForm.startPeriod,
    endPeriod: searchForm.endPeriod,
    warehouseIds: searchForm.warehouseId ? [searchForm.warehouseId] : [],
    businessTypes: searchForm.businessTypes,
    dataSources: searchForm.dataSources,
    inventoryCodeStart: searchForm.inventoryCodeStart,
    inventoryCodeEnd: searchForm.inventoryCodeEnd,
    inventoryName: searchForm.inventoryName,
    inventorySpecification: searchForm.inventorySpecification,
  };

  try {
    const response = await exportPostAction('/inOut/recordMain/inOutRecordExportData', queryParams);
    const url = window.URL.createObjectURL(
      new Blob([response], { type: 'application/vnd.ms-excel' })
    );
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', '出入库流水.xls');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('导出失败:', error);
  }
};

// 获取会计期间
const getPeriod = async () => {
  try {
    const response = await ListPeriod();
    if (response.code === 200) {
      periodData.value = response.data[0]?.erpPeriodList || [];
    }
  } catch (error) {
    console.error('获取会计期间失败:', error);
  }
};

// 初始化
onMounted(() => {
  getPeriod();
});
</script>

<style scoped lang="less">
.inventory-report-container {
  padding: 24px;
}
</style>