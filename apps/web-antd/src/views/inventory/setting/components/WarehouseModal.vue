<template>
  <Modal
    v-model:visible="visible"
    title="仓库编辑"
    centered
    width="900px"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 17 }"
    >
      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="编码规则" style="color: red; font-family: SimSun, sans-serif">
            {{ ruleCode }}
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="仓库编码" name="whCode" :rules="[{ required: true, message: '仓库编码不能为空' }]">
            <a-input v-model:value="formData.whCode" placeholder="请输入仓库编码" />
          </a-form-item>
        </a-col>
        <a-col :span="10" :push="2">
          <a-form-item label="仓库名称" name="whName" :rules="[{ required: true, message: '仓库名称不能为空' }]">
            <a-input v-model:value="formData.whName" placeholder="请输入仓库名称" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="仓库类型" name="whClass">
            <a-select v-model:value="formData.whClass" placeholder="请选择仓库类型">
              <a-select-option :value="1">普通仓</a-select-option>
              <a-select-option :value="2">现场仓</a-select-option>
              <a-select-option :value="3">委外仓</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="10" :push="2">
          <a-form-item label="负责部门" name="whDepartmentId">
            <InputGroupSearch
              modalTitle="选择部门"
              rightStyle="width: 320px;margin-top:-45px;"
              treeType="office"
              v-model:valueTitle="formData.whDepartment"
              v-model:value="formData.whDepartmentId"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="负责人" name="whPersonId">
            <InputGroupSearch
              modalTitle="选择负责人"
              rightStyle="width: 320px;margin-top:-45px;"
              treeType="officeUser"
              v-model:valueTitle="formData.whPerson"
              v-model:value="formData.whPersonId"
            />
          </a-form-item>
        </a-col>
        <a-col :span="10" :push="2">
          <a-form-item label="库管员" name="whKeeperName" :rules="[{ required: true, message: '库管员不能为空' }]">
            <a-input
              v-model:value="formData.whKeeperName"
              placeholder="请选择库管员"
              readonly
              @click="handleSelectUser"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="10">
          <a-form-item label="联系电话" name="whTelephone">
            <a-input v-model:value="formData.whTelephone" placeholder="请输入联系电话" />
          </a-form-item>
        </a-col>
        <a-col :span="10" :push="2">
          <a-form-item label="货位管理" name="storageBin">
            <a-checkbox
              v-model:checked="formData.storageBin"
              :disabled="!!formData.id"
              @change="handleStorageBinChange"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="20" :pull="3">
          <a-form-item label="仓库地址" name="whAddress">
            <a-textarea
              v-model:value="formData.whAddress"
              placeholder="请输入地址"
              :rows="2"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="20" :pull="3">
          <a-form-item label="备注" name="remarks">
            <a-textarea
              v-model:value="formData.remarks"
              placeholder="请输入备注"
              :rows="3"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <div>
        <Button type="primary" @click="handleSubmit">保存</Button>
        <Button class="ml-2" @click="handleCancel">取消</Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, reactive } from 'vue';
import { Button, Modal, Form, Input, Select, Checkbox, Textarea } from 'ant-design-vue';
import { useMessage } from '@vben/hooks';
import InputGroupSearch from '@/components/InputGroupSearch.vue';
import { getCodeDetail } from '@/api/erp/erpGradeRule';
import { getDepartmentList, getUserList } from '@/api/inventory/warehouse';

// 部门和用户数据
const departmentOptions = ref<any[]>([]);
const userOptions = ref<any[]>([]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref<FormInstance>();
const formData = ref<any>({});
const ruleCode = ref('');
const message = useMessage();

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

// 处理货位管理选择
const handleStorageBinChange = (e: any) => {
  formData.value.storageBin = e.target.checked;
};

// 处理选择用户
const handleSelectUser = async () => {
  // 加载用户数据
  const res = await getUserList();
  if (res.success) {
    userOptions.value = res.data.items.map(item => ({
      value: item.id,
      label: item.name
    }));
    // 这里可以打开用户选择模态框
    message.info('用户数据加载成功');
  }
};

// 搜索部门
const searchDepartment = async (keyword: string) => {
  const res = await getDepartmentList({ keyword });
  if (res.success) {
    departmentOptions.value = res.data.items.map(item => ({
      value: item.id,
      label: item.name
    }));
  }
};

// 搜索用户
const searchUser = async (keyword: string) => {
  const res = await getUserList({ keyword });
  if (res.success) {
    userOptions.value = res.data.items.map(item => ({
      value: item.id,
      label: item.name
    }));
  }
};

// 处理提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validateFields();
    emit('submit', { ...formData.value });
  } catch (error: any) {
    console.error('Form validation failed:', error);
  }
};

// 处理取消
const handleCancel = () => {
  emit('update:visible', false);
};

// 监听初始值变化
watch(
  () => props.initialValues,
  (newValues) => {
    formData.value = { ...newValues };
  },
  { immediate: true, deep: true }
);

// 监听可见性变化
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible && formRef.value) {
      formRef.value.resetFields();
    }
  }
);

onMounted(() => {
  getCodeRule();
  // 初始化加载部门数据
  getDepartmentList().then(res => {
    if (res.success) {
      departmentOptions.value = res.data.items.map(item => ({
        value: item.id,
        label: item.name
      }));
    }
  });
});
</script>