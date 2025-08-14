<!--
 * @Descripttion: 合同阶段组
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
            <a-col :span="2" v-if="hasPermission('contractPhaseGroup:add')">
              <div class="btns" @click="handleAdd">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractPhaseGroup:edit')">
              <div class="btns" @click="handleEdit">
                <a-icon class="btns-icon" type="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractPhaseGroup:delete')">
              <div class="btns" @click="handleDelete">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractPhaseGroup:save')">
              <div class="btns" @click="handleSave">
                <a-icon class="btns-icon" type="save" />
                <div class="btns-text">保存</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="handleRefresh">
                <a-icon class="btns-icon" type="sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 搜索框 -->
      <div class="search-wrapper">
        <a-input-search
          style="width: 200px"
          placeholder="搜索阶段组"
          v-model:value="searchValue"
          @search="handleSearch"
        />
      </div>

      <!-- 左侧树形和右侧表格 -->
      <div class="content-wrapper-inner">
        <!-- 左侧树形 -->
        <div class="tree-wrapper">
          <a-tree
            show-line
            default-expand-all
            :treeData="treeData"
            @select="onSelect"
            :replaceFields="replaceFields"
          >
            <a-icon slot="switcherIcon" type="down" />
          </a-tree>
        </div>

        <!-- 右侧内容区域 -->
        <div class="form-and-table-wrapper">
          <!-- 表单区域 -->
          <div class="form-wrapper">
            <a-form-model
              :model="formData"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              :layout="'inline'"
            >
              <a-form-model-item label="阶段组编码">
                <a-input v-model.trim="formData.code" disabled />
              </a-form-model-item>
              <a-form-model-item label="阶段组名称">
                <a-input v-model.trim="formData.name" />
              </a-form-model-item>
              <a-form-model-item label="阶段组说明">
                <a-input v-model.trim="formData.description" />
              </a-form-model-item>
              <a-form-model-item label="默认阶段组">
                <a-radio-group v-model="formData.isDefault">
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-form-model>
          </div>

          <!-- 表格区域 -->
          <div class="table-wrapper">
            <a-table
              :columns="columns"
              :dataSource="tableData"
              :loading="loading"
              rowKey="id"
              @change="handleTableChange"
              @row-contextmenu="handleContextMenu"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'sort'">
                  <a-input-number
                    :min="1"
                    :max="tableData.length"
                    v-model:value="record.sort"
                    @change="(value) => handleSortChange(index, value)"
                  />
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <a-menu
      v-if="contextMenuVisible"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      class="context-menu"
      @click="handleContextMenuClick"
    >
      <a-menu-item key="addPhase">添加阶段</a-menu-item>
      <a-menu-item key="deletePhase">删除阶段</a-menu-item>
    </a-menu>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @cancel="handleCancel"
    >
      <a-form-model
        v-if="modalVisible"
        :model="phaseFormData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item
          label="阶段编码"
          :rules="[{ required: true, trigger: 'change', message: '请选择阶段' }]"
        >
          <a-select
            placeholder="请选择阶段"
            v-model="phaseFormData.phaseId"
            style="width: 146px"
          >
            <a-select-option
              v-for="item in phaseOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item
          label="阶段顺序"
          :rules="[{ required: true, trigger: 'input', message: '请输入阶段顺序' }]"
        >
          <a-input-number
            :min="1"
            v-model:value="phaseFormData.sort"
            placeholder="请输入阶段顺序"
          />
        </a-form-model-item>
        <a-form-model-item label="备注">
          <a-input placeholder="请输入备注" v-model.trim="phaseFormData.remark" />
        </a-form-model-item>
      </a-form-model>
      <template #footer>
        <a-button type="primary" @click="handlePhaseSubmit">确认</a-button>
        <a-button @click="handleCancel">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '/@/store/modules/app';
import { usePermission } from '/@/hooks/web/usePermission';
import {
  getContractPhaseGroupList,
  saveContractPhaseGroup,
  deleteContractPhaseGroup,
  getContractPhaseGroupDetails,
  saveContractPhaseInGroup,
  deleteContractPhaseFromGroup,
} from '/@/api/contract/contractPhaseGroup';
import { getContractPhaseList } from '/@/api/contract/contractPhase';
import { message } from 'ant-design-vue';
import { treeToList } from '/@/utils/tree';

// 权限检查
const { hasPermission } = usePermission();
const appStore = useAppStore();

// 响应式数据
const loading = ref(false);
const treeData = ref<any[]>([]);
const searchValue = ref('');
const selectedKeys = ref<string[]>([]);
const selectedRow = ref<any>({});
const formData = reactive<any>({
  id: '',
  code: '',
  name: '',
  description: '',
  isDefault: false,
});
const tableData = ref<any[]>([]);
const columns = [
  { title: '阶段编码', dataIndex: 'phaseCode', width: 120 },
  { title: '阶段名称', dataIndex: 'phaseName', width: 180 },
  { title: '阶段顺序', dataIndex: 'sort', width: 100 },
  { title: '备注', dataIndex: 'remark', width: 150 },
];
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
const selectedTableRow = ref<any>({});
const modalVisible = ref(false);
const modalTitle = ref('添加阶段');
const phaseFormData = reactive<any>({
  id: '',
  phaseGroupId: '',
  phaseId: '',
  sort: 1,
  remark: '',
});
const phaseOptions = ref<any[]>([]);
const replaceFields = { title: 'showname', key: 'code' };

// 获取阶段组列表
const getGroupList = async () => {
  loading.value = true;
  try {
    const res = await getContractPhaseGroupList({ size: -1, current: 1 });
    if (res.code === 200) {
      const data = res.data.records || [];
      // 格式化树形数据
      const formattedData = formatTreeData(data);
      treeData.value = [{
        title: '合同阶段组',
        showname: '合同阶段组',
        key: '',
        children: formattedData
      }];
    } else {
      message.error(res.message || '获取数据失败');
    }
  } catch (error) {
    message.error('获取数据失败');
    console.error('Failed to get contract phase group list:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化树形数据
const formatTreeData = (data: any[]) => {
  return data.map(item => ({
    ...item,
    showname: `(${item.code}) ${item.name}`,
    key: item.code,
  }));
};

// 获取阶段列表
const getPhaseList = async () => {
  try {
    const res = await getContractPhaseList({ size: -1, current: 1 });
    if (res.code === 200) {
      phaseOptions.value = res.data.records || [];
    } else {
      message.error(res.message || '获取阶段数据失败');
    }
  } catch (error) {
    message.error('获取阶段数据失败');
    console.error('Failed to get contract phase list:', error);
  }
};

// 获取阶段组详情
const getGroupDetails = async (groupId: string) => {
  loading.value = true;
  try {
    const res = await getContractPhaseGroupDetails({ id: groupId });
    if (res.code === 200) {
      const data = res.data || {};
      Object.assign(formData, data);
      // 获取阶段组中的阶段
      tableData.value = data.phaseList || [];
    } else {
      message.error(res.message || '获取详情失败');
    }
  } catch (error) {
    message.error('获取详情失败');
    console.error('Failed to get contract phase group details:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索阶段组
const handleSearch = () => {
  if (!searchValue.value) {
    getGroupList();
    return;
  }

  // 简单搜索实现
  const allNodes = treeToList(treeData.value);
  const filteredNodes = allNodes.filter(node => 
    node.name?.includes(searchValue.value) || node.code?.includes(searchValue.value)
  );

  // 构建新的树结构
  // 简化处理
};

// 选择节点
const onSelect = (keys: string[], event: any) => {
  selectedKeys.value = keys;
  selectedRow.value = event.node.dataRef;
  if (keys.length > 0) {
    getGroupDetails(selectedRow.value.id);
  } else {
    // 清空表单和表格
    Object.assign(formData, {
      id: '',
      code: '',
      name: '',
      description: '',
      isDefault: false,
    });
    tableData.value = [];
  }
};

// 新增阶段组
const handleAdd = () => {
  modalTitle.value = '新增阶段组';
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    description: '',
    isDefault: false,
  });
  // 这里可能需要打开弹窗，根据实际需求调整
};

// 编辑阶段组
const handleEdit = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据进行修改');
    return;
  }
  // 这里可能需要打开弹窗，根据实际需求调整
};

// 删除阶段组
const handleDelete = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据进行删除');
    return;
  }

  appStore.showConfirmDialog({
    title: `确认删除`,
    content: `是否确认删除阶段组 ${selectedRow.value.name}？`,
    onOk: async () => {
      loading.value = true;
      try {
        const res = await deleteContractPhaseGroup({ id: selectedRow.value.id });
        if (res.code === 200) {
          message.success('删除成功');
          getGroupList();
          selectedKeys.value = [];
          selectedRow.value = {};
          Object.assign(formData, {
            id: '',
            code: '',
            name: '',
            description: '',
            isDefault: false,
          });
          tableData.value = [];
        } else {
          message.error(res.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete contract phase group:', error);
      } finally {
        loading.value = false;
      }
    },
  });
};

// 保存阶段组
const handleSave = async () => {
  if (!selectedKeys.value.length) {
    message.warning('请选择一个阶段组进行保存');
    return;
  }

  // 验证
  if (!formData.name) {
    message.warning('请输入阶段组名称');
    return;
  }

  loading.value = true;
  try {
    const res = await saveContractPhaseGroup(formData);
    if (res.code === 200) {
      message.success('保存成功');
      getGroupList();
    } else {
      message.error(res.message || '保存失败');
    }
  } catch (error) {
    message.error('保存失败');
    console.error('Failed to save contract phase group:', error);
  } finally {
    loading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  getGroupList();
  if (selectedKeys.value.length) {
    getGroupDetails(selectedRow.value.id);
  }
};

// 表格变化处理
const handleTableChange = (pagination: any) => {
  Object.assign(pagination, pagination);
  // 根据需要重新获取数据
};

// 处理右键菜单
const handleContextMenu = (e: MouseEvent, record: any) => {
  e.preventDefault();
  contextMenuLeft.value = e.clientX;
  contextMenuTop.value = e.clientY;
  selectedTableRow.value = record;
  contextMenuVisible.value = true;
};

// 处理右键菜单点击
const handleContextMenuClick = (e: any) => {
  contextMenuVisible.value = false;
  switch (e.key) {
    case 'addPhase':
      handleAddPhase();
      break;
    case 'deletePhase':
      handleDeletePhase();
      break;
    default:
      break;
  }
};

// 添加阶段
const handleAddPhase = () => {
  if (!selectedKeys.value.length) {
    message.warning('请先选择阶段组');
    return;
  }
  modalTitle.value = '添加阶段';
  Object.assign(phaseFormData, {
    id: '',
    phaseGroupId: selectedRow.value.id,
    phaseId: '',
    sort: 1,
    remark: '',
  });
  modalVisible.value = true;
};

// 删除阶段
const handleDeletePhase = () => {
  if (!selectedTableRow.value.id) {
    message.warning('请选择要删除的阶段');
    return;
  }

  appStore.showConfirmDialog({
    title: `确认删除`,
    content: `是否确认删除阶段 ${selectedTableRow.value.phaseName}？`,
    onOk: async () => {
      loading.value = true;
      try {
        const res = await deleteContractPhaseFromGroup({
          id: selectedTableRow.value.id,
        });
        if (res.code === 200) {
          message.success('删除成功');
          getGroupDetails(selectedRow.value.id);
        } else {
          message.error(res.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete phase from group:', error);
      } finally {
        loading.value = false;
      }
    },
  });
};

// 提交阶段表单
const handlePhaseSubmit = async () => {
  // 验证
  if (!phaseFormData.phaseId) {
    message.warning('请选择阶段');
    return;
  }
  if (!phaseFormData.sort) {
    message.warning('请输入阶段顺序');
    return;
  }

  loading.value = true;
  try {
    const res = await saveContractPhaseInGroup(phaseFormData);
    if (res.code === 200) {
      message.success('保存成功');
      modalVisible.value = false;
      getGroupDetails(selectedRow.value.id);
    } else {
      message.error(res.message || '保存失败');
    }
  } catch (error) {
    message.error('保存失败');
    console.error('Failed to save phase in group:', error);
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
};

// 处理排序变化
const handleSortChange = (index: number, value: number) => {
  if (value !== undefined) {
    tableData.value[index].sort = value;
  }
};

// 初始化
onMounted(() => {
  getGroupList();
  getPhaseList();
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

.search-wrapper {
  margin-bottom: 10px;
}

.content-wrapper-inner {
  display: flex;
  flex: 1;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.tree-wrapper {
  width: 250px;
  overflow: auto;
  border-right: 1px solid #e8e8e8;
  padding: 8px;
  background-color: #fff;
}

.form-and-table-wrapper {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.form-wrapper {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>