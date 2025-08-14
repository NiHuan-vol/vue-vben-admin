<template>
  <BasicModal
    v-model:visible="visible"
    :title="templateId ? '编辑模板' : '新增模板'"
    :width="1200"
    @ok="handleSubmit"
    :okButtonProps="{ loading: submitting }"
    :cancelButtonProps="{ disabled: submitting }"
  >
    <div class="template-modal-content">
      <!-- 左侧组件选择区 -->
      <div class="left-panel w-64 bg-gray-50 p-4 h-[600px] overflow-y-auto">
        <div class="panel-title font-medium mb-4">组件库</div>

        <div class="component-group mb-6">
          <div class="group-title text-sm font-medium text-gray-500 mb-2">展示类组件</div>
          <div class="component-list">
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'title')">
              <Icon icon="ep:title" class="mr-2 text-blue-500" />
              <span>标题</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'image')">
              <Icon icon="ep:picture" class="mr-2 text-blue-500" />
              <span>图片</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'text')">
              <Icon icon="ep:font" class="mr-2 text-blue-500" />
              <span>文本</span>
            </div>
          </div>
        </div>

        <div class="component-group mb-6">
          <div class="group-title text-sm font-medium text-gray-500 mb-2">填写类组件</div>
          <div class="component-list">
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'input')">
              <Icon icon="ep:edit" class="mr-2 text-blue-500" />
              <span>单行输入</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'textarea')">
              <Icon icon="ep:file-text" class="mr-2 text-blue-500" />
              <span>多行输入</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'select')">
              <Icon icon="ep:select" class="mr-2 text-blue-500" />
              <span>下拉选择</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'datePicker')">
              <Icon icon="ep:calendar" class="mr-2 text-blue-500" />
              <span>日期选择</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'radio')">
              <Icon icon="ep:radio" class="mr-2 text-blue-500" />
              <span>单选框组</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'checkbox')">
              <Icon icon="ep:checkbox" class="mr-2 text-blue-500" />
              <span>复选框组</span>
            </div>
          </div>
        </div>

        <div class="component-group">
          <div class="group-title text-sm font-medium text-gray-500 mb-2">联系人组件</div>
          <div class="component-list">
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'contactSelect')">
              <Icon icon="ep:user" class="mr-2 text-blue-500" />
              <span>联系人选择</span>
            </div>
            <div class="component-item p-2 bg-white rounded cursor-move border border-gray-200 mb-2 flex items-center" draggable @dragstart="handleDragStart($event, 'customerSelect')">
              <Icon icon="ep:company" class="mr-2 text-blue-500" />
              <span>客户选择</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间预览区 -->
      <div class="middle-panel flex-1 p-4 h-[600px] overflow-y-auto border-l border-gray-200 border-r border-gray-200">
        <div class="panel-title font-medium mb-4 flex justify-between items-center">
          <span>模板设计区</span>
          <Button size="small" @click="togglePreview">预览</Button>
        </div>

        <div class="template-preview" @dragover="handleDragOver" @drop="handleDrop">
          <!-- 手机预览框 -->
          <div class="phone-frame w-[375px] mx-auto bg-white border border-gray-300 rounded-xl overflow-hidden shadow-md" :class="isPreview ? 'preview-mode' : ''">
            <!-- 头部导航 -->
            <div class="phone-header bg-blue-600 text-white p-3 text-center">
              {{ templateData.title || '未命名模板' }}
            </div>

            <!-- 内容区域 -->
            <div class="phone-content p-4 min-h-[500px]">
              <template v-if="components.length === 0">
                <div class="empty-tips text-center text-gray-400 py-10">
                  <Icon icon="ep:empty" size="48" class="mx-auto mb-2" />
                  <p>拖拽左侧组件到此处开始设计</p>
                </div>
              </template>

              <Draggable
                v-model="components"
                draggable=".component-draggable"
                @change="handleComponentsChange"
                ghost-class="ghost"
                chosen-class="chosen"
              >
                <div v-for="(item, index) in components" :key="index" class="component-draggable mb-4"
                  :class="selectedComponentIndex === index ? 'selected-component' : ''"
                  @click="handleComponentClick(index)">
                  <div class="component-wrapper">
                    <component :is="getComponentName(item.type)" :data="item" :is-preview="isPreview" />
                  </div>
                  <div v-if="!isPreview" class="component-actions absolute top-1 right-1 flex">
                    <Icon icon="ep:edit" class="edit-icon mr-1 cursor-pointer" @click.stop="handleComponentEdit(index)" />
                    <Icon icon="ep:delete" class="delete-icon cursor-pointer" @click.stop="handleComponentDelete(index)" />
                  </div>
                </div>
              </Draggable>

              <!-- 提交按钮 -->
              <div v-if="!isPreview" class="submit-btn-wrapper mt-6 text-center">
                <Button type="primary" block>提交</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性编辑区 -->
      <div class="right-panel w-80 bg-gray-50 p-4 h-[600px] overflow-y-auto">
        <div class="panel-title font-medium mb-4">属性设置</div>

        <template v-if="selectedComponentIndex === -1">
          <BasicForm @register="registerForm" :schemas="formSchemas" :labelWidth="80" />
        </template>
        <template v-else>
          <ComponentEditor :type="components[selectedComponentIndex].type" :data="components[selectedComponentIndex]" @update="handleComponentUpdate" />
        </template>
      </div>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useForm } from '@/components/Form';
import { usePermission } from '@/hooks/usePermission';
import { createTemplate, updateTemplate, getTemplateDetail, getActivityList } from '@/api/crm/activity';
import { BasicModal, Button, Icon, BasicForm, Draggable } from '@/components';
import ComponentEditor from './ComponentEditor.vue';

// 组件类型映射
const componentMap = {
  title: 'TitleComponent',
  image: 'ImageComponent',
  text: 'TextComponent',
  input: 'InputComponent',
  textarea: 'TextareaComponent',
  select: 'SelectComponent',
  datePicker: 'DatePickerComponent',
  radio: 'RadioComponent',
  checkbox: 'CheckboxComponent',
  contactSelect: 'ContactSelectComponent',
  customerSelect: 'CustomerSelectComponent',
};

// 导入所有组件
const components = {
  TitleComponent: () => import('@/components/custom/TitleComponent.vue'),
  ImageComponent: () => import('@/components/custom/ImageComponent.vue'),
  TextComponent: () => import('@/components/custom/TextComponent.vue'),
  InputComponent: () => import('@/components/custom/InputComponent.vue'),
  TextareaComponent: () => import('@/components/custom/TextareaComponent.vue'),
  SelectComponent: () => import('@/components/custom/SelectComponent.vue'),
  DatePickerComponent: () => import('@/components/custom/DatePickerComponent.vue'),
  RadioComponent: () => import('@/components/custom/RadioComponent.vue'),
  CheckboxComponent: () => import('@/components/custom/CheckboxComponent.vue'),
  ContactSelectComponent: () => import('@/components/custom/ContactSelectComponent.vue'),
  CustomerSelectComponent: () => import('@/components/custom/CustomerSelectComponent.vue'),
};

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();

// Props
const props = defineProps({
  visible: Boolean,
  templateId: String,
});

// Emit
const emit = defineEmits(['update:visible', 'success']);

// 表单数据
const templateData = reactive<Record<string, any>>({
  name: '',
  activityId: '',
  description: '',
});

// 组件列表
const components = ref<any[]>([]);
// 选中的组件索引
const selectedComponentIndex = ref(-1);
// 拖拽中的组件类型
const draggingComponentType = ref('');
// 提交中
const submitting = ref(false);
// 预览模式
const isPreview = ref(false);
// 活动列表
const activityList = ref<any[]>([]);

// 表单结构
const formSchemas = computed(() => [
  {
    field: 'name',
    component: 'Input',
    label: '模板名称',
    required: true,
    componentProps: {
      placeholder: '请输入模板名称',
    },
    rules: [
      { required: true, message: '请输入模板名称' },
      { max: 50, message: '模板名称不能超过50个字符' },
    ],
  },
  {
    field: 'activityId',
    component: 'Select',
    label: '所属活动',
    required: true,
    componentProps: {
      options: activityList.value.map(item => ({ label: item.name, value: item.id })),
      placeholder: '请选择所属活动',
    },
  },
  {
    field: 'description',
    component: 'Input',
    label: '模板描述',
    componentProps: {
      placeholder: '请输入模板描述',
      type: 'textarea',
      rows: 4,
    },
    rules: [
      { max: 200, message: '模板描述不能超过200个字符' },
    ],
  },
]);

// 表单注册
const [registerForm, { validate, resetFields }] = useForm({
  labelWidth: 80,
  schemas: formSchemas.value,
  model: templateData,
});

// 获取组件名称
const getComponentName = (type: string) => {
  return componentMap[type as keyof typeof componentMap] || 'TextComponent';
};

// 获取活动列表
const getActivityData = async () => {
  try {
    const res = await getActivityList();
    activityList.value = res.data;
  } catch (error) {
    message.error('获取活动列表失败');
  }
};

// 获取模板详情
const getTemplateData = async (id: string) => {
  try {
    const res = await getTemplateDetail(id);
    Object.assign(templateData, res.data.template);
    components.value = res.data.components || [];
  } catch (error) {
    message.error('获取模板详情失败');
  }
};

// 处理拖拽开始
const handleDragStart = (event: DragEvent, type: string) => {
  draggingComponentType.value = type;
  event.dataTransfer?.setData('text/plain', type);
};

// 处理拖拽经过
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

// 处理放置
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (!draggingComponentType.value) return;

  // 创建组件配置
  const newComponent = {
    type: draggingComponentType.value,
    id: Date.now().toString(),
    config: getDefaultConfig(draggingComponentType.value),
  };

  components.value.push(newComponent);
  draggingComponentType.value = '';
};

// 获取默认配置
const getDefaultConfig = (type: string) => {
  switch (type) {
    case 'title':
      return { text: '标题', level: 1, align: 'center', color: '#000000', fontSize: 18 };
    case 'image':
      return { src: '', alt: '图片', width: '100%', height: 'auto' };
    case 'text':
      return { content: '文本内容', fontSize: 14, color: '#333333' };
    case 'input':
      return { label: '输入框', placeholder: '请输入', required: false, maxLength: 50 };
    case 'textarea':
      return { label: '多行输入', placeholder: '请输入', required: false, rows: 4, maxLength: 200 };
    case 'select':
      return { label: '下拉选择', placeholder: '请选择', required: false, options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }] };
    case 'datePicker':
      return { label: '日期选择', placeholder: '请选择日期', required: false };
    case 'radio':
      return { label: '单选框组', required: false, options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }], defaultValue: '' };
    case 'checkbox':
      return { label: '复选框组', required: false, options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }], defaultValue: [] };
    case 'contactSelect':
      return { label: '联系人选择', required: false };
    case 'customerSelect':
      return { label: '客户选择', required: false };
    default:
      return {};
  }
};

// 处理组件点击
const handleComponentClick = (index: number) => {
  selectedComponentIndex.value = index;
};

// 处理组件编辑
const handleComponentEdit = (index: number) => {
  selectedComponentIndex.value = index;
};

// 处理组件更新
const handleComponentUpdate = (data: any) => {
  if (selectedComponentIndex.value !== -1) {
    components.value[selectedComponentIndex.value].config = data;
  }
};

// 处理组件删除
const handleComponentDelete = (index: number) => {
  components.value.splice(index, 1);
  selectedComponentIndex.value = -1;
};

// 处理组件排序变化
const handleComponentsChange = () => {
  // 排序变化时的处理
};

// 切换预览模式
const togglePreview = () => {
  isPreview.value = !isPreview.value;
  if (isPreview.value) {
    selectedComponentIndex.value = -1;
  }
};

// 处理提交
const handleSubmit = async () => {
  try {
    await validate();

    submitting.value = true;

    const data = {
      ...templateData,
      components: components.value,
    };

    if (props.templateId) {
      await updateTemplate(props.templateId, data);
      message.success('编辑成功');
    } else {
      await createTemplate(data);
      message.success('创建成功');
    }

    emit('success');
    emit('update:visible', false);
  } catch (error) {
    message.error('提交失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.templateId) {
      getTemplateData(props.templateId);
    } else {
      // 重置表单
      resetFields();
      components.value = [];
      selectedComponentIndex.value = -1;
    }
  }
});

// 初始化
onMounted(() => {
  getActivityData();
});
</script>

<style scoped lang="scss">
// 自定义样式
.template-modal-content {
  display: flex;
  height: 100%;
}

.left-panel,
.right-panel {
  flex-shrink: 0;
}

.middle-panel {
  flex-grow: 1;
}

.component-item {
  transition: all 0.2s;
  &:hover {
    border-color: #1890ff;
    background-color: #e6f7ff;
  }
}

.template-preview {
  padding: 20px 0;
}

.phone-frame {
  position: relative;
  transition: all 0.3s;
}

.phone-header {
  font-size: 16px;
  font-weight: bold;
}

.phone-content {
  position: relative;
}

.component-draggable {
  position: relative;
  transition: all 0.2s;
}

.component-wrapper {
  padding: 10px;
  border: 1px dashed transparent;
  &:hover {
    border-color: #1890ff;
    background-color: #f0f7ff;
  }
}

.selected-component {
  .component-wrapper {
    border-color: #1890ff;
    background-color: #e6f7ff;
  }
}

.component-actions {
  display: none;
  opacity: 0;
  transition: all 0.2s;
}

.component-draggable:hover .component-actions {
  display: flex;
  opacity: 1;
}

.edit-icon,
.delete-icon {
  width: 16px;
  height: 16px;
  padding: 2px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #fff;
  }
}

.edit-icon {
  color: #1890ff;
}

.delete-icon {
  color: #ff4d4f;
}

.empty-tips {
  color: #999;
}

.preview-mode {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.submit-btn-wrapper {
  margin-top: 20px;
}
</style>