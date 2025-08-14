<template>
  <ContentWrapper class="content-warpper-2">
    <div class="content-header-2"></div>
    <Content>
      <div class="task-detail">
        <div class="task-detail-header">
          账户余额：<span class="balance">{{ accountData.balance || '0.00' }} 元</span>
        </div>
        <div class="task-detail-content">
          <Row>
            <Col :span="4" class="task-detail-item">
              <span class="task-detail-title">坐席总数:</span>
              <span class="task-detail-text">{{ agentStatistics.totalNumber }}</span>
            </Col>
            <Col :span="4" class="task-detail-item">
              <span class="task-detail-title">有效个数:</span>
              <span class="task-detail-text">{{ agentStatistics.enableNumber }}</span>
            </Col>
            <Col :span="4" class="task-detail-item">
              <span class="task-detail-title">失效个数:</span>
              <span class="task-detail-text">{{ agentStatistics.disableNumber }}</span>
            </Col>
          </Row>
        </div>
      </div>
      <div class="box">
        <div class="renwu-from">
          <div class="renwu-frisht">坐席单价</div>
          <div class="renwu-secend">{{ postData.price }}元/年</div>
        </div>
        <div class="renwu-from">
          <div class="renwu-frisht">购买个数</div>
          <div class="renwu-secend">
            <InputNumber
              v-model:value="postData.number"
              :min="1"
              :step="1"
              :precision="0"
              style="padding-left: 5px;"
            /> 个
          </div>
        </div>
        <div class="renwu-from">
          <div class="renwu-frisht">总金额</div>
          <div class="renwu-secend" style="color: #F59A23; font-weight: 700;">{{ totalAmount }}元</div>
        </div>
        <div class="renwu-from">
          <div class="renwu-frisht">我已了解</div>
          <div class="renwu-secend">
            <Checkbox
              v-model:checked="isAlreadyKnow"
              style="color: red;"
            >
              购买坐席的费用直接从账户余额中扣除；购买成功后，工作人员会在1-2个内为你开通
            </Checkbox>
          </div>
        </div>
        <div style="margin: 20px 0 20px 20%;">
          <Button type="primary" @click="handleSubmit" :loading="loading">立即购买</Button>
        </div>
      </div>
    </Content>
  </ContentWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ContentWrapper, Content, Row, Col, InputNumber, Checkbox, Button } from 'ant-design-vue';
import { saveAgentOrder } from '@/api/crm/call/agentManage';
import { getCrmCallAgentStatistics } from '@/api/crm/call/agentStatistcs';
import { getByCompany } from '@/api/expenses/expensesAccount';
import { storeToRefs } from 'pinia';

type AccountDataType = {
  balance: number;
};

type AgentStatisticsType = {
  totalNumber?: number;
  enableNumber?: number;
  disableNumber?: number;
};

type PostDataType = {
  price: number;
  number: number | null;
};

const router = useRouter();
const loading = ref(false);

const accountData = reactive<AccountDataType>({ balance: 0.00 });
const agentStatistics = reactive<AgentStatisticsType>({});
const postData = reactive<PostDataType>({ price: 1800, number: null });
const isAlreadyKnow = ref(false);

const totalAmount = computed(() => {
  const { price, number } = postData;
  return (price * (number || 0)).toFixed(2);
});

const reloadData = () => {
  getAccount();
  getCrmCallAgentStatisticsData();
};

const getAccount = () => {
  loading.value = true;
  getByCompany()
    .then((response) => {
      if (response.code === 200) {
        Object.assign(accountData, response.data);
      }
    })
    .catch((error) => {
      console.error(error);
      message.error('网络异常，请重试');
    }).finally(() => {
      loading.value = false;
    });
};

const getCrmCallAgentStatisticsData = () => {
  loading.value = true;
  getCrmCallAgentStatistics()
    .then((response) => {
      if (response.code === 200) {
        Object.assign(agentStatistics, response.data || {});
      }
    })
    .catch((error) => {
      console.error(error);
      message.error('购买失败，请重试');
    }).finally(() => {
      loading.value = false;
    });
};

const handleSubmit = () => {
  loading.value = true;
  const { postData: pd, isAlreadyKnow: know, accountData: ad } = {
    postData, isAlreadyKnow: isAlreadyKnow.value, accountData
  };

  if (!know) {
    message.warning('请勾选‘我已了解’');
    return;
  }

  const total = Number(totalAmount.value);
  if (ad.balance < total) {
    Modal.confirm({
      title: '提示',
      okText: '充值',
      content: <span>账户余额不足，请充值</span>,
      onOk() {
        router.push('/views/call/moneyManage');
      },
      onCancel() {},
    });
    return;
  }

  saveAgentOrder(pd)
    .then((response) => {
      if (response.code === 200) {
        postData.number = null;
        isAlreadyKnow.value = false;
        reloadData();
        Modal.confirm({
          title: '提示',
          okText: '订单管理',
          cancelText: '继续购买',
          content: <span>提交成功,你可以到订单里查询开通进度</span>,
          onOk() {
            router.push('/views/call/orderManage');
          },
          onCancel() {},
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

const onChange = (e: any) => {
  console.log(`checked = ${e.target.checked}`);
};

onMounted(() => {
  reloadData();
});

onActivated(() => {
  reloadData();
});
</script>

<style lang="less" scoped>
.box {
  border: 1px solid #e8e8e8;
  margin: 0px 5px 10px 5px;
  padding: 0 20px;

  .renwu-from {
    display: flex;
    min-height: 35px;
    line-height: 35px;
    margin-top: 10px;

    .renwu-frisht {
      width: 120px;
    }

    .renwu-secend {
      .play-btns {
        margin-left: 10px;
      }

      .ant-input,
      .ant-select-selection {
        width: 100%;
        outline: none;
        border: 1px solid #C6C1C1 !important;
        width: 100%;
      }
    }
  }
}

// 任务详情
.task-detail {
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 2px;
  position: relative;
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
  font-size: 14px;
  margin-top: -5px;
  margin: 0px 5px 10px 5px;

  .balance {
    color: #eb3b3b;
  }

  .task-detail-header {
    padding: 14.5px 24px;
    background: #f2f3f5;
    border-bottom: 1px solid #e8e8e8;
    color: rgba(0, 0, 0, 0.85);
    min-height: 40px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 2px 2px 0 0;
  }
}

.content-warpper-2 {
  padding: 16px;
}

.content-header-2 {
  margin-bottom: 16px;
}
</style>