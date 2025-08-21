<!--生产报表-->
<template>
  <div class="production-report-container">
    <div class="report-box">
      <a-row gutter={[16, 16]}>
        <a-col :span="6" v-for="(item, index) in reportItems" :key="index" class="item-box">
          <router-link :to="item.path">
            <a-icon class="icon" :type="item.icon" />
            <div class="item-text">{{ item.text }}</div>
          </router-link>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { SnippetsOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '/@/store/modules/app';
import { usePermission } from '/@/hooks/web/usePermission';

const appStore = useAppStore();
const { hasPermission } = usePermission();
const router = useRouter();

// 报表项配置
const reportItems = ref([
  {
    path: '/production/productionWorkCumSummary',
    icon: 'snippets',
    text: '生产订单执行汇总表',
  },
  {
    path: '/production/productionWorkCumDetailVo',
    icon: 'snippets',
    text: '生产订单执行明细表',
  },
  {
    path: '/production/productionPickReturnCumSummaryVo',
    icon: 'snippets',
    text: '生产订单领料汇总表',
  },
  {
    path: '/production/productionPickReturnCumDetailVo',
    icon: 'snippets',
    text: '生产订单领料明细表',
  },
  {
    path: '/production/productionPickAbnormalVo',
    icon: 'snippets',
    text: '生产领料异常表',
  },
  {
    path: '/production/productionPickAbnormalSumVo',
    icon: 'snippets',
    text: '生产领料差异汇总表',
  },
  {
    path: '/production/productionWorkInAndPick',
    icon: 'snippets',
    text: '生产入库领料查询',
  },
  {
    path: '/production/productionMonthInVo',
    icon: 'snippets',
    text: '生产入库月报',
  },
  {
    path: '/production/productionPickReturnMonthSummaryVo',
    icon: 'snippets',
    text: '生产领料月报',
  },
]);
</script>

<style lang="less" scoped>
.production-report-container {
  padding: 24px;
}

.report-box {
  padding: 20px;
  text-align: center;

  .icon {
    font-size: 36px;
    color: @primary-color;
  }

  .item-box {
    cursor: pointer;
    padding: 20px;
    border-radius: 8px;
    transition: all 0.3s;
    background-color: @background-color-light;

    &:hover {
      color: @primary-color;
      background-color: @background-color-hover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  }

  .item-text {
    margin-top: 10px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>