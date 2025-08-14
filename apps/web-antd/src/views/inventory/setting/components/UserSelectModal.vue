<template>
  <Modal
    v-model:visible="visible"
    title="用户选择"
    centered
    width="320px"
    @cancel="handleCancel"
  >
    <div class="user-select-container">
      <a-input-search
        style="margin-bottom: 8px"
        placeholder="输入用户名称"
        @search="handleSearch"
      />

      <div class="tree-container" style="height: 400px; overflow-y: scroll">
        <a-tree
          v-model:checkedKeys="checkedUserKeys"
          :tree-data="userData"
          :show-icon="true"
          :defaultExpandAll="true"
          checkable
          @check="handleCheck"
        >
          <template #icon="iconProps">
            <UserOutlined v-if="iconProps.type === 'user'" />
            <TeamOutlined v-else />
          </template>
        </a-tree>
      </div>
    </div>

    <template #footer>
      <div>
        <Button type="primary" @click="handleConfirm">确定</Button>
        <Button class="ml-2" @click="handleCancel">关闭</Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { Button, Modal, Tree, Input } from 'ant-design-vue';
import { UserOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { TreeDataOffice } from '@/api/office';
import { officeUserListToTree, searchInTreeData } from '@/utils/tree';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  checkedUserKeys: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'confirm']);

const checkedKeys = ref<string[]>([]);
const userData = ref<any[]>([]);
const searchData = ref<any[]>([]);
const expandedKeys = ref<string[]>([]);
const treeAShow = ref(false);
const treeBShow = ref(true);
const searchValue = ref('');

// 监听选中的用户keys
watch(
  () => props.checkedUserKeys,
  (newKeys) => {
    checkedKeys.value = [...newKeys];
  },
  { immediate: true }
);

// 加载用户数据
const loadUserData = async () => {
  try {
    const response = await TreeDataOffice({ isLoadUser: 2 });
    const { data } = response;
    const childrenNav: any[] = [];
    officeUserListToTree(data, childrenNav, '0');
    userData.value = childrenNav;
    searchData.value = childrenNav;
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

// 处理搜索
const handleSearch = (value: string) => {
  searchValue.value = value;
  if (value) {
    const searchResult = searchInTreeData(userData.value, value);
    searchData.value = searchResult;
    treeAShow.value = true;
    treeBShow.value = false;
  } else {
    searchData.value = userData.value;
    treeAShow.value = false;
    treeBShow.value = true;
  }
};

// 处理勾选
const handleCheck = (keys: string[]) => {
  checkedKeys.value = keys;
};

// 处理确认
const handleConfirm = () => {
  emit('confirm', checkedKeys.value);
  emit('update:visible', false);
};

// 处理取消
const handleCancel = () => {
  emit('update:visible', false);
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped lang="scss">
.user-select-container {
  padding: 8px;

  .tree-container {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }
}
</style>