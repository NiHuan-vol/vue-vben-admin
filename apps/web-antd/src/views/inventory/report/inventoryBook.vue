<template>
  <div class="inventory-book-container">
    <Card title="库存台账" :bordered="false" :loading="loading">
      <div class="btn-wrapper flex justify-between items-center mb-4">
        <div class="flex space-x-2">
          <Button
            type="primary"
            @click="getList"
            :loading="tableLoading"
            class="mr-2"
          >
            <Icon icon="ant-design:search-outlined" class="mr-1" />查询
          </Button>
          <Button
            type="success"
            @click="exportOrder"
            :loading="exportLoading"
          >
            <Icon icon="ant-design:download-outlined" class="mr-1" />导出
          </Button>
          <Button
            type="default"
            @click="printOrder"
          >
            <Icon icon="ant-design:printer-outlined" class="mr-1" />打印
          </Button>
          <Button
            type="default"
            @click="syncFun"
          >
            <Icon icon="ant-design:sync-outlined" class="mr-1" />刷新
          </Button>
        </div>
      </div>

      <div ref="print" class="credentials-wrapper bg-white p-4 rounded-md shadow-sm">
        <h3 class="text-center text-lg font-bold mb-6">库存台账</h3>

        <div class="credentials-search-warpper mb-6">
          <div class="search-box grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="filter flex flex-col">
              <label class="filter-label text-red-500 mb-1"><span>*</span> 仓库：</label>
              <Input
                v-model:value="warehouseName"
                placeholder="请选择仓库"
                @click="searchGroup(1)"
                @change="searchGroup(2)"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label text-red-500 mb-1"><span>*</span> 物料名称：</label>
              <Input
                v-model:value="inventoryName"
                placeholder="请选择物料"
                @click="handlInputArchives(1, 'searchArchivesRef')"
                @keyup="handleArchiveChange"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label mb-1">规格型号：</label>
              <Input
                v-model:value="inventorySpecification"
                readonly
                placeholder="自动填充"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label mb-1">计量单位：</label>
              <Input
                v-model:value="unitName"
                readonly
                placeholder="自动填充"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label mb-1">物料分类：</label>
              <Input
                v-model:value="inventoryClassName"
                readonly
                placeholder="自动填充"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label mb-1">安全库存：</label>
              <Input
                v-model:value="safeStorage"
                readonly
                placeholder="自动填充"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label mb-1">最高库存：</label>
              <Input
                v-model:value="maxStorage"
                readonly
                placeholder="自动填充"
              />
            </div>

            <div class="filter flex flex-col">
              <label class="filter-label mb-1">最低库存：</label>
              <Input
                v-model:value="minStorage"
                readonly
                placeholder="自动填充"
              />
            </div>

            <div class="filter flex flex-col col-span-1 md:col-span-2">
              <label class="filter-label mb-1">出入库日期：</label>
              <RangePicker
                v-model:value="voucherDate"
                :ranges="{ '今日': [moment(), moment()], '本月': [moment().startOf('month'), moment().endOf('month')] }"
                @change="onChangeDate"
                style="width: 100%"
              />
            </div>

            <div class="filter flex flex-col col-span-1 md:col-span-2">
              <label class="filter-label mb-1">期间：</label>
              <div class="flex items-center space-x-2">
                <Select
                  v-model:value="startPeriod"
                  placeholder="开始期间"
                  style="flex: 1"
                  @change="startPeriodChange"
                >
                  <Option v-for="item in periodData" :key="item.id" :value="item.id">
                    {{ item.currentYear }}-{{ item.currentPeriod }}
                  </Option>
                </Select>
                <span class="text-gray-500">至</span>
                <Select
                  v-model:value="endPeriod"
                  placeholder="结束期间"
                  style="flex: 1"
                  @change="endPeriodChange"
                >
                  <Option v-for="item in periodData" :key="item.id" :value="item.id">
                    {{ item.currentYear }}-{{ item.currentPeriod }}
                  </Option>
                </Select>
              </div>
            </div>

            <div class="filter flex flex-col col-span-1 md:col-span-2">
              <label class="filter-label mb-1">往来单位：</label>
              <Input
                v-model:value="companyName"
                placeholder="请选择往来单位"
                @click="searchCompany(1)"
                @change="searchCompany(2)"
              />
            </div>
          </div>
        </div>

        <div class="table-box overflow-x-auto">
          <BasicTable
            ref="registerTable"
            :columns="columns"
            :dataSource="dataSource"
            :loading="tableLoading"
            :bordered="true"
            :scroll-x="1500"
            :scroll-y="550"
            :row-class-name="rowClassName"
          >
            <template #balanceAmount={ record }>
              <div v-show="record.voucherCode || record.receiveDeliverType === 3" :class="record.balanceAmount > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatNumber(record.balanceAmount) }}
              </div>
            </template>
            <template #balanceBaseQuantity={ record }>
              <div v-show="record.voucherCode || record.receiveDeliverType === 3" :class="record.balanceBaseQuantity > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatNumber(record.balanceBaseQuantity) }}
              </div>
            </template>
            <template #balancePrice={ record }>
              <div v-show="record.voucherCode || record.receiveDeliverType === 3">
                {{ formatNumber(record.balancePrice) }}
              </div>
            </template>
            <template #inBaseQuantity={ record }>
              <div v-show="record.receiveDeliverType !== 3" :class="!record.voucherCode ? (record.inBaseQuantity > 0 ? 'font-bold' : 'text-gray-400') : ''">
                {{ formatNumber(record.inBaseQuantity) }}
              </div>
            </template>
            <template #inAmount={ record }>
              <div v-show="record.receiveDeliverType !== 3" :class="!record.voucherCode ? (record.inAmount > 0 ? 'font-bold' : 'text-gray-400') : ''">
                {{ formatNumber(record.inAmount) }}
              </div>
            </template>
            <template #inPrice={ record }>
              <div v-show="record.voucherCode">
                {{ formatNumber(record.inPrice) }}
              </div>
            </template>
            <template #outBaseQuantity={ record }>
              <div v-show="record.receiveDeliverType !== 3" :class="!record.voucherCode ? (record.outBaseQuantity > 0 ? 'font-bold' : 'text-gray-400') : ''">
                {{ formatNumber(record.outBaseQuantity) }}
              </div>
            </template>
            <template #outAmount={ record }>
              <div v-show="record.receiveDeliverType !== 3" :class="!record.voucherCode ? (record.outAmount > 0 ? 'font-bold' : 'text-gray-400') : ''">
                {{ formatNumber(record.outAmount) }}
              </div>
            </template>
            <template #outPrice={ record }>
              <div v-show="record.voucherCode">
                {{ formatNumber(record.outPrice) }}
              </div>
            </template>
          </BasicTable>
        </div>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Card, Button, Input, RangePicker, Select, Option, message } from 'ant-design-vue';
import { BasicTable } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
import { exportPostAction, postAction } from '/@/api/manage';
import { list as ListPeriod } from '/@/api/erp/period';
import moment from 'moment';

// 响应式状态
const loading = ref(false);
const tableLoading = ref(false);
const exportLoading = ref(false);
const dataSource = ref<any[]>([]);
const periodData = ref<any[]>([]);
const tableExplandKey = ref<string[]>([]);

// 表单数据
const warehouseName = ref<string>('');
const warehouseId = ref<string | null>(null);
const companyName = ref<string>('');
const companyId = ref<string | null>(null);
const inventoryName = ref<string>('');
const inventoryId = ref<string | null>(null);
const inventoryCode = ref<string | null>(null);
const inventorySpecification = ref<string | null>(null);
const unitName = ref<string | null>(null);
const inventoryClassName = ref<string | null>(null);
const safeStorage = ref<number | null>(null);
const maxStorage = ref<number | null>(null);
const minStorage = ref<number | null>(null);
const voucherDate = ref<string[]>([]);
const voucherDateStart = ref<string | null>(null);
const voucherDateEnd = ref<string | null>(null);
const startPeriod = ref<string | null>(null);
const endPeriod = ref<string | null>(null);
const currentPeriodStart = ref<number>(0);
const currentPeriodEnd = ref<number>(0);
const maskArchives = ref(false);
const maskArchivesName = ref(false);
const maskArchivesType = ref(false);
const zIndex = ref(5);
const zIndexType = ref(5);
const inputType = ref<number | null>(null);
const setTime = ref<any>(null);

// 数据源和业务类型
const dataSourcesArray = [
  { name: '库存期初', code: 'PeriodStartOfStock' },
  { name: '采购入库', code: 'PurchaseReceiveVoucher' },
  { name: '产成品入库', code: 'ProductReceiveVoucher' },
  { name: '委外入库', code: 'DelegateReceiveVoucher' },
  { name: '其他入库', code: 'OtherReceiveVoucher' },
  { name: '销售出库', code: 'SaleDispatchVoucher' },
  { name: '材料出库', code: 'MaterialDispatchVoucher' },
  { name: '委外出库', code: 'DelegateDispatchVoucher' },
  { name: '其他出库', code: 'OtherDispatchVoucher' },
];

const businessTypesArray = [
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
  { name: '其他入库', code: 109 },
];

// 表格列配置
const columns = [
  {
    title: '出入库日期',
    dataIndex: 'inDate',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      const { receiveDeliverType } = record;
      switch (receiveDeliverType) {
        case 3: return <span class="font-bold text-red-600">期初结存</span>;
        case 5: return <span class="font-bold">本月合计</span>;
        case 6: return <span class="font-bold">本年合计</span>;
        default: return record.inDate;
      }
    },
  },
  {
    title: '单据类型',
    dataIndex: 'dataSource',
    width: 100,
    customRender: ({ record }) => {
      let backText = '';
      if (record.businessType === 5) {
        backText = '材料退货';
      } else if (record.businessType === 98) {
        backText = '销售退货';
      } else if (record.businessType === 99) {
        backText = '采购退货';
      } else if (record.businessType === 94) {
        backText = '产品退库';
      } else if (record.businessType === 95) {
        backText = '委外产品退库';
      } else {
        const item = dataSourcesArray.find(item => item.code === record.dataSource);
        backText = item ? item.name : '';
      }
      return backText;
    },
  },
  {
    title: '单据编号',
    dataIndex: 'voucherCode',
    width: 150,
    align: 'left',
  },
  {
    title: '业务单位',
    dataIndex: 'crmName',
    align: 'left',
    width: 150,
    ellipsis: true,
    customRender: ({ record }) => {
      return record.crmName || record.vendorName || record.officeName || '';
    },
  },
  {
    title: '项目编码',
    dataIndex: 'projectCode',
    align: 'left',
    width: 80,
    ellipsis: true,
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    align: 'left',
    width: 80,
    ellipsis: true,
  },
  {
    title: '收入',
    width: 300,
    children: [
      {
        title: '数量',
        dataIndex: 'inBaseQuantity',
        align: 'right',
        width: 100,
        ellipsis: true,
        slots: { customRender: 'inBaseQuantity' },
      },
      {
        title: '单价',
        dataIndex: 'inPrice',
        align: 'right',
        width: 100,
        ellipsis: true,
        slots: { customRender: 'inPrice' },
      },
      {
        title: '金额',
        dataIndex: 'inAmount',
        align: 'right',
        width: 100,
        ellipsis: true,
        slots: { customRender: 'inAmount' },
      },
    ],
  },
  {
    title: '发出',
    width: 300,
    children: [
      {
        title: '数量',
        dataIndex: 'outBaseQuantity',
        align: 'right',
        width: 100,
        ellipsis: true,
        slots: { customRender: 'outBaseQuantity' },
      },
      {
        title: '单价',
        dataIndex: 'outPrice',
        align: 'right',
        width: 100,
        ellipsis: true,
        slots: { customRender: 'outPrice' },
      },
      {
        title: '金额',
        dataIndex: 'outAmount',
        align: 'right',
        width: 100,
        ellipsis: true,
        slots: { customRender: 'outAmount' },
      },
    ],
  },
  {
    title: '结存数量',
    dataIndex: 'balanceBaseQuantity',
    align: 'right',
    width: 80,
    ellipsis: true,
    slots: { customRender: 'balanceBaseQuantity' },
  },
  {
    title: '结存单价',
    dataIndex: 'balancePrice',
    align: 'right',
    width: 80,
    ellipsis: true,
    slots: { customRender: 'balancePrice' },
  },
  {
    title: '结存金额',
    dataIndex: 'balanceAmount',
    align: 'right',
    width: 80,
    ellipsis: true,
    slots: { customRender: 'balanceAmount' },
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    align: 'left',
    width: 200,
    ellipsis: true,
  },
];

// 生命周期钩子
onMounted(() => {
  getPeriod();
});

// 方法定义
function getPeriod() {
  // 获取会计期间
  ListPeriod().then(response => {
    if (response.code === 200) {
      periodData.value = response.data[0].erpPeriodList || [];
    }
  }).catch(error => {
    message.error(error.message || '获取会计期间失败');
  });
}

function getList() {
  tableLoading.value = true;

  if (!warehouseId.value) {
    message.warning('仓库必须选择');
    tableLoading.value = false;
    return;
  }

  if (!inventoryId.value) {
    message.warning('物料名称必须选择');
    tableLoading.value = false;
    return;
  }

  // 期间验证
  if (currentPeriodStart.value > currentPeriodEnd.value) {
    message.warning('开始期间必须小于结束期间');
    tableLoading.value = false;
    return;
  }

  const postData = {
    page: { size: -1 },
    inventoryId: inventoryId.value,
    warehouseId: warehouseId.value,
    companyId: companyId.value,
    inOutDateStart: voucherDateStart.value,
    inOutDateEnd: voucherDateEnd.value,
    startPeriod: startPeriod.value,
    endPeriod: endPeriod.value,
  };

  postAction('/inOut/recordMain/statisticInventoryStandingBookVo', postData).then(response => {
    tableLoading.value = false;
    if (response.code === 200) {
      dataSource.value = response.data.records || [];
      console.log('库存台账数据:', dataSource.value);
    }
  }).catch(error => {
    tableLoading.value = false;
    message.error(error.message || '获取库存台账数据失败');
  });
}

function exportOrder() {
  if (!warehouseId.value) {
    message.warning('仓库必须选择');
    return;
  }

  if (!inventoryId.value) {
    message.warning('物料名称必须选择');
    return;
  }

  exportLoading.value = true;

  const postData = {
    inventoryId: inventoryId.value,
    warehouseId: warehouseId.value,
    companyId: companyId.value,
    inOutDateStart: voucherDateStart.value,
    inOutDateEnd: voucherDateEnd.value,
    startPeriod: startPeriod.value,
    endPeriod: endPeriod.value,
  };

  exportPostAction('/inOut/recordMain/inventoryStandingBookExportData', postData).then(response => {
    exportLoading.value = false;
    const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.ms-excel' }));
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', '库存台账.xls');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(error => {
    exportLoading.value = false;
    message.error(error.message || '导出失败');
  });
}

function printOrder() {
  // 打印功能
  const printContent = document.querySelector('.credentials-wrapper');
  if (printContent) {
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // 刷新页面以恢复状态
  }
}

function syncFun() {
  // 刷新
  getList();
}

function searchGroup(t: number) {
  // 仓库搜索逻辑
  // 实际项目中这里应该打开仓库选择弹窗
  if (t === 1) {
    message.info('打开仓库选择弹窗');
    // 模拟选择仓库
    setTimeout(() => {
      warehouseName.value = '测试仓库';
      warehouseId.value = '1';
    }, 1000);
  }
}

function searchCompany(t: number) {
  // 往来单位搜索逻辑
  // 实际项目中这里应该打开往来单位选择弹窗
  if (t === 1) {
    message.info('打开往来单位选择弹窗');
    // 模拟选择往来单位
    setTimeout(() => {
      companyName.value = '测试公司';
      companyId.value = '1';
    }, 1000);
  }
}

function onChangeDate(dates: any[], dateStrings: string[]) {
  // 单据日期处理
  voucherDate.value = dateStrings;
  voucherDateStart.value = dateStrings[0];
  voucherDateEnd.value = dateStrings[1];
}

function startPeriodChange(val: string) {
  startPeriod.value = val;
  // 实际项目中应该根据选择的期间设置currentPeriodStart
  // 这里简化处理
  currentPeriodStart.value = parseInt(val) || 0;
}

function endPeriodChange(val: string) {
  endPeriod.value = val;
  // 实际项目中应该根据选择的期间设置currentPeriodEnd
  // 这里简化处理
  currentPeriodEnd.value = parseInt(val) || 0;
}

function handlInputArchives(type: number, ref: string) {
  // 物料档案选择逻辑
  inputType.value = type;
  maskArchives.value = true;
  // 实际项目中这里应该打开物料选择弹窗
  message.info('打开物料选择弹窗');
  // 模拟选择物料
  setTimeout(() => {
    inventoryCode.value = 'TEST001';
    inventoryName.value = '测试物料';
    inventoryId.value = '1';
    unitName.value = '个';
    inventorySpecification.value = '规格1';
    inventoryClassName.value = '物料分类1';
    safeStorage.value = 100;
    maxStorage.value = 1000;
    minStorage.value = 50;
    maskArchives.value = false;
  }, 1000);
}

function handleArchiveChange() {
  // 物料编码搜索
  if (inventoryName.value) {
    // 实际项目中这里应该根据输入的物料名称搜索物料
    message.info(`搜索物料: ${inventoryName.value}`);
  }
}

function closeArchives() {
  maskArchives.value = false;
  maskArchivesName.value = false;
  maskArchivesType.value = false;
}

function checkArchives(data: any[]) {
  // 物料选择回调处理
  closeArchives();
  // 实际项目中应该根据返回的data设置相关字段
  // 这里简化处理
  if (data[1] === 1) {
    inventoryCode.value = data[0][0].inventoryCode;
    inventoryName.value = data[0][0].inventoryName;
    inventoryId.value = data[0][0].id;
    unitName.value = data[0][0].unitName || data[0][0].unitGroupName;
    inventorySpecification.value = data[0][0].inventorySpecification;
    inventoryClassName.value = data[0][0].inventoryClassName;
    safeStorage.value = data[0][0].safeStorage;
    maxStorage.value = data[0][0].maxStorage;
    minStorage.value = data[0][0].minStorage;
  }
}

function rowClassName(record: any) {
  return !record.inventoryName ? 'bg-yellow-50 font-bold' : '';
}

function formatNumber(num: number) {
  // 数字格式化
  if (num === null || num === undefined) return '';
  return num.toFixed(2);
}
</script>

<style lang="less" scoped>
.inventory-book-container {
  .credentials-wrapper {
    .search-box {
      .filter-label {
        font-weight: normal;
        margin-bottom: 4px;
      }

      .filter-control {
        width: 100%;
      }
    }

    .table-box {
      margin-top: 16px;
    }
  }

  .bg-yellow-50 {
    background-color: #fffceb;
  }
}
</style>