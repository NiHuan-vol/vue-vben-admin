<template>
  <ContentWrap class="activity-content-wrapper">
    <!-- 页面标题 -->
    <PageTitle title="活动邀约列表" sub-title="管理所有活动邀约信息" />

    <!-- 按钮区域 -->
    <div class="btn-wrapper flex justify-between items-center mb-4">
      <div class="flex space-x-2">
        <Button v-if="hasPermission('crm:activity:deleteInvite') && selectedRowKeys.length > 0" type="danger" icon="ep:delete" @click="handleDelete">
          删除
        </Button>
      </div>
      <div class="flex space-x-2">
        <Button type="default" icon="ep:search" @click="handleSearch">
          查询
        </Button>
        <Button type="default" icon="ep:refresh" @click="handleReset">
          重置
        </Button>
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
        <template #nameSearch>
          <Input v-model:value="searchParams.name" placeholder="请输入姓名" />
        </template>
        <template #phoneSearch>
          <Input v-model:value="searchParams.phone" placeholder="请输入手机" />
        </template>
        <template #crmNameSearch>
          <Input v-model:value="searchParams.crmName" placeholder="请输入公司名称" />
        </template>
        <template #activityNameSearch>
          <Input v-model:value="searchParams.activityName" placeholder="请输入市场活动名称" />
        </template>
        <template #shareUserNameSearch>
          <Input v-model:value="searchParams.shareUserName" placeholder="请输入邀约人" />
        </template>
      </BasicTable>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { usePermission } from '@/hooks/usePermission';
import { useTable } from '@/components/Table';
import { useExport } from '@/hooks/useExport';
import { getInviteList, deleteInvite } from '@/api/crm/activity';
import { PageTitle, ContentWrap, BasicTable, Button, Input } from '@/components';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();

// 搜索参数
const searchParams = reactive<Record<string, any>>({
  name: '',
  phone: '',
  crmName: '',
  activityName: '',
  shareUserName: '',
});

// 表格数据
const [registerTable, { reload, setProps }] = useTable({
  title: '活动邀约列表',
  api: getInviteList,
  params: searchParams,
  rowKey: 'id',
  columns: [
    { title: '姓名', key: 'name', width: 100 },
    { title: '手机', key: 'phone', width: 120 },
    { title: '邮箱', key: 'email', width: 150 },
    { title: '公司名称', key: 'crmName', width: 150 },
    { title: '邀约表单名称', key: 'formName', width: 150 },
    { title: '市场活动名称', key: 'activityName', width: 150 },
    { title: '地址', key: 'address', width: 200 },
    { title: '签到时间', key: 'signDate', width: 180 },
    { title: '邀约人', key: 'shareUserName', width: 100 },
    { title: '提交日期', key: 'createDate', width: 180 },
  ],
  pagination: true,
  showTableSetting: true,
  tableSetting: {
    columns: ['name', 'phone', 'email', 'crmName', 'formName', 'activityName', 'address', 'signDate', 'shareUserName', 'createDate'],
    canSetColumn: true,
    canSetFont: true,
    canSetRowHeight: true,
  },
  exportConfig: {
    name: '活动邀约数据',
    url: '/api/crm/activity/exportInvite',
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

// 表格设置
const tableSetting = ref({
  columns: ['name', 'phone', 'email', 'crmName', 'formName', 'activityName', 'address', 'signDate', 'shareUserName', 'createDate'],
  canSetColumn: true,
  canSetFont: true,
  canSetRowHeight: true,
});

// 导出配置
const exportConfig = ref({
  name: '活动邀约数据',
  url: '/api/crm/activity/exportInvite',
});

// 处理表格变化
const handleTableChange = (pagination: any) => {
  setProps({
    pagination,
  });
  reload();
};

// 处理选择变化
const handleSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedRowKeys.value = selectedRowKeys;
};

// 处理搜索
const handleSearch = () => {
  reload();
};

// 处理重置
const handleReset = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = '';
  });
  reload();
};

// 处理删除
const handleDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的记录');
    return;
  }

  try {
    await deleteInvite(selectedRowKeys.value);
    message.success('删除成功');
    reload();
    selectedRowKeys.value = [];
  } catch (error) {
    message.error('删除失败');
  }
};

// 初始化
onMounted(() => {
  reload();
});
</script>

<style scoped lang="scss">
// 自定义样式
.activity-content-wrapper {
  padding: 20px;
}

.btn-wrapper {
  margin-bottom: 20px;
}
</style>