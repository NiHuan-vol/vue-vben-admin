<template>
  <PageWrapper title="客户详情" :tabList="tabList" @tabChange="handleTabChange">
    <div v-if="activeTab === 'base'" class="customer-detail-base">
      <!-- 基础信息卡片 -->
      <Card title="基础信息" class="mb-4">
        <Descriptions column={2} :title="null" :dataSource="baseInfoItems" />
      </Card>

      <!-- 联系方式卡片 -->
      <Card title="联系方式" class="mb-4">
        <Descriptions column={2} :title="null" :dataSource="contactInfoItems" />
      </Card>

      <!-- 备注信息卡片 -->
      <Card title="备注信息">
        <div v-if="customerDetail.description" class="description-content">
          {{ customerDetail.description }}
        </div>
        <div v-else class="no-data-text">无备注信息</div>
      </Card>
    </div>

    <div v-else-if="activeTab === 'business'" class="customer-detail-business">
      <!-- 商机信息列表 -->
      <BasicTable
        @register="registerBusinessTable"
        :columns="businessColumns"
        :requestFn="loadBusinessData"
        :rowKey="'id'"
        :pagination="paginationConfig"
      />
    </div>

    <div v-else-if="activeTab === 'contract'" class="customer-detail-contract">
      <!-- 合同信息列表 -->
      <BasicTable
        @register="registerContractTable"
        :columns="contractColumns"
        :requestFn="loadContractData"
        :rowKey="'id'"
        :pagination="paginationConfig"
      />
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMessage } from '@vben/hooks/web/useMessage';
import { PageWrapper, Card, Descriptions, BasicTable } from '@vben/components';
import { getCustomerDetail, getBusinessListByCustomer, getContractListByCustomer } from '#/api/crm/customer';
import { useTable } from '@vben/hooks/web/useTable';

// 路由参数
const route = useRoute();
const customerId = computed(() => route.params.id as string);
const tabkey = computed(() => route.query.tabkey as string);

// 选项卡数据
const tabList = [
  { key: 'base', tab: '基础信息' },
  { key: 'business', tab: '商机信息' },
  { key: 'contract', tab: '合同信息' },
];
const activeTab = ref('base');

// 客户详情数据
const customerDetail = reactive<Recordable>({});
const loading = ref(false);
const message = useMessage();

// 基础信息项
const baseInfoItems = computed(() => [
  { key: 'crmName', label: '客户名称', value: customerDetail.crmName || '-' },
  { key: 'crmNo', label: '客户编号', value: customerDetail.crmNo || '-' },
  { key: 'level', label: '客户等级', value: customerDetail.level || '-' },
  { key: 'ownerName', label: '负责人', value: customerDetail.ownerName || '-' },
  { key: 'industry', label: '所属行业', value: customerDetail.industry || '-' },
  { key: 'scale', label: '客户规模', value: customerDetail.scale || '-' },
  { key: 'source', label: '客户来源', value: customerDetail.source || '-' },
  { key: 'createTime', label: '创建时间', value: customerDetail.createTime || '-' },
]);

// 联系方式项
const contactInfoItems = computed(() => [
  { key: 'contactName', label: '联系人', value: customerDetail.contactName || '-' },
  { key: 'contactPhone', label: '联系电话', value: customerDetail.contactPhone || '-' },
  { key: 'email', label: '电子邮箱', value: customerDetail.email || '-' },
  { key: 'address', label: '联系地址', value: customerDetail.address || '-' },
  { key: 'website', label: '网站', value: customerDetail.website || '-' },
]);

// 加载客户详情
const loadCustomerDetail = async () => {
  if (!customerId.value) return;

  try {
    loading.value = true;
    const result = await getCustomerDetail(customerId.value);
    Object.assign(customerDetail, result);
  } catch (error) {
    message.error('获取客户详情失败');
  } finally {
    loading.value = false;
  }
};

// 商机表格配置
const businessColumns = [
  { title: '商机名称', dataIndex: 'businessTitle', key: 'businessTitle', width: 200 },
  { title: '预计金额', dataIndex: 'expectedAmount', key: 'expectedAmount', width: 120 },
  { title: '销售阶段', dataIndex: 'saleStage', key: 'saleStage', width: 120 },
  { title: '负责人', dataIndex: 'ownerName', key: 'ownerName', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
];

const { register: registerBusinessTable, tableProps: businessTableProps } = useTable({
  columns: businessColumns,
  requestFn: loadBusinessData,
  rowKey: 'id',
  pagination: paginationConfig,
});

// 加载商机数据
const loadBusinessData = async (params: any) => {
  try {
    const result = await getBusinessListByCustomer({
      customerId: customerId.value,
      page: params.current,
      pageSize: params.pageSize,
    });
    return {
      items: result.list || [],
      total: result.total || 0,
    };
  } catch (error) {
    message.error('获取商机数据失败');
    return { items: [], total: 0 };
  }
};

// 合同表格配置
const contractColumns = [
  { title: '合同名称', dataIndex: 'contractName', key: 'contractName', width: 200 },
  { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo', width: 150 },
  { title: '合同金额', dataIndex: 'contractAmount', key: 'contractAmount', width: 120 },
  { title: '签订日期', dataIndex: 'signDate', key: 'signDate', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
];

const { register: registerContractTable, tableProps: contractTableProps } = useTable({
  columns: contractColumns,
  requestFn: loadContractData,
  rowKey: 'id',
  pagination: paginationConfig,
});

// 加载合同数据
const loadContractData = async (params: any) => {
  try {
    const result = await getContractListByCustomer({
      customerId: customerId.value,
      page: params.current,
      pageSize: params.pageSize,
    });
    return {
      items: result.list || [],
      total: result.total || 0,
    };
  } catch (error) {
    message.error('获取合同数据失败');
    return { items: [], total: 0 };
  }
};

// 分页配置
const paginationConfig = {
  pageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条数据`,
};

// 处理选项卡切换
const handleTabChange = (key: string) => {
  activeTab.value = key;
};

// 初始化
onMounted(() => {
  // 如果有tabkey参数，则设置活动选项卡
  if (tabkey.value && tabList.some(item => item.key === tabkey.value)) {
    activeTab.value = tabkey.value;
  }
  loadCustomerDetail();
});
</script>

<style scoped lang="scss">
// 使用Vben-Admin的SCSS变量
@import '@vben/styles/mixins/index.scss';

.customer-detail-base {
  .card-container {
    margin-bottom: 20px;
  }

  .description-content {
    padding: 10px;
    line-height: 1.6;
  }

  .no-data-text {
    color: $text-color-placeholder;
    padding: 10px;
  }
}

.customer-detail-business,
.customer-detail-contract {
  margin-top: 20px;
}

// 详情项样式
.ant-descriptions-item-label {
  font-weight: 500;
}
</style>