<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <!-- 按钮组 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2">
              <div class="btns" @click="addTask()">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增任务</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="reloadData()">
                <a-icon class="btns-icon" type="file-sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="batchDelete()" :class="{ 'btns-disabled': selectedRowKeys.length === 0 }">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">批量删除</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="batchClose()" :class="{ 'btns-disabled': selectedRowKeys.length === 0 }">
                <a-icon class="btns-icon" type="close-circle" />
                <div class="btns-text">批量关闭</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <div class="scroll-content">
        <div class="form-search-wrapper">
          <a-form layout="inline" :form="form" @submit="handleSearch">
            <a-row :gutter="16">
              <a-col :md="4">
                <a-form-item label="任务名称">
                  <a-input v-model="queryParam.taskName" placeholder="请输入任务名称" />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="任务类型">
                  <a-select v-model="queryParam.taskType" placeholder="请选择任务类型">
                    <a-select-option v-for="(item, index) in taskTypeArr" :key="index" :value="index + 1">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="快呼方式">
                  <a-select v-model="queryParam.callType" placeholder="请选择快呼方式">
                    <a-select-option v-for="(item, index) in callTypeArr" :key="index" :value="index + 1">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="业务状态">
                  <a-select v-model="queryParam.businessStatus" placeholder="请选择业务状态">
                    <a-select-option value="null">全部</a-select-option>
                    <a-select-option value="0">正常</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="创建时间">
                  <a-range-picker
                    v-model="queryParam.createDateRange"
                    :format="dateFormat"
                    :placeholder="['开始日期', '结束日期']"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-button type="primary" html-type="submit" style="margin-right: 10px;">查询</a-button>
                <a-button @click="resetForm">重置</a-button>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="form-search-wrapper" style="min-height: 400px;">
          <a-table
            :columns="columns"
            :data-source="data"
            bordered
            :scroll="{ x: 'auto', y: 400 }"
            :pagination="pagination"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange"
          >
            <span slot="taskName" slot-scope="text, record" @click="goToDetail(record)">
              {{ text }}
            </span>
            <div slot="callType" slot-scope="text, record">
              {{ callTypeArr[text - 1] }}
            </div>
            <div slot="taskType" slot-scope="text, record">
              {{ taskTypeArr[text - 1] }}
            </div>
            <div slot="businessStatus" slot-scope="text, record">
              {{ text ? <span style="color: red">关闭</span> : <span style="color: green">正常</span> }}
            </div>
            <div slot="action" slot-scope="text, record">
              <a-button @click="editTask(record)" style="margin-right: 5px;">编辑</a-button>
              <a-button @click="deleteTask(record.id)" style="margin-right: 5px;">删除</a-button>
              <a-button @click="closeTask(record.id)" v-if="!record.businessStatus" style="margin-right: 5px;">关闭</a-button>
              <a-button @click="goToDetail(record)">详情</a-button>
            </div>
          </a-table>
        </div>
      </div>
    </div>
    <nly-content>
      <add-task-modal
        ref="addTaskModal"
        @reloadData="reloadData"
      ></add-task-modal>
      <drawer
        :title="drawerTitle"
        :width="800"
        :visible="drawerVisible"
        @close="onDrawerClose"
      >
        <div slot="body">
          <simple-task-detail
            :taskId="currentTaskId"
            @closeDrawer="onDrawerClose"
          ></simple-task-detail>
        </div>
      </drawer>
    </nly-content>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { pageList, remove, close } from '@/api/crm/call/callTask';
import AddTaskModal from './addTaskModal';
import SimpleTaskDetail from './simpleTaskDetail';
import { export_file } from '@/utils/file-utils';

const taskTypeArr = ['销售联系', '客户关怀', '售后回访', '投诉回访', '服务支持', '维修维护', '客户投诉'];
const callTypeArr = ['人工', '去电放音'];
const dateFormat = 'YYYY-MM-DD';

export default {
  components: {
    AddTaskModal,
    SimpleTaskDetail,
  },
  data() {
    const columns = [
      {
        align: 'center',
        title: '序号',
        dataIndex: 'index',
        width: 50,
        customRender: (text, row, index) => {
          return index + 1;
        },
      },
      {
        align: 'left',
        title: '任务名称',
        dataIndex: 'taskName',
        width: 150,
        scopedSlots: { customRender: 'taskName' },
      },
      {
        align: 'center',
        title: '任务开始时间',
        dataIndex: 'startTime',
        width: 150,
      },
      {
        align: 'center',
        title: '任务结束时间',
        dataIndex: 'endTime',
        width: 150,
      },
      {
        align: 'left',
        title: '快呼方式',
        dataIndex: 'callType',
        width: 100,
        scopedSlots: { customRender: 'callType' },
      },
      {
        align: 'left',
        title: '联系类型',
        dataIndex: 'taskType',
        width: 100,
        scopedSlots: { customRender: 'taskType' },
      },
      {
        align: 'center',
        title: '任务条数',
        dataIndex: 'mobileCount',
        width: 80,
      },
      {
        align: 'center',
        title: '执行数量',
        dataIndex: 'dialedCount',
        width: 80,
      },
      {
        align: 'center',
        title: '执行率',
        dataIndex: 'dialedCount',
        width: 80,
        customRender: (text, row, index) => {
          if (!row.mobileCount) return '0%';
          return `${((row.dialedCount / row.mobileCount) * 100).toFixed(2)}%`;
        },
      },
      {
        align: 'center',
        title: '业务状态',
        dataIndex: 'businessStatus',
        width: 80,
        scopedSlots: { customRender: 'businessStatus' },
      },
      {
        align: 'center',
        title: '创建时间',
        dataIndex: 'createDate',
        width: 150,
      },
      {
        align: 'center',
        title: '操作',
        dataIndex: 'action',
        width: 180,
        scopedSlots: { customRender: 'action' },
      },
    ];

    return {
      taskTypeArr,
      callTypeArr,
      dateFormat,
      columns,
      data: [],
      selectedRowKeys: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total) => `共 ${total} 条数据`,
        showQuickJumper: true,
        showLessItems: true,
      },
      queryParam: {
        taskName: '',
        taskType: '',
        callType: '',
        businessStatus: 'null',
        createDateRange: [],
      },
      form: this.$form.createForm(this, { name: 'advanced_search' }),
      drawerVisible: false,
      drawerTitle: '',
      currentTaskId: 0,
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    // 加载数据
    loadData() {
      const { pagination, queryParam } = this;
      const params = {
        page: {
          current: pagination.current,
          size: pagination.pageSize,
        },
        ...queryParam,
      };

      // 处理日期范围
      if (params.createDateRange && params.createDateRange.length === 2) {
        params.createStartTime = params.createDateRange[0].format('YYYY-MM-DD');
        params.createEndTime = params.createDateRange[1].format('YYYY-MM-DD');
      }
      delete params.createDateRange;

      // 处理空值
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === 'null') {
          delete params[key];
        }
      });

      pageList(params).then((response) => {
        if (response.code === 200) {
          const { data } = response;
          this.data = data.records;
          this.pagination.total = data.total;
          this.pagination.current = data.current;
          this.pagination.pageSize = data.size;
        }
      });
    },
    // 刷新数据
    reloadData() {
      this.loadData();
    },
    // 新增任务
    addTask() {
      this.$refs.addTaskModal.showModal();
    },
    // 编辑任务
    editTask(record) {
      this.$refs.addTaskModal.showModal(record);
    },
    // 删除任务
    deleteTask(id) {
      this.$confirm({
        title: '确认删除',
        content: '确定要删除该任务吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          remove(id).then((response) => {
            if (response.code === 200) {
              this.$message.success('删除成功');
              this.loadData();
            } else {
              this.$message.error(response.message || '删除失败');
            }
          });
        },
      });
    },
    // 批量删除
    batchDelete() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要删除的任务');
        return;
      }

      this.$confirm({
        title: '确认批量删除',
        content: `确定要删除选中的${this.selectedRowKeys.length}个任务吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          remove(this.selectedRowKeys).then((response) => {
            if (response.code === 200) {
              this.$message.success('删除成功');
              this.selectedRowKeys = [];
              this.loadData();
            } else {
              this.$message.error(response.message || '删除失败');
            }
          });
        },
      });
    },
    // 关闭任务
    closeTask(id) {
      this.$confirm({
        title: '确认关闭',
        content: '确定要关闭该任务吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          close(id).then((response) => {
            if (response.code === 200) {
              this.$message.success('关闭成功');
              this.loadData();
            } else {
              this.$message.error(response.message || '关闭失败');
            }
          });
        },
      });
    },
    // 批量关闭
    batchClose() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要关闭的任务');
        return;
      }

      this.$confirm({
        title: '确认批量关闭',
        content: `确定要关闭选中的${this.selectedRowKeys.length}个任务吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          close(this.selectedRowKeys).then((response) => {
            if (response.code === 200) {
              this.$message.success('关闭成功');
              this.selectedRowKeys = [];
              this.loadData();
            } else {
              this.$message.error(response.message || '关闭失败');
            }
          });
        },
      });
    },
    // 查看详情
    goToDetail(record) {
      this.drawerVisible = true;
      this.drawerTitle = record.taskName;
      this.currentTaskId = record.id;
    },
    // 关闭抽屉
    onDrawerClose() {
      this.drawerVisible = false;
    },
    // 表格变化
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.loadData();
    },
    // 选择变化
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    // 查询
    handleSearch(e) {
      e.preventDefault();
      this.pagination.current = 1;
      this.loadData();
    },
    // 重置
    resetForm() {
      this.queryParam = {
        taskName: '',
        taskType: '',
        callType: '',
        businessStatus: 'null',
        createDateRange: [],
      };
      this.pagination.current = 1;
      this.loadData();
    },
  },
};
</script>

<style scoped>
.form-search-wrapper >>> .ant-form-item {
  margin-bottom: 16px !important;
}
.btn-wrapper {
  margin-bottom: 16px;
}
.btns {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  background-color: #f0f2f5;
  transition: all 0.3s;
}
.btns:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}
.btns-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.btns-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
.btns-text {
  font-size: 12px;
}
</style>