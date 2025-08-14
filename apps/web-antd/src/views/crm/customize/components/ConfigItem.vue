<template>
  <a-card
    :bordered="false"
    class="config-item-card"
    @click="handleClick"
  >
    <div class="config-item-content">
      <div class="config-item-icon">
        <Icon :icon="icon" size="24" />
      </div>
      <div class="config-item-info">
        <h3 class="config-item-title">{{ title }}</h3>
        <p class="config-item-desc">{{ description }}</p>
      </div>
      <div class="config-item-arrow">
        <Icon icon="right" size="16" />
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '/@/components/Icon';

// 定义props
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});

// 路由跳转
const router = useRouter();
const handleClick = () => {
  router.push(props.to);
};
</script>

<style scoped lang="scss">
.config-item-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
  }
}

.config-item-content {
  display: flex;
  align-items: center;
  padding: 16px 0;
}

.config-item-icon {
  margin-right: 16px;
  color: #1890ff;
}

.config-item-info {
  flex: 1;
}

.config-item-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.config-item-desc {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0;
}

.config-item-arrow {
  color: rgba(0, 0, 0, 0.45);
}
</style>