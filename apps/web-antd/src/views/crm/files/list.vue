<template>
  <PageWrapper title="{{ t('menu.crm.files.list') }}" content="文件管理">
    <a-card :bordered="false">
      <!-- 工具栏 -->
      <template #extra>
        <a-button type="primary" v-if="hasPermission('crm:files:add')" @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" /> {{ t('common.add') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:clue:files:add') && crmType === 0" type="primary" @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" /> {{ t('common.add') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:potential:files:add') && crmType === 1" type="primary" @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" /> {{ t('common.add') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:deals:files:add') && crmType === 2" type="primary" @click="handleAdd">
          <Icon icon="ant-design:plus-outlined" /> {{ t('common.add') }}
        </a-button>

        <a-button v-if="hasPermission('crm:files:edit') && selectedRowKeys.length === 1" @click="handleEdit">
          {{ t('common.edit') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:clue:files:edit') && crmType === 0 && selectedRowKeys.length === 1" @click="handleEdit">
          {{ t('common.edit') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:potential:files:edit') && crmType === 1 && selectedRowKeys.length === 1" @click="handleEdit">
          {{ t('common.edit') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:deals:files:edit') && crmType === 2 && selectedRowKeys.length === 1" @click="handleEdit">
          {{ t('common.edit') }}
        </a-button>

        <a-button v-if="hasPermission('crm:files:disable') && selectedRowKeys.length > 0" @click="handleDisable" danger>
          {{ t('common.disable') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:clue:files:disable') && crmType === 0 && selectedRowKeys.length > 0" @click="handleDisable" danger>
          {{ t('common.disable') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:potential:files:disable') && crmType === 1 && selectedRowKeys.length > 0" @click="handleDisable" danger>
          {{ t('common.disable') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:deals:files:disable') && crmType === 2 && selectedRowKeys.length > 0" @click="handleDisable" danger>
          {{ t('common.disable') }}
        </a-button>

        <a-button v-if="hasPermission('crm:files:enable') && selectedRowKeys.length > 0" @click="handleEnable" type="dashed">
          {{ t('common.enable') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:clue:files:enable') && crmType === 0 && selectedRowKeys.length > 0" @click="handleEnable" type="dashed">
          {{ t('common.enable') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:potential:files:enable') && crmType === 1 && selectedRowKeys.length > 0" @click="handleEnable" type="dashed">
          {{ t('common.enable') }}
        </a-button>
        <a-button v-else-if="hasPermission('crm:deals:files:enable') && crmType === 2 && selectedRowKeys.length > 0" @click="handleEnable" type="dashed">
          {{ t('common.enable') }}
        </a-button>
      </template>

      <!-- 表格 -->
      <BasicTable
        :columns="columns"
        :request="getTableList"
        :rowSelection="{ type: 'checkbox', onChange: handleSelectionChange }"
        :pagination="paginationConfig"
        :loading="loading"
      >
        <template #action="{ record }">
          <Space>
            <a-button @click="handleDownload(record)">下载文档</a-button>
          </Space>
        </template>
      </BasicTable>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <FileModal
      v-model:visible="modalVisible"
      :fileItem="fileItem"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </PageWrapper>
</template>

<script lang="tsx" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { PageWrapper } from '/@/components/Page';
import { Button, Space, Message } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import { usePermission } from '/@/hooks/web/usePermission';
import { useI18n } from '/@/hooks/web/useI18n';
import { getFileList, saveFile, disableFile, enableFile } from '/@/api/crm/files';
import FileModal from './components/FileModal.vue';

const { t } = useI18n();
const { hasPermission } = usePermission();

// 表格数据
const columns = [
  { title: '文档名称', dataIndex: 'fileName', width: 150 },
  { title: '文档类型', dataIndex: 'filesType', width: 100 },
  { title: '上传人', dataIndex: 'createBy', width: 100 },
  { title: '上传时间', dataIndex: 'createTime', width: 180 },
  { title: '文档描述', dataIndex: 'remarks', width: 120 },
  { title: '操作', width: 120, slots: { customRender: 'action' } },
];

// 表格配置
const paginationConfig = {
  pageSize: 20,
  showTotal: (total: number) => t('common.total', { total }),
  showQuickJumper: true,
};

const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const modalVisible = ref(false);
const fileItem = ref<any>({});
const crmType = ref<number>(0); // 假设从路由参数或其他地方获取
const crmId = ref<string>(''); // 假设从路由参数或其他地方获取

// 处理表格数据请求
const getTableList = async (params) => {
  loading.value = true;
  try {
    const { current, pageSize, ...restParams } = params;
    const result = await getFileList({
      current,
      size: pageSize,
      crmId: crmId.value,
      ...restParams,
    });
    return {
      items: result.data?.records || [],
      total: result.data?.total || 0,
    };
  } finally {
    loading.value = false;
  }
};

// 处理选择变化
const handleSelectionChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

// 处理添加
const handleAdd = () => {
  fileItem.value = { crmId: crmId.value };
  modalVisible.value = true;
};

// 处理编辑
const handleEdit = () => {
  if (selectedRowKeys.value.length !== 1) {
    Message.warning(t('common.selectOne'));
    return;
  }
  fileItem.value = { ...selectedRows.value[0] };
  modalVisible.value = true;
};

// 处理下载
const handleDownload = (record: any) => {
  // 实现下载逻辑
  window.open(record.filePath, '_blank');
};

// 处理禁用
const handleDisable = async () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning(t('common.selectAtLeastOne'));
    return;
  }
  try {
    const result = await disableFile({ ids: selectedRowKeys.value });
    if (result.code === 200) {
      Message.success(t('common.disableSuccess'));
      // 刷新表格
      getTableList({ current: 1, pageSize: 20 });
    }
  } catch (error) {
    Message.error(t('common.disableFailed'));
  }
};

// 处理启用
const handleEnable = async () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning(t('common.selectAtLeastOne'));
    return;
  }
  try {
    const result = await enableFile({ ids: selectedRowKeys.value });
    if (result.code === 200) {
      Message.success(t('common.enableSuccess'));
      // 刷新表格
      getTableList({ current: 1, pageSize: 20 });
    }
  } catch (error) {
    Message.error(t('common.enableFailed'));
  }
};

// 处理提交
const handleSubmit = async (data) => {
  try {
    const result = await saveFile(data);
    if (result.code === 200) {
      Message.success(t('common.saveSuccess'));
      modalVisible.value = false;
      // 刷新表格
      getTableList({ current: 1, pageSize: 20 });
    }
  } catch (error) {
    Message.error(t('common.saveFailed'));
  }
};

// 处理取消
const handleCancel = () => {
  modalVisible.value = false;
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
  // 例如从路由参数获取crmId和crmType
});
</script>