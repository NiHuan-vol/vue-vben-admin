<template>
  <Modal
    v-model:visible="visible"
    :title="title"
    :width="800"
    :footer="null"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <BasicForm
      ref="formRef"
      :model="formData"
      :schemas="schemas"
      :labelWidth="120"
      @register="registerForm"
    />

    <div class="flex justify-end mt-4 gap-2">
      <Button @click="handleCancel">取消</Button>
      <Button type="primary" @click="handleOk" :loading="loading">确认</Button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useModal } from '/@/components/Modal';
import { useForm } from '/@/components/Form';
import { Button, Modal } from 'ant-design-vue';
import { BasicForm } from '/@/components/Table';
import { saveFinance, getFinanceDetail } from '/@/api/crm/finance';
import { useMessage } from '/@/hooks/web/useMessage';

export default {
  components: {
    Modal,
    BasicForm,
    Button,
  },
};

// 表单注册
const [registerForm, { formRef, validate, resetFields }] = useForm();

// 模态框控制
const visible = ref(false);
const title = ref('新增财务信息');
const loading = ref(false);
const id = ref('');
const message = useMessage();

// 表单数据
const formData = reactive({
  crmId: '',
  crmName: '',
  financialType: 'receivable',
  amount: 0,
  remark: '',
  status: 'normal',
});

// 表单结构
const schemas = [
  {
    field: 'crmName',
    component: 'Input',
    label: '客户名称',
    componentProps: {
      placeholder: '请输入客户名称',
      readonly: true,
    },
    required: true,
  },
  {
    field: 'financialType',
    component: 'Select',
    label: '财务类型',
    componentProps: {
      placeholder: '请选择财务类型',
      options: [
        { label: '应收账款', value: 'receivable' },
        { label: '应付账款', value: 'payable' },
        { label: '其他', value: 'other' },
      ],
    },
    required: true,
  },
  {
    field: 'amount',
    component: 'InputNumber',
    label: '金额',
    componentProps: {
      placeholder: '请输入金额',
      min: 0,
      precision: 2,
    },
    required: true,
  },
  {
    field: 'remark',
    component: 'TextArea',
    label: '备注',
    componentProps: {
      placeholder: '请输入备注',
      rows: 4,
    },
  },
  {
    field: 'status',
    component: 'Select',
    label: '状态',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '正常', value: 'normal' },
        { label: '禁用', value: 'disabled' },
      ],
    },
    required: true,
  },
];

// 打开模态框
const open = async (params?: { id: string }) => {
  visible.value = true;
  resetFields();

  if (params?.id) {
    id.value = params.id;
    title.value = '编辑财务信息';
    loading.value = true;
    try {
      const result = await getFinanceDetail({ id: id.value });
      Object.assign(formData, result.data);
    } catch (error) {
      message.error('获取财务信息详情失败');
    } finally {
      loading.value = false;
    }
  } else {
    id.value = '';
    title.value = '新增财务信息';
    // 清空表单数据
    Object.keys(formData).forEach((key) => {
      formData[key as keyof typeof formData] = '' as any;
    });
    formData.financialType = 'receivable';
    formData.status = 'normal';
  }
};

// 关闭模态框
const handleCancel = () => {
  visible.value = false;
};

// 处理确定按钮
const handleOk = async () => {
  try {
    // 表单验证
    await validate();

    loading.value = true;
    const params = { ...formData };

    if (id.value) {
      // 编辑操作
      params.id = id.value;
      await saveFinance(params);
      message.success('编辑成功');
    } else {
      // 新增操作
      await saveFinance(params);
      message.success('新增成功');
    }

    visible.value = false;
    // 触发成功回调
    emits('success');
  } catch (error) {
    // 验证失败或保存失败
    console.error('保存失败:', error);
  } finally {
    loading.value = false;
  }
};

// 定义emits
const emits = defineEmits(['success']);

// 暴露方法
defineExpose({
  open,
});
</script>

<style scoped lang="scss">
.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 1rem;
}

gap-2 {
  gap: 0.5rem;
}
</style>