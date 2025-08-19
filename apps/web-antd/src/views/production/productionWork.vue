<template>
  <div class="production-work-container">
    <!-- 顶部按钮区域 -->
    <div class="button-group">
      <a-button type="primary" @click="handleAdd">新增</a-button>
      <a-button @click="handleSave" :loading="isSaveRun">保存</a-button>
      <a-button @click="handleSubmitOrder(0)" v-if="voucherState === -1">提交</a-button>
      <a-button @click="handleSubmitOrder(-1)" v-if="voucherState === 0">撤回提交</a-button>
      <a-button @click="handleAuditClick(1)" v-if="voucherState === 0">审核</a-button>
      <a-button @click="handleAuditClick(0)" v-if="voucherState === 1">弃审</a-button>
      <a-button danger @click="handleRemove">删除</a-button>
      <a-button @click="handlePrint">打印</a-button>
      <a-button @click="choiceBillsFromProductionOrder">选计划订单</a-button>
    </div>

    <!-- 视图切换标签 -->
    <a-tabs v-model:activeKey="currentView" @change="handleViewChange">
      <a-tab-pane key="list" tab="列表视图" />
      <a-tab-pane key="order" tab="订单视图" />
      <a-tab-pane key="detail" tab="明细视图" />
      <a-tab-pane key="statistics" tab="统计视图" />
    </a-tabs>

    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="单据编号">
          <a-input v-model:value="searchForm.voucherCode" placeholder="请输入单据编号" />
        </a-form-item>
        <a-form-item label="单据状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择单据状态">
            <a-select-option value="-1">未提交</a-select-option>
            <a-select-option value="0">已提交</a-select-option>
            <a-select-option value="1">已审核</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="resetSearch">重置</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 主表格 -->
    <a-table
      :columns="columns"
      :dataSource="dataSource"
      :pagination="pagination"
      rowKey="id"
      :rowClassName="rowClassNameWork"
      @change="handleTableChange"
      @row-click="handleRowClick"
      @contextmenu="handleContextMenu"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'action'">
          <a-button size="small" @click="handleEdit(record)">编辑</a-button>
          <a-button size="small" danger @click="handleDelete(record)">删除</a-button>
        </template>
      </template>
    </a-table>

    <!-- 物料明细和工序明细标签页 -->
    <a-tabs v-model:activeKey="currentTab" @change="handleTabChange" v-if="currentView === 'detail'">
      <a-tab-pane key="bom" tab="物料明细" />
      <a-tab-pane key="route" tab="工序明细" />
    </a-tabs>

    <!-- 物料明细表格 -->
    <a-table
      v-if="currentTab === 'bom'"
      :columns="columnsBom"
      :dataSource="dataSourceBom"
      :pagination="false"
      rowKey="index"
      :rowClassName="rowClassNameBom"
      @cell-click="handleCellClickBom"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'inventoryCode'">
          <a-input
            v-model:value="record.inventoryCode"
            @change="onCellChangeMinBom(index, 'inventoryCode', $event)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'plannedQuantity'">
          <a-input-number
            v-model:value="record.plannedQuantity"
            :min="0"
            @change="onCellChangeMinBom(index, 'plannedQuantity', $event)"
          />
        </template>
        <!-- 其他可编辑列... -->
      </template>
    </a-table>

    <!-- 工序明细表格 -->
    <a-table
      v-if="currentTab === 'route'"
      :columns="columnsRoute"
      :dataSource="dataSourceRoute"
      :pagination="false"
      rowKey="index"
      @cell-click="handleCellClickRoute"
    >
      <!-- 工序表格内容... -->
    </a-table>

    <!-- 右键菜单 -->
    <div
      v-if="visibleDetails"
      class="context-menu"
      :style="{ top: topDetails + 'px', left: leftDetails + 'px' }"
    >
      <a-menu @click="handleMenuClick">
        <a-menu-item key="add">新增</a-menu-item>
        <a-menu-item key="delete">删除</a-menu-item>
      </a-menu>
    </div>

    <!-- 抽屉组件 -->
    <a-drawer
      title="加工单详情"
      :visible="drawerVisible"
      @close="handleDrawerClose"
      :width="800"
    >
      <!-- 抽屉内容... -->
    </a-drawer>

    <!-- 加载中状态 -->
    <a-spin :spinning="loading" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onActivated, watch } from 'vue';
import { message, Modal, Drawer, Spin } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  save, submitOrder, examine, remove, getCode,
  getClDetails, detailsRoute, getBomDetails
} from '@/api/production/work';
import { columns, columnsBom, columnsRoute } from './components/columns';
import { PaginationConfig } from 'ant-design-vue/lib/pagination';
import { ProductionWork, ProductionWorkDetail } from '@/types/production/work';

// 路由和状态管理
const router = useRouter();
const store = useStore();

// 基础状态
const loading = ref(false);
const isSaveRun = ref(false);
const orderId = ref('');
const voucherState = ref(-1);
const receiptNumber = ref('');
const currentView = ref('list');
const currentTab = ref('bom');
const drawerVisible = ref(false);
const visibleDetails = ref(false);
const topDetails = ref(0);
const leftDetails = ref(0);
const thisClickIdDetails = ref(0);
const dataSourceNumberOther = ref(0);
const classWorkCurrent = ref(0);
const currentBomId = ref('');
const currentRouteId = ref('');
const sourceVoucherData = ref<Record<string, any>>({});

// 数据源
const dataSource = ref<ProductionWork[]>([]);
const dataSourceBom = ref<ProductionWorkDetail[]>([]);
const dataSourceRoute = ref<ProductionWorkDetail[]>([]);
const orderHeaderData = ref<Record<string, any>[]>([]);

// 搜索表单
const searchForm = reactive<Record<string, any>>({
  voucherCode: '',
  status: '',
  startTime: '',
  endTime: ''
});

// 分页配置
const pagination = reactive<PaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 生命周期钩子
onMounted(() => {
  initData();
});

onActivated(() => {
  initData();
});

// 初始化数据
const initData = async () => {
  loading.value = true;
  try {
    // 获取列表数据
    // 这里应该调用API获取数据
    dataSource.value = []; // 临时设置为空
    pagination.total = 0;
  } catch (error) {
    message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (pagination: PaginationConfig) => {
  Object.assign(pagination, pagination);
  initData();
};

// 视图切换
const handleViewChange = (key: string) => {
  currentView.value = key;
  if (key === 'detail' && dataSource.value.length > 0) {
    showBomDetails(dataSource.value[0]);
  }
};

// 标签页切换
const handleTabChange = (key: string) => {
  currentTab.value = key;
  if (key === 'route' && dataSource.value.length > 0) {
    showDetailsRoute(dataSource.value[0]);
  }
};

// 行点击事件
const handleRowClick = (record: ProductionWork) => {
  orderId.value = record.id;
  voucherState.value = record.status;
  // 加载详情数据
  loadDetails(record);
};

// 加载详情
const loadDetails = async (record: ProductionWork) => {
  loading.value = true;
  try {
    // 获取加工单物料明细
    await getClDetails({ productionWorkMainId: record.id });
    // 获取工艺明细
    showDetailsRoute(record);
  } catch (error) {
    message.error('加载详情失败');
  }
};

// 展示物料明细
const showBomDetails = (record: ProductionWork) => {
  currentBomId.value = record.bomId;
  if (record.productionWorkInventoryDetailList && record.productionWorkInventoryDetailList.length > 0) {
    dataSourceBom.value = record.productionWorkInventoryDetailList;
  } else {
    dataSourceBom.value = [];
  }
  supplementTable();
};

// 展示工艺明细
const showDetailsRoute = (record: ProductionWork) => {
  currentRouteId.value = record.processRouteId;
  if (record.productionWorkProcedureDetailList && record.productionWorkProcedureDetailList.length > 0) {
    dataSourceRoute.value = record.productionWorkProcedureDetailList;
  } else {
    dataSourceRoute.value = [];
  }
};

// 补足表格
const supplementTable = () => {
  const currentLength = dataSourceBom.value.length;
  if (currentLength < 5) {
    for (let i = currentLength; i < 5; i++) {
      dataSourceBom.value.push({
        number: i,
        baseRequireQuantity: 1,
        lossQuantity: 0,
        lossRate: 0
      });
    }
  }
  dataSourceNumberOther.value = 5;
};

// 保存
const handleSave = async () => {
  if (isSaveRun.value) return;
  isSaveRun.value = true;
  loading.value = true;

  try {
    const requestData = prepareSaveData();
    const response = await save(requestData);
    if (response.code === 200) {
      message.success('保存成功');
      if (!orderId.value) {
        getIdByData();
      }
    } else {
      message.error(response.message);
    }
  } catch (error) {
    message.error('保存失败');
  } finally {
    loading.value = false;
    isSaveRun.value = false;
  }
};

// 准备保存数据
const prepareSaveData = (): any => {
  // 准备保存的数据结构
  return {
    id: orderId.value,
    voucherCode: receiptNumber.value,
    orderDetailList: dataSource.value.map(item => ({
      ...item,
      productionWorkInventoryDetailList: item.productionWorkInventoryDetailList?.filter(s => s.inventoryId)
    }))
  };
};

// 获取最新数据
const getIdByData = async () => {
  // 实现获取最新数据的逻辑
};

// 单据提交
const handleSubmitOrder = async (type: number) => {
  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }
  if (voucherState.value === -1 && type === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  try {
    const response = await submitOrder({
      id: orderId.value,
      status: type
    });
    if (response.code === 200) {
      message.success(type === 0 ? '提交成功' : '撤回提交成功');
      getIdByData();
    }
  } catch (error) {
    message.error('操作失败');
  }
};

// 审核
const handleAuditClick = async (type: number) => {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    const response = await examine({
      id: orderId.value,
      status: type
    });
    if (response.code === 200) {
      message.success(type === 1 ? '审核成功' : '弃审成功');
      getIdByData();
    }
  } catch (error) {
    message.error('操作失败');
  }
};

// 删除
const handleRemove = async () => {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: '您确定要删除该加工单吗？',
    onOk: async () => {
      try {
        const response = await remove({ id: orderId.value });
        if (response.code === 200) {
          message.success('删除成功');
          orderId.value = '';
          voucherState.value = 0;
          initData();
        }
      } catch (error) {
        message.error('删除失败');
      }
    }
  });
};

// 获取单据编号
const getCode = async () => {
  try {
    const response = await getCode();
    if (response.code === 200) {
      receiptNumber.value = response.message;
    }
  } catch (error) {
    message.warning('获取单据编号失败');
  }
};

// 物料明细单元格变化
const onCellChangeMinBom = (index: number, dataIndex: string, value: any) => {
  const target = dataSourceBom.value[index];
  if (!target) return;

  if (dataIndex === 'plannedQuantity') {
    target.plannedQuantity = value;
    if (target.requireQuantity != null) {
      target.lossQuantity = (Number(target.plannedQuantity) - Number(target.requireQuantity)).toFixed(4);
    }
    if (target.lossQuantity != null && target.requireQuantity != null) {
      const losstate = (Number(target.lossQuantity) / Number(target.requireQuantity)) * 100;
      target.lossRate = losstate.toFixed(4);
    }
  } else if (dataIndex === 'lossRate') {
    target.lossRate = value;
    if (target.requireQuantity != null) {
      target.lossQuantity = ((Number(target.requireQuantity) * Number(target.lossRate)) / 100).toFixed(4);
    }
    if (target.requireQuantity != null && target.lossQuantity != null) {
      target.plannedQuantity = (Number(target.requireQuantity) + Number(target.lossQuantity)).toFixed(4);
    }
  }
  // 其他数据索引的处理...
};

// 右键菜单相关
const handleContextMenu = (e: MouseEvent, record: any, index: number) => {
  e.preventDefault();
  thisClickIdDetails.value = index;
  topDetails.value = e.pageY - 40;
  leftDetails.value = e.pageX - 250;
  visibleDetails.value = true;
};

const handleMenuClick = (e: any) => {
  if (e.key === 'add') {
    handleAddDetails();
  } else if (e.key === 'delete') {
    handleDeleteDetails();
  }
  visibleDetails.value = false;
};

const handleAddDetails = () => {
  const newData = {
    number: dataSourceBom.value.length
  };
  dataSourceBom.value.push(newData);
};

const handleDeleteDetails = () => {
  Modal.confirm({
    title: '确认',
    content: '您确定要删除该记录吗？',
    onOk: () => {
      const index = thisClickIdDetails.value;
      if (dataSourceBom.value.length - 1 > dataSourceNumberOther.value) {
        dataSourceBom.value.splice(index, 1);
      } else {
        // 清空该行数据
        const item = dataSourceBom.value[index];
        for (const key in item) {
          if (key !== 'number') {
            item[key] = null;
          }
        }
      }
    }
  });
};

// 选计划订单
const choiceBillsFromProductionOrder = () => {
  // 实现选计划订单的逻辑
};

// 其他辅助方法...
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';

.production-work-container {
  padding: 16px;
}

.button-group {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.search-form {
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.context-menu {
  position: absolute;
  z-index: 100;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.hoverWorkStyle {
  background-color: rgba(24, 144, 255, 0.2);
  td {
    color: #222;
  }
}

.wuliao-mask {
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  height: calc(100% - 20px);
  width: calc(100% - 20px);
  background: rgba(0, 0, 0, 0);
}
</style>