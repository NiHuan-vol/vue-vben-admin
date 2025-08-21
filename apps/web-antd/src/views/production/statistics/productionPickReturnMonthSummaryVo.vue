<template>
  <div class="credentials-wrapper">
    <BasicTable
      title="生产领料月报表"
      :columns="columns"
      :request-fn="getList"
      :row-key="(record) => record.key"
      :expandable="expandable"
      :pagination="pagination"
      :row-class-name="rowClassName"
    >
      <template #toolbar>
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <a-button type="primary" @click="exportOrder">导出</a-button>
            <a-button @click="printOrder">打印</a-button>
            <a-button @click="searchDynamic">动态查询</a-button>
          </div>
          <Form class="flex items-center space-x-2">
            <FormItem label="月份">
              <a-month-picker
                v-model:value="postData.monthMoment"
                format="YYYY-MM"
                @change="onChangeMonth"
              />
            </FormItem>
            <FormItem label="生产车间">
              <a-input-search
                v-model:value="officeName"
                placeholder="请输入生产车间"
                @change="onOfficeNameChange"
                @search="handleSearch('officeSearch')"
              />
            </FormItem>
            <FormItem label="物料编码">
              <a-input
                v-model:value="inventoryCode"
                placeholder="请输入物料编码"
              />
            </FormItem>
            <FormItem label="物料名称">
              <a-input-search
                v-model:value="inventoryName"
                placeholder="请输入物料名称"
                @search="handleSearch('inventorySearch')"
              />
            </FormItem>
            <a-button type="primary" @click="searchPlan">查询</a-button>
          </Form>
        </div>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { BasicTable, useTable } from '@/components/Table';
import { Form, FormItem, Button } from 'ant-design-vue';
import { postAction, exportPostAction } from '@/api/http/axios';
import { formatToDateTime, isEmpty } from '@/utils';
import { moment } from 'moment';

// 类型定义
interface PostData {
  monthMoment: moment.Moment | null;
  month: string;
  officeId: string | null;
  inventoryId: string | null;
  page: { current: number; size: number };
}

interface TableRecord {
  key: string;
  month: string;
  officeId: string;
  officeName: string;
  inventoryId: string;
  inventoryCode: string;
  inventoryName: string;
  cumPickQuantity: number;
  cumRetQuantity: number;
  dataType: number;
}

// 状态定义
const postData = reactive<PostData>({
  monthMoment: moment(),
  month: '',
  officeId: null,
  inventoryId: null,
  page: { current: 1, size: 200 },
});

const officeName = ref('');
const inventoryCode = ref('');
const inventoryName = ref('');
const pagination = reactive({
  current: 1,
  pageSize: 200,
  total: 0,
});

const dataSource = ref<TableRecord[]>([]);
const tableExplandKey = ref<string[]>([]);

// 表格列定义
const columns = [
  { title: '月份', dataIndex: 'month', width: 100 },
  { title: '生产车间', dataIndex: 'officeName', width: 150 },
  { title: '物料编码', dataIndex: 'inventoryCode', width: 150 },
  { title: '物料名称', dataIndex: 'inventoryName', width: 200 },
  { title: '领料数量', dataIndex: 'cumPickQuantity', width: 100, valueType: 'number', valueFormat: '#,##0.000' },
  { title: '退料数量', dataIndex: 'cumRetQuantity', width: 100, valueType: 'number', valueFormat: '#,##0.000' },
];

// 展开配置
const expandable = {
  expandedRowKeys: tableExplandKey,
  onExpand: (expanded: boolean, record: TableRecord) => {
    if (expanded) {
      tableExplandKey.value.push(record.key);
    } else {
      const index = tableExplandKey.value.findIndex(key => key === record.key);
      if (index !== -1) {
        tableExplandKey.value.splice(index, 1);
      }
    }
  },
};

// 月份改变事件
const onChangeMonth = (value: moment.Moment) => {
  postData.monthMoment = value;
  postData.month = value?.format('YYYY-MM') || '';
};

// 生产车间改变事件
const onOfficeNameChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  officeName.value = target.value;
};

// 处理搜索
const handleSearch = (refName: string) => {
  // 模拟搜索弹窗逻辑
  console.log(`打开${refName}搜索弹窗`);
};

// 获取列表数据
const getList = async () => {
  tableExplandKey.value = [];
  postData.page.current = pagination.current;
  postData.page.size = pagination.pageSize;
  postData.month = postData.monthMoment?.format('YYYY-MM') || '';

  try {
    const response = await postAction('/production/work/pageProductionPickReturnMonthSummaryVo', postData);
    if (response.code === 200) {
      if (response.data) {
        pagination.total = response.data.total;
        if (response.data.total > 0) {
          dataSource.value = dataFormat(response.data.records);
        } else {
          dataSource.value = [];
        }
        return {
          items: dataSource.value,
          total: pagination.total,
        };
      }
    }
    return { items: [], total: 0 };
  } catch (error) {
    console.error('获取数据失败:', error);
    return { items: [], total: 0 };
  }
};

// 数据格式化
const dataFormat = (list: TableRecord[]): TableRecord[] => {
  const newList: TableRecord[] = [];
  let sumOffice: TableRecord | null = null;
  let sumInventory: TableRecord | null = null;
  const sumMonth: TableRecord = {
    dataType: 2,
    month: `${postData.month}(合计)`,
    officeId: '',
    officeName: '',
    inventoryId: '',
    inventoryCode: '',
    inventoryName: '',
    cumPickQuantity: 0,
    cumRetQuantity: 0,
    key: 'total-month',
  };

  const length = list.length;
  let offSet = 0;

  list.forEach((item, index) => {
    const { month, officeId, officeName, inventoryId, inventoryCode, cumPickQuantity, cumRetQuantity } = item;
    const pickQty = cumPickQuantity || 0;
    const retQty = cumRetQuantity || 0;

    sumMonth.cumPickQuantity += pickQty;
    sumMonth.cumRetQuantity += retQty;

    // 处理物料合计
    if (!sumInventory) {
      sumInventory = {
        dataType: 2,
        month,
        officeId,
        officeName,
        inventoryId,
        inventoryCode: `${inventoryCode}(合计)`,
        inventoryName: '',
        cumPickQuantity: pickQty,
        cumRetQuantity: retQty,
        key: `sum-inventory-${index}`,
      };
    } else if (officeId === sumInventory.officeId && inventoryId === sumInventory.inventoryId) {
      sumInventory.cumPickQuantity += pickQty;
      sumInventory.cumRetQuantity += retQty;
    } else {
      offSet++;
      sumInventory.cumPickQuantity = Number(sumInventory.cumPickQuantity.toFixed(3));
      sumInventory.cumRetQuantity = Number(sumInventory.cumRetQuantity.toFixed(3));
      newList.push(sumInventory);
      sumInventory = {
        dataType: 2,
        month,
        officeId,
        officeName,
        inventoryId,
        inventoryCode: `${inventoryCode}(合计)`,
        inventoryName: '',
        cumPickQuantity: pickQty,
        cumRetQuantity: retQty,
        key: `sum-inventory-${index}`,
      };
    }

    // 处理车间合计
    if (!sumOffice) {
      sumOffice = {
        dataType: 3,
        month,
        officeId,
        officeName: `${officeName}(合计)`,
        inventoryId: '',
        inventoryCode: '',
        inventoryName: '',
        cumPickQuantity: pickQty,
        cumRetQuantity: retQty,
        key: `sum-office-${index}`,
      };
    } else if (officeId === sumOffice.officeId) {
      sumOffice.cumPickQuantity += pickQty;
      sumOffice.cumRetQuantity += retQty;
    } else {
      offSet++;
      sumOffice.cumPickQuantity = Number(sumOffice.cumPickQuantity.toFixed(3));
      sumOffice.cumRetQuantity = Number(sumOffice.cumRetQuantity.toFixed(3));
      newList.push(sumOffice);
      sumOffice = {
        dataType: 3,
        month,
        officeId,
        officeName: `${officeName}(合计)`,
        inventoryId: '',
        inventoryCode: '',
        inventoryName: '',
        cumPickQuantity: pickQty,
        cumRetQuantity: retQty,
        key: `sum-office-${index}`,
      };
    }

    newList.push({ ...item, key: `item-${index}` });

    // 处理最后一条记录
    if (index === length - 1) {
      offSet += 3;
      if (sumInventory) {
        sumInventory.cumPickQuantity = Number(sumInventory.cumPickQuantity.toFixed(3));
        sumInventory.cumRetQuantity = Number(sumInventory.cumRetQuantity.toFixed(3));
        newList.push(sumInventory);
      }
      if (sumOffice) {
        sumOffice.cumPickQuantity = Number(sumOffice.cumPickQuantity.toFixed(3));
        sumOffice.cumRetQuantity = Number(sumOffice.cumRetQuantity.toFixed(3));
        newList.push(sumOffice);
      }
      sumMonth.cumPickQuantity = Number(sumMonth.cumPickQuantity.toFixed(3));
      sumMonth.cumRetQuantity = Number(sumMonth.cumRetQuantity.toFixed(3));
      newList.push(sumMonth);
    }
  });

  // 调整分页
  const pages = Math.ceil(pagination.total / pagination.pageSize);
  pagination.pageSize = pagination.pageSize + offSet;
  pagination.total = pagination.total + offSet * pages;

  return newList;
};

// 行样式
const rowClassName = (record: TableRecord) => {
  return !record.inventoryName ? 'changeColorClass' : '';
};

// 导出订单
const exportOrder = async () => {
  try {
    const response = await exportPostAction('/production/work/exportProductionPickReturnMonthSummaryVo', postData);
    if (response) {
      const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '生产领料月报表.xls');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('导出失败:', error);
  }
};

// 打印订单
const printOrder = () => {
  window.print();
};

// 动态查询
const searchDynamic = () => {
  console.log('打开动态查询弹窗');
};

// 查询
const searchPlan = () => {
  pagination.current = 1;
  getList();
};

// 初始化
onMounted(() => {
  postData.month = postData.monthMoment?.format('YYYY-MM') || '';
  getList();
});
</script>

<style lang="less">
.changeColorClass {
  font-weight: bold;
  background-color: #fffceb;
}

.credentials-wrapper {
  padding: 10px;
  height: auto;
  overflow-y: auto;
  font-size: 14px;

  .date-tp {
    margin-bottom: 10px;

    .header-tp {
      text-align: left;
    }
  }

  .footer-tp {
    text-align: center;
    margin-top: 10px;
  }

  .text-name {
    padding-bottom: 5px;
  }

  .bills-box-header {
    display: flex;
    justify-content: space-around;

    .filter {
      display: table;
      width: 280px;
      margin-bottom: 5px;

      .filter-label {
        display: table-cell;
        font-weight: normal;
        max-width: 160px;
        line-height: 32px;
        white-space: nowrap;
        vertical-align: bottom;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .filter-control {
        display: table-cell;
        width: 100%;
      }
    }
  }
}

.date-radio-box {
  border: 1px solid #ccc;
  padding: 8px;

  .ant-radio {
    margin-top: 20px;
  }

  span.ant-radio + * {
    padding: 0;
    padding-right: 4px;
  }
}

/deep/ .filter-label {
  width: 160px !important;
}
</style>