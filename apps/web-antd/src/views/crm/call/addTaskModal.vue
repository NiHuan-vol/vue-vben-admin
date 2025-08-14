<template>
  <div>
    <drag-modal
      :title="title"
      :visible="visible"
      @cancel="handleCancel"
      @ok="handleOk"
      width="800px"
    >
      <a-form :form="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="任务名称" :validate-status="validateStatus.taskName" help="{{ validateMessage.taskName }}">
              <a-input
                v-model="formData.taskName"
                placeholder="请输入任务名称"
                @blur="validateField('taskName')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开始时间" :validate-status="validateStatus.startTime" help="{{ validateMessage.startTime }}">
              <a-date-picker
                v-model="formData.startTime"
                :show-time="true"
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择开始时间"
                @blur="validateField('startTime')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间" :validate-status="validateStatus.endTime" help="{{ validateMessage.endTime }}">
              <a-date-picker
                v-model="formData.endTime"
                :show-time="true"
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择结束时间"
                @blur="validateField('endTime')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系类型" :validate-status="validateStatus.taskType" help="{{ validateMessage.taskType }}">
              <a-select
                v-model="formData.taskType"
                placeholder="请选择联系类型"
                @blur="validateField('taskType')"
              >
                <a-select-option v-for="(item, index) in taskTypeArr" :key="index" :value="index + 1">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="外呼方式" :validate-status="validateStatus.callType" help="{{ validateMessage.callType }}">
              <a-select
                v-model="formData.callType"
                placeholder="请选择外呼方式"
                @change="handleCallTypeChange"
                @blur="validateField('callType')"
              >
                <a-select-option v-for="(item, index) in callTypeArr" :key="index" :value="index + 1">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="formData.callType === 2">
            <a-form-item label="放音文件" :validate-status="validateStatus.voiceId" help="{{ validateMessage.voiceId }}">
              <a-select
                v-model="formData.voiceId"
                placeholder="请选择放音文件"
                @blur="validateField('voiceId')"
              >
                <a-select-option v-for="item in voiceList" :key="item.id" :value="item.id">
                  {{ item.voiceName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model="formData.remarks" placeholder="请输入备注信息" :rows="4" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </drag-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { pageList as voicePageList } from '@/api/crm/call/callVoice';
import { create, update } from '@/api/crm/call/callTask';

const taskTypeArr = ['销售联系', '客户关怀', '售后回访', '投诉回访', '服务支持', '维修维护', '客户投诉'];
const callTypeArr = ['人工', '去电放音'];

// 日期格式化
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

export default {
  data() {
    return {
      visible: false,
      title: '新增任务',
      formData: {
        id: 0,
        taskName: '',
        startTime: '',
        endTime: '',
        taskType: '',
        callType: 1,
        voiceId: '',
        remarks: '',
      },
      validateStatus: {
        taskName: '',
        startTime: '',
        endTime: '',
        taskType: '',
        callType: '',
        voiceId: '',
      },
      validateMessage: {
        taskName: '',
        startTime: '',
        endTime: '',
        taskType: '',
        callType: '',
        voiceId: '',
      },
      rules: {
        taskName: [
          { required: true, message: '任务名称不能为空' },
          { max: 50, message: '任务名称不能超过50个字符' },
        ],
        startTime: [
          { required: true, message: '开始时间不能为空' },
        ],
        endTime: [
          { required: true, message: '结束时间不能为空' },
        ],
        taskType: [
          { required: true, message: '联系类型不能为空' },
        ],
        callType: [
          { required: true, message: '外呼方式不能为空' },
        ],
        voiceId: [
          { required: true, message: '放音文件不能为空' },
        ],
      },
      taskTypeArr,
      callTypeArr,
      voiceList: [],
      dateFormat,
      isEdit: false,
    };
  },
  created() {
    this.loadVoiceList();
  },
  methods: {
    // 加载语音列表
    loadVoiceList() {
      voicePageList({ page: { current: 1, size: 100 } }).then((response) => {
        if (response.code === 200) {
          this.voiceList = response.data.records;
        }
      });
    },
    // 显示模态框
    showModal(data = {}) {
      this.visible = true;
      this.isEdit = !!data.id;
      this.title = this.isEdit ? '编辑任务' : '新增任务';

      // 重置表单验证
      Object.keys(this.validateStatus).forEach((key) => {
        this.validateStatus[key] = '';
        this.validateMessage[key] = '';
      });

      // 设置表单数据
      this.formData = {
        id: data.id || 0,
        taskName: data.taskName || '',
        startTime: data.startTime ? new Date(data.startTime) : '',
        endTime: data.endTime ? new Date(data.endTime) : '',
        taskType: data.taskType || '',
        callType: data.callType || 1,
        voiceId: data.voiceId || '',
        remarks: data.remarks || '',
      };
    },
    // 隐藏模态框
    handleCancel() {
      this.visible = false;
    },
    // 确认提交
    handleOk() {
      // 验证表单
      if (this.validateForm()) {
        const { formData, isEdit } = this;
        const api = isEdit ? update : create;

        api(formData).then((response) => {
          if (response.code === 200) {
            this.$message.success(isEdit ? '编辑成功' : '创建成功');
            this.visible = false;
            // 通知父组件刷新数据
            this.$emit('reloadData');
          } else {
            this.$message.error(response.message || (isEdit ? '编辑失败' : '创建失败'));
          }
        });
      }
    },
    // 验证表单
    validateForm() {
      let isValid = true;

      // 重置验证状态
      Object.keys(this.validateStatus).forEach((key) => {
        this.validateStatus[key] = '';
        this.validateMessage[key] = '';
      });

      // 验证必填字段
      Object.keys(this.rules).forEach((key) => {
        const rules = this.rules[key];
        for (const rule of rules) {
          if (rule.required && (!this.formData[key] && this.formData[key] !== 0)) {
            this.validateStatus[key] = 'error';
            this.validateMessage[key] = rule.message;
            isValid = false;
            break;
          }
        }
      });

      // 验证开始时间和结束时间
      if (this.formData.startTime && this.formData.endTime) {
        if (this.formData.startTime > this.formData.endTime) {
          this.validateStatus.startTime = 'error';
          this.validateMessage.startTime = '开始时间不能大于结束时间';
          this.validateStatus.endTime = 'error';
          this.validateMessage.endTime = '结束时间不能小于开始时间';
          isValid = false;
        }
      }

      // 验证放音文件
      if (this.formData.callType === 2 && !this.formData.voiceId) {
        this.validateStatus.voiceId = 'error';
        this.validateMessage.voiceId = '放音文件不能为空';
        isValid = false;
      }

      return isValid;
    },
    // 验证单个字段
    validateField(field) {
      // 重置验证状态
      this.validateStatus[field] = '';
      this.validateMessage[field] = '';

      // 验证字段
      const rules = this.rules[field] || [];
      for (const rule of rules) {
        if (rule.required && (!this.formData[field] && this.formData[field] !== 0)) {
          this.validateStatus[field] = 'error';
          this.validateMessage[field] = rule.message;
          break;
        }
        if (rule.max && this.formData[field] && this.formData[field].length > rule.max) {
          this.validateStatus[field] = 'error';
          this.validateMessage[field] = rule.message;
          break;
        }
      }

      // 特殊字段验证
      if (field === 'startTime' && this.formData.startTime && this.formData.endTime) {
        if (this.formData.startTime > this.formData.endTime) {
          this.validateStatus.startTime = 'error';
          this.validateMessage.startTime = '开始时间不能大于结束时间';
        }
      }
      if (field === 'endTime' && this.formData.startTime && this.formData.endTime) {
        if (this.formData.startTime > this.formData.endTime) {
          this.validateStatus.endTime = 'error';
          this.validateMessage.endTime = '结束时间不能小于开始时间';
        }
      }
      if (field === 'callType' && this.formData.callType === 2 && !this.formData.voiceId) {
        this.validateStatus.voiceId = 'error';
        this.validateMessage.voiceId = '放音文件不能为空';
      }
    },
    // 外呼方式变更
    handleCallTypeChange(value) {
      this.formData.callType = value;
      if (value !== 2) {
        this.formData.voiceId = '';
        this.validateStatus.voiceId = '';
        this.validateMessage.voiceId = '';
      }
    },
  },
};
</script>

<style scoped>
.form-search-wrapper >>> .ant-form-item {
  margin-bottom: 16px !important;
}
</style>