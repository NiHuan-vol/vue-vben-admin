<template>
  <ContentWrap class="activity-content-wrapper">
    <!-- 页面标题 -->
    <PageTitle title="市场活动管理" sub-title="管理所有市场活动信息" />

    <!-- 按钮区域 -->
    <div class="btn-wrapper flex justify-between items-center mb-4">
      <div class="flex space-x-2">
        <Button v-if="hasPermission('crm:activity:add')" type="primary" icon="ep:plus" @click="handleAdd">
          新增
        </Button>
        <Button v-if="hasPermission('crm:activity:edit') && selectedRowKeys.length === 1" type="primary" icon="ep:edit" @click="handleEdit">
          编辑
        </Button>
        <Button v-if="hasPermission('crm:activity:delete') && selectedRowKeys.length > 0" type="danger" icon="ep:delete" @click="handleDelete">
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

    <!-- 搜索区域 -->
    <CollapseContainer title="搜索条件" :isExpand="true">
      <BasicForm @register="registerForm" :labelWidth="100">
        <template #activityTitle>
          <Input v-model:value="searchParams.activityTitle" placeholder="请输入市场活动名称" />
        </template>
        <template #activityType>
          <Select v-model:value="searchParams.activityType" placeholder="请选择类型">
            <Option v-for="item in activityTypeList" :key="item.key" :value="item.key">
              {{ item.title }}
            </Option>
          </Select>
        </template>
        <template #activityState>
          <Select v-model:value="searchParams.activityState" placeholder="请选择状态">
            <Option v-for="item in activityStateList" :key="item.key" :value="item.key">
              {{ item.title }}
            </Option>
          </Select>
        </template>
        <template #activityOwnerName>
          <Input v-model:value="searchParams.activityOwnerName" placeholder="请输入负责人" />
        </template>
      </BasicForm>
    </CollapseContainer>

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
        <template #activityTitle="{ record }">
          <a @click="handleViewDetail(record)" class="text-primary hover:underline">
            {{ record.activityTitle }}
          </a>
        </template>
        <template #activityTime="{ record }">
          {{ record.startTime }} ~ {{ record.endTime }}
        </template>
      </BasicTable>
    </div>

    <!-- 新增/编辑模态框 -->
    <ActivityModal
      v-model:visible="modalVisible"
      :activityId="currentActivityId"
      @success="handleModalSuccess"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useModal } from '@/components/Modal';
import { usePermission } from '@/hooks/usePermission';
import { useForm } from '@/components/Form';
import { useTable } from '@/components/Table';
import { useExport } from '@/hooks/useExport';
import { useCrmActivityStore } from '@/store/crm/activity';
import { getActivityList, deleteActivity } from '@/api/crm/activity';
import ActivityModal from './components/edit/ActivityModal.vue';
import { PageTitle, ContentWrap, CollapseContainer, BasicForm, BasicTable, Button, Input, Select, Option } from '@/components';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();
// 模态框
const { createModal } = useModal();
// 状态管理
const activityStore = useCrmActivityStore();

// 搜索参数
const searchParams = reactive<Record<string, any>>({
  activityTitle: '',
  activityType: '',
  activityState: '',
  activityOwnerName: '',
});

// 表格数据
const [registerTable, { reload, setProps }] = useTable({
  title: '市场活动列表',
  api: getActivityList,
  params: searchParams,
  rowKey: 'id',
  columns: [
    { title: '市场活动名称', key: 'activityTitle', width: 180, slot: 'activityTitle' },
    { title: '类型', key: 'activityType', width: 100 },
    { title: '状态', key: 'activityState', width: 100 },
    { title: '负责人', key: 'activityOwnerName', width: 100 },
    { title: '活动时间', key: 'activityTime', width: 200, slot: 'activityTime' },
    { title: '创建人', key: 'createUserName', width: 100 },
    { title: '创建时间', key: 'createDate', width: 180 },
    { title: '修改人', key: 'updateUserName', width: 100 },
    { title: '修改时间', key: 'updateDate', width: 180 },
  ],
  pagination: true,
  showTableSetting: true,
  tableSetting: {
    columns: ['activityTitle', 'activityType', 'activityState', 'activityOwnerName', 'activityTime', 'createUserName', 'createDate', 'updateUserName', 'updateDate'],
    canSetColumn: true,
    canSetFont: true,
    canSetRowHeight: true,
  },
  exportConfig: {
    name: '市场活动数据',
    url: '/api/crm/activity/export',
  },
});

// 搜索表单
const [registerForm] = useForm({
  labelWidth: 100,
  schemas: [
    { field: 'activityTitle', label: '市场活动名称', component: 'Input' },
    { field: 'activityType', label: '类型', component: 'Select' },
    { field: 'activityState', label: '状态', component: 'Select' },
    { field: 'activityOwnerName', label: '负责人', component: 'Input' },
  ],
  initialValues: searchParams,
});

// 分页配置
const paginationConfig = computed(() => ({
  currentPage: 1,
  pageSize: 10,
  total: 0,
}));

// 选中的行
const selectedRowKeys = ref<string[]>([]);
const currentActivityId = ref<string>('');
const modalVisible = ref<boolean>(false);

// 活动类型列表
const activityTypeList = ref<any[]>([
  { key: 'meeting', title: '会议' },
  { key: 'webinar', title: '网络研讨会' },
  { key: 'trade', title: '交易会' },
  { key: 'media', title: '公开媒介' },
  { key: 'partner', title: '合作伙伴' },
  { key: 'recommendation', title: '推举程序' },
  { key: 'advertisement', title: '广告' },
  { key: 'banner', title: '条幅广告' },
  { key: 'directMail', title: '直接邮件' },
  { key: 'email', title: '电子邮件' },
  { key: 'electronicMarket', title: '电子市场' },
  { key: 'other', title: '其它' },
]);

// 活动状态列表
const activityStateList = ref<any[]>([
  { key: 'planning', title: '计划中' },
  { key: 'active', title: '激活的' },
  { key: 'inactive', title: '非活跃' },
  { key: 'completed', title: '完成' },
]);

// 表格设置
const tableSetting = ref({
  columns: ['activityTitle', 'activityType', 'activityState', 'activityOwnerName', 'activityTime', 'createUserName', 'createDate', 'updateUserName', 'updateDate'],
  canSetColumn: true,
  canSetFont: true,
  canSetRowHeight: true,
});

// 导出配置
const exportConfig = ref({
  name: '市场活动数据',
  url: '/api/crm/activity/export',
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

// 处理搜索
function handleSearch() {
  reload();
}

// 处理重置
function handleReset() {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = '';
  });
  reload();
}

// 处理新增
function handleAdd() {
  currentActivityId.value = '';
  modalVisible.value = true;
}

// 处理编辑
function handleEdit() {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一条数据进行编辑');
    return;
  }
  currentActivityId.value = selectedRowKeys.value[0];
  modalVisible.value = true;
}

// 处理删除
function handleDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择至少一条数据进行删除');
    return;
  }

  createModal({
    title: '确认删除',
    content: '确定要删除选中的市场活动吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteActivity({ ids: selectedRowKeys.value });
        message.success('删除成功');
        reload();
        selectedRowKeys.value = [];
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
}

// 处理查看详情
function handleViewDetail(record: any) {
  currentActivityId.value = record.id;
  modalVisible.value = true;
}

// 处理模态框成功回调
function handleModalSuccess() {
  modalVisible.value = false;
  reload();
}

// 初始化
onMounted(() => {
  reload();
});
</script>

<style scoped lang="scss">
.activity-content-wrapper {
  .btn-wrapper {
    padding: 10px 0;
  }
}
</style>