<template>
  <div class="component-editor">
    <div class="editor-title font-medium mb-4">{{ getComponentTitle(type) }} 属性编辑</div>

    <BasicForm
      @register="registerForm"
      :schemas="formSchemas"
      :labelWidth="80"
      :model="data"
      @finish="handleFinish"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useForm } from '@/components/Form';
import { BasicForm } from '@/components';

// Props
const props = defineProps({
  type: String,
  data: Object,
});

// Emit
const emit = defineEmits(['update']);

// 表单数据
const formData = ref<Record<string, any>>({});

// 组件标题映射
const componentTitles = {
  title: '标题',
  image: '图片',
  text: '文本',
  input: '单行输入',
  textarea: '多行输入',
  select: '下拉选择',
  datePicker: '日期选择',
  radio: '单选框组',
  checkbox: '复选框组',
  contactSelect: '联系人选择',
  customerSelect: '客户选择',
};

// 获取组件标题
const getComponentTitle = (type: string) => {
  return componentTitles[type as keyof typeof componentTitles] || '组件';
};

// 表单结构
const formSchemas = computed(() => {
  switch (props.type) {
    case 'title':
      return [
        {
          field: 'text',
          component: 'Input',
          label: '标题文本',
          required: true,
          componentProps: {
            placeholder: '请输入标题文本',
          },
        },
        {
          field: 'level',
          component: 'Select',
          label: '标题级别',
          required: true,
          componentProps: {
            options: [
              { label: '1级', value: 1 },
              { label: '2级', value: 2 },
              { label: '3级', value: 3 },
            ],
          },
        },
        {
          field: 'align',
          component: 'Select',
          label: '对齐方式',
          required: true,
          componentProps: {
            options: [
              { label: '左对齐', value: 'left' },
              { label: '居中', value: 'center' },
              { label: '右对齐', value: 'right' },
            ],
          },
        },
        {
          field: 'color',
          component: 'Input',
          label: '文字颜色',
          required: true,
          componentProps: {
            placeholder: '请输入颜色值，如 #000000',
          },
        },
        {
          field: 'fontSize',
          component: 'InputNumber',
          label: '字体大小',
          required: true,
          componentProps: {
            min: 12,
            max: 36,
            step: 1,
          },
        },
      ];
    case 'image':
      return [
        {
          field: 'src',
          component: 'Input',
          label: '图片URL',
          required: true,
          componentProps: {
            placeholder: '请输入图片URL',
          },
        },
        {
          field: 'alt',
          component: 'Input',
          label: '替代文本',
          componentProps: {
            placeholder: '请输入替代文本',
          },
        },
        {
          field: 'width',
          component: 'Input',
          label: '宽度',
          required: true,
          componentProps: {
            placeholder: '请输入宽度，如 100% 或 300px',
          },
        },
        {
          field: 'height',
          component: 'Input',
          label: '高度',
          componentProps: {
            placeholder: '请输入高度，如 auto 或 200px',
          },
        },
      ];
    case 'text':
      return [
        {
          field: 'content',
          component: 'Input',
          label: '文本内容',
          required: true,
          componentProps: {
            placeholder: '请输入文本内容',
            type: 'textarea',
            rows: 4,
          },
        },
        {
          field: 'fontSize',
          component: 'InputNumber',
          label: '字体大小',
          required: true,
          componentProps: {
            min: 12,
            max: 24,
            step: 1,
          },
        },
        {
          field: 'color',
          component: 'Input',
          label: '文字颜色',
          required: true,
          componentProps: {
            placeholder: '请输入颜色值，如 #333333',
          },
        },
      ];
    case 'input':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'placeholder',
          component: 'Input',
          label: '占位符',
          componentProps: {
            placeholder: '请输入占位符',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
        {
          field: 'maxLength',
          component: 'InputNumber',
          label: '最大长度',
          required: true,
          componentProps: {
            min: 1,
            max: 200,
            step: 1,
          },
        },
      ];
    case 'textarea':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'placeholder',
          component: 'Input',
          label: '占位符',
          componentProps: {
            placeholder: '请输入占位符',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
        {
          field: 'rows',
          component: 'InputNumber',
          label: '行数',
          required: true,
          componentProps: {
            min: 2,
            max: 10,
            step: 1,
          },
        },
        {
          field: 'maxLength',
          component: 'InputNumber',
          label: '最大长度',
          required: true,
          componentProps: {
            min: 1,
            max: 500,
            step: 1,
          },
        },
      ];
    case 'select':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'placeholder',
          component: 'Input',
          label: '占位符',
          componentProps: {
            placeholder: '请输入占位符',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
        {
          field: 'options',
          component: 'SelectOptions',
          label: '选项配置',
          required: true,
        },
      ];
    case 'datePicker':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'placeholder',
          component: 'Input',
          label: '占位符',
          componentProps: {
            placeholder: '请输入占位符',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
      ];
    case 'radio':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
        {
          field: 'options',
          component: 'SelectOptions',
          label: '选项配置',
          required: true,
        },
        {
          field: 'defaultValue',
          component: 'Input',
          label: '默认值',
          componentProps: {
            placeholder: '请输入默认值',
          },
        },
      ];
    case 'checkbox':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
        {
          field: 'options',
          component: 'SelectOptions',
          label: '选项配置',
          required: true,
        },
        {
          field: 'defaultValue',
          component: 'Input',
          label: '默认值',
          componentProps: {
            placeholder: '请输入默认值，多个值用逗号分隔',
          },
        },
      ];
    case 'contactSelect':
    case 'customerSelect':
      return [
        {
          field: 'label',
          component: 'Input',
          label: '标签文本',
          required: true,
          componentProps: {
            placeholder: '请输入标签文本',
          },
        },
        {
          field: 'required',
          component: 'Switch',
          label: '是否必填',
          componentProps: {
            checkedChildren: '是',
            unCheckedChildren: '否',
          },
        },
      ];
    default:
      return [];
  }
});

// 表单注册
const [registerForm] = useForm({
  labelWidth: 80,
  schemas: formSchemas.value,
  model: formData.value,
});

// 监听data变化
watch(() => props.data, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal.config };
    // 重新设置表单模型
    registerForm.model = formData.value;
  }
}, { immediate: true });

// 处理表单提交
const handleFinish = (values: any) => {
  emit('update', values);
};
</script>

<style scoped lang="scss">
// 自定义样式
.component-editor {
  padding: 10px 0;
}

.editor-title {
  font-size: 16px;
  margin-bottom: 16px;
}
</style>