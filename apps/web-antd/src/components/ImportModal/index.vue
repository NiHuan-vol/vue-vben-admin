<template>
  <div class="import-modal-mask">
    <div class="import-modal">
      <div class="import-modal-header">
        <h3>导入数据</h3>
        <button class="import-modal-close" @click="handleCancel">×</button>
      </div>
      <div class="import-modal-body">
        <div class="import-modal-desc">
          <p>请选择要导入的Excel文件</p>
          <p class="text-sm text-gray-500">支持.xlsx格式文件</p>
        </div>
        <div class="import-modal-upload">
          <input
            type="file"
            ref="fileInput"
            class="import-file-input"
            accept=".xlsx"
            @change="handleFileChange"
          />
          <button class="import-upload-btn" @click="handleUploadClick">
            <Icon icon="upload" /> 选择文件
          </button>
          <div v-if="selectedFile" class="import-file-info">
            <span>{{ selectedFile.name }}</span>
            <button class="import-file-remove" @click="handleRemoveFile">×</button>
          </div>
        </div>
        <div v-if="loading" class="import-modal-loading">
          <a-spin tip="上传中..." />
        </div>
      </div>
      <div class="import-modal-footer">
        <button class="import-modal-btn import-modal-btn-cancel" @click="handleCancel">取消</button>
        <button
          class="import-modal-btn import-modal-btn-confirm"
          :disabled="!selectedFile || loading"
          @click="handleConfirm"
        >
          导入
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue';
import { Icon } from '/@/components/Icon';
import { useMessage } from '/@/hooks/web/useMessage';

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const loading = ref<boolean>(false);

const emit = defineEmits(['uploadSuccess', 'cancelImport']);
const { createMessage } = useMessage();

const handleUploadClick = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const handleRemoveFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleConfirm = () => {
  if (!selectedFile) return;

  loading.value = true;

  // 模拟文件上传延迟
  setTimeout(() => {
    loading.value = false;
    emit('uploadSuccess', selectedFile);
    createMessage.success('文件上传成功');
    handleRemoveFile();
  }, 1500);
};

const handleCancel = () => {
  emit('cancelImport');
  handleRemoveFile();
};
</script>

<style scoped>
.import-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-modal {
  width: 500px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.import-modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.import-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.import-modal-body {
  padding: 24px;
}

.import-modal-desc {
  margin-bottom: 24px;
}

.import-modal-desc p {
  margin: 0 0 8px;
}

.import-modal-upload {
  border: 2px dashed #e0e0e0;
  border-radius: 6px;
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 16px;
}

.import-file-input {
  display: none;
}

.import-upload-btn {
  background-color: #f0f2f5;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  color: #333;
}

.import-upload-btn:hover {
  background-color: #e6e8eb;
}

.import-file-info {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #f0f2f5;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-file-remove {
  background: none;
  border: none;
  color: #f5222d;
  cursor: pointer;
}

.import-modal-loading {
  text-align: center;
  padding: 16px 0;
}

.import-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.import-modal-btn {
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.import-modal-btn-cancel {
  background-color: #fff;
  border: 1px solid #d9d9d9;
  color: #333;
}

.import-modal-btn-confirm {
  background-color: #1890ff;
  border: none;
  color: #fff;
}

.import-modal-btn-confirm:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>