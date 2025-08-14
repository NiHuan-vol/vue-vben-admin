<!--
 * @Descripttion: 合同条款
 * @version: V1.0
 * @Author: AI Assistant
 * @Date: 2025-08-13
-->
<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper" style="margin: 2px 8px;">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="hasPermission('contractClause:add')">
              <div class="btns" @click="handleAdd">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractClause:edit')">
              <div class="btns" @click="handleEdit">
                <a-icon class="btns-icon" type="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractClause:delete')">
              <div class="btns" @click="handleDelete">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 表格区域 -->
      <div class="table-wrapper">
        <a-table
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          :loading="loading"
          rowKey="id"
          @change="handleTableChange"
          @row-selection-change="onSelectChange"
          :row-selection="{ selectedRowKeys: selectedRowKeys, type: 'radio' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <span :class="record.status === 1 ? 'text-success' : 'text-danger'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @cancel="handleCancel"
    >
      <a-form-model
        v-if="modalVisible"
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item
          label="条款编号"
          :rules="[{ required: true, trigger: 'input', message: '请输入条款编号' }]"
        >
          <a-input placeholder="请输入条款编号" v-model.trim="formData.code" />
        </a-form-model-item>
        <a-form-model-item
          label="条款名称"
          :rules="[{ required: true, trigger: 'input', message: '请输入条款名称' }]"
        >
          <a-input placeholder="请输入条款名称" v-model.trim="formData.name" />
        </a-form-model-item>
        <a-form-model-item
          label="条款内容"
          :rules="[{ required: true, trigger: 'input', message: '请输入条款内容' }]"
        >
          <a-textarea
            placeholder="请输入条款内容"
            v-model.trim="formData.content"
            rows="4"
          />
        </a-form-model-item>
        <a-form-model-item label="备注">
          <a-input placeholder="请输入备注" v-model.trim="formData.remark" />
        </a-form-model-item>
        <a-form-model-item label="启用状态">
          <a-radio-group v-model="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
      <template #footer>
        <a-button type="primary" @click="handleSubmit">确认</a-button>
        <a-button @click="handleCancel">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAppStore } from '/@/store/modules/app';
import { usePermission } from '/@/hooks/web/usePermission';
import { getContractClauseList, saveContractClause, deleteContractClause } from '/@/api/contract/contractClause';
import { message } from 'ant-design-vue';

// 权限检查
const { hasPermission } = usePermission();
const appStore = useAppStore();

// 响应式数据
const loading = ref(false);
const dataSource = ref<any[]>([]);
const columns = [
  { title: '条款编号', dataIndex: 'code', width: 120 },
  { title: '条款名称', dataIndex: 'name', width: 180 },
  { title: '条款内容', dataIndex: 'content', width: 300 },
  { title: '备注', dataIndex: 'remark', width: 150 },
  { title: '启用状态', dataIndex: 'status', width: 80 },
  { title: '创建人', dataIndex: 'creator', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '更新人', dataIndex: 'updator', width: 100 },
  { title: '更新时间', dataIndex: 'updateTime', width: 180 },
];
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});
const selectedRowKeys = ref<string[]>([]);
const selectedRow = ref<any>({});
const modalVisible = ref(false);
const modalTitle = ref('新增合同条款');
const formData = reactive<any>({
  id: '',
  code: '',
  name: '',
  content: '',
  remark: '',
  status: 1,
});

// 获取条款列表
const getList = async () => {
  loading.value = true;
  try {
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
    };
    const res = await getContractClauseList(params);
    if (res.code === 200) {
      dataSource.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      message.error(res.message || '获取数据失败');
    }
  } catch (error) {
    message.error('获取数据失败');
    console.error('Failed to get contract clause list:', error);
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (pagination: any) => {
  Object.assign(pagination, pagination);
  getList();
};

// 选择行变化
const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedRowKeys.value = selectedRowKeys;
  selectedRow.value = selectedRows.length > 0 ? selectedRows[0] : {};
};

// 新增
const handleAdd = () => {
  modalTitle.value = '新增合同条款';
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    content: '',
    remark: '',
    status: 1,
  });
  modalVisible.value = true;
};

// 编辑
const handleEdit = () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一条数据进行修改');
    return;
  }
  modalTitle.value = '修改合同条款';
  Object.assign(formData, selectedRow.value);
  modalVisible.value = true;
};

// 删除
const handleDelete = () => {
  if (selectedRowKeys.value.length !== 1) {
    message.warning('请选择一条数据进行删除');
    return;
  }

  appStore.showConfirmDialog({
    title: `确认删除`,
    content: `是否确认删除条款 ${selectedRow.value.name}？`,
    onOk: async () => {
      loading.value = true;
      try {
        const res = await deleteContractClause({ id: selectedRow.value.id });
        if (res.code === 200) {
          message.success('删除成功');
          getList();
          selectedRowKeys.value = [];
          selectedRow.value = {};
        } else {
          message.error(res.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete contract clause:', error);
      } finally {
        loading.value = false;
      }
    },
  });
};

// 提交表单
const handleSubmit = async () => {
  // 验证
  if (!formData.code) {
    message.warning('请输入条款编号');
    return;
  }
  if (!formData.name) {
    message.warning('请输入条款名称');
    return;
  }
  if (!formData.content) {
    message.warning('请输入条款内容');
    return;
  }

  loading.value = true;
  try {
    const res = await saveContractClause(formData);
    if (res.code === 200) {
      message.success('保存成功');
      modalVisible.value = false;
      getList();
      selectedRowKeys.value = [];
      selectedRow.value = {};
    } else {
      message.error(res.message || '保存失败');
    }
  } catch (error) {
    message.error('保存失败');
    console.error('Failed to save contract clause:', error);
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style lang="less" scoped>
.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.btn-wrapper {
  margin-bottom: 10px;
  .btns {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    .btns-icon {
      font-size: 18px;
      color: #1890ff;
    }
    .btns-text {
      font-size: 12px;
      margin-top: 2px;
    }
    &:hover {
      .btns-icon {
        color: #40a9ff;
      }
      background-color: #f0f2f5;
      border-radius: 4px;
    }
  }
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
}

.text-success {
  color: #52c41a;
}

.text-danger {
  color: #f5222d;
}
</style>