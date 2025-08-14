<template>
  <!-- 坐席分配情况弹窗 -->
  <Modal
    v-model:visible="visible"
    :title="modalTitle"
    @cancel="onModalClose"
    width="1000px"
  >
    <div class="form-search-wrapper" style="min-height: 200px;">
      <Table
        :scroll="{ x: 'auto', y: 400 }"
        :columns="columns"
        :data-source="dataSource"
        bordered
        :pagination="pagination"
        :loading="isLoadingSearching"
      >
        <template #userNameFilterDropdown="{ column }">
          <Input
            :placeholder="`搜索${column.title}`"
            v-model:value="postData[column.dataIndex]"
            @pressEnter="() => { postData.page.current = 1; pageList(); }"
            style="width: 188px; margin-bottom: 8px; display: block;"
          />
          <Button
            size="small"
            style="width: 90px; margin-right: 8px;"
            @click="() => { postData[column.dataIndex] = ''; pageList(); }"
          >
            重置
          </Button>
          <Button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px;"
            @click="() => { postData.page.current = 1; pageList(); }"
          >
            搜索
          </Button>
        </template>
        <template #officeNameFilterDropdown="{ column }">
          <Input
            :placeholder="`搜索${column.title}`"
            v-model:value="postData[column.dataIndex]"
            @pressEnter="() => { postData.page.current = 1; pageList(); }"
            style="width: 188px; margin-bottom: 8px; display: block;"
          />
          <Button
            size="small"
            style="width: 90px; margin-right: 8px;"
            @click="() => { postData[column.dataIndex] = ''; pageList(); }"
          >
            重置
          </Button>
          <Button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px;"
            @click="() => { postData.page.current = 1; pageList(); }"
          >
            搜索
          </Button>
        </template>
        <template #loginAccountFilterDropdown="{ column }">
          <Input
            :placeholder="`搜索${column.title}`"
            v-model:value="postData[column.dataIndex]"
            @pressEnter="() => { postData.page.current = 1; pageList(); }"
            style="width: 188px; margin-bottom: 8px; display: block;"
          />
          <Button
            size="small"
            style="width: 90px; margin-right: 8px;"
            @click="() => { postData[column.dataIndex] = ''; pageList(); }"
          >
            重置
          </Button>
          <Button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px;"
            @click="() => { postData.page.current = 1; pageList(); }"
          >
            搜索
          </Button>
        </template>
        <template #operation="{ record }">
          <Row v-if="!disabledUserIds.includes(record.userId)">
            <Button type="primary" size="small" @click="selectItem(record)">
              分配
            </Button>
          </Row>
        </template>
        <template #filterIcon="{ filtered }">
          <Icon type="filter" :style="{ color: filtered ? '#1890ff' : '#aaa' }" />
        </template>
      </Table>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Modal, Table, Input, Button, Row, Icon } from 'ant-design-vue';
import { pageCrmCallAgentUserVo } from '@/api/crm/call/agentManage';

type ColumnType = {
  align: 'left' | 'center' | 'right';
  title: string;
  dataIndex: string;
  width: number;
  customRender?: (text: any, record: any, index: number) => React.ReactNode;
  scopedSlots?: {
    filterDropdown?: string;
    filterIcon?: string;
    customRender?: string;
  };
};

type DataType = {
  userId: number;
  userName: string;
  officeName: string;
  loginAccount: string;
  bindingDate: string;
  status: 0 | 1 | 2;
  key: number;
};

const store = useStore();

const visible = ref(false);
const modalTitle = ref('');
const disabledUserIds = ref<number[]>([]);
const dataSource = ref<DataType[]>([]);
const isLoadingSearching = ref(false);

const postData = reactive<{
  userName?: string;
  officeName?: string;
  loginAccount?: string;
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

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

const columns = ref<ColumnType[]>([
  {
    align: 'left',
    title: '用户姓名',
    dataIndex: 'userName',
    width: 120,
    scopedSlots: {
      filterDropdown: 'userNameFilterDropdown',
      filterIcon: 'filterIcon',
    },
  },
  {
    align: 'left',
    title: '部门名称',
    dataIndex: 'officeName',
    width: 100,
    scopedSlots: {
      filterDropdown: 'officeNameFilterDropdown',
      filterIcon: 'filterIcon',
    },
  },
  {
    align: 'left',
    title: '账户名称',
    dataIndex: 'loginAccount',
    width: 100,
    scopedSlots: {
      filterDropdown: 'loginAccountFilterDropdown',
      filterIcon: 'filterIcon',
    },
  },
  {
    align: 'center',
    title: '绑定时间',
    dataIndex: 'bindingDate',
    width: 100,
  },
  {
    align: 'center',
    title: '坐席状态',
    dataIndex: 'status',
    width: 80,
    customRender: (text) => {
      // 状态 0：未启用 1.启用 2.暂停
      switch (text) {
        case 0:
          return <span>未启用</span>;
        case 1:
          return <span style={{ color: 'green' }}>启用</span>;
        case 2:
          return <span style={{ color: 'red' }}>暂停</span>;
        default:
          return '';
      }
    },
  },
  {
    align: 'center',
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    scopedSlots: {
      customRender: 'operation',
    },
  },
]);

const userInfo = computed(() => store.state.user.info);
const permissions = computed(() => store.state.user.permissions);

const onModalOpen = (data: any) => {
  Object.assign(postData, { page: { current: 1, size: 20 } });
  Object.assign(pagination, { current: 1 });
  Object.assign(postData, data);
  visible.value = true;
  disabledUserIds.value = data.disabledUserIds || [];
  modalTitle.value = data.modalTitle || '';
  pageList();
};

const onModalClose = () => {
  visible.value = false;
  postData.userName = '';
  postData.officeName = '';
  postData.loginAccount = '';
  postData.page.current = 1;
  postData.page.size = 20;
};

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

const selectItem = (record: DataType) => {
  // 这里应该触发父组件的回调
  // 假设父组件通过props传递了callBack函数
  // callBack && callBack(record);
  onModalClose();
};

const pageList = () => {
  isLoadingSearching.value = true;
  pageCrmCallAgentUserVo(postData)
    .then((response) => {
      if (response.code === 200) {
        const { data } = response;
        const { records, total, current, size } = data;
        dataSource.value = records.map((item: any) => ({
          ...item,
          key: item.userId,
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
    })
    .finally(() => {
      isLoadingSearching.value = false;
    });
};

// 导出组件方法供父组件调用
defineExpose({
  onModalOpen,
  onModalClose,
});
</script>

<style scoped>
.form-search-wrapper {
  padding: 16px;
}
</style>