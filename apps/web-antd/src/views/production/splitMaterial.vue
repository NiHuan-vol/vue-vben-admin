<template>
  <Modal
    v-model:visible={visible}
    title={t('production.splitMaterial.title')}
    width={800}
    @cancel={handleCancel}
    @ok={handleOk}
    :destroyOnClose={true}
  >
    <div class="split-material-modal">
      <!-- 物料信息 -->
      <div class="material-info mb-4">
        <Space size="large">
          <Tag>{{ t('production.splitMaterial.materialCode') }}</Tag>
          <span>{{ formData.inventoryCode }}</span>
          <Tag>{{ t('production.splitMaterial.materialName') }}</Tag>
          <span>{{ formData.inventoryName }}</span>
          <Tag>{{ t('production.splitMaterial.specification') }}</Tag>
          <span>{{ formData.inventorySpecification }}</span>
        </Space>
      </div>

      <!-- 表单信息 -->
      <Form ref="formRef" :model="formData" layout="vertical" class="mb-4">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <FormItem label={t('production.splitMaterial.businessPlan')} name="bussessPlan">
              <Input v-model:value={formData.bussessPlan} disabled />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={t('production.splitMaterial.leadTime')} name="productionLeadTime">
              <Input v-model:value={formData.productionLeadTime} disabled />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={t('production.splitMaterial.suggestedQuantity')} name="baseQuantity">
              <Input v-model:value={formData.baseQuantity} disabled />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={t('production.splitMaterial.releasedQuantity')} name="releasedQuantity">
              <Input v-model:value={formData.releasedQuantity} disabled />
            </FormItem>
          </Col>
        </Row>
      </Form>

      <!-- 拆分信息表头 -->
      <div class="split-header flex items-center mb-2">
        <div class="w-1/4 font-medium">{{ t('production.splitMaterial.startDate') }} <span class="required">*</span></div>
        <div class="w-1/4 font-medium">{{ t('production.splitMaterial.endDate') }} <span class="required">*</span></div>
        <div class="w-1/4 font-medium">{{ t('production.splitMaterial.splitQuantity') }} <span class="required">*</span></div>
        <div class="w-1/4"></div>
      </div>

      <!-- 拆分信息列表 -->
      <div class="split-items">
        <div v-for="(item, index) in splitItems" :key="index" class="split-item flex items-center mb-2">
          <div class="w-1/4">
            <DatePicker
              v-model:value={item.planBeginDate}
              format="YYYY-MM-DD"
              @change={(date, dateString) => handleStartDateChange(dateString, index)}
            />
          </div>
          <div class="w-1/4">
            <DatePicker
              v-model:value={item.planEndDate}
              format="YYYY-MM-DD"
              @change={(date, dateString) => handleEndDateChange(dateString, index)}
            />
          </div>
          <div class="w-1/4">
            <InputNumber
              v-model:value={item.baseQuantity}
              :min={0}
              :precision={2}
              @change={(value) => handleQuantityChange(value, index)}
            />
          </div>
          <div class="w-1/4 flex justify-center">
            <Space>
              <Button
                type="text"
                icon={<PlusOutlined />}
                @click={handleAddItem}
                v-if={index === splitItems.length - 1 && residueNum > 0}
              />
              <Button
                type="text"
                icon={<MinusOutlined />}
                @click={() => handleDeleteItem(index)}
                v-if={index > 0}
              />
            </Space>
          </div>
        </div>
      </div>

      <!-- 剩余数量信息 -->
      <div class="residue-info mt-4 text-right">
        <span class="font-medium">{{ t('production.splitMaterial.residueQuantity') }}: </span>
        <span :class="residueNum !== 0 ? 'text-red-500' : 'text-green-500'">{{ residueNum }}</span>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal, Form, Input, DatePicker, InputNumber, Button, Tag, Space } from 'ant-design-vue';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import { useMessage } from '/@/hooks/web/useMessage';

// 类型定义
interface SplitItem {
  planBeginDate: string;
  planEndDate: string;
  baseQuantity: number;
}

interface FormData {
  inventoryCode: string;
  inventoryName: string;
  inventorySpecification: string;
  bussessPlan: string;
  productionLeadTime: number;
  baseQuantity: number;
  releasedQuantity: number;
}

// 国际化
const { t } = useI18n();
const { createMessage } = useMessage();

// Props
const props = defineProps<{
  splitData: FormData;
  visible: boolean;
}>();

// Emit
const emit = defineEmits<{
  (e: 'close', value: boolean): void;
  (e: 'splitSubmit', value: SplitItem[]): void;
}>();

// 响应式数据
const formRef = ref<any>(null);
const splitItems = ref<SplitItem[]>([]);
const residueNum = ref<number>(0);

// 表单数据
const formData = reactive<FormData>({
  inventoryCode: '',
  inventoryName: '',
  inventorySpecification: '',
  bussessPlan: '',
  productionLeadTime: 0,
  baseQuantity: 0,
  releasedQuantity: 0,
});

// 生命周期
onMounted(() => {
  initFormData();
});

// 监听visible变化
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      initFormData();
    }
  }
);

// 监听splitItems变化计算剩余数量
watch(
  splitItems,
  (newValue) => {
    const total = newValue.reduce((sum, item) => sum + Number(item.baseQuantity || 0), 0);
    residueNum.value = formData.baseQuantity - total;
  },
  { deep: true }
);

// 方法
const initFormData = () => {
  // 复制传入的数据
  Object.assign(formData, { ...props.splitData });

  // 计算剩余数量
  residueNum.value = formData.baseQuantity - (formData.releasedQuantity || 0);

  // 初始化拆分项
  splitItems.value = [
    {
      planBeginDate: formData.productionLeadTime ? calculateDate(formData.productionLeadTime) : '',
      planEndDate: formData.productionLeadTime ? calculateDate(0) : '',
      baseQuantity: residueNum.value,
    },
  ];
};

// 计算日期（根据提前期）
const calculateDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const handleStartDateChange = (dateString: string, index: number) => {
  splitItems.value[index].planBeginDate = dateString;
};

const handleEndDateChange = (dateString: string, index: number) => {
  splitItems.value[index].planEndDate = dateString;
};

const handleQuantityChange = (value: number, index: number) => {
  splitItems.value[index].baseQuantity = value || 0;
};

const handleAddItem = () => {
  splitItems.value.push({
    planBeginDate: splitItems.value[0].planBeginDate,
    planEndDate: splitItems.value[0].planEndDate,
    baseQuantity: residueNum.value,
  });
};

const handleDeleteItem = (index: number) => {
  splitItems.value.splice(index, 1);
};

const handleCancel = () => {
  emit('close', false);
};

const handleOk = () => {
  // 验证所有拆分项
  for (const item of splitItems.value) {
    if (!item.planBeginDate) {
      createMessage.warning(t('production.splitMaterial.startDateRequired'));
      return;
    }
    if (!item.planEndDate) {
      createMessage.warning(t('production.splitMaterial.endDateRequired'));
      return;
    }
    if (item.baseQuantity <= 0) {
      createMessage.warning(t('production.splitMaterial.quantityRequired'));
      return;
    }
  }

  // 验证剩余数量
  if (residueNum.value !== 0) {
    createMessage.warning(t('production.splitMaterial.quantityNotMatch'));
    return;
  }

  // 准备提交数据
  const submitData = splitItems.value.map((item, index) => ({
    ...props.splitData,
    id: index === 0 ? props.splitData.baseQuantity : undefined,
    releasedQuantity: index === 0 ? props.splitData.releasedQuantity : 0,
    ...item,
  }));

  // 提交数据
  emit('splitSubmit', submitData);
  emit('close', false);
};
</script>

<style lang="less">
.split-material-modal {
  .material-info {
    padding: 10px 0;
  }

  .split-header {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .split-item {
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;
  }

  .required {
    color: #ff4d4f;
  }

  .residue-info {
    padding: 10px 0;
    font-size: 14px;
  }

  .ant-form-item {
    margin-bottom: 16px;
  }
}
</style>