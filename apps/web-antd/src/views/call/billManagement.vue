<template>
  <ContentWrapper class="content-warpper-2">
    <div class="content-header-2">
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2">
              <div class="btns" @click="reLoadData">
                <a-icon class="btns-icon" type="file-sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
    </div>
    <Content>
      <!-- 列表 -->
      <Table
        :columns="columns"
        :data-source="data"
        bordered
        :scroll="{ x: 1000, y: 200 }"
        :pagination="pagination"
        @change="onTableChange"
        :loading="!!loading"
      >
        <template #statusFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
          <a-radio-group
            v-model:value="postData.status"
            @change="onConditionChange"
            style="flex-direction: column;"
          >
            <a-radio :style="radioStyle" :value="null">所有</a-radio>
            <a-radio :style="radioStyle" :value="0">未结算</a-radio>
            <a-radio :style="radioStyle" :value="1">已结算</a-radio>
          </a-radio-group>
        </template>
        <template #filterIcon="{ filtered }">
          <a-icon type="filter" :style="{ color: filtered ? '#1890ff' : '#aaa' }" />
        </template>
      </Table>
    </Content>
  </ContentWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from 'vue';
import { useStore } from 'vuex';
import { Table, ContentWrapper, Content, Row, Col, Button, Icon, InputNumber, message } from 'ant-design-vue';
import { pageList } from '@/api/crm/call/callBill';
import { storeToRefs } from 'pinia';

type ColumnType = {
  align: 'left' | 'center' | 'right';
  title: string;
  dataIndex: string;
  width: number;
  customRender?: (text: any, record: any, index: number) => React.ReactNode;
  scopedSlots?: {
    filterDropdown?: string;
    filterIcon?: string;
  };
};

type DataType = {
  id: number;
  year: number;
  month: number;
  orderAmount: number;
  baseSettingName: string;
  baseCharges: number;
  baseMinutes: number;
  baseMinutesUsed: number;
  price: number;
  otherMinutes: number;
  otherAmount: number;
  status: 0 | 1;
  key: number;
};

const store = useStore();
const loading = ref(false);

const postData = reactive<{
  status: number | null;
  page: {
    current: number;
    size: number;
  };
}>({
  status: null,
  page: {
    current: 1,
    size: 20,
  },
});

const pagination = reactive<{
  defaultPageSize: number;
  size: 'small' | 'middle' | 'large';
  current: number;
  pageSize: number;
  total: number;
  showTotal: (total: number) => React.ReactNode;
  showQuickJumper: boolean;
  showLessItems: boolean;
}>({
  defaultPageSize: 20,
  size: 'small',
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => {
    return (
      <div>
        共 {total} 条数据，每页
        <InputNumber
          value={pagination.pageSize}
          min={1}
          max={500}
          onPressEnter={(e) => changePageSize(e)}
        />
        条
      </div>
    );
  },
  showQuickJumper: true,
  showLessItems: true,
});

const data = ref<DataType[]>([]);
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

const columns = ref<ColumnType[]>([
  {
    align: 'left',
    title: '年份',
    dataIndex: 'year',
    width: 120,
  },
  {
    align: 'left',
    title: '月份',
    dataIndex: 'month',
    width: 100,
  },
  {
    align: 'center',
    title: '账单金额',
    dataIndex: 'orderAmount',
    width: 80,
    customRender: (text) => {
      return text ? (
        <span style={{ color: '#F59A23', fontWeight: 700 }}>{text}</span>
      ) : text;
    },
  },
  {
    align: 'left',
    title: '套餐名称',
    dataIndex: 'baseSettingName',
    width: 120,
  },
  {
    align: 'left',
    title: '月低费(元/月)',
    dataIndex: 'baseCharges',
    width: 150,
  },
  {
    align: 'left',
    title: '固定分钟数',
    dataIndex: 'baseMinutes',
    width: 100,
  },
  {
    align: 'left',
    title: '套餐内使用分钟数',
    dataIndex: 'baseMinutesUsed',
    width: 100,
    customRender: (text) => {
      return text ? (
        <span style={{ color: '#F59A23', fontWeight: 700 }}>{text}</span>
      ) : text;
    },
  },
  {
    align: 'left',
    title: '超出部分费率(元/分钟)',
    dataIndex: 'price',
    width: 100,
  },
  {
    align: 'left',
    title: '超出分钟数',
    dataIndex: 'otherMinutes',
    width: 100,
    customRender: (text) => {
      return text ? (
        <span style={{ color: '#F59A23', fontWeight: 700 }}>{text}</span>
      ) : text;
    },
  },
  {
    align: 'left',
    title: '超出部分总金额',
    dataIndex: 'otherAmount',
    width: 100,
    customRender: (text, row) => {
      const { otherMinutes, price } = row;
      if (!otherMinutes || !price) return 0.00;
      const otherAmount = (otherMinutes * price).toFixed(2);
      return otherAmount ? (
        <span style={{ color: '#F59A23', fontWeight: 700 }}>{otherAmount}</span>
      ) : otherAmount;
    },
  },
  {
    align: 'center',
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: (text) => {
      switch (text) {
        case 0:
          return <span style={{ color: '#CD0019' }}>未结算</span>;
        case 1:
          return <span style={{ color: '#028C10' }}>已结算</span>;
        default:
          return '';
      }
    },
    scopedSlots: {
      filterDropdown: 'statusFilterDropdown',
      filterIcon: 'filterIcon',
    },
  },
]);

const userInfo = computed(() => store.state.user.info);
const permissions = computed(() => store.state.user.permissions);

const reLoadData = () => {
  pageListData();
};

const onTableChange = (pagination: any) => {
  Object.assign(postData, {
    page: {
      size: pagination.pageSize,
      current: pagination.current,
    },
  });
  Object.assign(pagination, {
    current: pagination.current,
    pageSize: pagination.pageSize,
  });
  pageListData();
};

const changePageSize = (e: any) => {
  const value = e.target.value;
  Object.assign(postData, {
    page: {
      size: value,
      current: 1,
    },
  });
  Object.assign(pagination, {
    pageSize: Number.parseInt(value),
    current: 1,
  });
  pageListData();
};

const onConditionChange = () => {
  postData.page.current = 1;
  pagination.current = 1;
  pageListData();
};

const pageListData = () => {
  loading.value = true;
  pageList(postData)
    .then((response) => {
      if (response.code === 200) {
        const { data: resData } = response;
        const { records, total, current, size } = resData;
        data.value = records.map((item: any) => ({
          ...item,
          key: item.id,
        }));
        Object.assign(pagination, {
          total,
          current,
          pageSize: size,
        });
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

<style scoped>
.content-warpper-2 {
  padding: 16px;
}
.content-header-2 {
  margin-bottom: 16px;
}
.btn-wrapper {
  margin-bottom: 16px;
}
.btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.btns-icon {
  font-size: 20px;
  margin-bottom: 4px;
}
.btns-text {
  font-size: 12px;
}
</style>