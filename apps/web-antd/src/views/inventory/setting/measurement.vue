<template>
  <div class="measurement-container">
    <div class="button-group">
      <Button
        v-if="hasPermission('unit:add')"
        type="primary"
        @click="handleAdd"
        :icon="<PlusOutlined />"
        class="mr-2"
      >
        新增
      </Button>
      <Button
        v-if="hasPermission('unit:edit')"
        type="default"
        @click="handleEdit"
        :icon="<EditOutlined />"
        class="mr-2"
      >
        修改
      </Button>
      <Button
        v-if="hasPermission('unit:delete')"
        type="default"
        @click="handleDelete"
        :icon="<DeleteOutlined />"
      >
        删除
      </Button>
    </div>

    <div class="content-wrapper">
      <div class="tree-container">
        <Tree
          class="measurement-tree"
          showLine
          :treeData="treeData"
          :defaultSelectedKeys="['0']"
          :autoExpandParent="autoExpandParent"
          :expandedKeys="expandedKeys"
          @select="handleTreeSelect"
          @expand="handleExpand"
        >
          <template #switcherIcon>
            <DownOutlined />
          </template>
          <template #title="{ title }">
            <span v-if="title.includes(searchName)">
              {{ title.split(searchName).join(`<span style="color: #f50">${searchName}</span>`) }}
            </span>
            <span v-else>{{ title }}</span>
          </template>
        </Tree>
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
    </div>

    <MeasurementModal
      v-model:visible="isModalOpen"
      :unitType="unitType"
      :initialValues="currentItem"
      @submit="handleSubmit"
      @close="handleModalClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons-vue';
import { Button, Tree } from 'ant-design-vue';
import { BasicTable, useTable } from '@vben/components';
import { usePermission } from '@vben/hooks';
import { useMessage } from '@vben/hooks';
import MeasurementModal from './components/MeasurementModal.vue';
import { getUnitList, deleteUnit, saveUnit } from '@/api/inventory/unit';
import { getUnitGroupList, saveUnitGroup } from '@/api/inventory/unitGroup';
import { searchInTreeData } from '@/utils/tree';

// 权限检查
const { hasPermission } = usePermission();
const message = useMessage();

// 状态管理
const loading = ref(false);
const isModalOpen = ref(false);
const currentItem = ref<any>({});
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const unitType = ref<number>(0); // 0: 单计量, -1: 多计量
const searchName = ref('');
const expandedKeys = ref<string[]>([]);
const autoExpandParent = ref(true);

// 树形数据
const treeData = ref<any[]>([
  {
    title: '分类',
    key: '',
    children: [
      {
        title: '单计量',
        key: '0',
      },
      {
        title: '多计量',
        key: '-1',
        children: [],
      },
    ],
  },
]);

// 表格配置
const columns = [
  { title: '编码', dataIndex: 'code', width: 120 },
  { title: '名称', dataIndex: 'name', width: 120 },
  { title: '是否主计量', dataIndex: 'isMainUnit', width: 120, customRender: ({ text }) => text ? '是' : '否' },
  { title: '换算率', dataIndex: 'changeRate', width: 120 },
  { title: '换算类型', dataIndex: 'convertType', width: 120, customRender: ({ text }) => text === 0 ? '固定' : '浮动' },
  { title: '备注', dataIndex: 'remarks', width: 120 },
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

// 加载计量单位数据
const loadUnitData = async (key: string = '0') => {
  loading.value = true;
  try {
    const response = await getUnitList({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      type: key,
    });
    const { data, total } = response;
    setTableData(data);
    paginationConfig.total = total;
  } catch (error) {
    message.error('获取计量单位数据失败');
    console.error('Failed to load unit data:', error);
  } finally {
    loading.value = false;
  }
};

// 加载计量单位组数据
const loadUnitGroupData = async () => {
  try {
    const response = await getUnitGroupList();
    const { data } = response;
    // 更新多计量下的子节点
    if (treeData.value[0]?.children[1]) {
      treeData.value[0].children[1].children = data.map((item: any) => ({
        title: item.name,
        key: item.id,
      }));
    }
  } catch (error) {
    console.error('Failed to load unit group data:', error);
  }
};

// 处理树形结构选择
const handleTreeSelect = (keys: string[]) => {
  if (keys.length > 0) {
    const key = keys[0];
    // 如果选择的是单计量或多计量根节点
    if (key === '0' || key === '-1') {
      unitType.value = parseInt(key);
      loadUnitData(key);
    } else {
      // 选择的是多计量下的具体分组
      loadUnitData(key);
    }
  }
};

// 处理展开节点
const handleExpand = (expandedKeys: string[]) => {
  expandedKeys.value = expandedKeys;
  autoExpandParent.value = false;
};

// 处理表格变化
const handleTableChange = (pagination: any) => {
  paginationConfig.current = pagination.current;
  paginationConfig.pageSize = pagination.pageSize;
  loadUnitData();
};

// 处理选择变化
const handleSelectChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

// 新增计量单位
const handleAdd = () => {
  currentItem.value = {};
  isModalOpen.value = true;
};

// 编辑计量单位
const handleEdit = () => {
  if (selectedRows.value.length !== 1) {
    message.warning('请选择一条数据进行编辑');
    return;
  }
  currentItem.value = { ...selectedRows.value[0] };
  isModalOpen.value = true;
};

// 删除计量单位
const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  message.confirm('确定要删除选中的计量单位吗？', {
    onOk: async () => {
      try {
        const ids = selectedRows.value.map(row => row.id).join(',');
        await deleteUnit({ ids });
        message.success('删除成功');
        loadUnitData();
        selectedRowKeys.value = [];
        selectedRows.value = [];
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete unit:', error);
      }
    },
  });
};

// 提交表单
const handleSubmit = async (values: any) => {
  try {
    // 根据unitType调用不同的保存接口
    if (unitType.value === 0) {
      // 单计量保存逻辑
      const params = {
        id: values.id || undefined,
        code: values.code,
        name: values.name,
        remarks: values.remarks,
      };
      await saveUnit(params);
    } else {
      // 多计量保存逻辑
      const params = {
        id: values.id || undefined,
        code: values.code,
        name: values.name,
        units: values.units,
      };
      await saveUnitGroup(params);
    }
    message.success('保存成功');
    isModalOpen.value = false;
    loadUnitData();
  } catch (error) {
    message.error('保存失败');
    console.error('Failed to save unit:', error);
  }
};

// 关闭模态框
const handleModalClose = () => {
  isModalOpen.value = false;
};

// 初始化
onMounted(() => {
  loadUnitData();
  loadUnitGroupData();
});
</script>

<style scoped lang="scss">
.measurement-container {
  padding: 16px;

  .button-group {
    margin-bottom: 16px;
    display: flex;
  }

  .content-wrapper {
    display: flex;
    height: calc(100vh - 120px);

    .tree-container {
      width: 240px;
      border-right: 1px solid #e5e6eb;
      padding: 16px;
      overflow: auto;

      .measurement-tree {
        :deep(.ant-tree-node-content-wrapper) {
          padding: 4px 8px;
        }
      }
    }

    .table-container {
      flex: 1;
      padding: 16px;
      overflow: auto;
    }
  }
}
</style>