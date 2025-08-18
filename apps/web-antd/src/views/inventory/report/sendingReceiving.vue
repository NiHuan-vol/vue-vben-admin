<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <div class="title-wrapper">
        <h3 class="text-center">{{voucherTitle}}</h3>
      </div>

      <div class="btn-wrapper clearfix">
        <div class="btn-wrapper-left fl" style="margin-left: 10px;">
          <a-row :span="24" :gutter="[16, 0]">
            <a-col :sm="24" :md="12" :lg="8" :xl="6" style="text-align: left; line-height: 32px;">
              期间：{{startPeriodName}}至{{endPeriodName}}
            </a-col>
            <a-col :sm="24" :md="12" :lg="16" :xl="18" style="text-align: right;">
              <Button type="primary" @click="handleExport">导出</Button>
              <Button class="margin-left-10" @click="handlePrint">打印</Button>
              <Button class="margin-left-10" @click="handleSearch">查询</Button>
            </a-col>
          </a-row>
        </div>
      </div>

      <div class="documents-wrapper" id="documents-wrapper">
        <BasicTable
          ref="tableRef"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          @change="handleTableChange"
          @expand="expand"
          :expandable="{ expandedRowKeys, expandedRowRender: expandedRowRender }
          bordered
        >
          <template #defaultExpandAllRows>
            true
          </template>
        </BasicTable>
      </div>
    </div>

    <Modal v-model:visible="searchVisible" title="查询条件" @cancel="handleCancel" @ok="handleSearch" width="800px" :destroyOnClose="true">
      <div class="credentials-wrapper">
        <a-row :span="24" :gutter="[16, 16]">
          <a-col :span="12">
            <FormItem label="仓库" name="warehouse">
              <Select v-model:value="searchForm.warehouse" placeholder="请选择仓库" style="width: 100%;">
                <Option v-for="item in warehouseList" :key="item.id" :value="item.id">{{item.name}}</Option>
              </Select>
            </FormItem>
          </a-col>
          <a-col :span="12">
            <FormItem label="物料编码" name="inventoryCode">
              <Input v-model:value="searchForm.inventoryCode" placeholder="请输入物料编码" />
            </FormItem>
          </a-col>
          <a-col :span="12">
            <FormItem label="物料名称" name="inventoryName">
              <Input v-model:value="searchForm.inventoryName" placeholder="请输入物料名称" />
            </FormItem>
          </a-col>
          <a-col :span="12">
            <FormItem label="规格型号" name="inventorySpecification">
              <Input v-model:value="searchForm.inventorySpecification" placeholder="请输入规格型号" />
            </FormItem>
          </a-col>
          <a-col :span="24">
            <div class="date-radio-box">
              <RadioGroup v-model:value="searchForm.dateType" @change="onChangeRadio">
                <Radio value="0">按会计期间</Radio>
                <Radio value="1">按日期</Radio>
              </RadioGroup>
              <div v-if="searchForm.dateType === '0'" class="date-radio-content">
                <FormItem label="开始期间" name="startPeriod">
                  <Select v-model:value="searchForm.startPeriod" placeholder="请选择开始期间" style="width: 100%; margin-right: 10px;">
                    <Option v-for="item in periodList" :key="item.value" :value="item.value">{{item.label}}</Option>
                  </Select>
                </FormItem>
                <FormItem label="结束期间" name="endPeriod">
                  <Select v-model:value="searchForm.endPeriod" placeholder="请选择结束期间" style="width: 100%;">
                    <Option v-for="item in periodList" :key="item.value" :value="item.value">{{item.label}}</Option>
                  </Select>
                </FormItem>
              </div>
              <div v-else class="date-radio-content">
                <FormItem label="开始日期" name="startDate">
                  <DatePicker v-model:value="searchForm.startDate" style="width: 100%; margin-right: 10px;" />
                </FormItem>
                <FormItem label="结束日期" name="endDate">
                  <DatePicker v-model:value="searchForm.endDate" style="width: 100%;" />
                </FormItem>
              </div>
            </div>
          </a-col>
        </a-row>
        <div class="button-wrapper">
          <Button type="primary" @click="handleSearch">查询</Button>
          <Button @click="handleCancel" class="margin-left-10">取消</Button>
        </div>
      </div>
    </Modal>

    <Modal v-model:visible="inventoryVisible" title="物料选择" @cancel="handleCancelInventory" @ok="handleOkInventory" width="1000px" :destroyOnClose="true">
      <div class="inventory-select-wrapper">
        <a-row :span="24" :gutter="[16, 16]">
          <a-col :span="24">
            <div class="search-wrapper">
              <Input v-model:value="searchKey" placeholder="请输入物料编码/名称" @change="handleArchiveChange" />
              <Button type="primary" @click="handleArchiveChange">搜索</Button>
            </div>
          </a-col>
          <a-col :span="24">
            <BasicTable ref="inventoryTableRef" rowKey="id" @select="handleNameChange" :columns="inventoryColumns" :dataSource="inventoryDataSource" :pagination="inventoryPagination" @change="handleInventoryTableChange" bordered />
          </a-col>
        </a-row>
      </div>
      <template #footer>
        <div>
          <Button type="primary" @click="handleOkInventory">确定</Button>
          <Button @click="handleCancelInventory" class="margin-left-10">取消</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { BasicTable, TableColumn } from '@/components/Table';
import { Button, Input, Modal, Select, Option, Form, FormItem, DatePicker, Radio, RadioGroup } from 'ant-design-vue';
import { list as getSendingReceiving } from '@/api/inventory/sendingReceiving';
import { list as listWarehouse } from '@/api/inventory/warehouse';
import { list as listInventory } from '@/api/inventory/inventory';
import { getPeriodList } from '@/api/period/period';
import { exportExcel } from '@/utils/export';
import { print } from '@/utils/print';

const route = useRoute();
const instance = getCurrentInstance();

// 状态定义
const searchVisible = ref(false);
const inventoryVisible = ref(false);
const searchForm = reactive({
  warehouse: '',
  inventoryCode: '',
  inventoryName: '',
  inventorySpecification: '',
  dateType: '0',
  startPeriod: '',
  endPeriod: '',
  startDate: '',
  endDate: ''
});
const columns = ref<TableColumn[]>([
  { label: '物料编码', prop: 'inventoryCode', width: 120 },
  { label: '物料名称', prop: 'inventoryName', width: 160 },
  { label: '规格型号', prop: 'inventorySpecification', width: 120 },
  { label: '计量单位', prop: 'unitName', width: 80 },
  { label: '期初数量', prop: 'beginningQuantity', width: 100 },
  { label: '入库数量', prop: 'inQuantity', width: 100 },
  { label: '出库数量', prop: 'outQuantity', width: 100 },
  { label: '期末数量', prop: 'endingQuantity', width: 100 },
  { label: '仓库', prop: 'warehouseName', width: 120 },
]);
const dataSource = ref<any[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});
const expandedRowKeys = ref<string[]>([]);
const warehouseList = ref<any[]>([]);
const periodList = ref<any[]>([]);
const startPeriodName = ref<string>('');
const endPeriodName = ref<string>('');
const searchKey = ref<string>('');
const inventoryDataSource = ref<any[]>([]);
const inventoryPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});
const inventoryColumns = ref<TableColumn[]>([
  { label: '物料编码', prop: 'inventoryCode', width: 120 },
  { label: '物料名称', prop: 'inventoryName', width: 160 },
  { label: '规格型号', prop: 'inventorySpecification', width: 120 },
  { label: '单位', prop: 'unitName', width: 80 },
]);
const selectedInventory = ref<any[]>([]);
const docTypes = ref<string[]>(['采购入库', '销售出库', '生产入库', '材料出库', '其他入库', '其他出库']);
const businessTypes = ref<string[]>(['采购', '销售', '生产', '委外', '其他']);
const loading = ref(false);

// 计算属性
const voucherTitle = computed(() => route.meta.name || '收发存汇总表');

// 生命周期钩子
onMounted(() => {
  getWarehouseList();
  getPeriod();
  getList();
});

// 方法定义
function handleSearch() {
  loading.value = true;
  searchVisible.value = false;
  const params = {
    current: pagination.current,
    size: pagination.pageSize,
    ...searchForm
  };

  getSendingReceiving(params).then(res => {
    loading.value = false;
    if (res.code === 200) {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    }
  });
}

function handleTableChange(page: number) {
  pagination.current = page;
  handleSearch();
}

function expand(expandedRowKeys: string[]) {
  this.expandedRowKeys = expandedRowKeys;
}

function expandedRowRender(record: any) {
  return (
    <div class="expand-row-content">
      <BasicTable
        rowKey="id"
        columns={[
          { label: '业务类型', prop: 'businessType', width: 100 },
          { label: '单据类型', prop: 'docType', width: 100 },
          { label: '单据编号', prop: 'docCode', width: 160 },
          { label: '单据日期', prop: 'docDate', width: 120 },
          { label: '入库数量', prop: 'inQuantity', width: 100 },
          { label: '出库数量', prop: 'outQuantity', width: 100 },
        ]}
        dataSource={record.details || []}
        pagination={false}
        bordered
      />
    </div>
  );
}

function handleExport() {
  const params = { ...searchForm };
  getSendingReceiving(params).then(res => {
    if (res.code === 200) {
      const data = res.data.records;
      exportExcel(data, ['物料编码', '物料名称', '规格型号', '计量单位', '期初数量', '入库数量', '出库数量', '期末数量', '仓库'], ['inventoryCode', 'inventoryName', 'inventorySpecification', 'unitName', 'beginningQuantity', 'inQuantity', 'outQuantity', 'endingQuantity', 'warehouseName'], '收发存汇总表');
    }
  });
}

function handlePrint() {
  print('documents-wrapper', '收发存汇总表');
}

function getWarehouseList() {
  listWarehouse({ current: 1, size: -1 }).then(res => {
    if (res.code === 200) {
      warehouseList.value = res.data.records;
    }
  });
}

function getPeriod() {
  getPeriodList().then(res => {
    if (res.code === 200) {
      periodList.value = res.data;
      if (periodList.value.length > 0) {
        searchForm.startPeriod = periodList.value[0].value;
        searchForm.endPeriod = periodList.value[0].value;
        startPeriodName.value = periodList.value[0].label;
        endPeriodName.value = periodList.value[0].label;
      }
    }
  });
}

function startPeriodChange(value: string) {
  searchForm.startPeriod = value;
  const item = periodList.value.find(item => item.value === value);
  if (item) startPeriodName.value = item.label;
}

function endPeriodChange(value: string) {
  searchForm.endPeriod = value;
  const item = periodList.value.find(item => item.value === value);
  if (item) endPeriodName.value = item.label;
}

function onChangeRadio(e: any) {
  searchForm.dateType = e.target.value;
}

function handleNameChange(rows: any[]) {
  selectedInventory.value = rows;
}

function handleArchiveChange() {
  const params = {
    current: inventoryPagination.current,
    size: inventoryPagination.pageSize,
    inventoryCode: searchKey.value,
    inventoryName: searchKey.value
  };

  listInventory(params).then(res => {
    if (res.code === 200) {
      inventoryDataSource.value = res.data.records;
      inventoryPagination.total = res.data.total;
    }
  });
}

function handleInventoryTableChange(page: number) {
  inventoryPagination.current = page;
  handleArchiveChange();
}

function handleOkInventory() {
  if (selectedInventory.value.length > 0) {
    searchForm.inventoryCode = selectedInventory.value[0].inventoryCode;
    searchForm.inventoryName = selectedInventory.value[0].inventoryName;
    searchForm.inventorySpecification = selectedInventory.value[0].inventorySpecification;
    inventoryVisible.value = false;
  } else {
    message.warning('请选择物料');
  }
}

function handleCancelInventory() {
  inventoryVisible.value = false;
}

function handleCancel() {
  searchVisible.value = false;
}

function getList() {
  const params = {
    current: pagination.current,
    size: pagination.pageSize,
    ...searchForm
  };

  getSendingReceiving(params).then(res => {
    if (res.code === 200) {
      dataSource.value = res.data.records;
      pagination.total = res.data.total;
    }
  });
}

function searchPlan() {
  searchVisible.value = true;
}

function syncFun() {
  getList();
}
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';

.credentials-wrapper {
  padding: 10px;
  .button-wrapper {
    text-align: right;
    margin-top: 20px;
  }
}

.date-radio-box {
  margin-top: 10px;
  .date-radio-content {
    display: flex;
    margin-top: 10px;
  }
}

.inventory-select-wrapper {
  .search-wrapper {
    display: flex;
    margin-bottom: 10px;
    .ant-input {
      flex: 1;
      margin-right: 10px;
    }
  }
}

.expand-row-content {
  padding: 10px;
}
</style>