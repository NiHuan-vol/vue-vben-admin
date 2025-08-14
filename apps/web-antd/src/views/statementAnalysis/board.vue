<script lang="ts" setup>
import { ref } from 'vue';
import { Card } from 'ant-design-vue';

defineOptions({ name: 'StatementAnalysisBoard' });

const title = ref('仪表盘');
</script>

<template>
  <div class="statement-analysis-container">
    <Card :title="title" :bordered="false">
      <div class="content">
        <!-- 这里可以添加仪表盘图表和数据 -->
        <p>仪表盘内容将在这里展示</p>
      </div>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.statement-analysis-container {
  padding: 24px;
  min-height: 100%;
}

.content {
  padding: 20px 0;
}
</style>