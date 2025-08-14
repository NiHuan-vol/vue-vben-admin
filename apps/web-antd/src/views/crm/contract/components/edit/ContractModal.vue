<template>
  <BasicModal
    v-model:visible="visible"
    title="{{ isUpdate ? '编辑合同' : '新增合同' }}"
    :width="950"
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
import { getContractDetail, addContract, updateContract } from '/@/api/crm/contract';
import { getContractTemplateDetail } from '/@/api/crm/contractTemplate';
import { getCustomerList } from '/@/api/crm/customer';

// 定义props
interface ContractModalProps {
  id?: string;
  templateId?: string;
}

// 组件参数
const props = withDefaults(defineProps<ContractModalProps>(), {
  id: '',
  templateId: '',
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
    contractCode: '',
    contractName: '',
    personCharge: '',
    crmCharge: '',
    contractPrice: 0,
    signingDate: '',
    beginDate: '',
    endDate: '',
    contractType: 1,
    executionStatus: 1,
    contractClause: '',
    paymentMethod: 1,
    paymentDate: '',
    paymentPrice: 0,
    remarks: '',
    content: '',
  }
);

// 消息提示
const message = useMessage();

// 表单结构
const schemas: FormSchema[] = [
  {
    field: 'contractCode',
    component: 'Input',
    label: '合同编码',
    required: true,
    componentProps: {
      placeholder: '请输入合同编码',
      maxlength: 50,
    },
  },
  {
    field: 'contractName',
    component: 'Input',
    label: '合同名称',
    required: true,
    componentProps: {
      placeholder: '请输入合同名称',
      maxlength: 100,
    },
  },
  {
    field: 'personCharge',
    component: 'Input',
    label: '我方签约人',
    required: true,
    componentProps: {
      placeholder: '请输入我方签约人',
      maxlength: 50,
    },
  },
  {
    field: 'crmCharge',
    component: 'Input',
    label: '客户方签约人',
    required: true,
    componentProps: {
      placeholder: '请输入客户方签约人',
      maxlength: 50,
    },
  },
  {
    field: 'contractPrice',
    component: 'InputNumber',
    label: '合同金额',
    required: true,
    componentProps: {
      placeholder: '请输入合同金额',
      min: 0,
      precision: 2,
    },
  },
  {
    field: 'signingDate',
    component: 'DatePicker',
    label: '签约时间',
    required: true,
    componentProps: {
      placeholder: '请选择签约时间',
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'beginDate',
    component: 'DatePicker',
    label: '生效时间',
    required: true,
    componentProps: {
      placeholder: '请选择生效时间',
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'endDate',
    component: 'DatePicker',
    label: '结束时间',
    required: true,
    componentProps: {
      placeholder: '请选择结束时间',
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'contractType',
    component: 'Select',
    label: '合同类型',
    required: true,
    componentProps: {
      placeholder: '请选择合同类型',
      options: [
        { label: '产品销售', value: 1 },
        { label: '服务', value: 2 },
        { label: '业务合作', value: 3 },
        { label: '代理分销', value: 4 },
        { label: '其它', value: 5 },
      ],
    },
  },
  {
    field: 'executionStatus',
    component: 'Select',
    label: '执行状态',
    required: true,
    componentProps: {
      placeholder: '请选择执行状态',
      options: [
        { label: '执行中', value: 1 },
        { label: '结束', value: 2 },
        { label: '意外中止', value: 3 },
      ],
    },
  },
  {
    field: 'contractClause',
    component: 'Input',
    label: '合同条款',
    required: true,
    componentProps: {
      placeholder: '请输入合同条款',
      maxlength: 200,
    },
  },
  {
    field: 'paymentMethod',
    component: 'Select',
    label: '付款方式',
    required: true,
    componentProps: {
      placeholder: '请选择付款方式',
      options: [
        { label: '汇票', value: 1 },
        { label: '现金', value: 2 },
        { label: '银行转帐', value: 3 },
        { label: '其它', value: 4 },
      ],
    },
  },
  {
    field: 'paymentDate',
    component: 'DatePicker',
    label: '付款时间',
    required: true,
    componentProps: {
      placeholder: '请选择付款时间',
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'paymentPrice',
    component: 'InputNumber',
    label: '付款金额',
    required: true,
    componentProps: {
      placeholder: '请输入付款金额',
      min: 0,
      precision: 2,
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
  {
    field: 'content',
    component: 'Editor',
    label: '合同内容',
    required: true,
    componentProps: {
      placeholder: '请输入合同内容',
    },
  },
];

// 打开模态框
const open = (params: ContractModalProps = {}) => {
  // 重置表单
  resetForm();

  // 设置参数
  if (params.id) {
    isUpdate.value = true;
    formData.id = params.id;
    // 加载详情
    loadDetail(params.id);
  } else if (params.templateId) {
    isUpdate.value = false;
    // 加载模板详情
    loadTemplateDetail(params.templateId);
  } else {
    isUpdate.value = false;
  }

  visible.value = true;
};

// 加载详情
const loadDetail = async (id: string) => {
  loading.value = true;
  try {
    const result = await getContractDetail(id);
    // 填充表单数据
    Object.assign(formData, result);
  } catch (error) {
    message.error('获取合同详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载模板详情
const loadTemplateDetail = async (templateId: string) => {
  loading.value = true;
  try {
    const result = await getContractTemplateDetail(templateId);
    // 填充表单数据
    Object.assign(formData, result);
  } catch (error) {
    message.error('获取模板详情失败');
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
      // 更新合同
      await updateContract(formData);
      message.success('编辑成功');
    } else {
      // 新增合同
      await addContract(formData);
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
  formData.contractCode = '';
  formData.contractName = '';
  formData.personCharge = '';
  formData.crmCharge = '';
  formData.contractPrice = 0;
  formData.signingDate = '';
  formData.beginDate = '';
  formData.endDate = '';
  formData.contractType = 1;
  formData.executionStatus = 1;
  formData.contractClause = '';
  formData.paymentMethod = 1;
  formData.paymentDate = '';
  formData.paymentPrice = 0;
  formData.remarks = '';
  formData.content = '';

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

// 监听templateId变化
watch(
  () => props.templateId,
  (newVal) => {
    if (newVal && visible.value) {
      loadTemplateDetail(newVal);
    }
  }
);

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
.ant-input-number,
.ant-picker,
.ant-input-textarea {
  border-radius: 4px;
}
</style>