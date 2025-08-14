<template>
  <Modal
    v-model:visible="visible"
    title="{{ isUpdate ? '编辑客户' : '新增客户' }}"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :destroyOnClose="true"
    :maskClosable="false"
    class="customer-modal"
  >
    <BasicForm
      ref="formRef"
      :model="formData"
      :schemas="schemas"
      :labelWidth="120"
      :showActionButtonGroup="false"
      class="mt-4 customer-form"
    >
      <!-- 客户名称 -->
      <template #form-crmName>
        <FormItem
          field="crmName"
          label="客户名称"
          required
          :rules="[{ required: true, message: '请输入客户名称', trigger: 'blur' }]"
        >
          <Input v-model:value="formData.crmName" placeholder="请输入客户名称" maxlength="50" />
        </FormItem>
      </template>

      <!-- 客户编号 -->
      <template #form-crmNo>
        <FormItem
          field="crmNo"
          label="客户编号"
          required
          :rules="[{ required: true, message: '请输入客户编号', trigger: 'blur' }]"
        >
          <Input v-model:value="formData.crmNo" placeholder="请输入客户编号" maxlength="20" :disabled="isUpdate" />
        </FormItem>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useMessage } from '@vben/hooks/web/useMessage';
import { usePermission } from '@vben/hooks/web/usePermission';
import { Modal, FormItem, Input, Select, Option, TextArea } from '@vben/components';
import { BasicForm, FormSchema } from '@vben/components/Table';
import { getCustomerDetail, addCustomer, updateCustomer, getUserList } from '#/api/crm/customer';
import { useUserStore } from '#/store/modules/user';
import { useAuthStore } from '#/store/auth';

// 定义props
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

// 定义emits
const emit = defineEmits(['success', 'cancel']);

// 权限检查
const { hasPermission } = usePermission();

// 表单引用
const formRef = ref<InstanceType<typeof BasicForm>>();

// 响应式数据
const visible = ref(false);
const isUpdate = computed(() => !!props.id);
const loading = ref(false);
const formData = reactive<Recordable>({
  id: '',
  crmName: '',
  crmNo: '',
  level: '',
  ownerId: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  website: '',
  industry: '',
  scale: '',
  source: '',
  description: '',
});

// 用户信息
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo());

// 消息提示
const message = useMessage();

// 下拉选项
const userOptions = ref<any[]>([]);
const levelOptions = [
  { label: '普通客户', value: 'normal' },
  { label: 'VIP客户', value: 'vip' },
  { label: '重要客户', value: 'important' },
];
const industryOptions = [
  { label: '互联网', value: 'internet' },
  { label: '金融', value: 'finance' },
  { label: '教育', value: 'education' },
  { label: '医疗', value: 'medical' },
  { label: '其他', value: 'other' },
];
const scaleOptions = [
  { label: '小型', value: 'small' },
  { label: '中型', value: 'medium' },
  { label: '大型', value: 'large' },
  { label: '集团', value: 'group' },
];
const sourceOptions = [
  { label: '网站', value: 'website' },
  { label: '广告', value: 'advertisement' },
  { label: '推荐', value: 'recommendation' },
  { label: '展会', value: 'exhibition' },
  { label: '其他', value: 'other' },
];
  id: '',
  crmName: '',
  crmNo: '',
  level: '',
  ownerId: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  website: '',
  industry: '',
  scale: '',
  source: '',
  description: '',
});

// 用户信息
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);

// 消息提示
const message = useMessage();

// 表单结构
  const schemas: FormSchema[] = [
    {
      field: 'crmName',
      component: 'Input',
      label: '客户名称',
      required: true,
      componentProps: {
        placeholder: '请输入客户名称',
        maxlength: 50,
      },
      rules: [
        { required: true, message: '请输入客户名称', trigger: 'blur' },
      ],
    },
    {
      field: 'crmNo',
      component: 'Input',
      label: '客户编号',
      required: true,
      componentProps: {
        placeholder: '请输入客户编号',
        maxlength: 20,
        disabled: isUpdate.value,
      },
      rules: [
        { required: true, message: '请输入客户编号', trigger: 'blur' },
      ],
    },
    {
      field: 'level',
      component: 'Select',
      label: '客户等级',
      required: true,
      componentProps: {
        placeholder: '请选择客户等级',
        options: levelOptions,
      },
      rules: [
        { required: true, message: '请选择客户等级', trigger: 'change' },
      ],
    },
    {
      field: 'ownerId',
      component: 'Select',
      label: '负责人',
      required: true,
      componentProps: {
        placeholder: '请选择负责人',
        options: userOptions.value,
      },
      rules: [
        { required: true, message: '请选择负责人', trigger: 'change' },
      ],
    },
    {
      field: 'contactName',
      component: 'Input',
      label: '联系人',
      componentProps: {
        placeholder: '请输入联系人',
        maxlength: 20,
      },
    },
    {
      field: 'contactPhone',
      component: 'Input',
      label: '联系电话',
      componentProps: {
        placeholder: '请输入联系电话',
        maxlength: 15,
      },
      rules: [
        {
          pattern: /^1[3-9]\d{9}$/,
          message: '请输入有效的手机号码',
          trigger: 'blur',
        },
      ],
    },
    {
      field: 'email',
      component: 'Input',
      label: '电子邮箱',
      componentProps: {
        placeholder: '请输入电子邮箱',
        maxlength: 50,
      },
      rules: [
        {
          pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
          message: '请输入有效的电子邮箱',
          trigger: 'blur',
        },
      ],
    },
    {
      field: 'address',
      component: 'Input',
      label: '地址',
      componentProps: {
        placeholder: '请输入地址',
        maxlength: 100,
      },
    },
    {
      field: 'website',
      component: 'Input',
      label: '网站',
      componentProps: {
        placeholder: '请输入网站',
        maxlength: 50,
      },
    },
    {
      field: 'industry',
      component: 'Select',
      label: '所属行业',
      componentProps: {
        placeholder: '请选择所属行业',
        options: industryOptions,
      },
    },
    {
      field: 'scale',
      component: 'Select',
      label: '企业规模',
      componentProps: {
        placeholder: '请选择企业规模',
        options: scaleOptions,
      },
    },
    {
      field: 'source',
      component: 'Select',
      label: '客户来源',
      componentProps: {
        placeholder: '请选择客户来源',
        options: sourceOptions,
      },
    },
  {
    field: 'description',
    component: 'TextArea',
    label: '客户描述',
    componentProps: {
      placeholder: '请输入客户描述',
      rows: 4,
      maxlength: 500,
    },
  },
];

// 加载用户列表
  const loadUserList = async () => {
    try {
      const result = await getUserList();
      userOptions.value = result.list || [];
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  // 打开模态框
  const open = async (params: { id?: string } = {}) => {
    visible.value = true;
    // 重置表单
    formRef.value?.resetFields();

    if (params.id) {
      // 加载详情
      try {
        loading.value = true;
        const detail = await getCustomerDetail(params.id);
        Object.assign(formData, detail);
      } catch (error) {
        message.error('获取客户详情失败');
        visible.value = false;
      } finally {
        loading.value = false;
      }
    } else {
      // 重置表单数据
      Object.keys(formData).forEach((key) => {
        formData[key] = '';
      });
      // 设置默认负责人为当前用户
      formData.ownerId = userInfo.value?.id || '';
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
        // 更新客户
        await updateCustomer(formData);
        message.success('编辑成功');
      } else {
        // 新增客户
        await addCustomer(formData);
        message.success('创建成功');
      }

      visible.value = false;
      emit('success');
    } catch (error) {
      message.error(isUpdate.value ? '编辑失败' : '创建失败');
    } finally {
      loading.value = false;
    }
  };

  // 处理取消
  const handleCancel = () => {
    visible.value = false;
    emit('cancel');
  };

  // 初始化
  onMounted(() => {
    loadUserList();
  });

  // 暴露方法
  defineExpose({
    open,
  });

// 重置表单
const resetForm = () => {
  formData.id = '';
  formData.crmName = '';
  formData.crmNo = '';
  formData.level = '';
  formData.ownerId = '';
  formData.contactName = '';
  formData.contactPhone = '';
  formData.email = '';
  formData.address = '';
  formData.website = '';
  formData.industry = '';
  formData.scale = '';
  formData.source = '';
  formData.description = '';

  formRef.value?.resetFields();
};

// 监听props变化
watch(
  () => props.id,
  (newVal) => {
    if (newVal && visible.value) {
      loadDetail(newVal);
    }
  }
);

// 导出组件方法
defineExpose({
  open,
});
</script>

<style scoped lang="scss">
@import './CustomerModal.scss';

// 组件样式类
.mt-4 {
  margin-top: 1rem;
}

// 覆盖部分组件样式
:deep(.ant-modal) {
  &.customer-modal {
    .ant-modal-content {
      border-radius: $border-radius-base;
    }
  }
}

:deep(.ant-form) {
  &.customer-form {
    .ant-form-item {
      margin-bottom: 16px;
    }
  }
}

:deep(.ant-btn) {
  &.customer-btn {
    min-width: 80px;
  }
}
</style>
// 自定义样式
.ant-modal-body {
  padding: 24px;
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-input,
.ant-select-selector,
.ant-input-textarea {
  border-radius: 4px;
}
</style>