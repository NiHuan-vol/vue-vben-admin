<!--
 * @Descripttion: 个人中心 - 我的笔记
 * @version: V1.0
 * @Author: System
 * @Date: 2023-01-01 00:00:00
-->
<template>
  <div class="personal-my-note-container">
    <Card :title="'我的笔记'" class="mb-4">
      <!-- 操作按钮 -->
      <template #extra>
        <div class="flex space-x-2">
          <a-button type="primary" @click="handleAddItem">
            <Icon icon="ic:outline-plus" class="mr-2" /> 新增
          </a-button>
          <a-button danger :disabled="selectedIds.length === 0" @click="handleDeleteNote">
            <Icon icon="ic:outline-delete" class="mr-2" /> 删除
          </a-button>
        </div>
      </template>

      <!-- 表格 -->
      <BasicTable
        @register="registerTable"
        bordered
        rowKey="id"
        :row-selection="{ selectedRowKeys: selectedKeys, onChange: handleSelectionChange }"
      >
        <template #title="{ record }">
          <a @click="handleEditItem(record)">{{ record.title }}</a>
        </template>
        <template #content="{ record }">
          <div class="content-container" v-html="record.content"></div>
        </template>
      </BasicTable>
    </Card>

    <!-- 编辑弹窗 -->
    <Modal
      v-model:visible="editModalVisible"
      :title="editItem.id ? '编辑笔记' : '新增笔记'"
      centered
      width="960px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <ProForm
        :model="editItem"
        :schema="formSchema"
        :labelCol="{ span: 4 }"
        :wrapperCol="{ span: 18 }"
      >
        <template #content>
          <div ref="editorRef" class="editor-container"></div>
        </template>
      </ProForm>
    </Modal>

    <!-- 加载中 -->
    <Loading v-if="loading" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, getCurrentInstance, nextTick } from 'vue';
import { Card, Modal, message, Button } from 'ant-design-vue';
import { BasicTable, useTable, TableAction } from '@/components/Table';
import { ProForm, ProFormText } from '@/components/ProForm';
import { Icon } from '/@/components/Icon';
import { useI18n } from 'vue-i18n';
import { useModal } from '/@/components/Modal';
import { Loading } from '/@/components/Loading';
import { pageList, save, deleteNote } from '@/api/personal/userNote';
import { usePermission } from '/@/hooks/web/usePermission';
import { createEditor } from '@/utils/wangEditer';

const { t } = useI18n();
const { hasPermission } = usePermission();
const instance = getCurrentInstance();

// 状态管理
const loading = ref<boolean>(false);
const editModalVisible = ref<boolean>(false);
const selectedKeys = ref<string[]>([]);
const selectedIds = ref<string[]>([]);
const selectedData = ref<any[]>([]);
const editorContent = ref<string>('');
const editorRef = ref<HTMLElement | null>(null);
let editorInstance: any = null;

// 数据管理
const editItem = ref<{ id?: string; title: string; content: string; type: number }>({
  title: '',
  content: '',
  type: 2,
});
const noteData = ref<any[]>([]);
const total = ref<number>(0);
const postData = ref<{ current: number; size: number; type: number }>({
  current: 1,
  size: 20,
  type: 2,
});

// 表格列配置
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 300,
    slot: 'title',
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 400,
    slot: 'content',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 150,
  },
];

// 表单schema
const formSchema = [
  {
    field: 'title',
    component: 'Input',
    label: '标题',
    required: true,
    componentProps: {
      placeholder: '请输入标题',
    },
  },
  {
    field: 'content',
    label: '内容',
    required: true,
    slot: 'content',
  },
];

// 注册表格
const { registerTable, tableContext } = useTable({
  columns,
  dataSource: noteData,
  bordered: true,
  pagination: {
    pageSize: 20,
    showTotal: (total) => `共 ${total} 条数据`,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (current, pageSize) => {
      postData.value.current = current;
      postData.value.size = pageSize;
      handlePageList();
    },
  },
  onLoad: handlePageList,
});

// 获取笔记列表
const handlePageList = async () => {
  loading.value = true;
  try {
    const response = await pageList(postData.value);
    if (response.code === 200) {
      const { records, total: totalCount } = response.data;
      noteData.value = records;
      total.value = totalCount;
    }
  } catch (error) {
    message.error('获取笔记列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理表格选择变化
const handleSelectionChange = (keys: string[], info: any[]) => {
  selectedKeys.value = keys;
  selectedIds.value = info.map((item) => item.id);
  selectedData.value = info;
};

// 新增笔记
const handleAddItem = () => {
  editItem.value = { title: '', content: '', type: 2 };
  editModalVisible.value = true;
  // 初始化富文本编辑器
  initEditor('');
};

// 编辑笔记
const handleEditItem = (record: any) => {
  editItem.value = { ...record };
  editModalVisible.value = true;
  // 初始化富文本编辑器并设置内容
  initEditor(record.content);
};

// 初始化富文本编辑器
const initEditor = (content: string) => {
  nextTick(() => {
    if (!editorRef.value) return;
    // 销毁旧编辑器
    if (editorInstance) {
      editorInstance.destroy();
    }
    // 创建新编辑器
    editorInstance = createEditor(editorRef.value, (html: string) => {
      editorContent.value = html;
    });
    // 设置内容
    editorInstance.txt.html(content);
    editorContent.value = content;
  });
};

// 删除笔记
const handleDeleteNote = () => {
  if (selectedIds.value.length === 0) {
    message.warning('请选择要删除的笔记');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: '您确定要删除选中的笔记吗？',
    onOk: async () => {
      loading.value = true;
      try {
        const response = await deleteNote(selectedIds.value);
        if (response.code === 200) {
          message.success('删除成功');
          handlePageList();
          selectedKeys.value = [];
          selectedIds.value = [];
          selectedData.value = [];
        } else {
          message.error(response.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
      } finally {
        loading.value = false;
      }
    },
  });
};

// 提交表单
const handleSubmit = async () => {
  // 更新富文本内容
  if (editorInstance) {
    editorContent.value = editorInstance.txt.html();
  }

  // 验证表单
  if (!editItem.value.title.trim()) {
    message.warning('请输入标题');
    return;
  }
  if (!editorContent.value.trim()) {
    message.warning('请输入内容');
    return;
  }

  loading.value = true;
  try {
    const data = {
      ...editItem.value,
      content: editorContent.value,
      createDate: null,
    };

    const response = await save(data);
    if (response.code === 200) {
      message.success('保存成功');
      handlePageList();
      editModalVisible.value = false;
    } else {
      message.error(response.message || '保存失败');
    }
  } catch (error) {
    message.error('保存失败');
  }
  finally {
    loading.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  editModalVisible.value = false;
  // 销毁编辑器
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
};

// 初始化
onMounted(() => {
  handlePageList();
});
</script>

<style lang="less" scoped>
.personal-my-note-container {
  padding: 16px;

  .mb-4 {
    margin-bottom: 16px;
  }

  .flex {
    display: flex;
  }

  .space-x-2 > * {
    margin-right: 8px;
  }

  .content-container {
    width: 100%;
    height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .editor-container {
    width: 100%;
    height: 400px;
    border: 1px solid #f0f0f0;
  }

  /deep/ .w-e-text-container {
    height: 400px !important;
  }

  /deep/ .w-e-menu {
    padding: 5px 9px;
  }
}
</style>