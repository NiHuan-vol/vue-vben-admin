<template>
  <Modal
    v-model:visible="visible"
    :title="title"
    @ok="handleOk"
    @cancel="handleCancel"
    :width="unitType === 0 ? 450 : 800"
  >
    <template #footer>
      <div class="footer-buttons">
        <Button @click="handleCancel">取消</Button>
        <Button type="primary" @click="handleOk">确定</Button>
      </div>
    </template>

    <div v-if="unitType === 0">
      <!-- 单计量表单 -->
      <Form ref="formRef" :model="formData" :rules="rules" layout="vertical">
        <FormItem name="code" label="计量单位编码">
          <Input v-model:value="formData.code" placeholder="请输入计量单位编码" />
        </FormItem>
        <FormItem name="name" label="计量单位名称">
          <Input v-model:value="formData.name" placeholder="请输入计量单位名称" />
        </FormItem>
        <FormItem name="remarks" label="备注">
          <Input v-model:value="formData.remarks" placeholder="请输入备注" />
        </FormItem>
      </Form>
    </div>

    <div v-else>
      <!-- 多计量表单 -->
      <Form ref="formRef" :model="formData" layout="vertical">
        <FormItem name="code" label="计量单位组编码">
          <Input v-model:value="formData.code" placeholder="请输入计量单位组编码" />
        </FormItem>
        <FormItem name="name" label="计量单位组名称">
          <Input v-model:value="formData.name" placeholder="请输入计量单位组名称" />
        </FormItem>

        <div class="table-container">
          <BasicTable
            @register="registerTable"
            :columns="columns"
            :dataSource="unitsData"
            bordered
            :pagination="false"
          >
            <template #name="{ record, index }">
              <Input
                v-model:value="unitsData[index].name"
                placeholder="请输入计量单位名称"
                style="width: 120px"
              />
            </template>
            <template #isMainUnit="{ record, index }">
              <Radio
                v-model:checked="unitsData[index].isMainUnit"
                :disabled="isMainUnitSet && !unitsData[index].isMainUnit"
                @change="handleMainUnitChange(index)"
              >
                是
              </Radio>
            </template>
            <template #convertType="{ record, index }">
              <Select
                v-model:value="unitsData[index].convertType"
                placeholder="请选择换算类型"
                style="width: 100px"
              >
                <Option value="0">固定</Option>
                <Option value="1">浮动</Option>
              </Select>
            </template>
            <template #changeRate="{ record, index }">
              <Input
                v-model:value="unitsData[index].changeRate"
                type="number"
                placeholder="请输入换算率"
                style="width: 80px"
              />
            </template>
            <template #rateDescription="{ record, index }">
              <Input
                v-model:value="unitsData[index].rateDescription"
                placeholder="请输入换算说明"
                style="width: 150px"
              />
            </template>
            <template #isGroup="{ record, index }">
              <Radio v-model:checked="unitsData[index].isGroup">是</Radio>
            </template>
          </BasicTable>
        </div>

        <div class="add-button">
          <Button type="dashed" @click="addUnit" :icon="<PlusOutlined />">
            新增计量单位
          </Button>
        </div>
      </Form>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Modal, Form, Input, Button, Radio, Select, Option } from 'ant-design-vue';
import { BasicTable, useTable } from '@vben/components';
import { PlusOutlined } from '@ant-design/icons-vue';
import { useMessage } from '@vben/hooks';

const props = defineProps<{
  visible: boolean;
  unitType: number;
  initialValues?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'submit', values: any): void;
  (e: 'close'): void;
}>();

const message = useMessage();
const formRef = ref<typeof Form>();
const isMainUnitSet = ref(false);

// 表单数据
const formData = ref<Record<string, any>>({
  code: '',
  name: '',
  remarks: '',
});

// 多计量下的单位数据
const unitsData = ref<Record<string, any>[]>([]);

// 表单标题
const title = computed(() => props.initialValues?.id ? '修改计量单位' : '新增计量单位');

// 单计量表单规则
const rules = {
  code: [{ required: true, message: '请输入计量单位编码' }],
  name: [{ required: true, message: '请输入计量单位名称' }],
};

// 多计量表格列配置
const columns = [
  {
    title: '序号',
    dataIndex: 'key',
    width: 40,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '计量单位名称',
    dataIndex: 'name',
    width: 130,
    slots: { customRender: 'name' },
  },
  {
    title: '主计量',
    dataIndex: 'isMainUnit',
    width: 60,
    slots: { customRender: 'isMainUnit' },
  },
  {
    title: '换算类型',
    dataIndex: 'convertType',
    width: 100,
    slots: { customRender: 'convertType' },
  },
  {
    title: '换算率',
    dataIndex: 'changeRate',
    width: 80,
    slots: { customRender: 'changeRate' },
  },
  {
    title: '换算说明',
    dataIndex: 'rateDescription',
    width: 150,
    slots: { customRender: 'rateDescription' },
  },
  {
    title: '单位组合',
    dataIndex: 'isGroup',
    width: 80,
    slots: { customRender: 'isGroup' },
  },
];

const { registerTable } = useTable({
  columns,
  dataSource: unitsData,
  pagination: false,
});

// 监听初始值变化
watch(
  () => props.initialValues,
  (values) => {
    if (values) {
      // 填充表单数据
      formData.value = { ...values };

      // 如果是多计量，填充单位数据
      if (props.unitType === -1) {
        // 这里假设初始值中包含units字段，存储多计量的单位数据
        unitsData.value = values.units || [{
          key: 0,
          name: '',
          isMainUnit: false,
          convertType: '0',
          changeRate: '',
          rateDescription: '',
          isGroup: false,
        }];

        // 检查是否已经设置了主计量
        isMainUnitSet.value = unitsData.value.some((unit) => unit.isMainUnit);
      }
    } else {
      // 重置表单
      formData.value = {
        code: '',
        name: '',
        remarks: '',
      };

      if (props.unitType === -1) {
        unitsData.value = [{
          key: 0,
          name: '',
          isMainUnit: false,
          convertType: '0',
          changeRate: '',
          rateDescription: '',
          isGroup: false,
        }];
        isMainUnitSet.value = false;
      }
    }
  },
  { immediate: true },
);

// 处理主计量变更
const handleMainUnitChange = (index: number) => {
  // 如果当前设置为主计量，则取消其他行的主计量
  if (unitsData.value[index].isMainUnit) {
    unitsData.value.forEach((unit, i) => {
      if (i !== index) {
        unit.isMainUnit = false;
      }
    });
    isMainUnitSet.value = true;
  } else {
    // 检查是否还有其他主计量
    isMainUnitSet.value = unitsData.value.some((unit) => unit.isMainUnit);
  }
};

// 新增单位
const addUnit = () => {
  const newUnit = {
    key: unitsData.value.length,
    name: '',
    isMainUnit: false,
    convertType: '0',
    changeRate: '',
    rateDescription: '',
    isGroup: false,
  };
  unitsData.value = [...unitsData.value, newUnit];
};

// 提交表单
const handleOk = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validateFields();

    const submitData = {
      ...formData.value,
    };

    // 如果是多计量，添加单位数据
    if (props.unitType === -1) {
      // 检查是否设置了主计量
      const hasMainUnit = unitsData.value.some((unit) => unit.isMainUnit);
      if (!hasMainUnit) {
        message.warning('请设置主计量');
        return;
      }

      submitData.units = unitsData.value;
    }

    emit('submit', submitData);
  } catch (error) {
    // 表单验证失败
    message.error('表单验证失败，请检查填写内容');
  }
};

// 取消操作
const handleCancel = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.table-container {
  margin: 16px 0;
  max-height: 300px;
  overflow: auto;
}

.add-button {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>