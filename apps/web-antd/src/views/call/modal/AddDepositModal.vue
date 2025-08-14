<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Modal, Button, message } from 'ant-design-vue';
import { useStore } from 'vuex';

const store = useStore();

// 定义props
const props = defineProps<{
  visible: boolean;
  modalTitle?: string;
  selectButtonTitle?: string;
}>();

// 定义emit
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'callBack'): void;
}>();

// 响应式数据
const accountData = ref<{
  balance: number;
}>({ balance: 0.00 });

// 组件挂载时加载数据
onMounted(() => {
  reLoadData();
});

// 重新加载数据
const reLoadData = () => {
  getAccount();
};

// 关闭模态框
const onModalClose = () => {
  emit('update:visible', false);
};

// 获取账户余额
const getAccount = () => {
  // 模拟API请求
  setTimeout(() => {
    accountData.value = { balance: 5000.00 };
    console.log('获取账户余额', accountData.value);
  }, 500);
};

// 缴纳保证金
const addDeposit = () => {
  Modal.confirm({
    title: '确认',
    content: '保证金将从可用余额中扣除？',
    onOk: () => {
      // 模拟API请求
      setTimeout(() => {
        message.success('扣除成功');
        onModalClose();
        emit('callBack');
      }, 500);
    },
  });
};
</script>

<template>
  <!-- 坐席分配情况弹窗 -->
  <Modal
    v-model:visible="visible"
    :title="modalTitle || '缴纳保证金'"
    @cancel="onModalClose"
    width="500px"
    centered
  >
    <div class="form-search-wrapper" style="min-height: 200px;">
      <div class="box-content">
        <div class="box">
          <div>
            <p>首次购买需要缴纳保证金1000元。</p>
            <p>保证金是为了保证话术规范，如客户将此号码投诉</p>
            <p>到工信部网站，保证金不退还。如未投诉，使用期满后退还。</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <Button type="primary" @click="addDeposit">
              {{ selectButtonTitle || '缴纳' }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="less">
/* 头部 */
.header {
  padding: 15px 20px;
  .title {
    font-weight: 700;
    font-size: 20px;
  }
  .bt {
    margin-left: 10px;
  }
}
</style>