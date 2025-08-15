<template>
  <BasicModal
    v-model:visible="visible"
    :title="title"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
  >
    <Form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <FormItem label="单据类型" name="type">
        <Select v-model:value="formData.type" style="width: 100%;" @change="handleTypeChange">
          <SelectOption value="1">入库单</SelectOption>
          <SelectOption value="2">出库单</SelectOption>
          <SelectOption value="3">调拨单</SelectOption>
          <SelectOption value="4">盘点单</SelectOption>
          <SelectOption value="5">委外入库单</SelectOption>
          <SelectOption value="6">委外出库单</SelectOption>
        </Select>
      </FormItem>

      <!-- 委外入库单特有字段 -->
      <FormItem v-if="formData.type === '5'" label="供应商" name="supplierId">
        <Select v-model:value="formData.supplierId" style="width: 100%;">
          <!-- 供应商选项将通过API加载 -->
        </Select>
      </FormItem>

      <FormItem v-if="formData.type === '5'" label="联系人" name="contactPerson">
        <Input v-model:value="formData.contactPerson" placeholder="请输入联系人" />
      </FormItem>

      <FormItem v-if="formData.type === '5'" label="联系电话" name="phone">
        <Input v-model:value="formData.phone" placeholder="请输入联系电话" />
      </FormItem>
      <FormItem label="仓库" name="warehouseId">
        <Select v-model:value="formData.warehouseId" style="width: 100%;">
          <!-- 仓库选项将通过API加载 -->
        </Select>
      </FormItem>
      <FormItem label="备注" name="remark">
        <Input.TextArea v-model:value="formData.remark" rows={4} />
      </FormItem>
      <FormItem label="单据明细">
        <BasicTable
          :columns="detailColumns"
          :dataSource="formData.details"
          :rowKey="(row) => row.id || row.index"
          :actionColumn="detailActionColumn"
        >
          <template #toolbar>
            <a-button type="primary" @click="handleAddDetail">添加明细</a-button>
          </template>
        </BasicTable>
      </FormItem>
    </Form>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { BasicModal, useModalInner } from '@/components/Modal';
import { Form, FormItem, Select, SelectOption, Input } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { saveInventory, saveDelegateIn, saveDelegateOut } from '@/api/inventory/bills';

// 表单引用
const formRef = ref<any>(null);

// 表单数据
const formData = reactive({
  type: '',
  warehouseId: '',
  remark: '',
  details: [],
  // 委外入库单特有字段
  supplierId: '',
  contactPerson: '',
  phone: '',
});

// 表单规则
const formRules = {
  type: [{ required: true, message: '请选择单据类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }],
};

// 明细表格列定义
const detailColumns = [
  { title: '商品编码', dataIndex: 'inventoryCode' },
  { title: '商品名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'specification' },
  { title: '单位', dataIndex: 'unitName' },
  { title: '数量', dataIndex: 'quantity' },
  { title: '单价', dataIndex: 'price' },
  { title: '金额', dataIndex: 'amount' },
];

// 明细操作列定义
const detailActionColumn = {
  width: 100,
  title: '操作',
  dataIndex: 'action',
  slots: {
    default: 'action',
  },
};

// 确认加载状态
const confirmLoading = ref(false);

// 使用模态框内部API
const { visible, title, emit } = useModalInner();

// 监听 visible 变化
watch(visible, (newVal) => {
  if (newVal) {
    // 重置表单
    formRef.value?.resetFields();
    // 清空明细
    formData.details = [];
  }
});

// 处理类型变更
const handleTypeChange = () => {
  // 清空委外入库单特有字段
  if (formData.type !== '5') {
    formData.supplierId = '';
    formData.contactPerson = '';
    formData.phone = '';
  }
};

// 处理提交
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate();
    // 设置加载状态
    confirmLoading.value = true;
    // 提交数据
    let res;
    if (formData.type === '5') {
      // 委外入库单
      res = await saveDelegateIn(formData);
    } else if (formData.type === '6') {
      // 委外出库单
      res = await saveDelegateOut(formData);
    } else {
      // 其他单据类型
      res = await saveInventory(formData);
    }
    if (res.success) {
      // 触发成功回调
      emit('success');
    }
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    // 重置加载状态
    confirmLoading.value = false;
  }
};

// 添加明细
const handleAddDetail = () => {
  formData.details.push({
    id: Date.now(),
    inventoryCode: '',
    inventoryName: '',
    specification: '',
    unitName: '',
    quantity: 1,
    price: 0,
    amount: 0,
  });
};

// 删除明细
const handleDeleteDetail = (index) => {
  formData.details.splice(index, 1);
};
</script>