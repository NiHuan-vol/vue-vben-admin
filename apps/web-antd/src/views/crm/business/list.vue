<template>
  <ContentWrap class="business-content-wrapper">
    <!-- 页面标题 -->
    <PageTitle title="商机管理" sub-title="管理所有商机信息" />

    <!-- 按钮区域 -->
    <div class="btn-wrapper flex justify-between items-center mb-4">
      <div class="flex space-x-2">
        <Button v-if="hasPermission('crm:business:add')" type="primary" icon="ep:plus" @click="handleAdd">
          新增
        </Button>
        <Button v-if="hasPermission('crm:business:edit') && selectedRowKeys.length === 1" type="primary" icon="ep:edit" @click="handleEdit">
          编辑
        </Button>
        <Button v-if="hasPermission('crm:business:delete') && selectedRowKeys.length > 0" type="danger" icon="ep:delete" @click="handleDelete">
          删除
        </Button>
      </div>
      <div class="flex space-x-2">
        <Button type="default" icon="ep:setting" @click="showCustomColumns">
          自定义列
        </Button>
        <Button type="default" icon="ep:sync" @click="syncSettings">
          同步设置
        </Button>
      </div>
    </div>

    <!-- 查询方案 -->
    <div class="search-plan mb-4" v-if="!customerId">
      <div class="plan-list flex items-center">
        <div class="plan-item" :class="activePlanId === 0 ? 'active' : ''" @click="handlePlanChange(0)">
          所有
        </div>
        <div class="plan-item" v-for="item in searchPlans" :key="item.id" :class="activePlanId === item.id ? 'active' : ''" @click="handlePlanChange(item.id)">
          {{ item.name }}
        </div>
        <div class="plan-item custom-plan" @click="showAdvancedSearch">
          自定义查询 <Icon icon="ep:search" class="ml-1" />
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="mt-4">
      <BasicTable
        @register="registerTable"
        :columns="columns"
        :pagination="paginationConfig"
        @change="handleTableChange"
        :row-selection="{ selectedRowKeys, onChange: handleSelectChange }"
        :showTableSetting="true"
        :tableSetting="tableSetting"
        :exportConfig="exportConfig"
      >
        <template #crmName="{ record }">
          <a @click="handleViewDetail(record)" class="text-primary hover:underline">
            {{ record.crmName }}
          </a>
        </template>
        <template #businessTitle="{ record }">
          <a @click="handleEditDetail(record.id)" class="text-primary hover:underline">
            {{ record.businessTitle }}
          </a>
        </template>
        <template #saleStage="{ record }">
          <Tooltip :title="renderSaleStageTooltip(record)">)
            <span>{{ record.saleStage }}</span>
          </Tooltip>
        </template>
        <template #goingStatus="{ record }">
          <Tooltip :title="record.goingStatus === '输单' ? `输单原因: ${record.loseReason}` : ''">
            <span :class="getStatusClass(record.goingStatus)">{{ record.goingStatus }}</span>
          </Tooltip>
        </template>
        <template #activityName="{ record }">
          <a v-if="record.activityId" @click="gotoActivity(record.activityId)" class="text-primary hover:underline">
            {{ record.activityName }}
          </a>
          <span v-else>-</span>
        </template>
      </BasicTable>
    </div>

    <!-- 自定义列抽屉 -->
    <Drawer v-model:visible="customColumnsVisible" title="自定义列" width="520px">
      <CheckboxGroup v-model:value="checkedColumns" :options="columnOptions" />
      <div class="flex justify-end mt-4 space-x-2">
        <Button @click="customColumnsVisible = false">取消</Button>
        <Button type="primary" @click="saveCustomColumns">确定</Button>
      </div>
    </Drawer>

    <!-- 新增/编辑模态框 -->
    <BusinessModal
      v-model:visible="modalVisible"
      :businessId="currentBusinessId"
      :customerId="customerId"
      @success="handleModalSuccess"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useModal, useDrawer } from '@/components/Modal';
import { usePermission } from '@/hooks/usePermission';
import { useForm } from '@/components/Form';
import { useTable } from '@/components/Table';
import { useExport } from '@/hooks/useExport';
import { useCrmBusinessStore } from '@/store/crm/business';
import { getBusinessList, deleteBusiness } from '@/api/crm/business';
import BusinessModal from './components/edit/BusinessModal.vue';
import { PageTitle, ContentWrap, BasicTable, Button, CheckboxGroup, Tooltip, Drawer, Icon } from '@/components';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();
// 状态管理
const businessStore = useCrmBusinessStore();

// props
const props = defineProps({
  customerId: {
    type: String,
    default: '',
  },
});

// 搜索参数
const searchParams = reactive<Record<string, any>>({});

// 表格数据
const [registerTable, { reload, setProps }] = useTable({
  title: '商机列表',
  api: getBusinessList,
  params: searchParams,
  rowKey: 'id',
  columns: [
    { title: '客户名称', key: 'crmName', width: 180, slot: 'crmName' },
    { title: '项目编号', key: 'projectNo', width: 120 },
    { title: '商机名称', key: 'businessTitle', width: 200, slot: 'businessTitle' },
    { title: '销售阶段', key: 'saleStage', width: 120, slot: 'saleStage' },
    { title: '状态', key: 'goingStatus', width: 100, slot: 'goingStatus' },
    { title: '负责人', key: 'ownerName', width: 100 },
    { title: '预计成交日期', key: 'expectedDate', width: 120 },
    { title: '预计金额(元)', key: 'expectedAmount', width: 120 },
    { title: '市场活动', key: 'activityName', width: 180, slot: 'activityName' },
    { title: '创建时间', key: 'createDate', width: 180 },
  ],
  pagination: true,
  showTableSetting: true,
  tableSetting: {
    canSetColumn: true,
    canSetFont: true,
    canSetRowHeight: true,
  },
  exportConfig: {
    name: '商机数据',
    url: '/api/crm/business/export',
  },
});

// 分页配置
const paginationConfig = computed(() => ({
  currentPage: 1,
  pageSize: 10,
  total: 0,
}));

// 选中的行
const selectedRowKeys = ref<string[]>([]);
const currentBusinessId = ref<string>('');
const modalVisible = ref<boolean>(false);

// 自定义列相关
const customColumnsVisible = ref<boolean>(false);
const columnOptions = ref([
  { label: '客户名称', value: 'crmName' },
  { label: '项目编号', value: 'projectNo' },
  { label: '商机名称', value: 'businessTitle' },
  { label: '销售阶段', value: 'saleStage' },
  { label: '状态', value: 'goingStatus' },
  { label: '负责人', value: 'ownerName' },
  { label: '预计成交日期', value: 'expectedDate' },
  { label: '预计金额(元)', value: 'expectedAmount' },
  { label: '市场活动', value: 'activityName' },
  { label: '创建时间', value: 'createDate' },
]);
const checkedColumns = ref<string[]>([
  'crmName', 'projectNo', 'businessTitle', 'saleStage', 'goingStatus',
  'ownerName', 'expectedDate', 'expectedAmount', 'activityName', 'createDate'
]);

// 搜索方案
const searchPlans = ref<any[]>([]);
const activePlanId = ref<number>(0);

// 表格设置
const tableSetting = ref({
  canSetColumn: true,
  canSetFont: true,
  canSetRowHeight: true,
});

// 导出配置
const exportConfig = ref({
  name: '商机数据',
  url: '/api/crm/business/export',
});

// 处理表格选择变化
function handleSelectChange(keys: string[]) {
  selectedRowKeys.value = keys;
}

// 处理表格分页变化
function handleTableChange(pagination: any) {
  setProps({
    pagination,
  });
}

// 处理新增
function handleAdd() {
  currentBusinessId.value = '';
  modalVisible.value = true;
}

// 处理编辑
function handleEdit() {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一条数据进行编辑');
    return;
  }
  currentBusinessId.value = selectedRowKeys.value[0];
  modalVisible.value = true;
}

// 处理编辑详情
function handleEditDetail(id: string) {
  currentBusinessId.value = id;
  modalVisible.value = true;
}

// 处理查看详情
function handleViewDetail(record: any) {
  // 跳转到客户详情
  // router.push(`/crm/customer/detail/${record.crmId}`);
  message.info('跳转到客户详情');
}

// 处理删除
function handleDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择至少一条数据进行删除');
    return;
  }

  const { createModal } = useModal();
  createModal({
    title: '确认删除',
    content: '确定要删除选中的商机吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteBusiness({ ids: selectedRowKeys.value });
        message.success('删除成功');
        reload();
        selectedRowKeys.value = [];
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
}

// 处理模态框成功回调
function handleModalSuccess() {
  modalVisible.value = false;
  reload();
}

// 显示自定义列抽屉
function showCustomColumns() {
  customColumnsVisible.value = true;
}

// 保存自定义列设置
function saveCustomColumns() {
  // 更新表格列显示
  const newColumns = columnOptions.value
    .filter(item => checkedColumns.value.includes(item.value))
    .map(item => {
      const originalColumn = registerTable.value.columns.find(col => col.key === item.value);
      return originalColumn || { title: item.label, key: item.value };
    });

  setProps({
    columns: newColumns,
  });

  customColumnsVisible.value = false;
  message.success('自定义列设置已保存');
}

// 同步设置
function syncSettings() {
  // 模拟同步设置操作
  message.info('同步设置成功');
}

// 处理查询方案切换
function handlePlanChange(id: number) {
  activePlanId.value = id;
  // 加载对应方案的查询参数
  if (id === 0) {
    // 重置查询参数
    Object.keys(searchParams).forEach(key => {
      searchParams[key] = '';
    });
  } else {
    // 加载预设方案的参数
    const plan = searchPlans.value.find(p => p.id === id);
    if (plan) {
      Object.assign(searchParams, plan.params);
    }
  }
  reload();
}

// 显示高级搜索
function showAdvancedSearch() {
  // 打开高级搜索模态框
  const { createModal } = useModal();
  createModal({
    title: '高级搜索',
    // 高级搜索组件内容
    content: <div>高级搜索内容</div>,
    positiveText: '搜索',
    negativeText: '取消',
    onPositiveClick: () => {
      reload();
    },
  });
}

// 渲染销售阶段tooltip
function renderSaleStageTooltip(record: any) {
  return (
    <div>
      <div class="font-bold mb-2">客户名称：{record.crmName}</div>
      <div class="mb-2">状态：{record.goingStatus}</div>
      {/* 销售阶段步骤条可以在这里实现 */}
    </div>
  );
}

// 获取状态样式
function getStatusClass(status: string) {
  switch (status) {
    case '赢单':
      return 'text-success';
    case '输单':
      return 'text-danger';
    case '进行中':
      return 'text-primary';
    default:
      return '';
  }
}

// 跳转到市场活动
function gotoActivity(activityId: string) {
  // router.push(`/crm/activity/detail/${activityId}`);
  message.info('跳转到市场活动详情');
}

// 初始化
onMounted(() => {
  // 加载搜索方案
  // loadSearchPlans();
  reload();
});
</script>

<style scoped lang="scss">
.business-content-wrapper {
  .btn-wrapper {
    padding: 10px 0;
  }

  .search-plan {
    .plan-list {
      flex-wrap: wrap;
      gap: 8px;

      .plan-item {
        padding: 6px 12px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;

        &.active {
          background-color: #1890ff;
          color: white;
        }

        &:hover:not(.active) {
          background-color: #f0f0f0;
        }

        &.custom-plan {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .text-success {
    color: #52c41a;
  }

  .text-danger {
    color: #ff4d4f;
  }

  .text-primary {
    color: #1890ff;
  }
}
</style>