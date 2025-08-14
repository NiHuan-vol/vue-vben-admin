<script lang="ts" setup>
import { Card } from 'ant-design-vue';

defineOptions({ name: 'About' });
</script>

<template>
  <div class="about-container">
    <Card title="关于我们" :bordered="false">
      <div class="about-content">
        <h1>This is an about page</h1>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.about-container {
  padding: 24px;
  min-height: 100%;
}

.about-content {
  padding: 20px 0;
}
</style>