<template>
  <BasicModal
    v-model:visible="visible"
    title="{{ isUpdate ? '编辑收货人信息' : '新增收货人信息' }}"
    :width="600"
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { BasicModal, BasicForm } from '/@/components/Modal';
import { FormSchema } from '/@/components/Table';
import { getConsigneeDetail, addConsignee, updateConsignee } from '/@/api/crm/consignee';
import { getCustomerList } from '/@/api/crm/customer';

// 定义props
interface ConsigneeModalProps {
  id?: string;
  customerId?: string;
}

// 组件参数
const props = withDefaults(defineProps<ConsigneeModalProps>(), {
  id: '',
  customerId: '',
});

// 定义emits
const emit = defineEmits(['success', 'close']);

// 表单引用
const formRef = ref<InstanceType<typeof BasicForm>>();

// 响应式数据
const visible = ref(false);
const isUpdate = ref(false);
const loading = ref(false);
const customers = ref<any[]>([]);
const formData = reactive<Record<string, any>>(
  {
    id: '',
    customerId: '',
    crmName: '',
    consignee: '',
    phone: '',
    mobile: '',
    consigneeAddress: '',
    remarks: '',
  }
);

// 消息提示
const message = useMessage();

// 表单结构
const schemas: FormSchema[] = [
  {
    field: 'customerId',
    component: 'Select',
    label: '客户名称',
    required: true,
    componentProps: {
      placeholder: '请选择客户',
      options: customers.value,
      disabled: !!props.customerId || isUpdate.value,
      onChange: (value: string) => {
        const customer = customers.value.find(item => item.value === value);
        if (customer) {
          formData.crmName = customer.label;
        }
      },
    },
  },
  {
    field: 'consignee',
    component: 'Input',
    label: '收货人',
    required: true,
    componentProps: {
      placeholder: '请输入收货人',
      maxlength: 50,
    },
  },
  {
    field: 'phone',
    component: 'Input',
    label: '联系电话',
    componentProps: {
      placeholder: '请输入联系电话',
      maxlength: 20,
    },
  },
  {
    field: 'mobile',
    component: 'Input',
    label: '手机号码',
    componentProps: {
      placeholder: '请输入手机号码',
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
    field: 'consigneeAddress',
    component: 'Input',
    label: '收货地址',
    required: true,
    componentProps: {
      placeholder: '请输入收货地址',
      maxlength: 200,
    },
  },
  {
    field: 'remarks',
    component: 'TextArea',
    label: '备注',
    componentProps: {
      placeholder: '请输入备注',
      rows: 4,
      maxlength: 500,
    },
  },
];

// 加载客户列表
const loadCustomerList = async () => {
  try {
    const result = await getCustomerList({ page: 1, pageSize: 1000 });
    customers.value = result.list?.map((item: any) => ({
      label: item.crmName,
      value: item.id,
    })) || [];
  } catch (error) {
    message.error('获取客户列表失败');
  }
};

// 打开模态框
const open = (params: ConsigneeModalProps = {}) => {
  // 重置表单
  resetForm();

  // 设置参数
  if (params.id) {
    isUpdate.value = true;
    formData.id = params.id;
    // 加载详情
    loadDetail(params.id);
  } else {
    isUpdate.value = false;
    if (params.customerId) {
      formData.customerId = params.customerId;
      // 根据customerId获取客户名称
      const customer = customers.value.find(item => item.value === params.customerId);
      if (customer) {
        formData.crmName = customer.label;
      }
    }
  }

  visible.value = true;
};

// 加载详情
const loadDetail = async (id: string) => {
  loading.value = true;
  try {
    const result = await getConsigneeDetail(id);
    // 填充表单数据
    Object.assign(formData, result);
  } catch (error) {
    message.error('获取收货人详情失败');
  } finally {
    loading.value = false;
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
      // 更新收货人
      await updateConsignee(formData);
      message.success('编辑成功');
    } else {
      // 新增收货人
      await addConsignee(formData);
      message.success('新增成功');
    }

    // 触发成功回调
    emit('success');

    // 关闭模态框
    visible.value = false;
  } catch (error) {
    message.error(isUpdate.value ? '编辑失败' : '新增失败');
  } finally {
    loading.value = false;
  }
};

// 处理取消
const handleCancel = () => {
  visible.value = false;
  emit('close');
};

// 重置表单
const resetForm = () => {
  formData.id = '';
  formData.customerId = props.customerId || '';
  formData.crmName = '';
  formData.consignee = '';
  formData.phone = '';
  formData.mobile = '';
  formData.consigneeAddress = '';
  formData.remarks = '';

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

// 初始化
onMounted(() => {
  loadCustomerList();
});

// 导出组件方法
defineExpose({
  open,
});
</script>

<style scoped lang="scss">
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