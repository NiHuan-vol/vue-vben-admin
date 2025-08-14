<template>
  <PageWrapper title="客户管理" content="客户信息管理页面">
    <!-- 顶部操作栏 -->
    <template #headerContent>
      <div class="flex flex-wrap gap-2">
        <Button
          type="primary"
          @click="handleAdd"
          :disabled="!hasPermission('crm:customer:add')"
        >
          <Icon icon="mdi:plus" class="mr-1" /> 新增
        </Button>
        <Button
          type="primary"
          @click="handleEdit"
          :disabled="!hasPermission('crm:customer:edit') || selectedRowKeys.length !== 1"
        >
          <Icon icon="mdi:edit" class="mr-1" /> 编辑
        </Button>
        <Button
          type="danger"
          @click="handleDelete"
          :disabled="!hasPermission('crm:customer:delete') || selectedRowKeys.length === 0"
        >
          <Icon icon="mdi:delete" class="mr-1" /> 删除
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          :disabled="!hasPermission('crm:customer:import')"
        >
          <Icon icon="mdi:import" class="mr-1" /> 导入
        </Button>
        <Button
          @click="downloadTemplate"
          :disabled="!hasPermission('crm:customer:import')"
        >
          <Icon icon="mdi:file-download" class="mr-1" /> 下载模板
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          :disabled="!hasPermission('crm:customer:export')"
        >
          <Icon icon="mdi:export" class="mr-1" /> 导出
        </Button>
        <Button
          type="primary"
          @click="handleCollect"
          :disabled="selectedRowKeys.length !== 1"
        >
          <Icon :icon="isCollected ? 'mdi:heart' : 'mdi:heart-outline'" :class="isCollected ? 'text-red-500' : ''" class="mr-1" />
          {{ isCollected ? '取消关注' : '关注客户' }}
        </Button>
        <Button
          type="primary"
          @click="handleReceive"
          :disabled="!hasPermission('crm:customer:receive') || selectedRowKeys.length !== 1"
        >
          <Icon icon="mdi:tag" class="mr-1" /> 领用
        </Button>
        <Button
          type="primary"
          @click="handleDistribution"
          :disabled="!hasPermission('crm:customer:distribution') || selectedRowKeys.length !== 1"
        >
          <Icon icon="mdi:share-all" class="mr-1" /> 分配
        </Button>
        <Dropdown
          v-if="selectedRowKeys.length > 0"
          :menuItems="batchMenuItems"
          trigger="click"
        >
          <Button type="default">
            <Icon icon="mdi:batch-operations" class="mr-1" /> 批量操作
            <Icon icon="mdi:chevron-down" class="ml-1" size="14" />
          </Button>
        </Dropdown>
        <Button @click="showTableSetting">
          <Icon icon="mdi:settings" class="mr-1" /> 列设置
        </Button>
      </div>
    </template>

    <!-- 搜索区域 -->
    <BasicForm
      :schema="searchFormSchema"
      :model="searchForm"
      @submit="handleSearch"
      @reset="handleReset"
      :labelWidth="100"
      class="mb-4"
    />

    <!-- 表格区域 -->
    <BasicTable
      @register="registerTable"
      :columns="columns"
      :requestFn="loadData"
      :rowKey="rowKey"
      :pagination="paginationConfig"
      :showTableSetting="true"
      :tableSetting="tableSetting"
      @tableSettingChange="handleTableSettingChange"
      @rowSelectionChange="handleRowSelectionChange"
    >
      <!-- 客户名称列 -->
      <template #bodyCell:name="{ record }">
        <a @click="goToDetail(record)" class="text-primary hover:underline flex items-center">
          <Icon
            :icon="record.collectId > 0 ? 'mdi:heart' : 'mdi:flag-outline'"
            :class="record.collectId > 0 ? 'text-red-500 mr-1' : 'mr-1'"
            size="14"
          />
          {{ record.crmName }}
        </a>
      </template>

      <!-- 客户编号列 -->
      <template #bodyCell:code="{ record }">
        <a @click="goToDetail(record)" class="text-primary hover:underline">{{ record.crmNo }}</a>
      </template>

      <!-- 客户状态列 -->
      <template #bodyCell:status="{ text }">
        <span :class="text === 'normal' ? 'text-green-500' : 'text-red-500'">
          {{ statusMap[text] }}
        </span>
      </template>

      <!-- 共享类型列 -->
      <template #bodyCell:shareType="{ record }">
        <div v-if="record.shareType">
          <span v-if="userInfo.id === record.collarUserId">已共享给‘{{ record.shareUserName }}’</span>
          <span v-else>由‘{{ record.collarUserName }}’共享</span>
        </div>
      </template>
    </BasicTable>

    <!-- 新增/编辑模态框 -->
    <CustomerModal ref="customerModalRef" @success="handleModalSuccess" />

    <!-- 导入模态框 -->
    <ImportModal ref="importModalRef" @success="handleImportSuccess" />

    <!-- 分配模态框 -->
    <DistributionModal ref="distributionModalRef" @success="handleDistributionSuccess" />
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePermission } from '@vben/hooks/web/usePermission';
import { useMessage } from '@vben/hooks/web/useMessage';
import { useTable } from '@vben/components/Table';
import { useExport } from '@vben/hooks/web/useExport';
import { PageWrapper, Button, Dropdown, Icon } from '@vben/components';
import { BasicTable, BasicForm, FormSchema } from '@vben/components/Table';
import { CustomerModal } from './components/edit/CustomerModal';
import { ImportModal } from '@vben/components/Import';
import { DistributionModal } from './components/edit/DistributionModal';
import { getCustomerList, deleteCustomer, collectCustomer, receiveCustomer, distributeCustomer, getUserList, importCustomer } from '#/api/crm/customer';
import { useUserStore } from '#/store/modules/user';
import { useAuthStore } from '#/store/auth';

// 表格注册
const [registerTable, { reload, setProps }] = useTable();
const { exportToExcel } = useExport();
const message = useMessage();
const router = useRouter();
const { hasPermission } = usePermission();

// 模态框引用
const customerModalRef = ref<InstanceType<typeof CustomerModal>>();
const importModalRef = ref<InstanceType<typeof ImportModal>>();
const distributionModalRef = ref<InstanceType<typeof DistributionModal>>();

// 响应式数据
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const isCollected = ref(false);
const searchForm = reactive<Recordable>({
  crmName: '',
  crmNo: '',
  status: '',
  createTime: [],
  ownerId: '',
});

// 用户信息
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo());

// 状态映射
const statusMap = {
  normal: '正常',
  disabled: '禁用',
};

// 批量操作菜单
const batchMenuItems = [
  {
    label: '批量删除',
    key: 'batchDelete',
    onClick: handleDelete,
  },
  {
    label: '批量关注',
    key: 'batchCollect',
    onClick: handleBatchCollect,
  },
];

// 用户列表
const userOptions = ref<any[]>([]);

// 加载用户列表
const loadUserList = async () => {
  try {
    const result = await getUserList();
    userOptions.value = result.list || [];
  } catch (error) {
    message.error('获取用户列表失败');
  }
};

// 搜索表单结构
const searchFormSchema: FormSchema[] = [
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
      options: userOptions.value,
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().includes(input.toLowerCase());
      },
    },
  },
];

// 表格列定义
const columns = [
  {
    title: '客户名称',
    dataIndex: 'crmName',
    key: 'name',
    width: 180,
    slots: { customRender: 'name' },
    filterable: true,
    filteredValue: [],
  },
  {
    title: '客户编号',
    dataIndex: 'crmNo',
    key: 'code',
    width: 120,
    slots: { customRender: 'code' },
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
    slots: { customRender: 'status' },
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

// 表格设置
const tableSetting = ref<Recordable>({
  columnOrder: [],
  columnShow: {},
});

// 加载数据
const loadData = async (params: any) => {
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

// 处理表格设置变更
const handleTableSettingChange = (setting: Recordable) => {
  tableSetting.value = setting;
};

// 显示表格设置
const showTableSetting = () => {
  // Vben-Admin的BasicTable已内置列设置功能
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

// 批量关注
const handleBatchCollect = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要关注的客户');
    return;
  }

  try {
    // 这里简化处理，实际项目中可能需要批量API
    for (const id of selectedRowKeys.value) {
      await collectCustomer({ id, collect: true });
    }
    message.success('批量关注成功');
    reload();
  } catch (error) {
    message.error('批量关注失败');
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
  importModalRef.value?.open({
    title: '导入客户数据',
    api: importCustomer,
    columns: [
      { label: '客户名称', key: 'crmName', required: true },
      { label: '客户编号', key: 'crmNo', required: true },
      { label: '客户等级', key: 'level' },
      { label: '负责人ID', key: 'ownerId' },
      { label: '联系电话', key: 'phone' },
      { label: '电子邮箱', key: 'email' },
    ],
    beforeUpload: (file: File) => {
      // 校验文件类型和大小
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isExcel) {
        message.error('只能上传Excel文件');
        return false;
      }
      if (!isLt2M) {
        message.error('文件大小不能超过2MB');
        return false;
      }
      return true;
    },
  });
};

// 处理导入成功回调
const handleImportSuccess = () => {
  message.success('导入成功');
  reload();
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

// 下载导入模板
const downloadTemplate = () => {
  // 模拟模板数据
  const templateData = [
    {
      crmName: '客户名称示例',
      crmNo: 'KH20230001',
      level: 'VIP',
      ownerId: '10001',
      phone: '13800138000',
      email: 'example@test.com',
    },
  ];

  // 定义模板列
  const templateColumns = [
    { title: '客户名称', dataIndex: 'crmName' },
    { title: '客户编号', dataIndex: 'crmNo' },
    { title: '客户等级', dataIndex: 'level' },
    { title: '负责人ID', dataIndex: 'ownerId' },
    { title: '联系电话', dataIndex: 'phone' },
    { title: '电子邮箱', dataIndex: 'email' },
  ];

  // 导出模板
  exportToExcel(templateData, '客户导入模板', templateColumns);
  message.success('模板下载成功');
};

// 处理查询
const handleSearch = () => {
  reload();
};

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = '';
  });
  searchForm.createTime = [];
  reload();
};

// 前往详情页
const goToDetail = (record: any) => {
  router.push(`/crm/customer/detail/${record.id}`);
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
  // 加载用户列表
  loadUserList();
});
</script>

<style scoped lang="scss">
// 使用Vben-Admin的SCSS变量
@import '@vben/styles/mixins/index.scss';

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

.text-primary {
  color: $primary-color;
}

.text-red-500 {
  color: $error-color;
}

.text-green-500 {
  color: $success-color;
}

.hover\:underline:hover {
  text-decoration: underline;
}

// 按钮间距
.ant-btn {
  margin-right: 8px;
}
</style>