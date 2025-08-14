<template>
  <div class="warehouse-goods-container">
    <div class="button-group">
      <Button
        v-if="hasPermission('warehouse:add')"
        type="primary"
        @click="handleAdd"
        :icon="<PlusOutlined />"
        class="mr-2"
      >
        新增
      </Button>
      <Button
        v-if="hasPermission('warehouse:edit')"
        type="default"
        @click="handleEdit"
        :icon="<EditOutlined />"
        class="mr-2"
      >
        修改
      </Button>
      <Button
        v-if="hasPermission('warehouse:delete')"
        type="default"
        @click="handleDelete"
        :icon="<DeleteOutlined />"
      >
        删除
      </Button>
    </div>

    <div class="table-container">
      <BasicTable
        @register="registerTable"
        :columns="columns"
        :pagination="paginationConfig"
        :loading="loading"
        @change="handleTableChange"
        @select-change="handleSelectChange"
        bordered
      />
    </div>

    <WarehouseModal
      v-model:visible="isModalOpen"
      :initialValues="currentItem"
      @submit="handleSubmit"
    />

    <UserSelectModal
      v-model:visible="isUserModalOpen"
      :checkedUserKeys="checkedUserKeys"
      @confirm="handleUserSelectConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { Button } from 'ant-design-vue';
import { BasicTable, useTable } from '@vben/components';
import { usePermission } from '@vben/hooks';
import { useMessage } from '@vben/hooks';
import WarehouseModal from './components/WarehouseModal.vue';
import UserSelectModal from './components/UserSelectModal.vue';
import { getWarehouseList, saveWarehouse, deleteWarehouse } from '@/api/inventory/warehouse';
import { getCodeDetail } from '@/api/erp/erpGradeRule';
import { TreeDataOffice } from '@/api/office';
import { officeUserListToTree } from '@/utils/tree';

// 表格数据和配置
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const currentItem = ref<any>({});
const isModalOpen = ref(false);
const isUserModalOpen = ref(false);
const checkedUserKeys = ref<string[]>([]);
const ruleCode = ref('');
const userAllData = ref<any[]>([]);

// 权限检查
const { hasPermission } = usePermission();
const message = useMessage();

// 表格配置
const columns = [
  { title: '仓库编码', dataIndex: 'whCode', width: 120 },
  { title: '仓库名称', dataIndex: 'whName', width: 120 },
  { 
    title: '仓库类型', 
    dataIndex: 'whClass', 
    width: 120, 
    customRender: ({ text }) => {
      switch (text) {
        case 1: return '普通仓';
        case 2: return '现场仓';
        case 3: return '委外仓';
        default: return '';
      }
    }
  },
  { 
    title: '货位管理', 
    dataIndex: 'storageBin', 
    width: 120, 
    customRender: ({ text }) => text ? '是' : '否'
  },
  { title: '库管员', dataIndex: 'whKeeperName', width: 120 },
  { title: '负责人', dataIndex: 'whPerson', width: 120 },
  { title: '负责部门', dataIndex: 'whDepartment', width: 120 },
  { title: '联系电话', dataIndex: 'whTelephone', width: 120 },
  { title: '地址', dataIndex: 'whAddress', width: 200 },
  { title: '备注', dataIndex: 'remarks', width: 120 },
  { 
    title: '状态', 
    dataIndex: 'status', 
    width: 120, 
    customRender: ({ text }) => {
      let color = 'green';
      let label = '正常';
      if (text === 1) {
        color = 'red';
        label = '删除';
      } else if (text === 2) {
        color = 'yellow';
        label = '停用';
      }
      return <span style={{ color }}>{label}</span>;
    }
  },
];

const paginationConfig = {
  pageSize: 10,
  current: 1,
  total: 0,
};

const { registerTable, setTableData } = useTable({
  columns,
  pagination: paginationConfig,
  rowSelection: {
    type: 'radio',
  },
});

// 加载仓库数据
const loadWarehouseData = async () => {
  loading.value = true;
  try {
    const response = await getWarehouseList({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
    const { data, total } = response;
    setTableData(data);
    paginationConfig.total = total;
  } catch (error) {
    message.error('获取仓库数据失败');
    console.error('Failed to load warehouse data:', error);
  } finally {
    loading.value = false;
  }
};

// 获取编码规则
const getCodeRule = async () => {
  try {
    const response = await getCodeDetail({ code: 'warehouse' });
    if (response.code === 200) {
      const code = response.data.codingRule;
      ruleCode.value = formatCodeRule(code);
    }
  } catch (error) {
    console.error('Failed to get code rule:', error);
  }
};

// 格式化编码规则
const formatCodeRule = (code: string) => {
  let codeText = '';
  for (let i = 0; i < code.length; i++) {
    const codeNum = code.substring(i, i + 1);
    for (let j = 0; j < parseInt(codeNum); j++) {
      codeText += '*';
    }
    codeText += ' ';
  }
  return codeText.trim();
};

// 处理表格变化
const handleTableChange = (pagination: any) => {
  paginationConfig.current = pagination.current;
  paginationConfig.pageSize = pagination.pageSize;
  loadWarehouseData();
};

// 处理选择变化
const handleSelectChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

// 新增仓库
const handleAdd = () => {
  currentItem.value = { storageBin: false };
  checkedUserKeys.value = [];
  isModalOpen.value = true;
};

// 编辑仓库
const handleEdit = () => {
  if (selectedRows.value.length !== 1) {
    message.warning('请选择一条数据进行编辑');
    return;
  }
  currentItem.value = { ...selectedRows.value[0] };
  // 设置已选用户
  if (currentItem.value.whKeeper) {
    const userKeys = currentItem.value.whKeeper.split(',');
    checkedUserKeys.value = userKeys.map(key => `${key}_user`);
  }
  isModalOpen.value = true;
};

// 删除仓库
const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  message.confirm('确定要删除选中的仓库吗？', {
    onOk: async () => {
      try {
        const ids = selectedRows.value.map(row => row.id).join(',');
        await deleteWarehouse({ ids });
        message.success('删除成功');
        loadWarehouseData();
        selectedRowKeys.value = [];
        selectedRows.value = [];
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete warehouse:', error);
      }
    },
  });
};

// 提交表单
const handleSubmit = async (values: any) => {
  try {
    await saveWarehouse(values);
    message.success('保存成功');
    isModalOpen.value = false;
    loadWarehouseData();
  } catch (error) {
    message.error('保存失败');
    console.error('Failed to save warehouse:', error);
  }
};

// 处理用户选择
const handleUserSelectConfirm = (keys: string[]) => {
  checkedUserKeys.value = keys;
  isUserModalOpen.value = false;
  // 处理选择的用户
  if (keys.length > 0) {
    // 这里可以根据需要处理选中的用户
  }
};

// 初始化
onMounted(() => {
  loadWarehouseData();
  getCodeRule();
  // 加载用户数据
  TreeDataOffice({ isLoadUser: 2 }).then(response => {
    const { data } = response;
    const childrenNav: any[] = [];
    officeUserListToTree(data, childrenNav, '0');
    userAllData.value = childrenNav;
  });
});
</script>

<style scoped lang="scss">
.warehouse-goods-container {
  padding: 16px;

  .button-group {
    margin-bottom: 16px;
    display: flex;
  }

  .table-container {
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
}
</style>