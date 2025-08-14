<template>
  <ContentWrap class="invite-content-wrapper">
    <!-- 页面标题 -->
    <PageTitle title="活动邀约分享" sub-title="创建和分享活动邀约" />

    <!-- 表单区域 -->
    <div class="form-wrapper mt-4 bg-white p-6 rounded-lg shadow-md">
      <BasicForm
        @register="registerForm"
        :schemas="schemas"
        :labelWidth="120"
        :showActionButtonGroup="false"
      />

      <!-- 分享链接区域 -->
      <div class="share-link-wrapper mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-blue-700 font-medium">分享链接</span>
          <Button type="primary" size="small" @click="copyLink">复制链接</Button>
        </div>
        <Input
          v-model:value="shareLink"
          placeholder="生成的分享链接"
          readonly
          class="w-full"
        />
      </div>

      <!-- 按钮区域 -->
      <div class="btn-wrapper flex justify-end mt-6 space-x-3">
        <Button type="default" @click="handleCancel">取消</Button>
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useForm } from '@/components/Form';
import { usePermission } from '@/hooks/usePermission';
import { createInvite, getActivityList } from '@/api/crm/activity';
import { PageTitle, ContentWrap, BasicForm, Button, Input, Select, DatePicker } from '@/components';
import { copyText } from '@/utils/helper';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();

// 活动列表
const activityList = ref<any[]>([]);

// 分享链接
const shareLink = ref('');

// 表单数据
const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({
  labelWidth: 120,
  schemas: [
    {
      field: 'activityId',
      component: 'Select',
      label: '选择活动',
      required: true,
      componentProps: {
        options: activityList.value,
        placeholder: '请选择活动',
      },
    },
    {
      field: 'title',
      component: 'Input',
      label: '邀约标题',
      required: true,
      componentProps: {
        placeholder: '请输入邀约标题',
      },
      rules: [
        { required: true, message: '请输入邀约标题' },
        { max: 50, message: '标题长度不能超过50个字符' },
      ],
    },
    {
      field: 'startDate',
      component: 'DatePicker',
      label: '开始时间',
      required: true,
      componentProps: {
        placeholder: '请选择开始时间',
        type: 'date',
      },
    },
    {
      field: 'endDate',
      component: 'DatePicker',
      label: '结束时间',
      required: true,
      componentProps: {
        placeholder: '请选择结束时间',
        type: 'date',
      },
    },
    {
      field: 'description',
      component: 'Input',
      label: '邀约说明',
      componentProps: {
        placeholder: '请输入邀约说明',
        type: 'textarea',
        rows: 4,
      },
      rules: [
        { max: 200, message: '说明长度不能超过200个字符' },
      ],
    },
  ],
});

// 表单结构
const schemas = computed(() => [
  {
    field: 'activityId',
    component: 'Select',
    label: '选择活动',
    required: true,
    componentProps: {
      options: activityList.value,
      placeholder: '请选择活动',
    },
  },
  {
    field: 'title',
    component: 'Input',
    label: '邀约标题',
    required: true,
    componentProps: {
      placeholder: '请输入邀约标题',
    },
    rules: [
      { required: true, message: '请输入邀约标题' },
      { max: 50, message: '标题长度不能超过50个字符' },
    ],
  },
  {
    field: 'startDate',
    component: 'DatePicker',
    label: '开始时间',
    required: true,
    componentProps: {
      placeholder: '请选择开始时间',
      type: 'date',
    },
  },
  {
    field: 'endDate',
    component: 'DatePicker',
    label: '结束时间',
    required: true,
    componentProps: {
      placeholder: '请选择结束时间',
      type: 'date',
    },
  },
  {
    field: 'description',
    component: 'Input',
    label: '邀约说明',
    componentProps: {
      placeholder: '请输入邀约说明',
      type: 'textarea',
      rows: 4,
    },
    rules: [
      { max: 200, message: '说明长度不能超过200个字符' },
    ],
  },
]);

// 获取活动列表
const getActivityData = async () => {
  try {
    const res = await getActivityList();
    activityList.value = res.data.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    message.error('获取活动列表失败');
  }
};

// 复制链接
const copyLink = () => {
  if (!shareLink.value) {
    message.warning('请先提交生成分享链接');
    return;
  }
  copyText(shareLink.value);
  message.success('复制成功');
};

// 处理提交
const handleSubmit = async () => {
  try {
    const values = await validate();
    const res = await createInvite(values);
    shareLink.value = res.data.shareLink;
    message.success('创建成功');
  } catch (error) {
    message.error('创建失败');
  }
};

// 处理取消
const handleCancel = () => {
  resetFields();
  shareLink.value = '';
};

// 初始化
onMounted(() => {
  getActivityData();
});
</script>

<style scoped lang="scss">
// 自定义样式
.invite-content-wrapper {
  padding: 20px;
}

.form-wrapper {
  margin-top: 20px;
}

.share-link-wrapper {
  margin-top: 20px;
}

.btn-wrapper {
  margin-top: 20px;
}
</style>