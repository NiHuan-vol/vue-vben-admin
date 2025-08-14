<template>
  <Modal
    v-model:visible="visible"
    title="分配客户"
    :width="600"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :destroyOnClose="true"
    :maskClosable="false"
    class="distribution-modal"
  >
    <BasicForm
      ref="formRef"
      :model="formData"
      :schemas="schemas"
      :labelWidth="100"
      :showActionButtonGroup="false"
      class="mt-4 distribution-form"
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useMessage } from '@vben/hooks/web/useMessage';
import { usePermission } from '@vben/hooks/web/usePermission';
import { Modal } from '@vben/components';
import { BasicForm, FormSchema } from '@vben/components/Table';
import { getCustomerDetail, distributeCustomer, getUserList } from '#/api/crm/customer';
import { useUserStore } from '#/store/modules/user';

// 定义props
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

// 定义emits
const emit = defineEmits(['success', 'cancel']);

// 表单引用
const formRef = ref<InstanceType<typeof BasicForm>>();

// 响应式数据
const visible = ref(false);
const loading = ref(false);
const formData = reactive<Recordable>({
  id: '',
  ownerId: '',
  remark: '',
});

// 下拉选项
const userOptions = ref<any[]>([]);

// 用户信息
const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo());

// 消息提示
const message = useMessage();
const { hasPermission } = usePermission();

// 表单结构
const schemas: FormSchema[] = [
  {
    field: 'ownerId',
    component: 'Select',
    label: '分配给',
    required: true,
    componentProps: {
      placeholder: '请选择负责人',
      options: userOptions.value,
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().includes(input.toLowerCase());
      },
    },
    rules: [
      { required: true, message: '请选择负责人', trigger: 'change' },
      {
        validator: (_, value) => {
          if (value === userInfo.value?.id) {
            return Promise.reject('不能分配给自己');
          }
          return Promise.resolve();
        },
        trigger: 'change',
      },
    ],
  },
  {
    field: 'remark',
    component: 'TextArea',
    label: '分配备注',
    componentProps: {
      placeholder: '请输入分配备注',
      rows: 4,
      maxlength: 500,
    },
  },
];

// 加载用户列表
const loadUserList = async () => {
  try {
    const result = await getUserList();
    // 过滤掉当前用户
    userOptions.value = (result.list || []).filter(
      (user: any) => user.id !== userInfo.value?.id
    );
  } catch (error) {
    message.error('获取用户列表失败');
  }
};

// 打开模态框
const open = async (params: { id: string }) => {
  visible.value = true;
  formRef.value?.resetFields();
  formData.id = params.id;

  try {
    // 可以加载客户详情，这里简化处理
    formData.ownerId = '';
    formData.remark = '';
  } catch (error) {
    message.error('获取客户信息失败');
    visible.value = false;
  }
};

// 处理提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    await distributeCustomer({
      id: formData.id,
      ownerId: formData.ownerId,
      remark: formData.remark,
    });

    message.success('分配成功');
    visible.value = false;
    emit('success');
  } catch (error) {
    message.error('分配失败');
  }
  finally {
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
</script>

<style scoped lang="scss">
// 引入自定义样式
@import './DistributionModal.scss';

.mt-4 {
  margin-top: 1rem;
}

// 覆盖部分组件样式
:deep(.ant-modal) {
  &.distribution-modal {
    .ant-modal-content {
      border-radius: $border-radius-base;
    }
  }
}

:deep(.ant-form) {
  &.distribution-form {
    .ant-form-item {
      margin-bottom: 16px;
    }
  }
}
</style>