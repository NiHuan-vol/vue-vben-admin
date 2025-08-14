<template>
  <PageWrapper title="客户管理" :tabActiveKey="tabActiveKey" @tabChange="handleTabChange">
    <!-- 按钮区域 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <Button type="primary" @click="handleAdd" :disabled="!hasPermission('crm:customer:add')">
        <Icon icon="mdi:plus" class="mr-1" /> 新增
      </Button>
      <Button type="primary" @click="handleEdit" :disabled="!hasPermission('crm:customer:edit') || selectedRowKeys.length !== 1">
        <Icon icon="mdi:edit" class="mr-1" /> 编辑
      </Button>
      <Button type="danger" @click="handleDelete" :disabled="!hasPermission('crm:customer:delete') || selectedRowKeys.length === 0">
        <Icon icon="mdi:delete" class="mr-1" /> 删除
      </Button>
      <Button type="primary" @click="handleImport" :disabled="!hasPermission('crm:customer:import')">
        <Icon icon="mdi:import" class="mr-1" /> 导入
      </Button>
      <Button type="primary" @click="handleExport" :disabled="!hasPermission('crm:customer:export')">
        <Icon icon="mdi:export" class="mr-1" /> 导出
      </Button>
      <Button type="primary" @click="handleCollect" :disabled="selectedRowKeys.length !== 1">
        <Icon :icon="isCollected ? 'mdi:heart' : 'mdi:heart-outline'" :class="isCollected ? 'text-red-500' : ''" class="mr-1" />
        {{ isCollected ? '取消关注' : '关注客户' }}
      </Button>
      <Button type="primary" @click="handleReceive" :disabled="!hasPermission('crm:customer:receive') || selectedRowKeys.length !== 1">
        <Icon icon="mdi:tag" class="mr-1" /> 领用
      </Button>
      <Button type="primary" @click="handleDistribution" :disabled="!hasPermission('crm:customer:distribution') || selectedRowKeys.length !== 1">
        <Icon icon="mdi:share-all" class="mr-1" /> 分配
      </Button>
      <Button @click="showColumnSetting">
        <Icon icon="mdi:settings" class="mr-1" /> 自定义列
      </Button>
      <Button @click="syncSettings">
        <Icon icon="mdi:sync" class="mr-1" /> 同步设置
      </Button>
    </div>

    <!-- 查询方案 -->
    <div class="mb-4 bg-gray-50 p-3 rounded-md">
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex flex-wrap gap-2 border rounded-md p-2">
          <button
            class="px-3 py-1 rounded-md text-sm" :class="planActive === 0 ? 'bg-primary text-white' : 'bg-white text-gray-700'"
            @click="handlePlanChange(0)">
            所有
          </button>
          <template v-for="(item, index) in userSearchList" :key="index">
            <button
              class="px-3 py-1 rounded-md text-sm" :class="item.id === planActive ? 'bg-primary text-white' : 'bg-white text-gray-700'"
              :title="item.searchName"
              @click="handlePlanChange(item.id)">
              {{ item.searchName }}
            </button>
          </template>
          <button
            class="px-3 py-1 rounded-md text-sm bg-white text-gray-700 flex items-center"
            @click="showCustomSearch">
            自定查询 <Icon icon="mdi:search" class="ml-1" size="14" />
          </button>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <Button @click="toggleSearchForm" type="default" size="small">
            <Icon :icon="showSearchForm ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="mr-1" /> {{ showSearchForm ? '折叠' : '展开' }}
          </Button>
          <Button @click="handleSearch" type="primary" size="small" :loading="loading">查询</Button>
          <Button @click="handleReset" type="default" size="small" :loading="loading">重置</Button>
          <Button @click="saveSearchPlan" type="default" size="small">保存常用查询</Button>
        </div>
      </div>

      <!-- 搜索表单 -->
      <Collapse v-model:value="showSearchForm" class="mt-3">
        <CollapseItem title="高级搜索" name="searchForm">
          <BasicForm
            :model="searchForm"
            :schemas="searchFormSchemas"
            :labelWidth="100"
            class="mt-2"
          />
        </CollapseItem>
      </Collapse>
    </div>

    <!-- 数据表格 -->
    <BasicTable
      ref="tableRef"
      :columns="columns"
      :request="loadData"
      :rowKey="rowKey"
      :pagination="paginationConfig"
      :loading="loading"
      @register="registerTable"
      @row-selection-change="handleRowSelectionChange"
      @columns-change="handleColumnsChange"
    >
      <!-- 客户名称列插槽 -->
      <template #crmName="{ record }">
        <a @click="goToDetail(record)" class="text-primary hover:underline flex items-center">
          <Icon :icon="record.collectId > 0 ? 'mdi:heart' : 'mdi:flag-outline'" :class="record.collectId > 0 ? 'text-red-500 mr-1' : 'mr-1'" size="14" />
          {{ record.crmName }}
        </a>
      </template>

      <!-- 客户编号列插槽 -->
      <template #crmNo="{ record }">
        <a @click="goToDetail(record)" class="text-primary hover:underline">{{ record.crmNo }}</a>
      </template>

      <!-- 共享类型列插槽 -->
      <template #shareType="{ record }">
        <div v-if="record.shareType">
          <span v-if="userInfo.id === record.collarUserId">已共享给‘{{ record.shareUserName }}’</span>
          <span v-else>由‘{{ record.collarUserName }}’共享</span>
        </div>
      </template>
    </BasicTable>

    <!-- 自定义列抽屉 -->
    <ColumnSetting
      @register="registerColumnSetting"
      :columns="columns"
      :columnSettingMap="columnSettingMap"
      @confirm="handleColumnSettingConfirm"
    />

    <!-- 新增/编辑模态框 -->
    <CustomerModal
      ref="customerModalRef"
      @success="handleModalSuccess"
    />

    <!-- 导入模态框 -->
    <ImportModal
      ref="importModalRef"
      @success="handleImportSuccess"
    />

    <!-- 分配模态框 -->
    <DistributionModal
      ref="distributionModalRef"
      @success="handleDistributionSuccess"
    />
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { usePermission } from '/@/hooks/web/usePermission';
import { useMessage } from '/@/hooks/web/useMessage';
import { useTable } from '/@/components/Table';
import { useColumnSetting } from '/@/components/Table/src/hooks/useColumnSetting';
import { PageWrapper } from '/@/components/Page';
import { Button, Collapse, CollapseItem, Icon } from 'ant-design-vue';
import { BasicTable, BasicForm, ColumnSetting } from '/@/components/Table';
import { CustomerModal } from './components/edit/CustomerModal';
import { ImportModal } from '/@/components/Import';
import { DistributionModal } from './components/edit/DistributionModal';
import { getCustomerList, deleteCustomer, collectCustomer, receiveCustomer, distributeCustomer } from '/@/api/crm/customer';
import { exportToExcel } from '/@/utils/excel';
import { useUserStore } from '/@/store/modules/user';

export default {
  components: {
    PageWrapper,
    Button,
    Icon,
    BasicTable,
    BasicForm,
    Collapse,
    CollapseItem,
    ColumnSetting,
    CustomerModal,
    ImportModal,
    DistributionModal,
  },
};

// 表格注册
const [registerTable, { tableRef, reload, setProps }] = useTable();
const [registerColumnSetting] = useColumnSetting();

// 模态框引用
const customerModalRef = ref<InstanceType<typeof CustomerModal>>();
const importModalRef = ref<InstanceType<typeof ImportModal>>();
const distributionModalRef = ref<InstanceType<typeof DistributionModal>>();

// 响应式数据
const tabActiveKey = ref('list');
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const loading = ref(false);
const showSearchForm = ref(false);
const isCollected = ref(false);
const planActive = ref(0);
const userSearchList = ref<any[]>([]);
const columnSettingMap = ref<any>({});
const crmNameValue = ref('');

// 用户信息
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);

// 权限检查
const { hasPermission } = usePermission();
const message = useMessage();

// 搜索表单
const searchForm = reactive({
  crmName: '',
  crmNo: '',
  status: '',
  createTime: [],
  ownerId: '',
});

// 搜索表单结构
const searchFormSchemas = [
  {
    field: 'crmName',
    component: 'Input',
    label: '客户名称',
    componentProps: {
      placeholder: '请输入客户名称',
    },
  },
  {
    field: 'crmNo',
    component: 'Input',
    label: '客户编号',
    componentProps: {
      placeholder: '请输入客户编号',
    },
  },
  {
    field: 'status',
    component: 'Select',
    label: '客户状态',
    componentProps: {
      placeholder: '请选择客户状态',
      options: [
        { label: '正常', value: 'normal' },
        { label: '禁用', value: 'disabled' },
      ],
    },
  },
  {
    field: 'createTime',
    component: 'RangePicker',
    label: '创建时间',
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'ownerId',
    component: 'Select',
    label: '负责人',
    componentProps: {
      placeholder: '请选择负责人',
      // 这里应该是异步加载的用户列表
      options: [],
    },
  },
];

// 表格列定义
const columns = [
  {
    title: '客户名称',
    dataIndex: 'crmName',
    key: 'crmName',
    width: 180,
    slots: { customRender: 'crmName' },
    filterable: true,
    filteredValue: [crmNameValue.value],
  },
  {
    title: '客户编号',
    dataIndex: 'crmNo',
    key: 'crmNo',
    width: 120,
    slots: { customRender: 'crmNo' },
  },
  {
    title: '客户等级',
    dataIndex: 'level',
    key: 'level',
    width: 100,
  },
  {
    title: '负责人',
    dataIndex: 'ownerName',
    key: 'ownerName',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
  {
    title: '客户状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    customRender: ({ text }) => (
      <span class={text === 'normal' ? 'text-green-500' : 'text-red-500'}>
        {{ normal: '正常', disabled: '禁用' }[text]}
      </span>
    ),
  },
  {
    title: '共享类型',
    dataIndex: 'shareType',
    key: 'shareType',
    width: 160,
    slots: { customRender: 'shareType' },
  },
];

// 表格配置
const paginationConfig = {
  pageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条数据`,
};

const rowKey = 'id';

// 加载数据
const loadData = async (params: any) => {
  loading.value = true;
  try {
    const result = await getCustomerList({
      ...params,
      ...searchForm,
      page: params.current,
      pageSize: params.pageSize,
    });
    // 检查是否有选中的数据被关注
    if (selectedRowKeys.value.length > 0) {
      checkIfCollected();
    }
    return {
      items: result.list || [],
      total: result.total || 0,
    };
  } catch (error) {
    message.error('获取客户列表失败');
    return { items: [], total: 0 };
  } finally {
    loading.value = false;
  }
};

// 检查选中项是否被关注
const checkIfCollected = () => {
  if (selectedRows.value.length === 1) {
    isCollected.value = selectedRows.value[0].collectId > 0;
  } else {
    isCollected.value = false;
  }
};

// 处理行选择变化
const handleRowSelectionChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedRowKeys.value = selectedRowKeys;
  selectedRows.value = selectedRows;
  checkIfCollected();
};

// 处理标签页切换
const handleTabChange = (key: string) => {
  tabActiveKey.value = key;
  // 如果切换到关注标签，可能需要加载不同的数据
  if (key === 'collected') {
    // 这里可以实现加载关注客户的逻辑
  } else {
    reload();
  }
};

// 处理新增
const handleAdd = () => {
  customerModalRef.value?.open();
};

// 处理编辑
const handleEdit = () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一条数据进行编辑');
    return;
  }
  customerModalRef.value?.open({ id: selectedRowKeys.value[0] });
};

// 处理删除
const handleDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  try {
    await deleteCustomer({ ids: selectedRowKeys.value });
    message.success('删除成功');
    reload();
    selectedRowKeys.value = [];
  } catch (error) {
    message.error('删除失败');
  }
};

// 处理关注/取消关注
const handleCollect = async () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一个客户进行关注/取消关注');
    return;
  }

  const id = selectedRowKeys.value[0];
  try {
    await collectCustomer({ id, collect: !isCollected.value });
    message.success(isCollected.value ? '取消关注成功' : '关注成功');
    isCollected.value = !isCollected.value;
    reload();
  } catch (error) {
    message.error(isCollected.value ? '取消关注失败' : '关注失败');
  }
};

// 处理领用
const handleReceive = async () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一个客户进行领用');
    return;
  }

  const id = selectedRowKeys.value[0];
  try {
    await receiveCustomer({ id });
    message.success('领用成功');
    reload();
  } catch (error) {
    message.error('领用失败');
  }
};

// 处理分配
const handleDistribution = () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一个客户进行分配');
    return;
  }

  distributionModalRef.value?.open({ id: selectedRowKeys.value[0] });
};

// 处理导入
const handleImport = () => {
  importModalRef.value?.open();
};

// 处理导出
const handleExport = async () => {
  try {
    const result = await getCustomerList({
      ...searchForm,
      page: 1,
      pageSize: 10000, // 导出全部符合条件的数据
    });
    exportToExcel(result.list || [], '客户数据', columns);
    message.success('导出成功');
  } catch (error) {
    message.error('导出失败');
  }
};

// 处理查询
const handleSearch = () => {
  reload();
};

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key as keyof typeof searchForm] = '';
  });
  searchForm.createTime = [];
  reload();
};

// 切换搜索表单显示/隐藏
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

// 显示自定义列设置
const showColumnSetting = () => {
  // 触发 ColumnSetting 组件的显示
};

// 处理列设置确认
const handleColumnSettingConfirm = (columns: any[]) => {
  // 这里可以处理列设置变更后的逻辑
};

// 处理列变更
const handleColumnsChange = (columns: any[]) => {
  // 这里可以处理列顺序变更后的逻辑
};

// 同步设置
const syncSettings = () => {
  // 这里可以实现同步设置的逻辑
  message.success('同步设置成功');
};

// 处理查询方案变更
const handlePlanChange = (id: number) => {
  planActive.value = id;
  // 这里可以实现查询方案切换的逻辑
  if (id === 0) {
    // 加载所有数据
    handleReset();
  } else {
    // 加载指定查询方案的数据
    // 这里需要根据实际情况实现
  }
};

// 显示自定义查询
const showCustomSearch = () => {
  // 这里可以实现显示自定义查询的逻辑
};

// 保存查询方案
const saveSearchPlan = () => {
  // 这里可以实现保存查询方案的逻辑
};

// 前往详情页
const goToDetail = (record: any) => {
  // 这里可以实现前往详情页的逻辑
  // 例如: router.push(`/crm/customer/detail/${record.id}`);
};

// 处理模态框成功回调
const handleModalSuccess = () => {
  reload();
};

// 处理导入成功回调
const handleImportSuccess = () => {
  reload();
};

// 处理分配成功回调
const handleDistributionSuccess = () => {
  reload();
};

// 初始化
onMounted(() => {
  // 加载查询方案列表
  // 这里可以实现加载查询方案的逻辑
  userSearchList.value = [
    { id: 1, searchName: '最近新增' },
    { id: 2, searchName: '我的客户' },
  ];
});
</script>

<style scoped lang="scss">
// 自定义样式
.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-2 {
  padding: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.text-primary {
  color: #1677ff;
}

.text-red-500 {
  color: #ff4d4f;
}

.text-green-500 {
  color: #52c41a;
}

.text-gray-700 {
  color: #333;
}

.hover\:underline:hover {
  text-decoration: underline;
}

// 按钮样式覆盖
.ant-btn {
  margin-right: 8px;
}

// 表格样式
.ant-table {
  overflow: hidden;
}

// 自定义列按钮样式
.fieldSet {
  cursor: pointer;
  margin-left: 8px;
}
</style>