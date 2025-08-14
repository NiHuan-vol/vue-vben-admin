<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { Card, Table, Button, Input, Select } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import {
  pageCrmCallAgentCustomerVo,
  saveAgentByCompany,
  deleteByIdsByCompany,
  batchEnableByCompany,
  batchDisableByCompany,
} from '@/api/crm/call/agentManage';
import { getByCompany } from '@/api/crm/call/callMinutes';
import AddDepositModal from './modal/AddDepositModal.vue';
import { useExpose } from '@/hooks/core/useExpose';
import { useStore } from '@/store';
import { storeToRefs } from 'pinia';

type AgentItem = {
  id?: string;
  bindingUserName?: string;
  bindingUserId?: string;
  loginAccount?: string;
  phone?: string;
  status?: number;
  officeName?: string;
  key?: string;
  [key: string]: any;
};

type PostDataType = {
  status?: number | null;
  page: {
    current: number;
    size: number;
  };
  companyId?: string;
};

type CallMinutesType = {
  deposit?: number;
  [key: string]: any;
};

const router = useRouter();
const store = useStore();
const { userInfo } = storeToRefs(store);

const data = ref<AgentItem[]>([]);
const selectedKeys = ref<string[]>([]);
const selectedData = ref<AgentItem[]>([]);
const editModal = ref(false);
const editItem = reactive<AgentItem>({});
const callMinutes = ref<CallMinutesType | null>(null);
const loading = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showLessItems: true,
});

const postData = reactive<PostDataType>({
  status: null,
  page: {
    current: 1,
    size: 20,
  },
  companyId: userInfo.value?.companyId,
});

const columns = [
  {
    align: 'center',
    title: '序号',
    width: 60,
    customRender: (_: any, __: any, index: number) => index + 1,
  },
  {
    align: 'left',
    title: '姓名',
    dataIndex: 'bindingUserName',
    width: 100,
  },
  {
    align: 'left',
    title: '部门',
    dataIndex: 'officeName',
    width: 100,
  },
  {
    align: 'center',
    title: '坐席账号',
    dataIndex: 'loginAccount',
    width: 100,
  },
  {
    align: 'center',
    title: '绑定电话',
    dataIndex: 'phone',
    width: 120,
  },
  {
    align: 'center',
    title: '状态(可设置)',
    dataIndex: 'status',
    width: 120,
    customRender: ({ text, record }) => (
      <span
        style={{ color: text === 1 ? 'green' : 'red', cursor: 'pointer' }}
        onClick={() => (text === 1 ? batchDisable(record) : batchEnable(record))}
      >
        {text === 1 ? '启用' : '停用'}
      </span>
    ),
  },
];

const rowSelection = computed(() => ({
  columnWidth: 30,
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: string[], rows: AgentItem[]) => {
    selectedKeys.value = keys;
    selectedData.value = rows;
  },
}));

const addDepositModalRef = ref<InstanceType<typeof AddDepositModal> | null>(null);

useExpose({
  addDepositModalRef,
});

const reLoadData = () => {
  loading.value = true;
  getByCompany()
    .then((response) => {
      if (response.code === 200) {
        callMinutes.value = response.data || null;
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      pageList();
    });
};

const pageList = () => {
  loading.value = true;
  pageCrmCallAgentCustomerVo(postData)
    .then((response) => {
      if (response.code === 200) {
        const { data: resData } = response;
        const { records, total, current, size } = resData;
        data.value = records.map((item: AgentItem) => ({
          ...item,
          key: item.id,
        }));
        pagination.total = total;
        pagination.current = current;
        pagination.pageSize = size;
      }
    })
    .catch((error) => {
      console.error(error);
      message.error('获取数据失败');
    })
    .finally(() => {
      loading.value = false;
    });
};

const onTableChange = (paginationObj: any) => {
  postData.page.current = paginationObj.current;
  postData.page.size = paginationObj.pageSize;
  Object.assign(pagination, paginationObj);
  pageList();
};

const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedKeys.value = selectedRowKeys;
  selectedData.value = selectedRows;
};

const openModal = (item: AgentItem) => {
  editModal.value = true;
  Object.assign(editItem, item);
};

const hideModal = () => {
  editModal.value = false;
  Object.keys(editItem).forEach((key) => {
    delete editItem[key];
  });
};

const addItem = () => {
  if (!callMinutes.value || callMinutes.value.deposit < 1000) {
    if (addDepositModalRef.value) {
      addDepositModalRef.value.onModalOpen({});
    }
    return;
  }
  openModal({});
};

const editItemFun = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条记录');
    return;
  }
  const item = selectedData.value[0];
  openModal({ ...item });
};

const batchDelete = () => {
  if (selectedKeys.value.length < 1) {
    message.warning('请选择记录');
    return;
  }

  Modal.confirm({
    title: '确认',
    content: <span>您确定要{<span style={{ color: 'red' }}>删除</span>}这些记录吗？</span>,
    onOk() {
      deleteByIdsByCompany(selectedKeys.value)
        .then((response) => {
          if (response.code === 200) {
            message.success('删除成功');
            selectedKeys.value = [];
            selectedData.value = [];
            reLoadData();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    onCancel() {},
  });
};

const batchEnable = (record: AgentItem) => {
  Modal.confirm({
    title: '确认',
    content: <span>您确定要{<span style={{ color: 'red' }}>启用</span>}该记录吗？</span>,
    onOk() {
      batchEnableByCompany([record.id!])
        .then((response) => {
          if (response.code === 200) {
            message.success('启用成功');
            reLoadData();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    onCancel() {},
  });
};

const batchDisable = (record: AgentItem) => {
  Modal.confirm({
    title: '确认',
    content: <span>您确定要{<span style={{ color: 'red' }}>停用</span>}该记录吗？</span>,
    onOk() {
      batchDisableByCompany([record.id!])
        .then((response) => {
          if (response.code === 200) {
            message.success('停用成功');
            reLoadData();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    onCancel() {},
  });
};

const openDepositModal = () => {
  if (addDepositModalRef.value) {
    addDepositModalRef.value.onModalOpen({});
  }
};

const handleSubmit = () => {
  if (!editItem.loginAccount) {
    message.error('请输入登录账户');
    return;
  }

  if (!editItem.phone) {
    message.error('请输入电话号码');
    return;
  }

  if (!editItem.bindingUserName) {
    message.error('请选择员工');
    return;
  }

  const submitData = { ...editItem };
  delete submitData.createDate;
  delete submitData.createUserName;
  delete submitData.createUserId;
  delete submitData.bindingDate;
  submitData.companyId = postData.companyId;

  saveAgentByCompany(submitData)
    .then((response) => {
      if (response.code === 200) {
        message.success('保存成功');
        selectedKeys.value = [];
        selectedData.value = [];
        hideModal();
        reLoadData();
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

onMounted(() => {
  reLoadData();
});
</script>

<template>
  <Card :bordered="false">
    <div class="content-header-2"></div>
    <div class="task-detail">
      <div class="call-button-list">
        <div class="call-button">
          <Button type="primary" @click="addItem" style="margin-left: 10px;">
            <PlusOutlined /> 新建
          </Button>
          <Button type="primary" @click="editItemFun" style="margin-left: 10px;">
            <EditOutlined /> 修改
          </Button>
          <Button type="primary" @click="batchDelete" style="margin-left: 10px;">
            <DeleteOutlined /> 删除
          </Button>
          <Button
            type="primary"
            v-if="!callMinutes || callMinutes.deposit < 1000"
            @click="openDepositModal"
            style="margin-left: 10px;"
          >
            保证金
          </Button>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <Table
      :columns="columns"
      :data-source="data"
      bordered
      :scroll="{ x: 1000, y: 500 }"
      :pagination="pagination"
      :row-selection="rowSelection"
      @change="onTableChange"
      :loading="!!loading"
    />

    <!-- 新增/编辑坐席弹窗 -->
    <Modal
      v-model:visible="editModal"
      :title="editItem.id ? '编辑坐席' : '新增坐席'"
      width="550px"
      centered
      @cancel="hideModal"
    >
      <div class="renwu-from">
        <div class="renwu-frisht">
          <span style="color: red; padding-right: 3px;">*</span> 员工姓名
        </div>
        <div class="renwu-secend">
          <Input v-model="editItem.bindingUserName" placeholder="请输入员工姓名" />
        </div>
      </div>
      <div class="renwu-from">
        <div class="renwu-frisht">
          <span style="color: red; padding-right: 3px;">*</span> 坐席账号
        </div>
        <div class="renwu-secend">
          <Input v-model="editItem.loginAccount" placeholder="请输入坐席账号" />
        </div>
      </div>
      <div class="renwu-from">
        <div class="renwu-frisht">
          <span style="color: red; padding-right: 3px;">*</span> 电话号码
        </div>
        <div class="renwu-secend">
          <Input v-model="editItem.phone" placeholder="请输入电话号码" />
        </div>
      </div>

      <template #footer>
        <Button @click="hideModal" style="margin-left: 8px;">关闭</Button>
        <Button type="primary" @click="handleSubmit">确定</Button>
      </template>
    </Modal>

    <!-- 缴纳保证金 -->
    <AddDepositModal
      ref="addDepositModalRef"
      @callBack="reLoadData"
    />
  </Card>
</template>

<style scoped lang="less">
.content-warpper-2 {
  padding: 24px;
  min-height: 100%;
}

.task-detail {
  margin-bottom: 20px;
}

.call-button-list {
  display: flex;
  justify-content: flex-start;
}

.call-button {
  display: flex;
  gap: 10px;
}

.renwu-from {
  display: flex;
  margin-bottom: 16px;
}

.renwu-frisht {
  width: 100px;
  text-align: right;
  padding-right: 12px;
  line-height: 32px;
}

.renwu-secend {
  flex: 1;
}
</style>