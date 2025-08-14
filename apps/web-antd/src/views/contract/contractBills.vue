<!--
 * @Descripttion: 合同单据
 * @version: V1.0
 * @Author: AI Assistant
 * @Date: 2025-08-13
-->
<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper" style="margin: 2px 8px;">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="hasPermission('contractBills:add')">
              <div class="btns" @click="handleAdd">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractBills:edit')">
              <div class="btns" @click="handleEdit">
                <a-icon class="btns-icon" type="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractBills:delete')">
              <div class="btns" @click="handleDelete">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractBills:examine')">
              <div class="btns" @click="handleExamine">
                <a-icon class="btns-icon" type="check-circle" />
                <div class="btns-text">审核</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="handleRefresh">
                <a-icon class="btns-icon" type="sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 动态列表 -->
      <div class="resize-table-container">
        <a-table
          v-loading="loading"
          :columns="columns"
          :data-source="dataSource"
          bordered
          :pagination="pagination"
          style="font-size: 12px;"
          @change="onTableChange"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        />
      </div>

      <!-- 标签页内容 -->
      <a-tabs v-model:activeKey="activeKey" @change="handleTabChange" style="margin-top: 16px;">
        <a-tab-pane key="contractTarget" tab="合同标的" />
        <a-tab-pane key="contractClause" tab="合同条款" />
        <a-tab-pane key="paymentInfo" tab="收付信息" />
        <a-tab-pane key="attachment" tab="附件" />
        <a-tab-pane key="additionalClause" tab="附加条款" />
      </a-tabs>

      <!-- 右键菜单 -->
      <div class="contextmenu-box" v-show="contextMenuVisible" :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }">
        <ul class="contextmenu">
          <li @click="handleContextMenuAdd">新增行</li>
          <li @click="handleContextMenuDelete">删除行</li>
        </ul>
      </div>

      <!-- 加载中 -->
      <div class="loading-wrapper" v-show="loading">
        <a-spin class="loading-content" tip="加载中..." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '/@/store/modules/app';
import { usePermission } from '/@/hooks/web/usePermission';
import { getContractBillsList, deleteContractBill, examineContractBill } from '/@/api/contract/contractBills';
import { TableColumns, PaginationProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';

// 权限检查
const { hasPermission } = usePermission();
const appStore = useAppStore();

// 响应式数据
const loading = ref(false);
const dataSource = ref<any[]>([]);
const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);
const activeKey = ref('contractTarget');
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);

// 分页配置
const pagination = reactive<PaginationProps>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

// 表格列配置
const columns = computed<TableColumns<any>>(() => [
  {
    title: '合同编码',
    dataIndex: 'code',
    width: 120,
  },
  {
    title: '合同名称',
    dataIndex: 'name',
    width: 180,
  },
  {
    title: '合同类别',
    dataIndex: 'contractClassName',
    width: 100,
  },
  {
    title: '合同金额',
    dataIndex: 'amount',
    width: 100,
    valueType: 'money',
  },
  {
    title: '签订日期',
    dataIndex: 'signDate',
    width: 100,
    valueType: 'date',
  },
  {
    title: '生效日期',
    dataIndex: 'effectiveDate',
    width: 100,
    valueType: 'date',
  },
  {
    title: '到期日期',
    dataIndex: 'expireDate',
    width: 100,
    valueType: 'date',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }) => {
      return text === 1 ? '已审核' : '未审核';
    },
  },
]);

// 获取数据列表
const getList = async () => {
  loading.value = true;
  try {
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
    };
    const res = await getContractBillsList(params);
    if (res.code === 200) {
      dataSource.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      message.error(res.message || '获取数据失败');
    }
  } catch (error) {
    message.error('获取数据失败');
    console.error('Failed to get contract bills list:', error);
  } finally {
    loading.value = false;
  }
};

// 表格分页变化
const onTableChange = (pagination: any) => {
  Object.assign(pagination, pagination);
  getList();
};

// 选中行变化
const onSelectChange = (keys: string[], rows: any[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

// 标签页切换
const handleTabChange = (key: string) => {
  activeKey.value = key;
  // 根据不同标签页加载不同数据
};

// 右键菜单相关
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuLeft.value = e.clientX;
  contextMenuTop.value = e.clientY;
  contextMenuVisible.value = true;
};

const hideContextMenu = () => {
  contextMenuVisible.value = false;
};

const handleContextMenuAdd = () => {
  // 新增行逻辑
  hideContextMenu();
};

const handleContextMenuDelete = () => {
  // 删除行逻辑
  hideContextMenu();
};

// 按钮事件处理
const handleAdd = () => {
  // 新增合同单据
};

const handleEdit = () => {
  if (selectedRows.value.length !== 1) {
    message.warning('请选择一条数据进行修改');
    return;
  }
  // 修改合同单据
};

const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请选择至少一条数据进行删除');
    return;
  }

  // 确认删除
  appStore.showConfirmDialog({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRows.value.length} 条合同单据吗？`,
    onOk: async () => {
      loading.value = true;
      try {
        const ids = selectedRows.value.map(row => row.id);
        const res = await deleteContractBill(ids);
        if (res.code === 200) {
          message.success('删除成功');
          getList();
          selectedRowKeys.value = [];
          selectedRows.value = [];
        } else {
          message.error(res.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
        console.error('Failed to delete contract bills:', error);
      }
    },
  });
};

const handleExamine = () => {
  if (selectedRows.value.length !== 1) {
    message.warning('请选择一条数据进行审核');
    return;
  }

  const bill = selectedRows.value[0];
  if (bill.status === 1) {
    message.warning('该合同单据已审核');
    return;
  }

  // 确认审核
  appStore.showConfirmDialog({
    title: '确认审核',
    content: `确定要审核合同单据 ${bill.code} 吗？`,
    onOk: async () => {
      loading.value = true;
      try {
        const res = await examineContractBill(bill.id);
        if (res.code === 200) {
          message.success('审核成功');
          getList();
        } else {
          message.error(res.message || '审核失败');
        }
      } catch (error) {
        message.error('审核失败');
        console.error('Failed to examine contract bill:', error);
      }
    },
  });
};

const handleRefresh = () => {
  getList();
};

// 初始化加载数据
onMounted(() => {
  getList();
  // 监听点击空白处关闭右键菜单
  document.addEventListener('click', hideContextMenu);
});

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu);
});
</script>

<style lang="less" scoped>
.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.btn-wrapper {
  margin-bottom: 10px;
  .btns {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    .btns-icon {
      font-size: 18px;
      color: #1890ff;
    }
    .btns-text {
      font-size: 12px;
      margin-top: 2px;
    }
    &:hover {
      .btns-icon {
        color: #40a9ff;
      }
      background-color: #f0f2f5;
      border-radius: 4px;
    }
  }
}

.contextmenu-box {
  position: fixed;
  z-index: 1000;
  .contextmenu {
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    list-style: none;
    li {
      padding: 5px 16px;
      cursor: pointer;
      &:hover {
        background-color: #f0f2f5;
      }
    }
  }
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  .loading-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>