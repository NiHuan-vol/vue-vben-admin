<template>
  <ContentWrapper class="content-warpper-2">
    <div class="content-header-2">
      <div class="header">
        <span class="name">套餐名称：{{ billData.baseSettingName || '未选择' }}</span>
        <span class="bt">
          <Button
            type="primary"
            size="small"
            @click="goToSelect"
            v-show="!billData.id"
          >
            选择
          </Button>
          <Button
            type="primary"
            size="small"
            @click="goToSelect"
            v-show="billData.id"
          >
            变更
          </Button>
        </span>
      </div>
    </div>
    <Content>
      <Tabs v-model:activeKey="activeKey" @change="callback" class="tab-class">
        <TabPane key="1" tab="套餐余额">
          <Descriptions
            title=""
            layout="vertical"
            bordered
            :column="{ xxl: 6, xl: 6, lg: 6, md: 5, sm: 4, xs: 3 }"
          >
            <DescriptionsItem label="套餐名称">
              {{ billData.baseSettingName }}
            </DescriptionsItem>
            <DescriptionsItem label="固定分钟数">
              {{ billData.baseMinutes }}
            </DescriptionsItem>
            <DescriptionsItem label="套餐内使用分钟数">
              {{ billData.baseMinutesUsed }}
            </DescriptionsItem>
            <DescriptionsItem label="超出分钟数">
              <span style="color: #F59A23; font-weight: 700">
                {{ billData.otherMinutes }}
              </span>
            </DescriptionsItem>
            <DescriptionsItem label="超出分钟数费率">
              {{ billData.price || 'xx' }} 元/分钟
            </DescriptionsItem>
            <DescriptionsItem label="超出部分总金额" :span="3">
              <span style="color: #F59A23; font-weight: 700">
                {{ otherAmount }} 元
              </span>
            </DescriptionsItem>
            <DescriptionsItem label="总金额">
              <span style="color: #F59A23; font-weight: 700">
                {{ billData.orderAmount }}
              </span>
            </DescriptionsItem>
          </Descriptions>
        </TabPane>
      </Tabs>
    </Content>
  </ContentWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ContentWrapper, Content, Tabs, TabPane, Descriptions, DescriptionsItem, Button, message } from 'ant-design-vue';
import { getCurrentBillByCompany } from '@/api/crm/call/callBill';
import { storeToRefs } from 'pinia';

type BillDataType = {
  id?: number;
  baseSettingName?: string;
  baseMinutes?: number;
  baseMinutesUsed?: number;
  otherMinutes?: number;
  price?: number;
  orderAmount?: number;
};

const store = useStore();
const router = useRouter();
const loading = ref(false);

const activeKey = ref(1);
const billData = reactive<BillDataType>({});

const userInfo = computed(() => store.state.user.info);
const permissions = computed(() => store.state.user.permissions);

const otherAmount = computed(() => {
  const { otherMinutes, price } = billData;
  if (!otherMinutes || !price) return 0.00;
  return (otherMinutes * price).toFixed(2);
});

const goToSelect = () => {
  router.push('/crm/call/changeBaseSetting');
};

const reLoadData = () => {
  getCurrentBillByCompanyData();
};

const callback = (key: number) => {
  activeKey.value = key;
};

const getCurrentBillByCompanyData = () => {
  loading.value = true;
  getCurrentBillByCompany()
    .then((response) => {
      if (response.code === 200) {
        const { data } = response;
        if (data) {
          Object.assign(billData, data);
        }
      }
    })
    .catch((error) => {
      console.error(error);
      message.error('网络异常，请重试');
    }).finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  reLoadData();
});

onActivated(() => {
  reLoadData();
});
</script>

<style lang="less" scoped>
/deep/ .ant-descriptions-item-label {
  background-color: #dbdbdb !important;
}

.border-t-95 {
  border-top: 1px solid #e8e8e8;
}

.detail-box {
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 2px;
  position: relative;
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
  font-size: 14px;
  margin: 0px 10% 10px 10%;

  .detail-header {
    padding: 14.5px 24px;
    border-bottom: 1px solid #e8e8e8;
    color: rgba(0, 0, 0, 0.85);
    min-height: 40px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 2px 2px 0 0;
  }

  .detail-content {
    padding: 8px 24px 3px 24px;

    .detail-item {
      margin-bottom: 5px;

      .detail-title {
        display: inline-block;
        width: 120px;
        margin-right: 8px;
        color: #7b7979;
      }

      .detail-text {
        color: #333 !important;
      }
    }
  }
}

// 头部
.header {
  margin: 5px 20px;

  .bt {
    margin-left: 10px;
  }
}

.content-warpper-2 {
  padding: 16px;
}

.content-header-2 {
  margin-bottom: 16px;
}
</style>