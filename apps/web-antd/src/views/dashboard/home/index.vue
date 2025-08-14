<script lang="ts" setup>
import { ref } from 'vue';
import { Card } from 'ant-design-vue';

defineOptions({ name: 'Home' });

const name = ref('啊哈哈');
const welcomeMessage = ref('欢迎使用Vue Vben Admin');
</script>

<template>
  <div class="home-container">
    <Card title="首页" :bordered="false">
      <div class="content">{{ welcomeMessage }}</div>
      <div class="original-content">{{ name }}</div>
    </Card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 24px;
  min-height: 100%;
}

.content {
  font-size: 18px;
  font-weight: 500;
  color: #1890ff;
  text-align: center;
  padding: 20px 0;
}

.original-content {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4f;
  text-align: center;
  padding: 10px 0;
}
</style>