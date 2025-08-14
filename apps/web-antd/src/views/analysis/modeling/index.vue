<script lang="ts" setup>
import { ref } from 'vue';
import { Card } from 'ant-design-vue';

defineOptions({ name: 'ModelingIndex' });

const title = ref('建模分析');
</script>

<template>
  <div class="modeling-container">
    <Card :title="title" :bordered="false">
      <div class="content">
        <p>欢迎使用建模分析模块</p>
        <p>请从左侧菜单选择具体功能</p>
      </div>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.modeling-container {
  padding: 24px;
  min-height: 100%;
}

.content {
  padding: 20px 0;
}
</style>