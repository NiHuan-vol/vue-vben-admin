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
        <Select v-model:value="formData.type" style="width: 100%;">
          <SelectOption value="1">入库单</SelectOption>
          <SelectOption value="2">出库单</SelectOption>
          <SelectOption value="3">调拨单</SelectOption>
          <SelectOption value="4">盘点单</SelectOption>
        </Select>
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
import { saveInventory } from '@/api/inventory';

// 表单引用
const formRef = ref<any>(null);

// 表单数据
const formData = reactive({
  type: '',
  warehouseId: '',
  remark: '',
  details: [],
});

// 表单规则
const formRules = {
  type: [{ required: true, message: '请选择单据类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
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

// 处理提交
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate();
    // 设置加载状态
    confirmLoading.value = true;
    // 提交数据
    const res = await saveInventory(formData);
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