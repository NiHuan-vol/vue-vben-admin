<template>
  <div class="content-wrapper a-base-container">
    <div class="overflow-auto m-2 border border-gray-200 bg-gray-50 h-[98%]">
      <!-- 佣金统计区域 -->
      <div class="money-main-box p-4 bg-white border-b border-gray-200">
        <div class="auto-out flex flex-wrap gap-6 justify-center items-center">
          <a-statistic
            title="总佣金"
            :value="totalCommission"
            :precision="2"
            :value-style="{ color: '#1890ff' }"
            style="min-width: 150px"
          />
          <a-statistic
            title="已提现佣金"
            :value="withdrawalCommission"
            :precision="2"
            :value-style="{ color: '#faad14' }"
            style="min-width: 150px"
          />
          <a-statistic
            title="可提现佣金"
            :value="surplusCommission"
            :precision="2"
            :value-style="{ color: '#52c41a' }"
            style="min-width: 150px"
          />
          <a-button
            type="primary"
            size="large"
            @click="handleWithdrawalClick"
            class="withdrawal-btn whitespace-nowrap"
          >
            提现
          </a-button>
        </div>
      </div>

      <!-- 标签页区域 -->
      <a-tabs
        v-model:activeKey="tabKey"
        @change="handleTabChange"
        class="m-2 bg-white"
      >
        <a-tab-pane key="2" tab="佣金记录">
          <BasicTable
            :columns="commissionColumns"
            :dataSource="commissionData"
            :pagination="pagination"
            @change="handleTableChange"
            bordered
            style="min-height: 200px"
            scroll={{ x: 500, y: 500 }}
          />
        </a-tab-pane>
        <a-tab-pane key="3" tab="提现记录">
          <BasicTable
            :columns="withdrawalColumns"
            :dataSource="withdrawalData"
            :pagination="pagination"
            @change="handleTableChange"
            bordered
            style="min-height: 200px"
            scroll={{ x: 500, y: 500 }}
          />
        </a-tab-pane>
      </a-tabs>

      <!-- 提现模态框 -->
      <Modal
        v-model:visible="commissionVisible"
        title="提现"
        centered
      >
        <ProForm
          :model="withdrawalForm"
          :labelCol="{ span: 7 }"
          :wrapperCol="{ span: 12 }"
          class="user-class"
        >
          <ProFormText
            name="bankName"
            label="银行卡名称"
            v-model:value="withdrawalForm.bankName"
            placeholder="请输入银行卡名称"
            :rules="[{ required: true, message: '银行卡名称不能为空' }]"
          />
          <ProFormText
            name="bankAccount"
            label="银行卡卡号"
            v-model:value="withdrawalForm.bankAccount"
            placeholder="请输入银行卡卡号"
            :rules="[{ required: true, message: '银行卡卡号不能为空' }]"
          />
          <ProFormText
            name="commission"
            label="提现金额"
            v-model:value="withdrawalForm.commission"
            placeholder="请输入提现金额"
            :rules="[
              { required: true, message: '提现金额不能为空' },
              { validator: validateCommission }
            ]"
          />
        </ProForm>
        <template #footer>
          <a-button key="back" @click="commissionVisible = false">取消</a-button>
          <a-button key="submit" type="primary" @click="handleSubmitWithdrawal">立即提现</a-button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { ProForm, ProFormText } from '@/components/ProForm';
import { Modal } from 'ant-design-vue';
import { getUserInfo, commissionRecord, withdrawalRecord, save as saveUserInfo, withdrawalCommission } from '@/api/personal/userInfo';

// 标签页状态
const tabKey = ref('2');

// 用户信息和佣金数据
const userInfo = reactive<{
  userId: string;
  email: string;
  bankAccount: string;
  bankName: string;
}>({
  userId: '',
  email: '',
  bankAccount: '',
  bankName: '',
});

const totalCommission = ref(0);
const withdrawalCommission = ref(0);
const surplusCommission = computed(() => {
  return Number((totalCommission.value - withdrawalCommission.value).toFixed(2));
});

// 表格数据
const commissionData = ref<any[]>([]);
const withdrawalData = ref<any[]>([]);
const postData = reactive<{
  current: number;
  size: number;
}>({
  current: 1,
  size: 20,
});

// 分页配置
const pagination = reactive<{
  current: number;
  pageSize: number;
  total: number;
  showTotal: (total: number) => React.ReactNode;
  showQuickJumper: boolean;
  showLessItems: boolean;
}>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => (
    <div className="flex items-center">
      共 {total} 条数据，每页
      <a-input-number
        defaultValue={pagination.pageSize}
        min={1}
        max={500}
        onChange={(value) => {
          if (value) {
            changePageSize(value);
          }
        }}
        style={{ width: 80, margin: '0 8px' }}
      />
      条
    </div>
  ),
  showQuickJumper: true,
  showLessItems: true,
});

// 提现相关
const commissionVisible = ref(false);
const withdrawalForm = reactive<{
  bankName: string;
  bankAccount: string;
  commission: string;
}>({
  bankName: '',
  bankAccount: '',
  commission: '',
});

// 佣金记录表格列定义
const commissionColumns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 120,
  },
  {
    title: '客户信息',
    dataIndex: 'companyName',
    key: 'companyName',
    width: 120,
  },
  {
    title: '实付金额',
    dataIndex: 'payAmount',
    key: 'payAmount',
    width: 120,
    customRender: ({ text }) => {
      return Number(text).toFixed(2);
    },
  },
  {
    title: '推客级次',
    dataIndex: 'rewardLevel',
    key: 'rewardLevel',
    width: 120,
  },
  {
    title: '佣金比例(%)',
    dataIndex: 'rewardRate',
    key: 'rewardRate',
    width: 120,
  },
  {
    title: '推客等级',
    dataIndex: 'retailLevelName',
    key: 'retailLevelName',
    width: 120,
  },
  {
    title: '上月等级系数',
    dataIndex: 'retailRate',
    key: 'retailRate',
    width: 100,
  },
  {
    title: '佣金收入(元)',
    dataIndex: 'rewardIncome',
    key: 'rewardIncome',
    width: 120,
    customRender: ({ text }) => {
      return Number(text).toFixed(2);
    },
  },
  {
    title: '付款时间',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 120,
  },
];

// 提现记录表格列定义
const withdrawalColumns = [
  {
    title: '提现金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    customRender: ({ text }) => {
      return Number(text).toFixed(2);
    },
  },
  {
    title: '提现银行',
    dataIndex: 'bankName',
    key: 'bankName',
    width: 120,
  },
  {
    title: '银行卡号',
    dataIndex: 'bankAccount',
    key: 'bankAccount',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    customRender: ({ text }) => {
      const status = ['已提现', '待审核', '审核中', '审核驳回', '待打款', '待到账'];
      return status[text as number] || '';
    },
  },
  {
    title: '提现时间',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 120,
  },
];

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo();
    if (response.code === 200) {
      const data = response.data;
      withdrawalCommission.value = data.withdrawalCommission;
      totalCommission.value = data.totalCommission;
      userInfo.userId = data.userId;
      userInfo.email = data.email;
      userInfo.bankAccount = data.bankAccount || '';
      userInfo.bankName = data.bankName || '';
      // 初始化提现表单
      withdrawalForm.bankAccount = userInfo.bankAccount;
      withdrawalForm.bankName = userInfo.bankName;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    message.error('获取用户信息失败');
  }
};

// 获取佣金记录
const fetchCommissionRecord = async () => {
  try {
    const response = await commissionRecord(postData);
    if (response.code === 200) {
      const { records, total } = response.data;
      commissionData.value = records;
      pagination.total = total;
    }
  } catch (error) {
    console.error('获取佣金记录失败:', error);
    message.error('获取佣金记录失败');
  }
};

// 获取提现记录
const fetchWithdrawalRecord = async () => {
  try {
    const response = await withdrawalRecord(postData);
    if (response.code === 200) {
      const { records, total } = response.data;
      withdrawalData.value = records;
      pagination.total = total;
    }
  } catch (error) {
    console.error('获取提现记录失败:', error);
    message.error('获取提现记录失败');
  }
};

// 标签页切换
const handleTabChange = (key: string) => {
  tabKey.value = key;
  if (key === '2') {
    fetchCommissionRecord();
  } else if (key === '3') {
    fetchWithdrawalRecord();
  }
};

// 表格分页变更
const handleTableChange = (paginationObj: any) => {
  Object.assign(pagination, paginationObj);
  Object.assign(postData, {
    current: paginationObj.current,
    size: paginationObj.pageSize,
  });
  if (tabKey.value === '2') {
    fetchCommissionRecord();
  } else if (tabKey.value === '3') {
    fetchWithdrawalRecord();
  }
};

// 改变分页大小
const changePageSize = (value: number) => {
  Object.assign(pagination, {
    pageSize: value,
  });
  Object.assign(postData, {
    size: value,
  });
  if (tabKey.value === '2') {
    fetchCommissionRecord();
  } else if (tabKey.value === '3') {
    fetchWithdrawalRecord();
  }
};

// 提现按钮点击
const handleWithdrawalClick = () => {
  commissionVisible.value = true;
};

// 提现金额验证
const validateCommission = (rule: any, value: string, callback: any) => {
  const commissionNum = Number(value);
  if (!value || isNaN(commissionNum)) {
    callback('请输入有效的提现金额');
    return;
  }
  if (commissionNum <= 0) {
    callback('提现金额必须大于0！');
    return;
  }
  if (commissionNum > surplusCommission.value) {
    callback('可提现金额不足！');
    return;
  }
  callback();
};

// 提交提现申请
const handleSubmitWithdrawal = async () => {
  // 先保存银行卡信息
  const sysUser = {
    bankAccount: withdrawalForm.bankAccount,
    bankName: withdrawalForm.bankName,
    id: userInfo.userId,
    email: userInfo.email,
  };

  try {
    // 保存银行卡信息
    const saveResponse = await saveUserInfo(sysUser);
    if (saveResponse.code === 200) {
      // 提交提现申请
      const withdrawalResponse = await withdrawalCommission({
        amount: Number(withdrawalForm.commission),
      });
      if (withdrawalResponse.code === 200) {
        message.success('提现成功，正在加速审核中');
        commissionVisible.value = false;
        // 刷新用户信息
        fetchUserInfo();
        // 刷新提现记录
        if (tabKey.value === '3') {
          fetchWithdrawalRecord();
        }
      }
    }
  } catch (error) {
    console.error('提现失败:', error);
    message.error('提现失败，请重试');
  }
};

// 初始化
onMounted(() => {
  fetchUserInfo();
  fetchCommissionRecord();
});
</script>

<style lang="less" scoped>
.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.money-main-box {
  padding: 10px;
  background: #ffffff;
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #ccc;
}

.auto-out {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.withdrawal-btn {
  margin-top: 16px;
  white-space: nowrap;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
}

:deep(.ant-form-item) {
  margin-bottom: 12px !important;
}
</style>