<script lang="ts" setup>
import { ref } from 'vue';
import { Card } from 'ant-design-vue';

defineOptions({ name: 'Page2' });

const msg = ref('我是page2组件');
</script>

<template>
  <div class="page2-container">
    <Card title="Page 2" :bordered="false">
      <div class="content">
        <h1>page1</h1>
        <p>{{ msg }}</p>
      </div>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.page2-container {
  padding: 24px;
  min-height: 100%;
}

.content {
  padding: 20px 0;
}
</style>