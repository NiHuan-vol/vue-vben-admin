<script lang="ts" setup>
import type { WorkbenchProjectItem } from '@vben/common-ui';
import { ref } from 'vue';
import { Card, Row, Col } from 'ant-design-vue';
import { useUserStore } from '@vben/stores';
import { preferences } from '@vben/preferences';

defineOptions({ name: 'Workplace' });

const userStore = useUserStore();

// 数据模型定义
const dashboardItems = ref<WorkbenchProjectItem[]>([
  {
    color: '#17a2b8',
    content: '150',
    date: '',
    group: '',
    icon: 'pie-chart',
    title: '采购统计',
    url: '',
  },
  {
    color: '#28a745',
    content: '12%',
    date: '',
    group: '',
    icon: 'bar-chart',
    title: '生产统计',
    url: '',
  },
  {
    color: '#ffc107',
    content: '678',
    date: '',
    group: '',
    icon: 'area-chart',
    title: '财务统计',
    url: '',
  },
  {
    color: '#dc3545',
    content: '9935',
    date: '',
    group: '',
    icon: 'reddit',
    title: '销售统计',
    url: '',
  },
]);

// 处理点击事件
function handleItemClick(item: WorkbenchProjectItem) {
  // 这里可以添加点击事件的逻辑
  console.log('点击了:', item.title);
}
</script>

<template>
  <div class="p-5 h-full bg-gray-50">
    <Card :bordered="false" class="mb-5">
      <template #title>
        <div class="text-lg font-semibold flex items-center">
          <span>仪表盘</span>
        </div>
      </template>
      <Row gutter={16}>
        <Col :xxl="6" :xl="6" :lg="12" :md="12" :sm="12" :xs="24" v-for="(item, index) in dashboardItems" :key="index">
          <div 
            class="h-36 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg"
            :style="{ backgroundColor: item.color }"
            @click="handleItemClick(item)"
          >
            <div class="p-4 text-white h-full flex flex-col justify-between">
              <div class="flex justify-between items-start">
                <span class="text-3xl font-bold">{{ item.content }}</span>
                <a-icon :type="item.icon" class="text-4xl opacity-70" />
              </div>
              <div class="text-white/90 font-medium">{{ item.title }}</div>
            </div>
          </div>
        </Col>
      </Row>
    </Card>

    <!-- 可以根据需要添加更多内容区域 -->
  </div>
</template>

<style scoped lang="scss">
// 可以添加自定义样式
</style>