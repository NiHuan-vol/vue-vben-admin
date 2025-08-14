<template>
  <a-modal
    v-model:visible="visible"
    :title="fileItem.id ? t('common.edit') : t('common.add')"
    @cancel="handleCancel"
    :width="600"
  >
    <a-form
      ref="formRef"
      :model="fileItem"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item name="fileName" label="{{ t('menu.crm.files.fileName') }}">
        <a-input v-model:value="fileItem.fileName" placeholder="{{ t('menu.crm.files.enterFileName') }}" />
      </a-form-item>

      <a-form-item name="filesType" label="{{ t('menu.crm.files.fileType') }}">
        <a-select v-model:value="fileItem.filesType" placeholder="{{ t('menu.crm.files.selectFileType') }}">
          <a-select-option value="0">文档</a-select-option>
          <a-select-option value="1">图片</a-select-option>
          <a-select-option value="2">视频</a-select-option>
          <a-select-option value="3">其他</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item name="file" label="{{ t('menu.crm.files.uploadFile') }}" v-if="!fileItem.id">
        <a-upload
          v-model:fileList="fileList"
          name="file"
          :action="uploadUrl"
          :headers="{ 'Access-Token': token }
          :before-upload="beforeUpload"
          @change="handleUploadChange"
        >
          <a-button>
            <Icon icon="ant-design:upload-outlined" /> {{ t('menu.crm.files.selectFile') }}
          </a-button>
        </a-upload>
      </a-form-item>

      <a-form-item name="remarks" label="{{ t('menu.crm.files.remarks') }}">
        <a-textarea v-model:value="fileItem.remarks" placeholder="{{ t('menu.crm.files.enterRemarks') }}" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="handleCancel">{{ t('common.cancel') }}</a-button>
      <a-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</a-button>
    </template>
  </a-modal>
</template>

<script lang="tsx" setup>
import { ref, watch, onMounted } from 'vue';
import { Message } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import { useI18n } from '/@/hooks/web/useI18n';
import { useToken } from '/@/hooks/web/useToken';
import { saveFile } from '/@/api/crm/files';

const { t } = useI18n();
const { getToken } = useToken();
const token = getToken();

// props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  fileItem: {
    type: Object,
    default: () => ({}),
  },
});

// emits
const emit = defineEmits(['cancel', 'submit', 'update:visible']);

// refs
const formRef = ref(null);
const fileList = ref([]);
const uploadUrl = ref('/api/upload'); // 假设的上传接口

// 表单规则
const rules = {
  fileName: [{ required: true, message: t('menu.crm.files.fileNameRequired') }],
  filesType: [{ required: true, message: t('menu.crm.files.fileTypeRequired') }],
};

// 处理取消
const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};

// 处理提交
const handleSubmit = async () => {
  try {
    await formRef.value.validateFields();
    const formData = { ...props.fileItem };
    // 如果有上传的文件，添加文件信息
    if (fileList.value.length > 0) {
      formData.filePath = fileList.value[0].url;
      formData.uploadFiles = fileList.value[0].name;
    }
    emit('submit', formData);
  } catch (error) {
    // 表单验证失败
  }
};

// 处理上传变化
const handleUploadChange = (info) => {
  if (info.file.status === 'done') {
    Message.success(t('menu.crm.files.uploadSuccess'));
  } else if (info.file.status === 'error') {
    Message.error(t('menu.crm.files.uploadFailed'));
  }
};

// 上传前检查
const beforeUpload = (file) => {
  // 可以添加文件类型和大小检查
  return true;
};

// 监听fileItem变化
watch(
  () => props.fileItem,
  (newVal) => {
    if (newVal.id) {
      // 编辑模式，设置文件列表
      fileList.value = [{
        uid: newVal.id,
        name: newVal.uploadFiles,
        status: 'done',
        url: newVal.filePath,
      }];
    } else {
      // 新增模式，清空文件列表
      fileList.value = [];
    }
  },
  { immediate: true }
);
</script>