<template>
  <Modal title="打印提示" v-model:visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel" :closable="false">
    <p style="text-align: center; font-weight: bold; letter-spacing: 1px; height: 180px; padding-top: 80px;">
      <span style="color: #dc3545; font-size: 16px;"> 您还未安装打印插件，请下载安装插件<br>下载安装完成后请刷新页面!</span>
    </p>
    <template #footer>
      <Button type="primary" @click="down">下载</Button>
      <Button type="primary" @click="handleCancel">稍后下载</Button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Button, Modal, message } from 'ant-design-vue';
import { getLodop } from '@/utils/tool/LodopFun';
import { downLoadexe } from '@/api/inventory/barcode';

// 状态管理
const visible = ref(false);
const confirmLoading = ref(false);

// 检查是否安装插件
const CheckIsInstall = () => {
  try {
    const LODOP = getLodop();
    if (LODOP.VERSION) {
      if (LODOP.CVERSION) {
        console.log(`当前有WEB打印服务C-Lodop可用!\n C-Lodop版本:${LODOP.CVERSION}(内含Lodop${LODOP.VERSION})`);
      } else {
        console.log(`本机已成功安装了Lodop控件！\n 版本号:${LODOP.VERSION}`);
      }
    }
    visible.value = false;
  } catch (err) {
    visible.value = true;
  }
  return visible.value;
};

// 下载插件
const down = async () => {
  try {
    confirmLoading.value = true;
    const res = await downLoadexe();
    if (res.code === 200) {
      window.location.href = res.message;
      visible.value = false;
    }
  } catch (error) {
    message.error('下载插件失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 处理取消
const handleCancel = () => {
  visible.value = false;
};

// 处理确定
const handleOk = () => {
  down();
};

// 导出方法
defineExpose({
  CheckIsInstall,
});
</script>

<style scoped lang="less">
/* 可以添加自定义样式 */
</style>