<template>
  <Modal
    v-model:visible="visible"
    :title="activityId ? '编辑市场活动' : '新增市场活动'"
    :width="900"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <BasicForm @register="registerForm" :labelWidth="120">
      <!-- 基本信息 -->
      <FormItem label="市场活动名称" field="activityTitle" required>
        <Input v-model:value="formData.activityTitle" placeholder="请输入市场活动名称" />
      </FormItem>

      <FormItem label="类型" field="activityType" required>
        <Select v-model:value="formData.activityType" placeholder="请选择类型">
          <Option v-for="item in activityTypeList" :key="item.key" :value="item.key">
            {{ item.title }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="状态" field="activityState" required>
        <Select v-model:value="formData.activityState" placeholder="请选择状态">
          <Option v-for="item in activityStateList" :key="item.key" :value="item.key">
            {{ item.title }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="负责人" field="activityOwnerId" required>
        <Input v-model:value="formData.activityOwnerName" placeholder="请选择负责人" readonly />
        <Button slot="append" @click="openUserSelectModal">选择</Button>
      </FormItem>

      <FormItem label="开始时间" field="startTime" required>
        <DatePicker v-model:value="formData.startTime" type="datetime" placeholder="请选择开始时间" />
      </FormItem>

      <FormItem label="结束时间" field="endTime" required>
        <DatePicker v-model:value="formData.endTime" type="datetime" placeholder="请选择结束时间" :minDate="formData.startTime" />
      </FormItem>

      <FormItem label="预期收益(元)" field="anticipatedRevenue">
        <InputNumber
          v-model:value="formData.anticipatedRevenue"
          :min="0"
          placeholder="请输入预期收益"
          :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value) => value.replace(/\¥\s?|(,*)|(\s*)/g, '')"
        />
      </FormItem>

      <FormItem label="预算成本(元)" field="budgetCost">
        <InputNumber
          v-model:value="formData.budgetCost"
          :min="0"
          placeholder="请输入预算成本"
          :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value) => value.replace(/\¥\s?|(,*)|(\s*)/g, '')"
        />
      </FormItem>

      <FormItem label="实际成本(元)" field="actualCost">
        <InputNumber
          v-model:value="formData.actualCost"
          :min="0"
          placeholder="请输入实际成本"
          :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value) => value.replace(/\¥\s?|(,*)|(\s*)/g, '')"
        />
      </FormItem>

      <FormItem label="期望成功率(%)" field="expectedSuccessRate">
        <InputNumber
          v-model:value="formData.expectedSuccessRate"
          :min="0"
          :max="100"
          placeholder="请输入期望成功率"
          :formatter="(value) => `${value}%`"
          :parser="(value) => value.replace('%', '')"
        />
      </FormItem>
    </BasicForm>

    <!-- 商机标签页 -->
    <Tabs v-model:activeKey="activeKey" class="mt-4">
      <TabPane key="1" title="商机(非必填)">
        <div class="flex justify-between items-center mb-2">
          <Button type="danger" @click="removeBusiness">移除商机</Button>
          <Button type="primary" @click="openBusinessSelectModal">分配商机</Button>
        </div>
        <BasicTable
          :columns="businessColumns"
          :dataSource="businessData"
          :row-selection="{ selectedRowKeys: selectedBusinessKeys, onChange: handleBusinessSelectChange }"
          :pagination="false"
        />
      </TabPane>
    </Tabs>

    <!-- 选择用户模态框 -->
    <UserSelectModal v-model:visible="userSelectModalVisible" @select="handleUserSelect" />

    <!-- 选择商机模态框 -->
    <BusinessSelectModal v-model:visible="businessSelectModalVisible" @select="handleBusinessSelect" />
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useForm } from '@/components/Form';
import { useTable } from '@/components/Table';
import { getActivityDetail, saveActivity } from '@/api/crm/activity';
import { getBusinessList } from '@/api/crm/business';
import { Modal, BasicForm, FormItem, Input, Select, Option, Button, DatePicker, InputNumber, Tabs, TabPane, BasicTable } from '@/components';
import UserSelectModal from '@/components/Select/UserSelectModal.vue';
import BusinessSelectModal from '@/components/Select/BusinessSelectModal.vue';

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
  activityId: {
    type: String,
    default: '',
  },
});

// emit
const emit = defineEmits(['update:visible', 'success']);

// 表单数据
const formData = reactive<Record<string, any>>({
  id: '',
  activityTitle: '',
  activityType: '',
  activityState: '',
  activityOwnerId: '',
  activityOwnerName: '',
  startTime: '',
  endTime: '',
  anticipatedRevenue: 0,
  budgetCost: 0,
  actualCost: 0,
  expectedSuccessRate: 0,
});

// 注册表单
const [registerForm] = useForm({
  labelWidth: 120,
  schemas: [
    { field: 'activityTitle', label: '市场活动名称', component: 'Input', required: true },
    { field: 'activityType', label: '类型', component: 'Select', required: true },
    { field: 'activityState', label: '状态', component: 'Select', required: true },
    { field: 'activityOwnerId', label: '负责人', component: 'Input', required: true },
    { field: 'startTime', label: '开始时间', component: 'DatePicker', required: true },
    { field: 'endTime', label: '结束时间', component: 'DatePicker', required: true },
    { field: 'anticipatedRevenue', label: '预期收益(元)', component: 'InputNumber' },
    { field: 'budgetCost', label: '预算成本(元)', component: 'InputNumber' },
    { field: 'actualCost', label: '实际成本(元)', component: 'InputNumber' },
    { field: 'expectedSuccessRate', label: '期望成功率(%)', component: 'InputNumber' },
  ],
  initialValues: formData,
});

// 活动类型列表
const activityTypeList = ref<any[]>([
  { key: 'meeting', title: '会议' },
  { key: 'webinar', title: '网络研讨会' },
  { key: 'trade', title: '交易会' },
  { key: 'media', title: '公开媒介' },
  { key: 'partner', title: '合作伙伴' },
  { key: 'recommendation', title: '推举程序' },
  { key: 'advertisement', title: '广告' },
  { key: 'banner', title: '条幅广告' },
  { key: 'directMail', title: '直接邮件' },
  { key: 'email', title: '电子邮件' },
  { key: 'electronicMarket', title: '电子市场' },
  { key: 'other', title: '其它' },
]);

// 活动状态列表
const activityStateList = ref<any[]>([
  { key: 'planning', title: '计划中' },
  { key: 'active', title: '激活的' },
  { key: 'inactive', title: '非活跃' },
  { key: 'completed', title: '完成' },
]);

// 商机表格列
const businessColumns = ref([
  { title: '客户名称', key: 'crmName', width: 180 },
  { title: '商机名称', key: 'title', width: 180 },
  { title: '商机编号', key: 'code', width: 120 },
  { title: '负责人', key: 'ownerName', width: 100 },
  { title: '金额(元)', key: 'amount', width: 120 },
]);

// 商机数据
const businessData = ref<any[]>([]);
// 选中的商机
const selectedBusinessKeys = ref<string[]>([]);
// 当前激活的标签页
const activeKey = ref('1');
// 用户选择模态框可见性
const userSelectModalVisible = ref(false);
// 商机选择模态框可见性
const businessSelectModalVisible = ref(false);

// 监听activityId变化，加载详情
watch(
  () => props.activityId,
  (id) => {
    if (id && props.visible) {
      loadActivityDetail(id);
    } else if (!id) {
      // 清空表单
      Object.keys(formData).forEach((key) => {
        formData[key] = '';
      });
      formData.anticipatedRevenue = 0;
      formData.budgetCost = 0;
      formData.actualCost = 0;
      formData.expectedSuccessRate = 0;
      businessData.value = [];
    }
  },
  { immediate: true }
);

// 加载活动详情
async function loadActivityDetail(id: string) {
  try {
    const res = await getActivityDetail(id);
    if (res.success) {
      const data = res.data;
      // 填充表单数据
      Object.assign(formData, data);
      // 加载商机数据
      if (data.businesses && data.businesses.length > 0) {
        businessData.value = data.businesses;
      }
    }
  } catch (error) {
    message.error('加载活动详情失败');
  }
}

// 处理确定按钮
async function handleOk() {
  try {
    // 表单验证
    await registerForm.validate();

    // 准备提交数据
    const submitData = {
      ...formData,
      businessIds: businessData.value.map((item) => item.id),
    };

    // 提交保存
    const res = await saveActivity(submitData);
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

// 打开用户选择模态框
function openUserSelectModal() {
  userSelectModalVisible.value = true;
}

// 处理用户选择
function handleUserSelect(user: any) {
  formData.activityOwnerId = user.id;
  formData.activityOwnerName = user.name;
  userSelectModalVisible.value = false;
}

// 打开商机选择模态框
function openBusinessSelectModal() {
  businessSelectModalVisible.value = true;
}

// 处理商机选择
function handleBusinessSelect(businesses: any[]) {
  // 合并已选择的商机，避免重复
  const existingIds = new Set(businessData.value.map((item) => item.id));
  const newBusinesses = businesses.filter((item) => !existingIds.has(item.id));
  businessData.value = [...businessData.value, ...newBusinesses];
  businessSelectModalVisible.value = false;
}

// 处理商机选择变化
function handleBusinessSelectChange(keys: string[]) {
  selectedBusinessKeys.value = keys;
}

// 移除选中的商机
function removeBusiness() {
  if (selectedBusinessKeys.value.length === 0) {
    message.warning('请选择至少一条商机进行移除');
    return;
  }

  businessData.value = businessData.value.filter(
    (item) => !selectedBusinessKeys.value.includes(item.id)
  );
  selectedBusinessKeys.value = [];
  message.success('移除成功');
}
</script>

<style scoped lang="scss">
// 模态框样式
:deep(.n-modal-content) {
  padding: 20px;
}

// 标签页样式
:deep(.n-tabs) {
  margin-top: 20px;
}
</style>