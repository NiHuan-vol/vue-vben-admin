<!--
 * @Descripttion: 合同分类
 * @version: V1.0
 * @Author: AI Assistant
 * @Date: 2025-08-13
-->
<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper warehouse-type-wrapper" style="margin: 2px 8px;">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="hasPermission('contractClass:add')">
              <div class="btns" @click="handleAdd">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractClass:edit')">
              <div class="btns" @click="handleEdit">
                <a-icon class="btns-icon" type="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractClass:delete')">
              <div class="btns" @click="handleDelete">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 分类树 -->
      <div class="content-tree-wrapper">
        <div class="tree-box not-copy" style="height: 99%">
          <a-input-search
            style="margin-bottom: 8px"
            placeholder="搜索分类"
            v-model:value="searchValue"
            @search="handleSearch"
          />
          <a-tree
            show-line
            default-expand-all
            :treeData="treeData"
            v-if="treeData.length > 0"
            @select="onSelect"
            :replaceFields="replaceFields"
          >
            <a-icon slot="switcherIcon" type="down" />
          </a-tree>
        </div>
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
        :layout="'inline'"
      >
        <a-form-model-item
          label="类别编码"
          :rules="[{ required: true, trigger: 'input', message: '请输入类别编码' }]"
        >
          <a-input
            placeholder="请输入两位数类别编码"
            maxLength="2"
            v-model.trim="formData.code"
            onkeyup="value=value.toString().match(/^\d+(?:\.\d{0,5})?/)"
          />
        </a-form-model-item>
        <a-form-model-item
          label="类别名称"
          :rules="[{ required: true, trigger: 'input', message: '请输入类别名称' }]"
        >
          <a-input placeholder="请输入类别名称" v-model.trim="formData.name" />
        </a-form-model-item>
        <a-form-model-item
          label="收付计划方向"
          :rules="[{ required: true, trigger: 'change', message: '请选择收付计划方向' }]"
        >
          <a-radio-group v-model="formData.planDirection" @change="onDirectionChange">
            <a-radio v-for="item in directionOptions" :key="item.code" :value="item.code">
              {{ item.name }}
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          label="合同编码规则"
          :rules="[{ required: true, trigger: 'change', message: '请选择合同编码规则' }]"
        >
          <a-select
            placeholder="请选择合同编码规则"
            v-model="formData.numberSetId"
            style="width: 146px"
            @change="onCodeRuleChange"
          >
            <a-select-option v-for="item in codeRules" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '/@/store/modules/app';
import { usePermission } from '/@/hooks/web/usePermission';
import { getContractClassList, saveContractClass, deleteContractClass } from '/@/api/contract/contractClass';
import { getCodeRules } from '/@/api/erp/mumberSet';
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
const modalVisible = ref(false);
const modalTitle = ref('新增合同类别');
const formData = reactive<any>({
  id: '',
  code: '',
  name: '',
  planDirection: 1,
  numberSetId: '',
  numberSetName: '',
});
const directionOptions = ref([
  { name: '收', code: 1 },
  { name: '付', code: 2 },
  { name: '其他', code: 3 },
]);
const codeRules = ref<any[]>([]);
const replaceFields = { title: 'showname', key: 'code' };

// 获取分类数据
const getList = async () => {
  loading.value = true;
  try {
    const params = { size: -1, current: 1 };
    const res = await getContractClassList(params);
    if (res.code === 200) {
      const data = res.data || [];
      // 格式化树形数据
      const formattedData = formatTreeData(data);
      treeData.value = [{
        title: '合同分类',
        showname: '合同分类',
        key: '',
        children: formattedData
      }];
    } else {
      message.error(res.message || '获取数据失败');
    }
  } catch (error) {
    message.error('获取数据失败');
    console.error('Failed to get contract class list:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化树形数据
const formatTreeData = (data: any[]) => {
  // 简单实现，实际可能需要递归处理
  const formattedData = data.map(item => ({
    ...item,
    showname: `(${item.code}) ${item.name}`,
    key: item.code,
  }));
  return formattedData;
};

// 获取编码规则
const getCodeRulesList = async () => {
  try {
    const res = await getCodeRules({ moduleCode: 'CM' });
    if (res.code === 200) {
      codeRules.value = res.data.records || [];
    } else {
      message.error(res.message || '获取编码规则失败');
    }
  } catch (error) {
    message.error('获取编码规则失败');
    console.error('Failed to get code rules:', error);
  }
};

// 搜索分类
const handleSearch = () => {
  if (!searchValue.value) {
    getList();
    return;
  }

  // 简单搜索实现，实际可能需要后端支持
  const allNodes = treeToList(treeData.value);
  const filteredNodes = allNodes.filter(node => 
    node.name?.includes(searchValue.value) || node.code?.includes(searchValue.value)
  );

  // 构建新的树结构
  // 这里简化处理，实际可能需要更复杂的逻辑来重建树
};

// 选择节点
const onSelect = (keys: string[], event: any) => {
  selectedKeys.value = keys;
  selectedRow.value = event.node.dataRef;
};

// 新增
const handleAdd = () => {
  modalTitle.value = '新增合同类别';
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    planDirection: 1,
    numberSetId: '',
    numberSetName: '',
  });
  modalVisible.value = true;
};

// 编辑
const handleEdit = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据进行修改');
    return;
  }
  modalTitle.value = '修改合同类别';
  Object.assign(formData, selectedRow.value);
  modalVisible.value = true;
};

// 删除
const handleDelete = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据进行删除');
    return;
  }

  appStore.showConfirmDialog({
    title: `确认删除`,
    content: `是否确认删除 ${selectedRow.value.name}？`,
    onOk: async () => {
      loading.value = true;
      try {
        const res = await deleteContractClass({ id: selectedRow.value.id });
        if (res.code === 200) {
          message.success('删除成功');
          getList();
          selectedKeys.value = [];
          selectedRow.value = {};
        } else {
          message.error(res.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete contract class:', error);
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
    message.warning('请输入类别编码');
    return;
  }
  if (formData.code.length !== 2) {
    message.warning('请输入两位数编码');
    return;
  }
  if (!formData.name) {
    message.warning('请输入类别名称');
    return;
  }
  if (!formData.numberSetId) {
    message.warning('请选择合同编码规则');
    return;
  }

  loading.value = true;
  try {
    const res = await saveContractClass(formData);
    if (res.code === 200) {
      message.success('保存成功');
      modalVisible.value = false;
      getList();
      selectedKeys.value = [];
      selectedRow.value = {};
    } else {
      message.error(res.message || '保存失败');
    }
  } catch (error) {
    message.error('保存失败');
    console.error('Failed to save contract class:', error);
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
};

// 收付方向变化
const onDirectionChange = (e: any) => {
  formData.planDirection = e.target.value;
};

// 编码规则变化
const onCodeRuleChange = (key: string) => {
  formData.numberSetId = key;
  const selectedRule = codeRules.value.find(rule => rule.id === key);
  if (selectedRule) {
    formData.numberSetName = selectedRule.name;
  }
};

// 初始化
onMounted(() => {
  getList();
  getCodeRulesList();
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

.content-tree-wrapper {
  flex: 1;
  overflow: auto;
  .tree-box {
    height: 100%;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
}
</style>