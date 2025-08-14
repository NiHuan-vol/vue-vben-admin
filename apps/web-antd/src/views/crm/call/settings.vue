<template>
  <PageWrapper title="呼叫设置" contentClass="p-4">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold mb-4">外呼基础设置</h3>

      <!-- 外呼方式 -->
      <div class="mb-6">
        <div class="text-gray-700 mb-2">外呼方式</div>
        <RadioGroup v-model:value="settings.callWay" class="mt-2">
          <Radio value="box">盒子</Radio>
          <Radio value="callBack">点击回拨</Radio>
        </RadioGroup>
      </div>

      <!-- 音量设置 -->
      <div v-show="settings.callWay === 'box'" class="mb-6">
        <h3 class="text-lg font-semibold mb-4">音量设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-gray-700 mb-2">本地听到音量</div>
            <Slider v-model:value="settings.localaudio" />
            <div class="text-right mt-1 text-gray-500">{{ settings.localaudio }}</div>
          </div>
          <div>
            <div class="text-gray-700 mb-2">对方听到音量</div>
            <Slider v-model:value="settings.phoneaudio" />
            <div class="text-right mt-1 text-gray-500">{{ settings.phoneaudio }}</div>
          </div>
        </div>
      </div>

      <!-- 换卡设置 -->
      <div v-show="settings.callWay === 'box'" class="mb-6">
        <h3 class="text-lg font-semibold mb-4">换卡设置</h3>
        <div class="flex items-center mb-4">
          <div class="text-gray-700 mr-3">自动换卡</div>
          <Checkbox v-model:checked="settings.isAutoChangeSIM">开启</Checkbox>
        </div>
        <div v-show="settings.isAutoChangeSIM" class="ml-10">
          <div class="flex items-center">
            <div class="text-gray-700 mr-3">拨打次数</div>
            <InputNumber
              v-model:value="settings.maxCallTimes"
              placeholder="录入"
              :min="1"
              :max="100"
              style="width: 120px;"
            />
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="flex justify-center mt-8">
        <Button type="primary" @click="handleSave" :loading="loading">保存</Button>
      </div>
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { PageWrapper } from '/@/components/Page';
import { Button, Checkbox, InputNumber, Radio, RadioGroup, Slider } from 'ant-design-vue';
import { getCallSettings, saveCallSettings } from '/@/api/crm/call';

// 响应式数据
const loading = ref(false);
const settings = reactive<Record<string, any>>({
  callWay: 'line',
  localaudio: 50,
  phoneaudio: 50,
  isAutoChangeSIM: true,
  maxCallTimes: 5,
});

// 消息提示
const message = useMessage();

// 加载设置
const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await getCallSettings();
    if (response.code === 200 && response.data) {
      // 转换数据类型
      const dataMap = new Map<string, any>();
      response.data.forEach((item: any) => {
        dataMap.set(item.code, item);
      });

      // 应用设置
      settings.callWay = dataMap.get('callWay')?.value || 'line';
      settings.localaudio = Number(dataMap.get('localaudio')?.value || 50);
      settings.phoneaudio = Number(dataMap.get('phoneaudio')?.value || 50);
      settings.isAutoChangeSIM = dataMap.get('isAutoChangeSIM')?.value === 'true';
      settings.maxCallTimes = Number(dataMap.get('maxCallTimes')?.value || 5);
    }
  } catch (error) {
    message.error('获取呼叫设置失败');
  } finally {
    loading.value = false;
  }
};

// 保存设置
const handleSave = async () => {
  loading.value = true;
  try {
    // 准备提交数据
    const postData = [
      { code: 'callWay', value: settings.callWay, dataType: 2 },
      { code: 'localaudio', value: settings.localaudio.toString(), dataType: 1 },
      { code: 'phoneaudio', value: settings.phoneaudio.toString(), dataType: 1 },
      { code: 'isAutoChangeSIM', value: settings.isAutoChangeSIM.toString(), dataType: 3 },
      { code: 'maxCallTimes', value: settings.maxCallTimes.toString(), dataType: 1 },
    ];

    const response = await saveCallSettings(postData);
    if (response.code === 200) {
      message.success('保存成功');
    } else {
      message.error('保存失败');
    }
  } catch (error) {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadSettings();
});
</script>

<style scoped lang="scss">
// 自定义样式
.p-4 {
  padding: 16px;
}

.p-6 {
  padding: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.mt-8 {
  margin-top: 32px;
}

.text-lg {
  font-size: 16px;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-700 {
  color: #333;
}

.text-gray-500 {
  color: #666;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.ml-10 {
  margin-left: 40px;
}

.mr-3 {
  margin-right: 12px;
}
</style>