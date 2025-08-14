<!--
 * @Descripttion: 合同变更记录
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
            <a-col :span="2" v-if="hasPermission('contractBillsRecord:add')">
              <div class="btns" @click="handleAdd">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractBillsRecord:edit')">
              <div class="btns" @click="handleEdit">
                <a-icon class="btns-icon" type="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('contractBillsRecord:delete')">
              <div class="btns" @click="handleDelete">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="handleRefresh">
                <a-icon class="btns-icon" type="sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="handlePrint">
                <a-icon class="btns-icon" type="printer" />
                <div class="btns-text">打印</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 切换按钮 -->
      <div class="switch-wrapper">
        <a-button-group>
          <a-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">列表</a-button>
          <a-button :type="viewMode === 'bill' ? 'primary' : 'default'" @click="viewMode = 'bill'">单据</a-button>
        </a-button-group>
      </div>

      <!-- 动态列表 -->
      <div v-if="viewMode === 'list'" class="resize-table-container">
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

      <!-- 单据视图 -->
      <div v-else-if="viewMode === 'bill'" class="bill-container">
        <!-- 单据头部信息 -->
        <div class="bill-header">
          <a-form layout="horizontal">
            <a-row>
              <a-col :span="8">
                <a-form-item label="记录单号">
                  <a-input v-model:value="currentRecord.code" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="关联合同号">
                  <a-input v-model:value="currentRecord.contractCode" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="记录日期">
                  <a-date-picker v-model:value="currentRecord.recordDate" disabled />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="8">
                <a-form-item label="变更类型">
                  <a-select v-model:value="currentRecord.changeType" disabled>
                    <a-select-option :value="1">条款变更</a-select-option>
                    <a-select-option :value="2">金额变更</a-select-option>
                    <a-select-option :value="3">其他变更</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="变更描述">
                  <a-input v-model:value="currentRecord.description" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="记录人">
                  <a-input v-model:value="currentRecord.createdBy" disabled />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <!-- 标签页内容 -->
        <a-tabs v-model:activeKey="activeKey" @change="handleTabChange" style="margin-top: 16px;">
          <a-tab-pane key="contractTarget" tab="合同标的" />
          <a-tab-pane key="contractClause" tab="合同条款" />
          <a-tab-pane key="paymentInfo" tab="收付信息" />
          <a-tab-pane key="files" tab="附件" />
        </a-tabs>
      </div>

      <!-- 右键菜单 -->
      <div class="contextmenu-box" v-show="contextMenuVisible" :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }">
        <ul class="contextmenu">
          <li @click="handleContextMenuView">查看详情</li>
          <li @click="handleContextMenuDelete">删除记录</li>
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
import { getContractBillsRecordList, deleteContractBillsRecord } from '/@/api/contract/contractBillsRecord';
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
const viewMode = ref<'list' | 'bill'>('list');
const activeKey = ref('contractTarget');
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
const currentRecord = reactive<any>({
  code: '',
  contractCode: '',
  recordDate: null,
  changeType: 1,
  description: '',
  createdBy: '',
});

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
    title: '记录单号',
    dataIndex: 'code',
    width: 120,
  },
  {
    title: '关联合同号',
    dataIndex: 'contractCode',
    width: 120,
  },
  {
    title: '变更类型',
    dataIndex: 'changeType',
    width: 100,
    customRender: ({ text }) => {
      return text === 1 ? '条款变更' : text === 2 ? '金额变更' : '其他变更';
    },
  },
  {
    title: '记录日期',
    dataIndex: 'recordDate',
    width: 100,
    valueType: 'date',
  },
  {
    title: '变更描述',
    dataIndex: 'description',
    width: 180,
  },
  {
    title: '记录人',
    dataIndex: 'createdBy',
    width: 100,
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
    const res = await getContractBillsRecordList(params);
    if (res.code === 200) {
      dataSource.value = res.data.records || [];
      pagination.total = res.data.total || 0;
    } else {
      message.error(res.message || '获取数据失败');
    }
  } catch (error) {
    message.error('获取数据失败');
    console.error('Failed to get contract bills record list:', error);
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
  // 如果选中一条数据，加载到单据视图
  if (rows.length === 1) {
    Object.assign(currentRecord, rows[0]);
  }
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

const handleContextMenuView = () => {
  // 查看详情逻辑
  hideContextMenu();
};

const handleContextMenuDelete = () => {
  // 删除记录逻辑
  hideContextMenu();
};

// 按钮事件处理
const handleAdd = () => {
  // 新增合同变更记录
  viewMode.value = 'bill';
  // 重置当前记录
  Object.assign(currentRecord, {
    code: '',
    contractCode: '',
    recordDate: null,
    changeType: 1,
    description: '',
    createdBy: '',
  });
};

const handleEdit = () => {
  if (selectedRows.value.length !== 1) {
    message.warning('请选择一条数据进行修改');
    return;
  }
  viewMode.value = 'bill';
  Object.assign(currentRecord, selectedRows.value[0]);
};

const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请选择至少一条数据进行删除');
    return;
  }

  // 确认删除
  appStore.showConfirmDialog({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRows.value.length} 条合同变更记录吗？`,
    onOk: async () => {
      loading.value = true;
      try {
        const ids = selectedRows.value.map(row => row.id);
        const res = await deleteContractBillsRecord(ids);
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
        console.error('Failed to delete contract bills record:', error);
      }
    },
  });
};

const handleRefresh = () => {
  getList();
};

const handlePrint = () => {
  // 打印逻辑
  message.info('打印功能待实现');
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

.switch-wrapper {
  margin-bottom: 10px;
}

.bill-container {
  border: 1px solid #e8e8e8;
  padding: 16px;
  background-color: #fff;
  .bill-header {
    margin-bottom: 16px;
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