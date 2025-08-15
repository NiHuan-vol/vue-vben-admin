<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <BtnsWrapper
          @searchClick="searchClick"
          :showModel="showModel"
          :orderId="orderId"
          :voucherState="voucherState"
          :editMask="editMask"
          :createUserId="createUserId"
          @printOrder="printOrder"
          :hasExport="true"
          @exportDetail="exportDetail"
        >
          <template slot="refresh">
            <a-button class="btns" @click="getList" icon={<RefreshOutlined />}>刷新</a-button>
          </template>
        </BtnsWrapper>
      </div>
      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">库存报表</h3>
        <div>
          <span class="audit-status" v-show="voucherState===0">待审核</span>
          <span class="audit-status" v-show="voucherState===1">已审核</span>
        </div>
        <div class="table-box">
          <BasicTable
            :columns="columns"
            :dataSource="dataSource"
            :pagination="pagination"
            :scroll="{ x: 1000, y: 347 }"
            @change="onTableChange"
            :size="'small'"
            bordered
          />
        </div>
      </div>
    </div>
    <!-- 加载中 -->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    ></PrintModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { BasicTable } from '/@/components/Table';
import { BtnsWrapper } from '/@/components/BtnsWrapper';
import { RefreshOutlined } from '@ant-design/icons-vue';
import { defHttp } from '/@/utils/http/axios';
import { getInventoryInfoPageList, exportInventoryReport } from '/@/api/inventory/bills';
import { useMessage } from '/@/hooks/web/useMessage';
import { PrintModal } from '/@/components/PrintModal';
import { BaseResp } from '@/api/model/baseModel';

// 基础数据
const showModel = ref<'list'>('list');
const orderId = ref<string>('');
const voucherState = ref<number>(-1);
const editMask = ref<boolean>(true);
const createUserId = ref<string>('');
const loading = ref<boolean>(false);
const printVisible = ref<boolean>(false);
const incomingPrintData = ref<any>({});
const btn_grid = ref<{
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}>({
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
  xl: 4,
});

// 表格数据
const dataSource = ref<any[]>([]);
const columns = ref<any[]>([
  { title: '物料名称', dataIndex: 'inventoryName', width: 150 },
  { title: '物料编码', dataIndex: 'inventoryCode', width: 120 },
  { title: '仓库名称', dataIndex: 'warehouseName', width: 120 },
  { title: '现存量', dataIndex: 'inventoryQuantity', width: 100 },
]);

// 分页数据
const pagination = reactive<{
  current: number;
  pageSize: number;
  total: number;
  showTotal: (total: number) => React.ReactNode;
  onChange: (page: number, pageSize: number) => void;
}>({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条数据`,
  onChange: (page) => {
    pagination.current = page;
    getList();
  },
});

const { createMessage } = useMessage();

// 生命周期
onMounted(() => {
  getList();
});

// 获取列表数据
function getList() {
  loading.value = true;
  const params = {
    current: pagination.current,
    size: pagination.pageSize,
    // 添加搜索参数
    ...searchParams
  };

  getInventoryInfoPageList(params, 'message').then((response) => {
    loading.value = false;
    if (response.code === 200) {
      dataSource.value = response.data.records || [];
      pagination.total = response.data.total || 0;
    }
  }).catch(() => {
    loading.value = false;
  });
}

// 打印订单
function printOrder() {
  printVisible.value = true;
  incomingPrintData.value = {
    title: '库存报表',
    dataSource: dataSource.value,
    columns: columns.value,
  };
}

// 取消打印
function cancelPrint() {
  printVisible.value = false;
}

// 搜索参数
const searchParams = reactive<{ warehouseId?: string; materialId?: string }>({});

// 搜索
function searchClick(params: any) {
  // 处理搜索参数
  Object.assign(searchParams, params);
  // 重置分页
  pagination.current = 1;
  // 重新获取数据
  getList();
}

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// 导出
function exportDetail() {
  loading.value = true;
  const params = {
    // 可以根据需要添加参数，如仓库ID
    // warehouseId: warehouseId.value,
  };

  exportInventoryReport(params, 'message').then((response) => {
    loading.value = false;
    if (response) {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `库存报表_${formatDate(new Date())}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      createMessage.success('导出成功');
    }
  }).catch(() => {
    loading.value = false;
  });
}
</script>

<style lang="less">
@import "~@/style/purchase/voucher.less";

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 10px;
  border-radius: 4px;
  font-size: 12px;
}

.audit-status[v-show="voucherState===0"] {
  background-color: #faad14;
  color: #fff;
}

.audit-status[v-show="voucherState===1"] {
  background-color: #52c41a;
  color: #fff;
}
</style>