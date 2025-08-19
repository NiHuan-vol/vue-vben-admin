<template>
  <div class="user-order-container">
    <Card :title="'订单管理'" class="mb-4">
      <div class="flex flex-wrap justify-between items-center mb-4">
        <div v-show="showSearch" class="flex flex-wrap gap-3 mb-2">
          <ProFormText
            name="orderNo"
            label="订单号"
            placeholder="请输入订单号"
            v-model:value="postData.orderNo"
            fieldProps={{ style: { width: '180px' } }}
          />
          <ProFormText
            name="crmName"
            label="商品名称"
            placeholder="请输入商品名称"
            v-model:value="postData.crmName"
            fieldProps={{ style: { width: '180px' } }}
          />
          <ProFormText
            name="companyName"
            label="租户名称"
            placeholder="请输入租户名称"
            v-model:value="postData.companyName"
            fieldProps={{ style: { width: '180px' } }}
          />
          <ProFormSelect
            name="orderStatus"
            label="支付状态"
            v-model:value="postData.orderStatus"
            :options="[
              { label: '全部', value: '' },
              { label: '已支付', value: 1 },
              { label: '未支付', value: 0 }
            ]"
            fieldProps={{ style: { width: '120px' } }}
          />
        </div>
        <Space>
          <Button type="primary" @click="fetchData">查询</Button>
          <Button @click="reset">重置</Button>
          <Button @click="toggleSearch">
            <Icon icon="ant-design:{{ showSearch ? 'up-outlined' : 'down-outlined' }}" />
            {{ showSearch ? '收起' : '展开' }}
          </Button>
        </Space>
      </div>

      <BasicTable
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        :row-selection="{ type: 'checkbox', onChange: handleSelectionChange }"
        @change="handleTableChange"
        :scroll="{ y: 500 }"
        bordered
      />
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { Card, Button, Space, ProFormText, ProFormSelect } from 'ant-design-vue';
import { BasicTable } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
import { orderPage } from '@/api/member/order';
import { message } from 'ant-design-vue';

// 数据定义
const data = ref<Array<Record<string, any>>>([]);
const total = ref(0);
const showSearch = ref(false);
const selectedKeys = ref<Array<string | number>>([]);
const selectedData = ref<Array<Record<string, any>>>([]);

// 查询参数
const postData = reactive({
  current: 1,
  size: 20,
  orderNo: '',
  crmName: '',
  companyName: '',
  orderStatus: ''
});

// 分页配置
const pagination = reactive({
  current: postData.current,
  pageSize: postData.size,
  total: total.value,
  showTotal: (total: number) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
});

// 表格列定义
const columns = [
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 120
  },
  {
    title: '订单日期',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 120
  },
  {
    title: '客户信息',
    dataIndex: 'companyName',
    key: 'companyName',
    width: 120
  },
  {
    title: '推客信息',
    dataIndex: 'userName',
    key: 'userName',
    width: 120
  },
  {
    title: '商品名称',
    dataIndex: 'goodsName',
    key: 'goodsName',
    width: 120
  },
  {
    title: '交易类型',
    dataIndex: 'orderType',
    key: 'orderType',
    width: 80,
    customRender: ({ text }) => {
      return text === 1 ? '购买' : text === 2 ? '升级' : '';
    }
  },
  {
    title: '实付金额',
    dataIndex: 'salePrice',
    key: 'salePrice',
    width: 80
  },
  {
    title: '付款状态',
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    width: 80,
    customRender: ({ text }) => {
      return text ? <span class="text-green-500">已付款</span> : <span class="text-red-500">未付款</span>;
    }
  },
  {
    title: '我的佣金',
    dataIndex: '',
    key: 'commission',
    width: 80
  },
  {
    title: '付款时间',
    dataIndex: 'payDate',
    key: 'payDate',
    width: 120
  }
];

// 生命周期钩子
onMounted(() => {
  fetchData();
});

// 获取订单列表
const fetchData = async () => {
  try {
    const response = await orderPage(postData);
    if (response.code === 200) {
      data.value = response.data.records;
      total.value = response.data.total;
      pagination.total = total.value;
    }
  } catch (error) {
    message.error('获取订单列表失败');
  }
};

// 切换搜索框显示
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};

// 重置查询条件
const reset = () => {
  postData.orderNo = '';
  postData.crmName = '';
  postData.companyName = '';
  postData.orderStatus = '';
  fetchData();
};

// 处理选择变化
const handleSelectionChange = (selectedRowKeys: Array<string | number>, selectedRows: Array<Record<string, any>>) => {
  selectedKeys.value = selectedRowKeys;
  selectedData.value = selectedRows;
};

// 处理表格分页变化
const handleTableChange = (pagination: any) => {
  postData.current = pagination.current;
  postData.size = pagination.pageSize;
  fetchData();
};
</script>

<style lang="less" scoped>
.user-order-container {
  .ant-card-body {
    padding: 16px;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .text-green-500 {
    color: #52c41a;
  }

  .text-red-500 {
    color: #f5222d;
  }
}
</style>