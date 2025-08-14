<template>
  <Modal
    v-model:visible="visible"
    :title="businessId ? '编辑商机管理' : '新增商机管理'"
    :width="900"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <!-- 警告提示 -->
    <Alert v-if="showWarning" message="商机客户在线索公海，请领用/分配后修改" type="warning" show-icon class="mb-4" />

    <!-- 基本信息 -->
    <BasicForm @register="registerForm" :labelWidth="120">
      <FormItem label="客户名称" field="crmId" required v-if="!customerId">
        <Select
          v-model:value="formData.crmId"
          placeholder="请选择客户"
          :showSearch="true"
          :filterOption="false"
          @search="handleCustomerSearch"
        >
          <Option v-for="item in customerList" :key="item.id" :value="item.id">
            {{ item.name }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="客户名称" field="crmName" v-else>
        <Input v-model:value="formData.crmName" readonly />
      </FormItem>

      <FormItem label="商机编号" field="projectNo" v-if="businessId">
        <Input v-model:value="formData.projectNo" readonly />
      </FormItem>

      <FormItem label="商机名称" field="businessTitle" required>
        <Input v-model:value="formData.businessTitle" placeholder="请输入商机名称" />
      </FormItem>

      <FormItem label="销售阶段" field="saleStage" required>
        <Select v-model:value="formData.saleStage" placeholder="请选择销售阶段">
          <Option v-for="item in saleStageList" :key="item.key" :value="item.key">
            {{ item.title }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="状态" field="goingStatus" required>
        <Select v-model:value="formData.goingStatus" placeholder="请选择状态">
          <Option v-for="item in statusList" :key="item.key" :value="item.key">
            {{ item.title }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="输单原因" field="loseReason" v-if="formData.goingStatus === '输单'">
        <Input v-model:value="formData.loseReason" placeholder="请输入输单原因" />
      </FormItem>

      <FormItem label="负责人" field="ownerId" required>
        <Select
          v-model:value="formData.ownerId"
          placeholder="请选择负责人"
          :showSearch="true"
          :filterOption="false"
          @search="handleUserSearch"
        >
          <Option v-for="item in userList" :key="item.id" :value="item.id">
            {{ item.name }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="预计成交日期" field="expectedDate" required>
        <DatePicker v-model:value="formData.expectedDate" type="date" placeholder="请选择预计成交日期" />
      </FormItem>

      <FormItem label="预计金额(元)" field="expectedAmount" required>
        <InputNumber
          v-model:value="formData.expectedAmount"
          :min="0"
          placeholder="请输入预计金额"
          :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value) => value.replace(/\¥\s?|(,*)|(\s*)/g, '')"
        />
      </FormItem>
    </BasicForm>

    <!-- 销售阶段进度 -->
    <div class="sale-stage mt-6 mb-4">
      <h3 class="font-bold mb-2">销售阶段进度</h3>
      <Steps :current="currentStep" type="navigation" @change="handleStepChange">
        <Step v-for="(item, index) in saleStageList" :key="index" :title="item.title" />
      </Steps>
    </div>

    <!-- 动态表单内容 -->
    <CollapseContainer title="详细信息" :isExpand="true" class="mt-4">
      <!-- 这里可以根据实际需求添加动态表单内容 -->
      <div class="dynamic-form-content">
        <!-- 动态表单字段将根据配置渲染 -->
      </div>
    </CollapseContainer>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useForm } from '@/components/Form';
import { getBusinessDetail, saveBusiness, getCustomerList, getUserList } from '@/api/crm/business';
import { Modal, BasicForm, FormItem, Input, Select, Option, Button, DatePicker, InputNumber, Steps, Step, Alert, CollapseContainer } from '@/components';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();

// props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  businessId: {
    type: String,
    default: '',
  },
  customerId: {
    type: String,
    default: '',
  },
});

// emit
const emit = defineEmits(['update:visible', 'success']);

// 表单数据
const formData = reactive<Record<string, any>>({
  id: '',
  crmId: '',
  crmName: '',
  projectNo: '',
  businessTitle: '',
  saleStage: '',
  goingStatus: '',
  loseReason: '',
  ownerId: '',
  ownerName: '',
  expectedDate: '',
  expectedAmount: 0,
});

// 注册表单
const [registerForm] = useForm({
  labelWidth: 120,
  schemas: [
    { field: 'crmId', label: '客户名称', component: 'Select', required: true },
    { field: 'crmName', label: '客户名称', component: 'Input' },
    { field: 'projectNo', label: '商机编号', component: 'Input' },
    { field: 'businessTitle', label: '商机名称', component: 'Input', required: true },
    { field: 'saleStage', label: '销售阶段', component: 'Select', required: true },
    { field: 'goingStatus', label: '状态', component: 'Select', required: true },
    { field: 'loseReason', label: '输单原因', component: 'Input' },
    { field: 'ownerId', label: '负责人', component: 'Select', required: true },
    { field: 'expectedDate', label: '预计成交日期', component: 'DatePicker', required: true },
    { field: 'expectedAmount', label: '预计金额(元)', component: 'InputNumber', required: true },
  ],
  initialValues: formData,
});

// 销售阶段列表
const saleStageList = ref<any[]>([
  { key: 'preliminary', title: '初步接触' },
  { key: 'requirement', title: '需求确认' },
  { key: 'proposal', title: '方案制定' },
  { key: 'quotation', title: '商务报价' },
  { key: 'negotiation', title: '谈判阶段' },
  { key: 'closing', title: '成交阶段' },
]);

// 状态列表
const statusList = ref<any[]>([
  { key: '进行中', title: '进行中' },
  { key: '赢单', title: '赢单' },
  { key: '输单', title: '输单' },
]);

// 当前步骤
const currentStep = ref(0);
// 客户列表
const customerList = ref<any[]>([]);
// 用户列表
const userList = ref<any[]>([]);
// 显示警告
const showWarning = ref(false);

// 监听businessId变化，加载详情
watch(
  () => props.businessId,
  (id) => {
    if (id && props.visible) {
      loadBusinessDetail(id);
    } else if (!id) {
      // 清空表单
      Object.keys(formData).forEach((key) => {
        formData[key] = '';
      });
      formData.expectedAmount = 0;
      currentStep.value = 0;
      showWarning.value = false;

      // 如果传入了customerId，加载客户信息
      if (props.customerId) {
        loadCustomerInfo(props.customerId);
      }
    }
  },
  { immediate: true }
);

// 监听销售阶段变化，更新步骤
watch(
  () => formData.saleStage,
  (stage) => {
    const index = saleStageList.value.findIndex(item => item.key === stage);
    if (index !== -1) {
      currentStep.value = index;
    }
  }
);

// 加载商机详情
async function loadBusinessDetail(id: string) {
  try {
    const res = await getBusinessDetail(id);
    if (res.success) {
      const data = res.data;
      // 填充表单数据
      Object.assign(formData, data);
      // 设置当前步骤
      const index = saleStageList.value.findIndex(item => item.key === data.saleStage);
      if (index !== -1) {
        currentStep.value = index;
      }
      // 检查是否需要显示警告
      showWarning.value = !data.crmType;
    }
  } catch (error) {
    message.error('加载商机详情失败');
  }
}

// 加载客户信息
async function loadCustomerInfo(id: string) {
  try {
    const res = await getCustomerList({ id });
    if (res.success && res.data.length > 0) {
      const customer = res.data[0];
      formData.crmId = customer.id;
      formData.crmName = customer.name;
    }
  } catch (error) {
    message.error('加载客户信息失败');
  }
}

// 处理客户搜索
async function handleCustomerSearch(keyword: string) {
  try {
    const res = await getCustomerList({ name: keyword });
    if (res.success) {
      customerList.value = res.data;
    }
  } catch (error) {
    message.error('搜索客户失败');
  }
}

// 处理用户搜索
async function handleUserSearch(keyword: string) {
  try {
    const res = await getUserList({ name: keyword });
    if (res.success) {
      userList.value = res.data;
    }
  } catch (error) {
    message.error('搜索用户失败');
  }
}

// 处理步骤变化
function handleStepChange(step: number) {
  currentStep.value = step;
  formData.saleStage = saleStageList.value[step].key;
}

// 处理确定按钮
async function handleOk() {
  try {
    // 表单验证
    await registerForm.validate();

    // 准备提交数据
    const submitData = { ...formData };

    // 提交保存
    const res = await saveBusiness(submitData);
    if (res.success) {
      message.success('保存成功');
      emit('success');
      handleCancel();
    }
  } catch (error) {
    // 表单验证失败或提交失败
    message.error('保存失败，请检查表单数据');
  }
}

// 处理取消按钮
function handleCancel() {
  emit('update:visible', false);
}

// 初始化
onMounted(() => {
  // 如果传入了customerId，加载客户信息
  if (props.customerId && !props.businessId) {
    loadCustomerInfo(props.customerId);
  }
});
</script>

<style scoped lang="scss">
// 模态框样式
:deep(.n-modal-content) {
  padding: 20px;
}

// 销售阶段样式
.sale-stage {
  :deep(.n-steps-navigation) {
    padding: 10px 0;
  }
}

// 动态表单内容样式
.dynamic-form-content {
  padding: 10px 0;
}
</style>