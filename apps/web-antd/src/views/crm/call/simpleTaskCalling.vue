<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <!-- 按钮组 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2">
              <div class="btns" @click="onTaskShow">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">选任务</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="reloadData">
                <a-icon class="btns-icon" type="file-sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
            <!-- 临时拨号 -->
            <a-col :span="2" style="z-index: 2">
              <div class="dial-other">
                <div class="btns" @click="OpenCallingBox()">
                  <a-icon class="btns-icon phone-box" type="phone" />
                </div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <div class="scroll-content">
        <!-- 任务详情 -->
        <div class="task-detail">
          <div class="task-detail-header">{{ taskItem.taskName }}</div>
          <div class="task-detail-content">
            <a-row>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">开始日期:</span>
                <span class="task-detail-text">{{ taskItem.startTime }}</span>
              </a-col>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">结束日期:</span>
                <span class="task-detail-text">{{ taskItem.endTime }}</span>
              </a-col>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">创建时间:</span>
                <span class="task-detail-text">{{ taskItem.createDate }}</span>
              </a-col>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">呼叫类型:</span>
                <span class="task-detail-text">{{ taskItem.callType ? callTypeArr[taskItem.callType - 1] : '' }}</span>
              </a-col>
              <a-col :span="8" class="task-detail-item">
                <span class="task-detail-title">播音名称:</span>
                <span class="task-detail-text">
                  <!-- 暂停 -->
                  <span v-if="voice_pay" @click="audioControl"><a-icon type="pause-circle" /></span>
                  <!-- 播放 -->
                  <span v-else @click="audioControl"><a-icon type="play-circle" /></span>
                  {{ taskItem.voiceName }}
                  <!-- 上传音频 -->
                  <audio ref="voiceAudio" :src="taskItem.voiceUrl" controls="controls" preload hidden></audio>
                </span>
              </a-col>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">联系类型:</span>
                <span class="task-detail-text">{{ taskItem.taskType ? taskTypeArr[taskItem.taskType - 1] : '' }}</span>
              </a-col>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">业务状态:</span>
                <span class="task-detail-text">{{ businessStatusArr[taskItem.businessStatus] }}</span>
              </a-col>
              <a-col :span="4" class="task-detail-item">
                <span class="task-detail-title">状态:</span>
                <span class="task-detail-text">{{ statusArr[taskItem.status] }}</span>
              </a-col>
              <a-col :span="24" class="task-detail-item">
                <span class="task-detail-title">备注:</span>
                <span class="task-detail-text">{{ taskItem.remarks }}</span>
              </a-col>
            </a-row>
          </div>
        </div>
        <!-- 任务统计 -->
        <div class="task-statistics">
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">任务条数</span>
            <span class="task-statistics-item-text">{{ taskItem.mobileCount || 0 }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">任务执行量</span>
            <span class="task-statistics-item-text">{{ taskItem.dialedCount || 0 }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">任务执行率</span>
            <span class="task-statistics-item-text">{{ taskItem.dialedCount ? ((taskItem.dialedCount / taskItem.mobileCount) * 100).toFixed(2) : '0.00' }}%</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">未呼叫数量</span>
            <span class="task-statistics-item-text">{{ taskItem.mobileCount - taskItem.dialedCount }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">任务接通量</span>
            <span class="task-statistics-item-text">{{ taskItem.taskConnectCount }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">任务接通率</span>
            <span class="task-statistics-item-text">{{ taskItem.taskConnectCount ? ((taskItem.taskConnectCount / taskItem.dialedCount) * 100).toFixed(2) : '--' }}%</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">呼叫次数</span>
            <span class="task-statistics-item-text">{{ taskItem.callCount || 0 }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">外呼接通数</span>
            <span class="task-statistics-item-text">{{ taskItem.connectCount || 0 }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">通话时长</span>
            <span class="task-statistics-item-text">{{ durationFormat(taskItem.totalTalkTime || 0, 'seconds', 'HH:mm:ss') }}</span>
          </div>
          <div class="task-statistics-item">
            <span class="task-statistics-item-title">平均通话时长</span>
            <span class="task-statistics-item-text">{{ durationFormat(taskItem.connectCount ? (taskItem.totalTalkTime / taskItem.connectCount).toFixed(2) : 0, 'seconds', 'mm:ss') }}</span>
          </div>
        </div>
        <!-- TAB切换 -->
        <a-tabs default-active-key="1" @change="onChangeTab">
          <a-tab-pane key="1" tab="联系人" style="min-height: 200px;">
            <!-- 联系人 列表 -->
            <a-table :columns="columns" v-show="detailTableShow" :data-source="data" bordered :scroll="{ x: 1000, y: 400 }" :pagination="false" :row-selection="{ selectedRowKeys: selectedKeys, onChange: userSelection }" @change="onTableChange">
              <a slot="crmName" slot-scope="text, record" @click="goToDetail(record, 'touch')" class="goToDetail">
                {{ record.crmName }}
              </a>
              <div slot="callOprate" slot-scope="text, record">
                <span v-show="record.mobile && !taskItem.businessStatus" @click="OpenCallingBox(record, false)" class="phone-class" style="margin-right: 5px;">
                  人工<a-icon type="phone" theme="twoTone" two-tone-color="#52c41a" />
                </span>
                <span v-show="record.mobile && !taskItem.businessStatus && taskItem.callType == 2" @click="OpenCallingBox(record, true)" class="phone-class">
                  放音<a-icon type="phone" theme="twoTone" two-tone-color="#52c41a" />
                </span>
              </div>
              <div
                slot="crmNameFilterDropdown"
                slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                style="padding: 8px"
              >
                <a-input
                  v-ant-ref="c => (searchInput = c)"
                  :placeholder="`搜索 ${column.title}`"
                  :value="selectedKeys[0]"
                  style="width: 188px; margin-bottom: 8px; display: block;"
                  @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                  @pressEnter="() => handleSearchInput(selectedKeys, confirm, column.dataIndex)"
                />
                <a-button
                  type="primary"
                  icon="search"
                  size="small"
                  style="width: 90px; margin-right: 8px"
                  @click="() => handleSearchInput(selectedKeys, confirm, column.dataIndex)"
                >
                  查询
                </a-button>
                <a-button size="small" style="width: 90px" @click="() => handleResetSearch(clearFilters)">
                  重置
                </a-button>
              </div>
              <div slot="lastCallResultFilterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
                <a-radio-group v-model="lastCallResultCondition" style="flex-direction: column;">
                  <a-radio :style="radioStyle" :value="-1" @click="() => handleSearch(setSelectedKeys, confirm, -1)">
                    所有
                  </a-radio>
                  <a-radio :style="radioStyle" :value="0" @click="() => handleSearch(setSelectedKeys, confirm, 0)">
                    未呼叫
                  </a-radio>
                  <a-radio :style="radioStyle" :value="1" @click="() => handleSearch(setSelectedKeys, confirm, 1)">
                    已接通
                  </a-radio>
                </a-radio-group>
              </div>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="2" tab="通话记录">
            <div class="form-search-wrapper" style="min-height: 200px;">
              <a-table :scroll="{ x: 200, y: 500 }" :columns="taskRecordColumns" :data-source="taskRecordData" bordered :pagination="taskRecordPagination" :loading="isLOadingTaskRecord">
                <div slot="callAudioPath" slot-scope="text, record">
                  <!-- 播放 -->
                  <span v-if="record.callAudioPath" @click="audioTableControl($event, record)"><a-icon type="play-circle" style="color: green;" /></span>
                  <!-- 暂停 -->
                  <span v-if="record.callAudioPath" @click="audioTableControl($event)" style="margin-left: 10px;"><a-icon type="pause-circle" style="color: green;" /></span>
                </div>
                <div slot="callResultFilterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
                  <a-radio-group v-model="taskRecordPostData.callResult" @change="onTaskRecordConditionChange" style="flex-direction: column;">
                    <a-radio :style="radioStyle" :value="null">
                      所有
                    </a-radio>
                    <a-radio :style="radioStyle" :value="0">
                      未接通
                    </a-radio>
                    <a-radio :style="radioStyle" :value="1">
                      已接通
                    </a-radio>
                  </a-radio-group>
                </div>
                <div slot="talkTimeFilterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
                  <div>
                    <a-input-number size="small" v-model="taskRecordPostData.talkTimeStart" @pressEnter="onTaskRecordConditionChange('taskRecordPostData_talkTimeStart', true, $event)" @blur="onTaskRecordConditionChange('taskRecordPostData_talkTimeStart', true, $event)" />
                    ~
                    <a-input-number size="small" v-model="taskRecordPostData.talkTimeEnd" :min="taskRecordPostData.talkTimeStart || 0" @pressEnter="onTaskRecordConditionChange('taskRecordPostData_talkTimeEnd', true, $event)" @blur="onTaskRecordConditionChange('taskRecordPostData_talkTimeEnd', true, $event)" />
                  </div>
                  <div style="display: flex; margin-top: 5px;">
                    <a-button style="width: 90px; margin-right: 8px;" @click="resetTalkTimeCondition">
                      重置
                    </a-button>
                    <a-button type="primary" style="width: 90px;" @click="onTaskRecordConditionChange">
                      搜索
                    </a-button>
                  </div>
                </div>
              </a-table>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <nly-content>
      <audio ref="voiceTableAudio" src="" controls="controls" preload hidden></audio>
      <drag-modal title="请选择任务" :visible="taskModalVisible" @cancel="onTaskClose" width="1000px">
        <div>
          <a-input-search placeholder="请输入任务名称" v-model="taskSearchKeyWord" @search="taskPage" @pressEnter="taskPage" />
          <div class="form-search-wrapper" style="min-height: 200px;">
            <a-table :scroll="{ x: 'auto', y: 400 }" :columns="taskColumns" :data-source="taskData" bordered :pagination="taskPagination" :customRow="taskCustomClick" :loading="taskIsLoadingSearching">
              <a slot="taskName" slot-scope="text, record" @click="initPage(record)">
                {{ text }}
              </a>
              <div slot="voiceId" slot-scope="text, record">
                {{ record.voiceName }}
              </div>
            </a-table>
          </div>
        </div>
      </drag-modal>
      <!-- 客户详情 抽屉 -->
      <drawerCrm ref="drawerCrm" :drawerVisible.sync="drawerVisible" :routeUrl="routeUrl" :title="drawerTitle" :dataItem="callingLinkMan" @collectOut="collectOut" @collectAdd="collectAdd" @dealSave="dealSave" @openShareBox="openShareBox" @release="release" @distribution="distribution" @receive="receive"></drawerCrm>
    </nly-content>
    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="换卡中..." />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { FormInput, EditableCell } from '@/components/Form';
import { list as listCallSettings } from '@/api/crm/call/callSettings';
import { pageList as voicePageList } from '@/api/crm/call/callVoice';
import { pageList as taskPage, detail as taskDetail } from '@/api/crm/call/callTask';
import { list as listTaskDetail } from '@/api/crm/call/callTaskDetail';
import { pageList as pageTaskRecord } from '@/api/crm/call/callTaskRecord';
import { receive } from '@/api/crm/customer';
import MiddleUtils from '@/utils/middle-utils';
import { durationFormat } from '@/utils/date';
import drawerCrm from '@/components/Crm/drawer';

let timer;

export default {
  components: {
    FormInput,
    EditableCell,
    drawerCrm,
  },
  data() {
    const taskTypeArr = ['销售联系', '客户关怀', '售后回访', '投诉回访', '服务支持', '维修维护', '客户投诉'];
    const callTypeArr = ['人工', '去电放音'];
    const businessStatusArr = ['正常', '关闭'];
    const statusArr = ['未开始', '进行中', '已完成', '未完成'];

    //基础设置
    const baseSettingsList = [
      {
        className: '音量设置', //分类
        code: 'localaudio',
        value: '50',
        dataType: 1, //数据类型 1：数字 2：字符串 3.Boolean
        showName: '本地听到音量',
      },
      {
        className: '音量设置', //分类
        code: 'phoneaudio',
        value: '50',
        dataType: 1, //数据类型 1：数字 2：字符串 3.Boolean
        showName: '对方听到音量',
      },
      {
        className: '换卡设置', //分类
        code: 'isAutoChangeSIM',
        value: 'true',
        dataType: 3, //数据类型 1：数字 2：字符串 3.Boolean
        showName: '是否自动换卡',
      },
      {
        className: '换卡设置', //分类
        code: 'maxCallTimes',
        value: '5',
        dataType: 1, //数据类型 1：数字 2：字符串 3.Boolean
        showName: '换卡频率',
      },
    ];

    //任务明细表头
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
        align: 'center',
        title: '姓名',
        dataIndex: 'linkManName',
        width: 80,
      },
      {
        align: 'left',
        title: '客户名称',
        dataIndex: 'crmName',
        width: 200,
        scopedSlots: {
          customRender: 'crmName',
          filterDropdown: 'crmNameFilterDropdown',
        },
        onFilter: (value, record) =>
          record.crmName
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        align: 'center',
        title: '移动电话',
        dataIndex: 'mobile',
        width: 120,
        customRender: (text, row, index) => {
          const callStatus = row.lastCallStatus ? <span style="color: #1890ff;">{text}</span> : <span>{text}</span>;
          return callStatus;
        },
      },
      {
        align: 'center',
        title: '呼叫操作',
        dataIndex: 'callOprate',
        width: 100,
        scopedSlots: { customRender: 'callOprate' },
      },
      {
        align: 'center',
        title: '呼叫次数',
        dataIndex: 'callCount',
        width: 80,
      },
      {
        align: 'center',
        title: '接通次数',
        dataIndex: 'connectCount',
        width: 80,
      },
      {
        align: 'center',
        title: '总通话时长(秒)',
        dataIndex: 'totalTalkTime',
        width: 80,
        customRender: (text, row, index) => {
          return this.durationFormat(text, 'seconds', 'HH:mm:ss') || '';
        },
      },
      {
        align: 'center',
        title: '接通状态',
        dataIndex: 'lastCallResult',
        width: 80,
        scopedSlots: {
          filterDropdown: 'lastCallResultFilterDropdown',
        },
        customRender: (text, row, index) => {
          if (!row.callCount) {
            return '未呼叫';
          }
          return text ? <span style="color: green">已接通</span> : <span style="color: red">未接通</span>;
        },
        onFilter: (value, record) => {
          switch (value) {
            case -1:
              return true;
              break;
            case 0:
              return !record.callCount;
              break;
            case 1:
              return record.callCount && record.lastCallResult;
              break;
            case 2:
              return record.callCount && !record.lastCallResult;
              break;
          }
        },
      },
    ];

    const taskColumns = [
      //工序信息table
      {
        align: 'left',
        title: '任务名称',
        dataIndex: 'taskName',
        width: 150,
        scopedSlots: {
          filterDropdown: 'taskNameFilterDropdown',
        },
      },
      {
        align: 'center',
        title: '任务开始时间',
        dataIndex: 'startTime',
        width: 80,
      },
      {
        align: 'center',
        title: '任务结束时间',
        dataIndex: 'endTime',
        width: 80,
      },
      {
        align: 'left',
        title: '快呼方式',
        dataIndex: 'callType',
        width: 100,
        customRender: (text, row, index) => {
          const type = ['人工', '去电放音'];
          return type[text - 1];
        },
        scopedSlots: {
          filterDropdown: 'callTypeFilterDropdown',
        },
      },
      {
        align: 'center',
        title: '联系类型',
        dataIndex: 'taskType',
        width: 60,
        customRender: (text, row, index) => {
          const type = ['销售联系', '客户关怀', '售后回访', '投诉回访', '服务支持', '维修维护', '客户投诉'];
          return type[text - 1];
        },
        scopedSlots: {
          filterDropdown: 'taskTypeFilterDropdown',
        },
      },
      {
        align: 'center',
        title: '任务条数',
        dataIndex: 'mobileCount',
        width: 50,
      },
      {
        align: 'center',
        title: '执行数量',
        dataIndex: 'dialedCount',
        width: 50,
      },
      {
        align: 'center',
        title: '任务执行率',
        dataIndex: 'taskType',
        width: 50,
        customRender: (text, row, index) => {
          if (!row.dialedCount) return '--';
          let callRate = ((row.dialedCount / row.mobileCount) * 100).toFixed(2);
          return callRate + '%';
        },
      },
      {
        align: 'center',
        title: '业务状态',
        dataIndex: 'businessStatus',
        width: 60,
        customRender: (text, row, index) => {
          const resultTex = !text ? <span style="color: green">正常</span> : <span style="color: red">关闭</span>;
          return resultTex;
        },
      },
      {
        align: 'center',
        title: '创建时间',
        dataIndex: 'createDate',
        width: 80,
      },
    ];

    //通话记录
    const taskRecordColumns = [
      {
        align: 'left',
        title: '姓名',
        dataIndex: 'linkManName',
        width: 100,
      },
      {
        align: 'left',
        title: '性别',
        dataIndex: 'gender',
        width: 50,
        customRender: (text, row, index) => {
          if (text == '男' || text == '女') {
            return text;
          } else {
            return '';
          }
        },
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
        title: '被叫号码',
        dataIndex: 'callee',
        width: 120,
      },
      {
        align: 'left',
        title: '客户名称',
        dataIndex: 'crmName',
        width: 200,
      },
      {
        align: 'center',
        title: '接通状态',
        dataIndex: 'callResult',
        width: 70,
        customRender: (text, row, index) => {
          return text === 1 ? <span style="color: green">已接通</span> : <span style="color: red">未接通</span>;
        },
        scopedSlots: {
          filterDropdown: 'callResultFilterDropdown',
        },
      },
      {
        align: 'center',
        title: '录音',
        dataIndex: 'callAudioPath',
        width: 60,
        scopedSlots: { customRender: 'callAudioPath' },
      },
      {
        align: 'center',
        title: '通话时长(秒)',
        dataIndex: 'talkTime',
        width: 100,
        customRender: (text, row, index) => {
          return this.durationFormat(text, 'seconds', 'mm:ss') || '';
        },
        scopedSlots: {
          filterDropdown: 'talkTimeFilterDropdown',
        },
        onFilterDropdownVisibleChange: (visible) => {
          if (visible) {
            let talkTimeStart = localStorage.getItem('taskRecordPostData_talkTimeStart');
            let talkTimeEnd = localStorage.getItem('taskRecordPostData_talkTimeEnd');
            if (talkTimeStart) {
              this.taskRecordPostData.talkTimeStart = parseInt(talkTimeStart);
            }
            if (talkTimeEnd) {
              this.taskRecordPostData.talkTimeEnd = parseInt(talkTimeEnd);
            }
          }
        },
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        width: 150,
      },
      {
        title: '接听时间',
        dataIndex: 'answerTime',
        width: 150,
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        width: 150,
      },
    ];

    return {
      taskTypeArr,
      callTypeArr,
      businessStatusArr,
      statusArr,
      baseSettingsList,
      taskId: 0, //任务ID
      taskItem: {}, //任务名称
      voice_pay: false, // 语音播放
      visible: false,
      link_device: false, // 是否链接设备
      keyboard: [1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'],

      detailTableShow: true,
      activeTabKey: '1',
      detailPostData: {
        lastCallStatus: null,
        lastCallResult: null,
      },
      columns,
      data: [],
      form: this.$form.createForm(this, { name: 'advanced_search' }),
      selectedKeys: [], //任务明细table选中key
      pagination: {
        defaultPageSize: 20,
        size: 'small',
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: (total) => {
          return (
            <div>
              共 {total} 条数据，每页
              <a-input-number
                value={this.pagination.pageSize}
                min={1}
                max={500}
                onPressEnter={(e) => this.changeLinkMamPageSize(e)}
              />
              条
            </div>
          );
        },
        showQuickJumper: true,
        showLessItems: true,
      },
      //选择任务
      taskPagination: {
        defaultPageSize: 20,
        size: 'small',
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: (total) => {
          return (
            <div>
              共 {total} 条数据，每页
              <a-input-number
                value={this.taskPagination.pageSize}
                min={1}
                max={500}
                onPressEnter={(e) => this.changeTaskPageSize(e)}
              />
              条
            </div>
          );
        },
        onChange: (page, pageSize) => {
          this.taskPagination.current = page;
          this.taskPagination.pageSize = pageSize;
          Object.assign(this.taskPostData, {
            page: {
              size: pageSize,
              current: page,
            },
          });
          this.taskPage();
        },
        showQuickJumper: true,
        showLessItems: true,
      },
      taskModalVisible: false,
      taskSearchKeyWord: '',
      taskData: [],
      taskIsLoadingSearching: false,
      taskColumns,
      taskCustomClick: (record, index) => ({
        on: {
          click: (event) => {
            event.preventDefault();
            //跳转 呼叫中心
            this.initPage(record);
          },
        },
      }),
      taskPostData: {
        page: {
          current: 1,
          size: 20,
        },
      },
      //客户详情 抽屉
      drawerVisible: false, //客户详情抽屉
      routeUrl: '',
      drawerTitle: '',
      callingLinkMan: {},
      //通话记录
      taskRecordColumns,
      taskRecordPostData: {
        page: {
          current: 1,
          size: 10,
        },
      },
      taskRecordPagination: {
        defaultPageSize: 10,
        size: 'small',
        pageSize: 10,
        total: 0,
        showTotal: (total) => {
          return (
            <div>
              共 {total} 条数据，每页
              <a-input-number
                value={this.taskRecordPagination.pageSize}
                min={1}
                max={500}
                onPressEnter={(e) => this.changeTaskRecordPageSize(e)}
              />
              条
            </div>
          );
        },
        onChange: (page, pageSize) => {
          this.taskRecordPagination.current = page;
          this.taskRecordPagination.pageSize = pageSize;
          Object.assign(this.taskRecordPostData, {
            page: {
              size: pageSize,
              current: page,
            },
          });
          this.pageTaskRecord();
        },
        showQuickJumper: true,
        showLessItems: true,
      },
      taskRecordData: [],
      isLOadingTaskRecord: false,
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      lastCallResultCondition: -1, //接通状态 查询条件
    };
  },
  //接口调用（数据准备）
  created() {},
  mounted() {},
  activated() {
    this.initPage();
  },
  watch: {
    $route: {
      handler(nv, ov) {
        //离开路由关闭 右侧详情抽屉
        this.drawerVisible = false;
      },
      deep: true,
    },
  },
  computed: {
    //号码数
    mobileCount: function() {
      let { data } = this;
      return data.length;
    },
    //已拨打数量
    dialedCount: function() {
      let { data } = this;
      return data.filter((f) => f.lastCallStatus).length;
    },
    //未拨打数量
    waitCount: function() {
      let { data } = this;
      return data.filter((f) => !f.lastCallStatus).length;
    },
    ...mapState({
      userInfo: (state) => state.user.info,
      permissions: (state) => state.user.permissions,
      devicename: (state) => state.callingBox.devicename, //设备名称
    }),
  },
  methods: {
    durationFormat,
    OpenCallingBox(callParams, isPlayAudio) {
      let { userInfo, taskItem } = this;
      if (!taskItem || taskItem.businessStatus) {
        return;
      }
      if (taskItem.createUserId != userInfo.id) {
        this.$message.warning('不是自己的任务不能拨打');
        return;
      }
      //1.临时拨打
      if (!callParams) {
        MiddleUtils.$emit('OpenCallingBox', null, taskItem);
        return;
      }
      let newCallParams = { ...callParams };
      Object.assign(newCallParams, {
        createUserId: userInfo.id,
        createUserName: userInfo.name,
      });
      Object.assign(taskItem, {
        isPlayAudio,
        HangupCallBack: this.reloadData,
        OutconnectedCallBack: this.goToDetail,
      });
      //2.任务明细 拨打
      MiddleUtils.$emit('OpenCallingBox', newCallParams, taskItem);
    },
    //播放/暂停
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
    // 手机拨号弹窗
    phone_dial() {
      this.visible = !this.visible;
    },

    choice_number(val) {
      this.temporaryNumber += val;
    },

    choice_up(val) {
      console.log('---2--', val);
    },

    choice_dow(val) {
      console.log('----1-', val);
    },
    //初始化 
    initPage(selectData) {
      if (!selectData) {
        let newTaskId = this.$route.params.taskId;
        this.taskId = newTaskId;
      } else {
        this.taskModalVisible = false;
        this.taskId = selectData.id;
      }
      this.reloadData();
    },
    //刷新
    reloadData() {
      let { taskId } = this;
      if (!taskId) return;
      Object.assign(this.detailPostData, {
        lastCallStatus: null,
        lastCallResult: null,
      });
      this.taskDetail1();
      this.listTaskDetail();
      this.pageTaskRecord();
    },
    //任务详情
    taskDetail1() {
      let { taskId } = this;
      if (!taskId) return;
      taskDetail({ id: taskId }).then((response) => {
        if (response.code === 200) {
          const { data } = response;
          this.taskItem = data;
        }
      }).catch((error) => { });
    },
    //重播语音
    audioRepeat() {
      let voiceAudioDom = this.$refs.voiceAudio;
      if (voiceAudioDom) {
        voiceAudioDom.currentTime = 0; //重新播放
      }
    },
    //详情语音_播放/暂停
    audioControl() {
      let voiceAudioDom = this.$refs.voiceAudio;
      if (voiceAudioDom && voiceAudioDom.src) {
        this.voice_pay = true;
        voiceAudioDom.play(); // 播放
      } else {
        this.voice_pay = false;
        voiceAudioDom.pause(); // 暂停
      }
    },
    onChangeTab(activeTabKey) {
      console.log('activeTabKey', activeTabKey);
    },
    //任务明细 条件 事件
    OnChangeDetailPostData(params) {
      const { detailPostData } = this;
      for (const key in params) {
        if (params[key] == detailPostData[key]) {
          detailPostData[key] = null;
        } else {
          detailPostData[key] = params[key];
        }
      }
      this.listTaskDetail();
    },
    /************ 任务 ************/
    onTaskShow() {
      this.taskModalVisible = true;
      this.taskPage();
    },
    onTaskClose() {
      this.taskModalVisible = false;
    },
    //获取任务列表
    taskPage() {
      const { taskPostData, taskSearchKeyWord } = this;
      taskPostData.taskName = taskSearchKeyWord;
      taskPage(taskPostData).then((response) => {
        if (response.code === 200) {
          const { data } = response;
          const { records, total } = data;
          this.taskData = records;
          this.taskData.forEach((item) => {
            item.key = item.id;
          });
          Object.assign(this.taskPagination, {
            total,
          });
        }
      }).catch((error) => { });
    },
    changeTaskPageSize(e) {
      const value = e.target.value;
      Object.assign(this.taskPostData, {
        page: {
          size: value,
          current: 1,
        },
      });
      Object.assign(this.taskPagination, {
        pageSize: Number.parseInt(value),
        current: 1,
      });
    },
    changeLinkMamPageSize(e) {
      const value = e.target.value;
      Object.assign(this.linkPostData, {
        page: {
          size: value,
          current: 1,
        },
      });
      Object.assign(this.linkPagination, {
        pageSize: Number.parseInt(value),
        current: 1,
      });
      this.pageNotTaskingLinkMan();
    },
    changeTaskRecordPageSize(e) {
      const value = e.target.value;
      Object.assign(this.taskRecordPostData, {
        page: {
          size: value,
          current: 1,
        },
      });
      Object.assign(this.taskRecordPagination, {
        pageSize: Number.parseInt(value),
        current: 1,
      });
      this.pageTaskRecord();
    },
    userSelection(keys, rows) {
      this.selectedKeys = [];
      this.selectedKeys = keys;
    },
    hideModal() {
      this.editModal = false;
      this.roleModal = false;
    },
    onTableChange(pagination, filters, sorter) {
      console.log('任务明细列表onTableChange_params', pagination, filters, sorter);
    },
    //获取任务明细列表
    listTaskDetail() {
      const { detailPostData, taskId } = this;
      if (!taskId) return;
      Object.assign(detailPostData, { taskId });
      listTaskDetail(detailPostData).then((response) => {
        if (response.code === 200) {
          const { data } = response;
          this.data = data;
          this.data.forEach((item) => {
            item.key = item.id;
          });
          this.detailTableShow = false;
          this.$nextTick(() => {
            this.detailTableShow = true;
          });
        }
      }).catch((error) => { });
    },
    //分页查询 通话记录
    pageTaskRecord() {
      let { taskRecordPostData, taskId } = this;
      if (!taskId) return;
      taskRecordPostData.taskId = taskId;
      pageTaskRecord(taskRecordPostData).then((response) => {
        if (response.code === 200) {
          this.isLoadingSearching = false;
          const { data } = response;
          const { records, total, current, size } = data;
          this.taskRecordData = records;
          this.taskRecordData.forEach((item) => {
            item.key = item.id;
            if (item.callBackJson) {
              let callBack = JSON.parse(item.callBackJson);
              delete callBack.callResult;
              delete callBack.callResultState;
              Object.assign(item, callBack);
            }
          });
          let page = {
            total: total,
            pageSize: size,
            current: current,
          };
          Object.assign(this.taskRecordPagination, page);
        }
      });
    },
    //跳转到 客户详情
    goToDetail(item, tabkey) {
      let { taskItem } = this;
      if (taskItem.businessStatus) {
        this.$message.warning('任务关闭，不能操作');
        return;
      }
      if (!item.id) return;
      this.callingLinkMan = item;
      const { permissions } = this;
      if (
        permissions.includes('crm:potential:edit') ||
        permissions.includes('crm:potential:edit') ||
        permissions.includes('crm:deals:edit')
      ) {
        this.drawerVisible = true;
        this.routeUrl = window.location.host + `/crm/customer/detail/${item.crmId}?tabkey=${tabkey}`;
        this.drawerTitle = item.crmName;
        this.$forceUpdate();
        //给点击的行一个颜色
        this.data.map((d) => {
          this.$set(d, 'clickActive', false);
        });
        this.$set(item, 'clickActive', true);
        this.$refs.drawerCrm.detail(item.crmId);
      }
    },
    //领用客户
    receive() {
      let { callingLinkMan } = this;
      if (callingLinkMan.crmId) {
        let _this = this;
        this.$confirm({
          title: '提示',
          content: '确定要领用吗？',
          okText: '确定',
          cancelText: '取消',
          onOk() {
            receive([callingLinkMan.crmId]).then((response) => {
              if (response.code == 200) {
                _this.$message.success(response.message);
                _this.drawerVisible = false; //关闭抽屉窗口
              } else {
                _this.$message.error(response.message);
              }
            });
          },
          onCancel() {},
        });
      }
    },
    handleSearch(setSelectedKeys, confirm, value) {
      setSelectedKeys([value]);
      confirm();
    },
    handleSearchInput(selectedKeys, confirm, dataIndex) {
      confirm();
    },
    handleResetSearch(clearFilters, code) {
      clearFilters();
    },
    //条件改变
    onTaskRecordConditionChange(localStorageKey, isStorage, $event) {
      if (localStorageKey && isStorage) {
        let value = $event.target.value;
        localStorage.setItem(localStorageKey, value);
      }
      Object.assign(this.taskRecordPostData.page, { current: 1 });
      this.pageTaskRecord();
    },
    resetTalkTimeCondition() {
      localStorage.setItem('taskRecordPostData_talkTimeStart', '');
      localStorage.setItem('taskRecordPostData_talkTimeEnd', '');
      Object.assign(this.taskRecordPostData, {
        talkTimeStart: null,
        talkTimeEnd: null,
      });
      Object.assign(this.taskRecordPostData.page, { current: 1 });
      this.pageTaskRecord();
    },
  },
};
</script>

<style scoped>
.form-inline label {
  justify-content: left !important;
}
.form-inline > .col {
  margin-bottom: 1.5rem !important;
}
.icons-list >>> .anticon {
  margin-right: 8px;
  font-size: 16px;
}
.ant-advanced-search-form {
  padding: 24px;
  background: #fbfbfb;
}

.ant-advanced-search-form .ant-form-item {
  display: flex;
  margin-bottom: 0px !important;
}

.ant-advanced-search-form .ant-form-item-control-wrapper {
  flex: 1;
}

#components-form-demo-advanced-search .ant-form {
  max-width: none;
}
#components-form-demo-advanced-search .search-result-list {
  margin-top: 16px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 80px;
}
</style>
<style lang="less">
@import '~@/style/setting/inventory.less';
@import '~@/style/crm.less';
.ant-input-number-handler-wrap {
  display: none !important;
}
.phone-class:hover {
  color: #1890ff;
}
.call-wrapper {
  width: 380px;
  height: 170px;
  position: fixed;
  box-shadow: 4px 0px 10px #555555;
  bottom: 0px;
  left: 254px;
  background: #ffffff;
  z-index: 102;
  &.call-wrapper-show {
    transition: 0.5s bottom;
    bottom: 0px;
  }

  &.call-wrapper-close {
    transition: 0.5s bottom;
    bottom: -175px;
  }
  .fa-text {
    width: 50px;
    height: 50px;
    margin-top: 30px;
    margin-left: 20px;
    font-size: 48px;
    color: #a7f12e;
    transform: rotate(10deg);
    transition: 1s transform;
  }
  .call-status {
    position: absolute;
    left: 108px;
    top: 45px;
    font-size: 26px;
    color: #666666;
  }
  .call-title {
    color: #ffffff;
    width: 100%;
    height: 32px;
    line-height: 32px;
    padding-left: 10px;
    box-sizing: border-box;
    background: #202534;
  }
  .call-content {
    padding: 10px;
    width: 100%;
    height: 140px;
    box-sizing: border-box;
    position: relative;
    .call-close {
      position: absolute;
      bottom: 10px;
      right: 10px;
    }
    .call-answer {
      position: absolute;
      bottom: 10px;
      right: 90px;
    }
  }
}
.voice_name {
  display: flex;
}
.voice-icon {
  span {
    padding: 0 5px;
    position: relative;
    bottom: 3px;
  }
}
.voice-title {
  width: 150px;
}

.phone-box {
  font-size: 30px !important;
  padding: 0 5px;
  background: #8CDC5A;
  border-radius: 5px;
  text-align: center;
  color: #fff !important;
  height: 38px;
  line-height: 30px;
}

.dial-other {
  position: relative;
  .dial-other-box {
    width: 310px;
    min-height: 350px;
    padding-bottom: 20px;
    position: absolute;
    left: 0;
    background: #fff;
    border-radius: 4px;
    border: 2px solid #8cd85a;
    display: flex;
    flex-direction: column;
  }
}
</style>