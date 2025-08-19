<template>
  <ContentWrap>
    <Content>
      <div class="mt-10">
        <a-tabs
          v-model:activeKey="tabKey"
          tabPosition="left"
          style="height: calc(100vh - 40px)"
          @change="handleTabChange"
        >
          <a-tab-pane key="1" tab="基本信息">
            <div class="tabpanel-container">
              <div class="mb-4 font-medium text-lg">基本信息</div>
              <div class="tabpanel_content overflow-y-auto" style="max-height: calc(100vh - 16rem);">
                <ProForm
                  :model="empInfo"
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 12 }"
                  layout="horizontal"
                >
                  <ProFormText
                    name="empName"
                    label="姓名"
                    :value="empInfo.empName"
                    disabled
                    placeholder="请输入姓名"
                  />
                  <ProFormRadioGroup
                    name="gender"
                    label="性别"
                    :options="genderOptions"
                    v-model:value="empInfo.gender"
                  />
                  <ProFormDatePicker
                    name="birthday"
                    label="出生日期"
                    v-model:value="empInfo.birthday"
                    placeholder="请选择出生日期"
                  />
                  <ProFormText
                    name="nation"
                    label="民族"
                    v-model:value="empInfo.nation"
                    placeholder="请输入民族"
                  />
                  <ProFormText
                    name="nativePlace"
                    label="籍贯"
                    v-model:value="empInfo.nativePlace"
                    placeholder="请输入籍贯"
                  />
                  <ProFormRadioGroup
                    name="maritalStatus"
                    label="婚姻状况"
                    :options="maritalStatusOptions"
                    v-model:value="empInfo.maritalStatus"
                  />
                  <ProFormRadioGroup
                    name="healthStatus"
                    label="身体状况"
                    :options="healthStatusOptions"
                    v-model:value="empInfo.healthStatus"
                  />
                  <ProFormText
                    name="height"
                    label="身高"
                    v-model:value="empInfo.height"
                    placeholder="请输入身高"
                  />
                  <ProFormText
                    name="weight"
                    label="体重"
                    v-model:value="empInfo.weight"
                    placeholder="请输入体重"
                  />
                  <ProFormText
                    name="certificatesNum"
                    label="身份证号码"
                    v-model:value="empInfo.certificatesNum"
                    placeholder="请输入身份证号码"
                  />
                  <ProFormText
                    name="residentialAddress"
                    label="居住地址"
                    v-model:value="empInfo.residentialAddress"
                    placeholder="请输入居住地址"
                  />
                  <ProFormText
                    name="address"
                    label="家庭地址"
                    v-model:value="empInfo.address"
                    placeholder="请输入家庭地址"
                  />
                  <ProFormText
                    name="emergencyContact"
                    label="紧急联系人"
                    v-model:value="empInfo.emergencyContact"
                    placeholder="请输入紧急联系人"
                  />
                  <ProFormText
                    name="emergencyContactPhone"
                    label="紧急联系方式"
                    v-model:value="empInfo.emergencyContactPhone"
                    placeholder="请输入紧急联系方式"
                  />
                  <ProFormText
                    name="email"
                    label="E-mail"
                    v-model:value="empInfo.email"
                    placeholder="请输入邮箱"
                  />
                  <ProFormText
                    name="qq"
                    label="QQ号码"
                    v-model:value="empInfo.qq"
                    placeholder="请输入QQ号码"
                  />
                  <ProFormText
                    name="wechat"
                    label="微信"
                    v-model:value="empInfo.wechat"
                    placeholder="请输入微信"
                  />
                  <ProFormText
                    name="education"
                    label="最高学历"
                    v-model:value="empInfo.education"
                    placeholder="请输入最高学历"
                  />
                  <ProFormText
                    name="graduatedFrom"
                    label="毕业院校"
                    v-model:value="empInfo.graduatedFrom"
                    placeholder="请输入毕业院校"
                  />
                  <ProFormItem
                    :wrapperCol="{ span: 12, offset: 5 }"
                  >
                    <a-button type="primary" @click="handleSaveEmp">保存</a-button>
                  </ProFormItem>
                </ProForm>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="简历">
            <div class="p-4 text-center text-gray-500">简历功能待开发</div>
          </a-tab-pane>
          <a-tab-pane key="3" tab="入职登记表">
            <div class="p-4 text-center text-gray-500">入职登记表功能待开发</div>
          </a-tab-pane>
          <a-tab-pane key="4" tab="银行卡号">
            <div class="flex justify-between items-center mb-4">
              <div class="font-medium text-lg">银行卡管理</div>
              <div class="flex space-x-2">
                <a-button type="primary" @click="handleAddBank">新增</a-button>
                <a-button type="danger" @click="handleDeleteBank" :disabled="selectedRowKeys.length === 0">删除</a-button>
              </div>
            </div>
            <BasicTable
              :columns="columns"
              :dataSource="bankList"
              :pagination="pagination"
              :rowSelection="{ selectedRowKeys, onChange: handleRowSelectionChange }"
              @change="handleTableChange"
              bordered
              style="height: calc(100vh - 16rem)"
            />
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 提现模态框 -->
      <Modal
        v-model:visible="commissionVisible"
        title="提现"
        centered
      >
        <div class="p-4">
          <ProFormText
            name="commission"
            label="提现金额"
            v-model:value="commission"
            placeholder="请输入提现金额"
            :rules="[{ required: true, message: '提现金额不能为空' }, { validator: validateCommission }]"
          />
          <div class="mt-4 text-sm text-gray-500">
            可提现金额: <span class="text-green-600 font-medium">{{ surplusCommission }}</span> 元
          </div>
        </div>
        <template #footer>
          <a-button key="submit" type="primary" @click="handleWithdrawal">立即提现</a-button>
          <a-button key="back" @click="commissionVisible = false">取消</a-button>
        </template>
      </Modal>

      <!-- 银行卡编辑模态框 -->
      <Modal
        v-model:visible="bankModalVisible"
        :title="editBankId ? '编辑银行卡' : '新增银行卡'"
        centered
        width="720px"
      >
        <ProForm
          :model="bankForm"
          :labelCol="{ span: 6 }"
          :wrapperCol="{ span: 16 }"
          layout="horizontal"
          @finish="handleSaveBank"
        >
          <ProFormText
            name="bankName"
            label="开户银行"
            v-model:value="bankForm.bankName"
            placeholder="请输入开户银行"
            :rules="[{ required: true, message: '开户银行不能为空' }]"
          />
          <ProFormText
            name="bankCode"
            label="银行卡号"
            v-model:value="bankForm.bankCode"
            placeholder="请输入银行卡号"
            :rules="[{ required: true, message: '银行卡号不能为空' }]"
          />
          <ProFormText
            name="userName"
            label="姓名"
            v-model:value="bankForm.userName"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '姓名不能为空' }]"
          />
        </ProForm>
        <template #footer>
          <a-button key="reset" @click="handleResetBankForm">重置</a-button>
          <a-button key="submit" type="primary" @click="handleSaveBank">保存</a-button>
          <a-button key="back" @click="bankModalVisible = false">关闭</a-button>
        </template>
      </Modal>
    </Content>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { BasicTable, TableAction } from '@/components/Table';
import { ProForm, ProFormText, ProFormItem, ProFormRadioGroup, ProFormDatePicker } from '@/components/ProForm';
import { Modal } from 'ant-design-vue';
import { Content, ContentWrap } from '@/components/Layout';
import { info as getEmpInfoApi, save as saveEmpInfoApi } from '@/api/system/employee';
import { pageList as getBankListApi, saveBank as saveBankApi, deleteBank as deleteBankApi } from '@/api/personal/userBank';
import { withdrawalCommission as withdrawalCommissionApi } from '@/api/personal/commission';
import { useForm } from '@ant-design-vue/pro-components';

// 标签页状态
const tabKey = ref('1');

// 员工信息
const empInfo = reactive<{
  empName: string;
  gender: number;
  birthday: string;
  nation: string;
  nativePlace: string;
  maritalStatus: number;
  healthStatus: number;
  height: string;
  weight: string;
  certificatesNum: string;
  residentialAddress: string;
  address: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  email: string;
  qq: string;
  wechat: string;
  education: string;
  graduatedFrom: string;
}>({
  empName: '',
  gender: 1,
  birthday: '',
  nation: '',
  nativePlace: '',
  maritalStatus: 0,
  healthStatus: 0,
  height: '',
  weight: '',
  certificatesNum: '',
  residentialAddress: '',
  address: '',
  emergencyContact: '',
  emergencyContactPhone: '',
  email: '',
  qq: '',
  wechat: '',
  education: '',
  graduatedFrom: '',
});

// 下拉选项
const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 0 },
];

const maritalStatusOptions = [
  { label: '未婚', value: 0 },
  { label: '已婚', value: 1 },
  { label: '其他', value: 2 },
];

const healthStatusOptions = [
  { label: '健康', value: 0 },
  { label: '不健康', value: 1 },
  { label: '其他', value: 2 },
];

// 银行卡相关
const bankList = ref<any[]>([]);
const pagination = reactive<{
  current: number;
  pageSize: number;
  total: number;
}>({
  current: 1,
  pageSize: 20,
  total: 0,
});

const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const bankModalVisible = ref(false);
const editBankId = ref<string>('');
const bankForm = reactive<{
  bankName: string;
  bankCode: string;
  userName: string;
}>({
  bankName: '',
  bankCode: '',
  userName: '',
});

// 提现相关
const commissionVisible = ref(false);
const commission = ref<number | null>(null);
const totalCommission = ref(0);
const withdrawalCommission = ref(0);
const surplusCommission = ref(0);

// 银行卡表格列定义
const columns = [
  {
    title: '开户银行',
    dataIndex: 'bankName',
    key: 'bankName',
    width: 120,
    customRender: ({ text, record }) => (
      <a href="javascript:;" onClick={() => handleEditBank(record)}>{text}</a>
    ),
  },
  {
    title: '银行卡号',
    dataIndex: 'bankCode',
    key: 'bankCode',
    width: 180,
  },
  {
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right',
    customRender: ({ record }) => (
      <TableAction
        actions={[
          {
            label: '编辑',
            onClick: () => handleEditBank(record),
          },
          {
            label: '删除',
            onClick: () => handleDeleteSingleBank(record.id),
            confirm: '确定要删除该银行卡吗？',
          },
        ]}
      />
    ),
  },
];

// 标签页切换
const handleTabChange = (key: string) => {
  tabKey.value = key;
  if (key === '4') {
    fetchBankList();
  }
};

// 获取员工信息
const fetchEmpInfo = async () => {
  try {
    const response = await getEmpInfoApi();
    if (response.code === 200) {
      Object.assign(empInfo, response.data);
    }
  } catch (error) {
    console.error('获取员工信息失败:', error);
    message.error('获取员工信息失败');
  }
};

// 保存员工信息
const handleSaveEmp = async () => {
  try {
    const response = await saveEmpInfoApi(empInfo);
    if (response.code === 200) {
      message.success('保存成功');
    }
  } catch (error) {
    console.error('保存员工信息失败:', error);
    message.error('保存失败，请重试');
  }
};

// 获取银行卡列表
const fetchBankList = async () => {
  try {
    const response = await getBankListApi({
      current: pagination.current,
      size: pagination.pageSize,
    });
    if (response.code === 200) {
      const { records, total } = response.data;
      bankList.value = records;
      pagination.total = total;
    }
  } catch (error) {
    console.error('获取银行卡列表失败:', error);
    message.error('获取银行卡列表失败');
  }
};

// 表格分页变更
const handleTableChange = (paginationObj: any) => {
  Object.assign(pagination, paginationObj);
  fetchBankList();
};

// 行选择变更
const handleRowSelectionChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

// 新增银行卡
const handleAddBank = () => {
  editBankId.value = '';
  Object.assign(bankForm, {
    bankName: '',
    bankCode: '',
    userName: '',
  });
  bankModalVisible.value = true;
};

// 编辑银行卡
const handleEditBank = (record: any) => {
  editBankId.value = record.id;
  Object.assign(bankForm, {
    bankName: record.bankName,
    bankCode: record.bankCode,
    userName: record.userName,
  });
  bankModalVisible.value = true;
};

// 保存银行卡
const handleSaveBank = async () => {
  try {
    const params = {
      ...bankForm,
      id: editBankId.value || undefined,
    };
    const response = await saveBankApi(params);
    if (response.code === 200) {
      message.success('保存成功');
      bankModalVisible.value = false;
      fetchBankList();
    }
  } catch (error) {
    console.error('保存银行卡失败:', error);
    message.error('保存失败，请重试');
  }
};

// 重置银行卡表单
const handleResetBankForm = () => {
  Object.assign(bankForm, {
    bankName: '',
    bankCode: '',
    userName: '',
  });
};

// 删除选中银行卡
const handleDeleteBank = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.error('请选择要删除的银行卡');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '您确定要删除选中的银行卡吗？',
    onOk: async () => {
      try {
        const response = await deleteBankApi(selectedRowKeys.value);
        if (response.code === 200) {
          message.success('删除成功');
          fetchBankList();
          selectedRowKeys.value = [];
        }
      } catch (error) {
        console.error('删除银行卡失败:', error);
        message.error('删除失败，请重试');
      }
    },
  });
};

// 删除单条银行卡
const handleDeleteSingleBank = async (id: string) => {
  Modal.confirm({
    title: '提示',
    content: '您确定要删除该银行卡吗？',
    onOk: async () => {
      try {
        const response = await deleteBankApi([id]);
        if (response.code === 200) {
          message.success('删除成功');
          fetchBankList();
        }
      } catch (error) {
        console.error('删除银行卡失败:', error);
        message.error('删除失败，请重试');
      }
    },
  });
};

// 提现验证
const validateCommission = (rule: any, value: number, callback: any) => {
  if (value === null || value <= 0) {
    callback('提现金额必须大于0！');
    return;
  }
  if (value > surplusCommission.value) {
    callback('可提现金额不足！');
    return;
  }
  callback();
};

// 提交提现申请
const handleWithdrawal = async () => {
  if (commission.value === null || commission.value <= 0) {
    message.error('提现金额必须大于0！');
    return;
  }
  if (commission.value > surplusCommission.value) {
    message.error('可提现金额不足！');
    return;
  }

  try {
    const response = await withdrawalCommissionApi({
      amount: commission.value,
    });
    if (response.code === 200) {
      message.success('提现成功，正在加速审核中');
      commissionVisible.value = false;
      commission.value = null;
      // 刷新佣金数据
      // fetchCommissionData();
    } else {
      message.error(response.message || '提现失败');
    }
  } catch (error) {
    console.error('提现失败:', error);
    message.error('提现失败，请重试');
  }
};

// 初始化
onMounted(() => {
  fetchEmpInfo();
  // fetchCommissionData(); // 假设存在获取佣金数据的API
});
</script>

<style lang="less" scoped>
.tabpanel-container {
  width: 550px;
}

.tabpanel_content {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ant-advanced-search-form {
  padding: 24px;
  background: #fbfbfb;
}

.ant-advanced-search-form .ant-form-item {
  display: flex;
}

.ant-advanced-search-form .ant-form-item-control-wrapper {
  flex: 1;
}

:deep(.ant-form-item-label label) {
  font-weight: normal !important;
}
</style>