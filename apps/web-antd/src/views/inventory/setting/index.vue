<template>
  <div class="inventory-setting-container">
    <Tabs v-model:activeKey="activeKey">
      <TabPane tab="仓库设置" key="warehouse">
        <WarehouseSetting />
      </TabPane>
      <TabPane tab="库存分类" key="category">
        <CategorySetting />
      </TabPane>
      <TabPane tab="计量单位" key="unit">
        <UnitSetting />
      </TabPane>
      <TabPane tab="库存预警" key="alert">
        <AlertSetting />
      </TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Tabs, TabPane } from 'ant-design-vue';
import WarehouseSetting from './WarehouseSetting.vue';
import CategorySetting from './CategorySetting.vue';
import UnitSetting from './UnitSetting.vue';
import AlertSetting from './AlertSetting.vue';

// 当前激活的标签页
const activeKey = ref('warehouse');
</script>

<style scoped lang="less">
.inventory-setting-container {
  padding: 24px;
}

.ant-tabs {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
</style>