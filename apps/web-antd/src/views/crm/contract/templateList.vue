<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="hasPermission('crm:contract:template:add')">
              <div class="btns" @click="addTemplate">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('crm:contract:template:edit')">
              <div class="btns" @click="editTemplate">
                <Icon class="btns-icon" icon="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('crm:contract:template:delete')">
              <div class="btns" @click="deleteTemplate">
                <Icon class="btns-icon" icon="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 模板列表 -->
      <BasicTable
        ref="tableRef"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        @select="handleSelect"
      />    
    </div>

    <!-- 模板编辑模态框 -->
    <BasicModal
      v-model:visible="editModalVisible"
      title="{{ isUpdate ? '编辑模板' : '新增模板' }}"
      :width="950"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <BasicForm
        ref="formRef"
        :model="formData"
        :schemas="schemas"
        :labelWidth="100"
        :showActionButtonGroup="false"
      />
    </BasicModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { BasicTable, TableColumn, TablePagination } from '/@/components/Table';
import { BasicModal, BasicForm } from '/@/components/Modal';
import { FormSchema } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
import { Editor } from '/@/components/Editor';
import { usePermission } from '/@/hooks/web/usePermission';
import { getTemplateList, getTemplateDetail, saveTemplate, deleteTemplate } from '/@/api/crm/template';

// 表格引用
const tableRef = ref<InstanceType<typeof BasicTable>>();
// 表单引用
const formRef = ref<InstanceType<typeof BasicForm>>();

// 响应式数据
const loading = ref(false);
const dataSource = ref<any[]>([]);
const selectedRowKeys = ref<string[]>([]);
const editModalVisible = ref(false);
const isUpdate = ref(false);

// 分页数据
const pagination = reactive<TablePagination>({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 表单数据
const formData = reactive<Record<string, any>>({
  id: '',
  name: '',
  content: '',
});

// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();

// 表格列定义
const columns: TableColumn[] = [
  {
    title: '模板名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (_: any, record: any) => (
      <div class="action-buttons">
        <a-button
          type="primary"
          size="small"
          v-if="hasPermission('crm:contract:template:edit')"
          @click={() => editTemplate(record.id)}
        >
          编辑
        </a-button>
        <a-button
          type="danger"
          size="small"
          v-if="hasPermission('crm:contract:template:delete')"
          style={{ marginLeft: '8px' }}
          @click={() => deleteTemplate(record.id)}
        >
          删除
        </a-button>
      </div>
    ),
  },
];

// 表单结构
const schemas: FormSchema[] = [
  {
    field: 'name',
    component: 'Input',
    label: '模板名称',
    required: true,
    componentProps: {
      placeholder: '请输入模板名称',
      maxlength: 100,
    },
  },
  {
    field: 'content',
    component: 'Editor',
    label: '模板内容',
    required: true,
    componentProps: {
      placeholder: '请输入模板内容',
    },
  },
];

// 加载模板列表
const loadTemplateList = async () => {
  loading.value = true;
  try {
    const result = await getTemplateList({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    dataSource.value = result.list || [];
    pagination.total = result.total || 0;
  } catch (error) {
    message.error('获取模板列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = (pagination: TablePagination) => {
  Object.assign(pagination, pagination);
  loadTemplateList();
};

// 处理选择
const handleSelect = (selectedKeys: string[], selectedRows: any[]) => {
  selectedRowKeys.value = selectedKeys;
};

// 新增模板
const addTemplate = () => {
  isUpdate.value = false;
  resetForm();
  editModalVisible.value = true;
};

// 编辑模板
const editTemplate = (id?: string) => {
  if (!id && selectedRowKeys.value.length === 0) {
    message.warning('请选择一条记录进行编辑');
    return;
  }

  const templateId = id || selectedRowKeys.value[0];
  isUpdate.value = true;
  loadTemplateDetail(templateId);
  editModalVisible.value = true;
};

// 加载模板详情
const loadTemplateDetail = async (id: string) => {
  loading.value = true;
  try {
    const result = await getTemplateDetail({ id });
    if (result.list && result.list.length > 0) {
      Object.assign(formData, result.list[0]);
    }
  } catch (error) {
    message.error('获取模板详情失败');
  } finally {
    loading.value = false;
  }
};

// 删除模板
const deleteTemplate = async (id?: string) => {
  const templateIds = id ? [id] : selectedRowKeys.value;

  if (templateIds.length === 0) {
    message.warning('请选择一条记录进行删除');
    return;
  }

  try {
    await deleteTemplate(templateIds);
    message.success('删除成功');
    loadTemplateList();
    selectedRowKeys.value = [];
  } catch (error) {
    message.error('删除失败');
  }
};

// 处理提交
const handleSubmit = async () => {
  try {
    // 验证表单
    const valid = await formRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    if (isUpdate.value) {
      // 更新模板
      await saveTemplate(formData);
      message.success('编辑成功');
    } else {
      // 新增模板
      await saveTemplate(formData);
      message.success('新增成功');
    }

    // 重新加载列表
    loadTemplateList();

    // 关闭模态框
    editModalVisible.value = false;
  } catch (error) {
    message.error(isUpdate.value ? '编辑失败' : '新增失败');
  } finally {
    loading.value = false;
  }
};

// 处理取消
const handleCancel = () => {
  editModalVisible.value = false;
};

// 重置表单
const resetForm = () => {
  formData.id = '';
  formData.name = '';
  formData.content = '';

  formRef.value?.resetFields();
};

// 初始化
onMounted(() => {
  loadTemplateList();
});
</script>

<style scoped lang="scss">
// 自定义样式
.content-wrapper {
  padding: 20px;
}

.btn-wrapper {
  margin-bottom: 20px;
}

.btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
}

.btns-icon {
  font-size: 18px;
  color: #1890ff;
  margin-bottom: 4px;
}

.btns-text {
  font-size: 12px;
  color: #333;
}

.action-buttons {
  display: flex;
  justify-content: center;
}
</style>