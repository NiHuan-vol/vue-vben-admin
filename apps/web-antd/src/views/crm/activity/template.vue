<template>
  <ContentWrap class="template-content-wrapper">
    <!-- 页面标题 -->
    <PageTitle title="活动邀约模板管理" sub-title="管理活动邀约的模板" />

    <!-- 按钮区域 -->
    <div class="btn-wrapper flex justify-between items-center mb-4">
      <div class="flex space-x-2">
        <Button v-if="hasPermission('crm:activity:addTemplate')" type="primary" icon="ep:plus" @click="handleAdd">
          新增模板
        </Button>
        <Button v-if="hasPermission('crm:activity:editTemplate') && selectedRowKeys.length === 1" type="primary" icon="ep:edit" @click="handleEdit">
          编辑模板
        </Button>
        <Button v-if="hasPermission('crm:activity:deleteTemplate') && selectedRowKeys.length > 0" type="danger" icon="ep:delete" @click="handleDelete">
          删除
        </Button>
        <Button type="default" icon="ep:refresh" @click="handleRefresh">
          刷新
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
          <Input v-model:value="searchParams.name" placeholder="请输入模板名称" />
        </template>
        <template #activityNameSearch>
          <Input v-model:value="searchParams.activityName" placeholder="请输入活动名称" />
        </template>
        <template #createUserNameSearch>
          <Input v-model:value="searchParams.createUserName" placeholder="请输入创建人" />
        </template>
        <template #share="{ record }">
          <Button type="link" @click="handleShare(record.id)">分享</Button>
        </template>
      </BasicTable>
    </div>

    <!-- 模板编辑模态框 -->
    <TemplateModal
      v-model:visible="modalVisible"
      :template-id="selectedTemplateId"
      @success="handleSuccess"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { usePermission } from '@/hooks/usePermission';
import { useTable } from '@/components/Table';
import { useExport } from '@/hooks/useExport';
import { getTemplateList, deleteTemplate, getActivityList } from '@/api/crm/activity';
import { PageTitle, ContentWrap, BasicTable, Button, Input } from '@/components';
import TemplateModal from './components/edit/TemplateModal.vue';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();

// 搜索参数
const searchParams = reactive<Record<string, any>>({
  name: '',
  activityName: '',
  createUserName: '',
});

// 模态框可见性
const modalVisible = ref(false);
// 选中的模板ID
const selectedTemplateId = ref('');
// 选中的行
const selectedRowKeys = ref<string[]>([]);

// 活动列表
const activityList = ref<any[]>([]);

// 获取活动列表
const getActivityData = async () => {
  try {
    const res = await getActivityList();
    activityList.value = res.data;
  } catch (error) {
    message.error('获取活动列表失败');
  }
};

// 表格数据
const [registerTable, { reload, setProps }] = useTable({
  title: '活动邀约模板列表',
  api: getTemplateList,
  params: searchParams,
  rowKey: 'id',
  columns: [
    { title: '模板名称', key: 'name', width: 150 },
    { title: '活动名称', key: 'activityName', width: 150 },
    { title: '创建人', key: 'createUserName', width: 100 },
    { title: '创建时间', key: 'createDate', width: 180 },
    { title: '更新时间', key: 'updateDate', width: 180 },
    { title: '操作', key: 'actions', width: 100, slot: 'share' },
  ],
  pagination: true,
  showTableSetting: true,
  tableSetting: {
    columns: ['name', 'activityName', 'createUserName', 'createDate', 'updateDate', 'actions'],
    canSetColumn: true,
    canSetFont: true,
    canSetRowHeight: true,
  },
  exportConfig: {
    name: '活动邀约模板数据',
    url: '/api/crm/activity/exportTemplate',
  },
});

// 分页配置
const paginationConfig = computed(() => ({
  currentPage: 1,
  pageSize: 10,
  total: 0,
}));

// 表格设置
const tableSetting = ref({
  columns: ['name', 'activityName', 'createUserName', 'createDate', 'updateDate', 'actions'],
  canSetColumn: true,
  canSetFont: true,
  canSetRowHeight: true,
});

// 导出配置
const exportConfig = ref({
  name: '活动邀约模板数据',
  url: '/api/crm/activity/exportTemplate',
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
  if (selectedRowKeys.length === 1) {
    selectedTemplateId.value = selectedRows[0].id;
  } else {
    selectedTemplateId.value = '';
  }
};

// 处理新增
const handleAdd = () => {
  selectedTemplateId.value = '';
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = () => {
  if (selectedRowKeys.length !== 1) {
    message.warning('请选择一条记录进行编辑');
    return;
  }
  modalVisible.value = true;
};

// 处理删除
const handleDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的记录');
    return;
  }

  try {
    await deleteTemplate(selectedRowKeys.value);
    message.success('删除成功');
    reload();
    selectedRowKeys.value = [];
  } catch (error) {
    message.error('删除失败');
  }
};

// 处理刷新
const handleRefresh = () => {
  reload();
};

// 处理分享
const handleShare = (id: string) => {
  // 这里实现分享功能
  message.info('分享功能开发中');
};

// 处理成功回调
const handleSuccess = () => {
  modalVisible.value = false;
  reload();
};

// 初始化
onMounted(() => {
  reload();
  getActivityData();
});
</script>

<style scoped lang="scss">
// 自定义样式
.template-content-wrapper {
  padding: 20px;
}

.btn-wrapper {
  margin-bottom: 20px;
}
</style>