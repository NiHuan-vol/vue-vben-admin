<template>
  <ContentWrapper class="content-warpper-2">
    <div class="content-header-2"></div>
    <Content>
      <!-- 列表 -->
      <Table
        :columns="columns"
        :data-source="data"
        bordered
        :scroll="{ x: 1000, y: 500 }"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="onTableChange"
        :loading="loading"
      />
    </Content>
  </ContentWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useStore } from 'vuex';
import { Table, ContentWrapper, Content } from 'ant-design-vue';
import { pageRecord } from '@/api/crm/call/callMinutes';
import { storeToRefs } from 'pinia';

type ColumnType = {
  align: 'left' | 'center' | 'right';
  title: string;
  dataIndex: string;
  width: number;
};

type DataType = {
  id: number;
  year: number;
  month: number;
  totalMinutes: number;
  baseMinutesUsed: number;
  generalMinutesUsedMonth: number;
  totalAmount: number;
  baseAmount: number;
  generalAmount: number;
  generalMinutesRemain: number;
  status?: number;
  key: number;
};

const store = useStore();
const { userInfo, permissions } = storeToRefs(store);

const postData = reactive<{
  page: {
    current: number;
    size: number;
  };
}>({
  page: {
    current: 1,
    size: 20,
  },
});

const selectedKeys = ref<number[]>([]);
const selectedData = ref<DataType[]>([]);
const loading = ref(false);
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
        <input
          type="number"
          value={pagination.pageSize}
          min={1}
          max={500}
          onInput={(e) => changePageSize(e.target.value)}
        />
        条
      </div>
    );
  },
  showQuickJumper: true,
  showLessItems: true,
});

const data = ref<DataType[]>([]);

const columns = ref<ColumnType[]>([
  {
    align: 'left',
    title: '年份',
    dataIndex: 'year',
    width: 80,
  },
  {
    align: 'left',
    title: '月份',
    dataIndex: 'month',
    width: 80,
  },
  {
    align: 'left',
    title: '总时长',
    dataIndex: 'totalMinutes',
    width: 80,
  },
  {
    align: 'center',
    title: '已用套餐分钟数',
    dataIndex: 'baseMinutesUsed',
    width: 80,
  },
  {
    align: 'center',
    title: '当月已用通用分钟',
    dataIndex: 'generalMinutesUsedMonth',
    width: 100,
  },
  {
    align: 'left',
    title: '总金额',
    dataIndex: 'totalAmount',
    width: 100,
  },
  {
    align: 'left',
    title: '套餐金额',
    dataIndex: 'baseAmount',
    width: 100,
  },
  {
    align: 'left',
    title: '通用金额',
    dataIndex: 'generalAmount',
    width: 100,
  },
  {
    align: 'left',
    title: '剩余通用分钟数',
    dataIndex: 'generalMinutesRemain',
    width: 100,
  },
]);

const userInfo = computed(() => store.state.user.info);
const permissions = computed(() => store.state.user.permissions);

const rowSelection = computed(() => {
  return {
    columnWidth: 30,
    selectedRowKeys: selectedKeys.value,
    onChange: userSelection,
    getCheckboxProps: (record: DataType) => ({
      props: {
        disabled: record.status !== undefined && record.status > 1,
      },
    }),
  };
});

const reLoadData = () => {
  pageList();
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
  pageList();
};

const changePageSize = (value: string) => {
  const numValue = Number.parseInt(value);
  Object.assign(postData, {
    page: {
      size: numValue,
      current: 1,
    },
  });
  Object.assign(pagination, {
    pageSize: numValue,
    current: 1,
  });
  pageList();
};

const userSelection = (keys: number[], rows: DataType[]) => {
  selectedKeys.value = keys;
  selectedData.value = rows;
};

const pageList = () => {
  loading.value = true;
  pageRecord(postData)
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
      message.error('获取通话记录数据失败');
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
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
</style>