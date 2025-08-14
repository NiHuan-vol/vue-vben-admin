<template>
  <PageWrapper title="收货人管理" contentClass="p-4">
    <!-- 按钮区域 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <Button type="primary" @click="handleAdd" :disabled="!hasPermission('crm:consignee:add')">
        <Icon icon="mdi:plus" class="mr-1" /> 新增
      </Button>
      <Button type="primary" @click="handleEdit" :disabled="!hasPermission('crm:consignee:edit') || selectedRowKeys.length !== 1">
        <Icon icon="mdi:edit" class="mr-1" /> 编辑
      </Button>
      <Button type="danger" @click="handleDelete" :disabled="!hasPermission('crm:consignee:delete') || selectedRowKeys.length === 0">
        <Icon icon="mdi:delete" class="mr-1" /> 删除
      </Button>
      <Button @click="handleSearch" type="default">
        <Icon icon="mdi:search" class="mr-1" /> 查询
      </Button>
      <Button @click="handleReset" type="default">
        <Icon icon="mdi:undo" class="mr-1" /> 重置
      </Button>
      <Button @click="toggleSearchForm" type="default" class="ml-auto">
        <Icon :icon="showSearchForm ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="mr-1" /> {{ showSearchForm ? '折叠' : '展开' }}
      </Button>
    </div>

    <!-- 搜索表单 -->
    <Collapse v-model:value="showSearchForm" class="mb-4 bg-gray-50 p-3 rounded-md">
      <CollapseItem title="高级搜索" name="searchForm">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <FormItem label="客户名称" name="crmName">
            <Input v-model:value="searchForm.crmName" placeholder="请输入客户名称" />
          </FormItem>
          <FormItem label="收货人" name="consignee">
            <Input v-model:value="searchForm.consignee" placeholder="请输入收货人" />
          </FormItem>
          <FormItem label="联系电话" name="phone">
            <Input v-model:value="searchForm.phone" placeholder="请输入联系电话" />
          </FormItem>
          <FormItem label="手机号码" name="mobile">
            <Input v-model:value="searchForm.mobile" placeholder="请输入手机号码" />
          </FormItem>
          <FormItem label="收货地址" name="consigneeAddress">
            <Input v-model:value="searchForm.consigneeAddress" placeholder="请输入收货地址" />
          </FormItem>
        </div>
      </CollapseItem>
    </Collapse>

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
    >
      <!-- 客户名称列插槽 -->
      <template #crmName="{ record }">
        <a @click="goToDetail(record)" class="text-primary hover:underline">{{ record.crmName }}</a>
      </template>

      <!-- 收货人列插槽 -->
      <template #consignee="{ record }">
        <a @click="handleEditItem(record)" class="text-primary hover:underline">{{ record.consignee }}</a>
      </template>
    </BasicTable>

    <!-- 新增/编辑模态框 -->
    <ConsigneeModal
      ref="consigneeModalRef"
      @success="handleModalSuccess"
    />
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { usePermission } from '/@/hooks/web/usePermission';
import { useMessage } from '/@/hooks/web/useMessage';
import { useTable } from '/@/components/Table';
import { PageWrapper } from '/@/components/Page';
import { Button, Collapse, CollapseItem, Form, FormItem, Icon, Input } from 'ant-design-vue';
import { BasicTable } from '/@/components/Table';
import { ConsigneeModal } from './components/edit/ConsigneeModal';
import { getConsigneeList, deleteConsignee } from '/@/api/crm/consignee';
import { useRouter } from 'vue-router';

// 表格注册
const [registerTable, { tableRef, reload }] = useTable();

// 模态框引用
const consigneeModalRef = ref<InstanceType<typeof ConsigneeModal>>();

// 响应式数据
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const loading = ref(false);
const showSearchForm = ref(false);
const searchForm = reactive({
  crmName: '',
  consignee: '',
  phone: '',
  mobile: '',
  consigneeAddress: '',
});

// 路由
const router = useRouter();

// 权限检查
const { hasPermission } = usePermission();
const message = useMessage();

// 表格列定义
const columns = [
  {
    title: '收货人',
    dataIndex: 'consignee',
    key: 'consignee',
    width: 120,
    slots: { customRender: 'consignee' },
  },
  {
    title: '客户名称',
    dataIndex: 'crmName',
    key: 'crmName',
    width: 120,
    slots: { customRender: 'crmName' },
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
  },
  {
    title: '手机号码',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 120,
  },
  {
    title: '收货地址',
    dataIndex: 'consigneeAddress',
    key: 'consigneeAddress',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    key: 'remarks',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
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
    const result = await getConsigneeList({
      ...params,
      ...searchForm,
      page: params.current,
      pageSize: params.pageSize,
    });
    return {
      items: result.list || [],
      total: result.total || 0,
    };
  } catch (error) {
    message.error('获取收货人列表失败');
    return { items: [], total: 0 };
  } finally {
    loading.value = false;
  }
};

// 处理行选择变化
const handleRowSelectionChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedRowKeys.value = selectedRowKeys;
  selectedRows.value = selectedRows;
};

// 处理新增
const handleAdd = () => {
  consigneeModalRef.value?.open();
};

// 处理编辑
const handleEdit = () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一条数据进行编辑');
    return;
  }
  consigneeModalRef.value?.open({ id: selectedRowKeys.value[0] });
};

// 处理表格行内编辑
const handleEditItem = (record: any) => {
  consigneeModalRef.value?.open({ id: record.id });
};

// 处理删除
const handleDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  try {
    await deleteConsignee({ ids: selectedRowKeys.value });
    message.success('删除成功');
    reload();
    selectedRowKeys.value = [];
  } catch (error) {
    message.error('删除失败');
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
  reload();
};

// 切换搜索表单显示/隐藏
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value;
};

// 前往详情页
const goToDetail = (record: any) => {
  // 这里可以实现前往客户详情页的逻辑
  // router.push(`/crm/customer/detail/${record.customerId}`);
};

// 处理模态框成功回调
const handleModalSuccess = () => {
  reload();
};

// 初始化
onMounted(() => {
  // 可以在这里加载初始数据或执行其他初始化操作
});
</script>

<style scoped lang="scss">
// 自定义样式
.p-4 {
  padding: 16px;
}

.p-3 {
  padding: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 8px;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lg\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.ml-auto {
  margin-left: auto;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.rounded-md {
  border-radius: 4px;
}

.text-primary {
  color: #1677ff;
}

.hover\:underline:hover {
  text-decoration: underline;
}
</style>