<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <!-- 按钮组 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2">
              <div class="btns" @click="reloadData()">
                <a-icon class="btns-icon" type="file-sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="exportData()">
                <a-icon class="btns-icon" type="download" />
                <div class="btns-text">导出</div>
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
                <a-form-item label="客户名称">
                  <a-input v-model="queryParam.crmName" placeholder="请输入客户名称" />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="联系人">
                  <a-input v-model="queryParam.linkManName" placeholder="请输入联系人" />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="手机号码">
                  <a-input v-model="queryParam.mobile" placeholder="请输入手机号码" />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="接通状态">
                  <a-select v-model="queryParam.callResult" placeholder="请选择接通状态">
                    <a-select-option value="null">全部</a-select-option>
                    <a-select-option value="0">未接通</a-select-option>
                    <a-select-option value="1">已接通</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="通话时间">
                  <a-range-picker
                    v-model="queryParam.callDateRange"
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
            @change="handleTableChange"
          >
            <div slot="callAudioPath" slot-scope="text, record">
              <!-- 播放 -->
              <span v-if="record.callAudioPath" @click="audioTableControl($event, record)"><a-icon type="play-circle" style="color: green;" /></span>
              <!-- 暂停 -->
              <span v-if="record.callAudioPath" @click="audioTableControl($event)" style="margin-left: 10px;"><a-icon type="pause-circle" style="color: green;" /></span>
            </div>
            <div slot="callResult" slot-scope="text, record">
              {{ text === 1 ? <span style="color: green">已接通</span> : <span style="color: red">未接通</span> }}
            </div>
            <div slot="talkTime" slot-scope="text, record">
              {{ durationFormat(text, 'seconds', 'mm:ss') || '' }}
            </div>
          </a-table>
        </div>
      </div>
    </div>
    <nly-content>
      <audio ref="voiceTableAudio" src="" controls="controls" preload hidden></audio>
    </nly-content>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { pageList } from '@/api/crm/call/callTaskRecord';
import { export_file } from '@/utils/file-utils';
import { durationFormat } from '@/utils/date';

const dateFormat = 'YYYY-MM-DD';

export default {
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
      },
      {
        align: 'left',
        title: '姓名',
        dataIndex: 'linkManName',
        width: 100,
      },
      {
        align: 'left',
        title: '客户名称',
        dataIndex: 'crmName',
        width: 200,
      },
      {
        align: 'center',
        title: '手机号码',
        dataIndex: 'mobile',
        width: 120,
      },
      {
        align: 'center',
        title: '坐席',
        dataIndex: 'createUserName',
        width: 100,
      },
      {
        align: 'center',
        title: '主叫号码',
        dataIndex: 'caller',
        width: 120,
      },
      {
        align: 'center',
        title: '接通状态',
        dataIndex: 'callResult',
        width: 80,
        scopedSlots: { customRender: 'callResult' },
      },
      {
        align: 'center',
        title: '录音',
        dataIndex: 'callAudioPath',
        width: 80,
        scopedSlots: { customRender: 'callAudioPath' },
      },
      {
        align: 'center',
        title: '通话时长',
        dataIndex: 'talkTime',
        width: 80,
        scopedSlots: { customRender: 'talkTime' },
      },
      {
        align: 'center',
        title: '开始时间',
        dataIndex: 'startTime',
        width: 150,
      },
      {
        align: 'center',
        title: '结束时间',
        dataIndex: 'endTime',
        width: 150,
      },
    ];

    return {
      dateFormat,
      columns,
      data: [],
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
        crmName: '',
        linkManName: '',
        mobile: '',
        callResult: 'null',
        callDateRange: [],
      },
      form: this.$form.createForm(this, { name: 'advanced_search' }),
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    durationFormat,
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
      if (params.callDateRange && params.callDateRange.length === 2) {
        params.startTime = params.callDateRange[0].format('YYYY-MM-DD HH:mm:ss');
        params.endTime = params.callDateRange[1].format('YYYY-MM-DD HH:mm:ss');
      }
      delete params.callDateRange;

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
    // 导出数据
    exportData() {
      const { queryParam } = this;
      const params = {
        ...queryParam,
      };

      // 处理日期范围
      if (params.callDateRange && params.callDateRange.length === 2) {
        params.startTime = params.callDateRange[0].format('YYYY-MM-DD HH:mm:ss');
        params.endTime = params.callDateRange[1].format('YYYY-MM-DD HH:mm:ss');
      }
      delete params.callDateRange;

      // 处理空值
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === 'null') {
          delete params[key];
        }
      });

      // 导出文件
      export_file('/api/crm/call/callTaskRecord/export', params, '呼叫记录.xlsx');
    },
    // 播放/暂停录音
    audioTableControl(e, item) {
      window.event ? (window.event.cancelBubble = true) : e.stopPropagation();
      let voiceTableAudio = this.$refs.voiceTableAudio;
      if (voiceTableAudio) {
        if (item) {
          voiceTableAudio.src = item.callAudioPath;
          voiceTableAudio.play(); // 播放
          return;
        } else {
          voiceTableAudio.pause(); // 暂停
        }
      }
    },
    // 表格变化
    handleTableChange(pagination, filters, sorter) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.loadData();
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
        crmName: '',
        linkManName: '',
        mobile: '',
        callResult: 'null',
        callDateRange: [],
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
.btns-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
.btns-text {
  font-size: 12px;
}
</style>