<template>
  <div class="customize-manager">
    <PageHeader title="客户基础设置" />
    <div class="content-wrapper">
      <!-- 内容区域 -->
      <div class="config-items">
        <ConfigItem
          title="业务设置"
          icon="setting"
          description="配置客户相关的业务参数"
          to="/crm/customize/businessSet"
        />
        <ConfigItem
          title="代码设置"
          icon="code"
          description="配置系统中的代码参数"
          to="/crm/customize/codeSet"
        />
        <ConfigItem
          title="合同设置"
          icon="file-text"
          description="配置合同相关参数"
          to="/crm/customize/contractSet"
        />
        <ConfigItem
          title="客户设置"
          icon="user"
          description="配置客户相关参数"
          to="/crm/customize/customerSet"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PageHeader } from '/@/components/Page';
import { ConfigItem } from './components/ConfigItem';

// 可以添加一些基础数据和逻辑
const activeTab = ref('business');

// 页面初始化逻辑
const initPage = () => {
  // 可以添加一些初始化代码
};

initPage();
</script>

<style scoped lang="scss">
.customize-manager {
  padding: 20px;
}

.content-wrapper {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
}

.config-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>