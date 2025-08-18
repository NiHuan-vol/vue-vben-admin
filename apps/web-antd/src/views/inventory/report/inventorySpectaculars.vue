<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2">
              <div class="btns" @click="sync">
                <Icon class="btns-icon" icon="ant-design:sync-outlined" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <div class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{voucherTitle}}</h3>
        <Tabs @change="tabChange">
          <TabPane key="1" tab="看板查询方案">
            <div class="note-warpper-inout">
              <a-row :span="24" :gutter="[16,16]">
                <a-col :xs="12" :sm="8" :md="8" :lg="6" :xl="4">
                  <div class="note-add" @click="showItem(1)">
                    <Icon type="plus" />
                  </div>
                </a-col>
                <a-col v-for="item in myPlanList" :key="item.id" :xs="12" :sm="8" :md="8" :lg="6" :xl="4">
                  <div class="note-item" @dblclick="showItem(2, item)">
                    <div class="note-title-box">
                      <span class="note-title">{{item.programmeName}}</span>
                      <span class="note-option">
                        <Icon @click.stop="removeItem(item)" icon="ant-design:close-outlined" />
                      </span>
                    </div>
                    <div class="note-content">
                      <ul class="note-content-li">
                        <li style="margin-bottom: 2px;" v-for="(d, index) in item.data" :key="index">
                          <div>{{d.inventoryName}}</div>
                        </li>
                      </ul>
                    </div>
                    <div class="note-time">
                      {{item.createDate}}
                      <span style="float: right; margin-left: 10px; color: #1890ff; cursor: pointer" @click="warehouseDisplay(item)">查看看板</span>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>

    <div class="flex-tial" v-if="Warehouse_type">
      <div class="warehose_maun">
        <div class="btn margin-left-10" @click="exit_ware">关闭看板</div>
        <div class="btn margin-left-10" v-if="isFullScreen" @click="exitFullscreenExit">还原</div>
        <div class="btn" v-else @click="enterFullscreen">全屏</div>
      </div>
      <div class="warehose_name_title">现存量看板</div>
      <div class="time-text" :style="isFullScreen ? bigStyle : ''">{{time}}</div>
      <div style="min-height: 200px;">
        <a-row>
          <a-col :span="24">
            <div class="batch-data-box">
              <div class="data-title">
                <div class="item">物料名称</div>
                <div class="item">物料编码</div>
                <div class="item">规格型号</div>
                <div class="item">计量单位</div>
                <div class="item">安全库存</div>
                <div class="item">库存量</div>
              </div>
              <div class="data-list-box" ref="dataListBox">
                <div class="data-list-mask" @mousemove="scrollMouseOver" @mouseout="scrollMouseOut"></div>
                <div class="data-list" v-for="item in dataSync" :key="item.inventoryId">
                  <div class="item">{{item.inventoryName}}</div>
                  <div class="item">{{item.inventoryCode}}</div>
                  <div class="item">{{item.inventorySpecification}}</div>
                  <div class="item">{{item.unitName}}</div>
                  <div class="item">{{item.safeStorage}}</div>
                  <div class="item">{{item.inventoryQuantity}}</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="warehose_picture">
              <div style="width: 100%;">
                <BasicChart ref="registers_creditChart" :options="options" :auto-resize="true" theme="walden" :style="{ width: '100%' }" />
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <div class="loading-wrapper" v-show="loading">
      <Spin class="loading-content" tip="加载中..." />
    </div>

    <Modal v-model:visible="inventoryVisible" title="新增看板方案" @cancel="cancel" @ok="saveItem" :width="1000">
      <div class="from-wrapper-spectculars">
        <div class="from-name">方案名称：</div>
        <div class="from-input">
          <Input v-model.trim="saveAsName" />
        </div>
      </div>
      <div class="clearfix">
        <div style="width: 45%; float: left;">
          已选中 {{initNumber}} 项,总共 {{tableDataLength}} 项
          <BasicTable ref="plTable" rowKey="id" @select="selectInit" :columns="columns" :dataSource="tableData" :pagination="false" :rowHeight="rowHeight" bordered />
        </div>
        <div class="shuttle-btn">
          <div><Icon icon="ant-design:forward-outlined" @click="forward" /></div>
          <div><Icon icon="ant-design:backward-outlined" @click="backward" /></div>
        </div>
        <div style="width: 45%; float: left;">
          总共 {{checkNumber}} 项
          <BasicTable ref="plTableCheck" rowKey="id" @select="selectCheck" :columns="columns" :dataSource="checkSubmitData" :pagination="false" :rowHeight="rowHeight" bordered />
        </div>
      </div>

      <template #footer>
        <div>
          <Button type="primary" @click="saveItem">保存</Button>
          <Button @click="cancel" class="margin-left-10">关闭</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { BasicTable, TableColumn } from '@/components/Table';
import { Button, Input, Modal, Spin, Tabs, TabPane, Icon } from 'ant-design-vue';
import { BasicChart } from '@/components/Chart';
import { list as listInventory } from '@/api/inventory/inventory';
import { save, remove, myplan } from '@/api/erp/reportProgramme';
import { boardApi } from '@/api/inventory/inout';
import { walden } from '@/theme/echarts/walden';

const route = useRoute();
const instance = getCurrentInstance();

// 状态定义
const inventoryVisible = ref(false);
const saveAsName = ref<string>('');
const columns = ref<TableColumn[]>([
  { label: '物料编码', prop: 'inventoryCode', width: 110 },
  { label: '物料名称', prop: 'inventoryName', width: 160, fixed: true },
  { label: '规格型号', prop: 'inventorySpecification', width: 110 },
]);
const dataBatch = ref<any[]>([]);
const projectId = ref<string>('');
const projectName = ref<string>('');
const activeKey = ref(1);
const expandedRowKeys = ref<string[]>([]);
const Warehouse_type = ref(false);
const dataList = ref<any[]>([]);
const dataRecord = ref<any>({});
const intervalId = ref<number | null>(null);
const dataSync = ref<any[]>([]);
const routeData = ref<any[]>([]);
const routeDataXAxis = ref<string[]>([]);
const routeDataNum = ref<number[]>([]);
const options = ref<any>({});
const outNum = ref(0);
const inNum = ref(0);
const loading = ref(false);
const isFullScreen = ref(false);
const bigStyle = ref<Record<string, string>>({ 'margin-top': '60px' });
const time = ref('');
const timeOut = ref<number | null>(null);
const rowHeight = ref(55);
const tableData = ref<any[]>([]);
const selectRows = ref<any[]>([]);
const reportCode = ref('inventory_board');
const myPlanList = ref<any[]>([]);
const planActiveId = ref<string | null>(null);
const inventoryQuantityArray = ref<number[]>([]);
const availableQuantityArray = ref<number[]>([]);
const timeRun = ref(false);
const checkSubmitData = ref<any[]>([]);
const initNumber = ref(0);
const checkNumber = ref(0);
const checkSelectData = ref<any[]>([]);
const maxLength = ref(30);
const timeScroll = ref<number | null>(null);
const tableDataLength = ref(0);

// 计算属性
const voucherTitle = computed(() => route.meta.name || '库存可视化看板');

// 生命周期钩子
onMounted(() => {
  orgOptions();
  getData();
  getList();
});

onUnmounted(() => {
  clear();
});

// 方法定义
function forward() {
  const check = (instance.refs.plTable as BasicTable).getSelectedRows();
  if (checkNumber.value + check.length > maxLength.value) {
    message.warning(`最多只能选择 ${maxLength.value} 个物料`);
    return;
  }

  checkSubmitData.value.push(...check);
  (instance.refs.plTableCheck as BasicTable).setTableData(checkSubmitData.value);

  // 删除左侧物料
  const map = new Map();
  checkSubmitData.value.forEach(m => map.set(m.id, m));
  tableData.value = tableData.value.filter(item => !map.has(item.id));
  (instance.refs.plTable as BasicTable).setTableData(tableData.value);
  tableDataLength.value = tableData.value.length;
  initNumber.value = 0;
}

function backward() {
  const check = (instance.refs.plTableCheck as BasicTable).getSelectedRows();
  tableData.value.push(...check);
  (instance.refs.plTable as BasicTable).setTableData(tableData.value);
  tableDataLength.value = tableData.value.length;
  initNumber.value = 0;

  const map = new Map();
  check.forEach(m => map.set(m.id, m));
  checkSubmitData.value = checkSubmitData.value.filter(item => !map.has(item.id));
  (instance.refs.plTableCheck as BasicTable).setTableData(checkSubmitData.value);
}

function getScroll() {
  const dom = instance.refs.dataListBox as HTMLElement;
  const boxHeight = dom.clientHeight;
  const height = dom.scrollHeight;
  timeScroll.value = window.setInterval(() => {
    dom.scrollTop += 1;
    if (dom.scrollTop >= height - boxHeight) {
      dom.scrollTop = 0;
    }
  }, 100);
}

function scrollMouseOver() {
  if (timeScroll.value) clearInterval(timeScroll.value);
}

function scrollMouseOut() {
  if (dataSync.value.length > 7 && !timeScroll.value) {
    getScroll();
  }
}

function getData() {
  const params = { current: 1, size: -1 };
  listInventory(params).then(res => {
    if (res.code === 200) {
      tableData.value = res.data.records.map(item => {
        item.key = item.id;
        const attribute: string[] = [];
        if (item.isPurchasing) attribute.push('允许外购');
        if (item.isForSale) attribute.push('允许销售');
        if (item.isMadeSelf) attribute.push('允许自制');
        if (item.isMaterial) attribute.push('允许生产耗用');
        if (item.isLaborCost) attribute.push('允许劳务费用');
        if (item.isSuite) attribute.push('允许成套件');
        if (item.isMadeRequest) attribute.push('允许委外');
        if (item.isInventedKey) attribute.push('允许虚拟件');
        item.inventoryAttribute = attribute.join('，');
        return item;
      });
      tableDataLength.value = tableData.value.length;
    }
  });
}

function saveItem() {
  const name = saveAsName.value;
  if (!name) {
    message.warning('请输入方案名称');
    return;
  } else if (checkSubmitData.value.length === 0) {
    message.warning('请选择需要查看的物料');
    return;
  }

  const newArray = checkSubmitData.value.map(res => ({
    id: res.id,
    inventoryName: res.inventoryName,
    inventoryCode: res.inventoryCode,
    inventorySpecification: res.inventorySpecification
  }));

  const requestData = {
    id: planActiveId.value,
    programmeName: name,
    programmeJson: JSON.stringify(newArray),
    reportCode: reportCode.value
  };

  save(requestData).then(res => {
    if (res.code === 200) {
      message.success(planActiveId.value ? '方案修改成功' : '方案保存成功');
      getList();
      clearSelection();
      inventoryVisible.value = false;
    }
  });
}

function getList() {
  myplan({ reportCode: reportCode.value }).then(res => {
    if (res.code === 200) {
      myPlanList.value = res.data.map(item => {
        item.data = JSON.parse(item.programmeJson);
        return item;
      });
    }
  });
}

function removeItem(item: any) {
  Modal.confirm({
    title: '提示',
    content: `是否确认删除${item.programmeName}?`,
    onOk() {
      remove({ id: item.id }).then(response => {
        if (response.code === 200) {
          message.success('删除方案成功');
          getList();
        }
      });
    }
  });
}

function showItem(type: number, item?: any) {
  inventoryVisible.value = true;
  getData();

  if (type === 1) {
    planActiveId.value = null;
    saveAsName.value = '';
    selectRows.value = [];
    checkSubmitData.value = [];
    initNumber.value = 0;
  } else if (item) {
    planActiveId.value = item.id;
    saveAsName.value = item.programmeName;
    selectRows.value = JSON.parse(item.programmeJson);
    initNumber.value = 0;
  }

  setTimeout(() => {
    if (type === 1) {
      (instance.refs.plTable as BasicTable).setTableData(tableData.value);
      (instance.refs.plTableCheck as BasicTable).setTableData(checkSubmitData.value);
    } else if (type === 2 && item) {
      const map = new Map();
      selectRows.value.forEach(m => map.set(m.id, m));
      tableData.value = tableData.value.filter(item => !map.has(item.id));
      (instance.refs.plTable as BasicTable).setTableData(tableData.value);
      tableDataLength.value = tableData.value.length;

      checkSubmitData.value = selectRows.value;
      (instance.refs.plTableCheck as BasicTable).setTableData(checkSubmitData.value);
    }
  }, 0);
}

function cancel() {
  inventoryVisible.value = false;
  clearSelection();
}

function selectCheck(rows: any[]) {
  checkSelectData.value = rows;
}

function clearSelection() {
  (instance.refs.plTable as BasicTable).clearSelection();
}

function selectInit(rows: any[]) {
  selectRows.value = rows;
  initNumber.value = rows.length;
}

function orgOptions() {
  options.value = {
    title: {
      text: '库存情况',
      textStyle: { color: '#19D0D8' },
      x: 'center',
      top: 0
    },
    tooltip: { show: true },
    legend: { data: ['库存量', '安全库存'], top: 30 },
    xAxis: [{
      name: '物料名称',
      type: 'category',
      axisLabel: { interval: 0 },
      grid: { let: '10%', bottom: '40%' },
      data: routeDataXAxis.value,
      nameTextStyle: { fontWeight: 'bold', color: '#19D0D8', fontSize: 14 }
    }],
    yAxis: [{
      name: '数量',
      nameTextStyle: { fontWeight: 'bold', color: '#19D0D8', fontSize: 14 },
      type: 'value',
      axisLabel: {
        formatter: '{value}',
        textStyle: { color: '#19D0D8', fontSize: 14 }
      }
    }],
    series: [{
      name: '库存量',
      type: 'bar',
      barWidth: '20',
      data: inventoryQuantityArray.value,
      itemStyle: {
        normal: {
          label: {
            show: true,
            position: 'top',
            textStyle: { color: 'rgba(231, 122, 14)', fontSize: 16 }
          }
        }
      }
    }, {
      name: '安全库存',
      type: 'bar',
      barWidth: '20',
      data: availableQuantityArray.value,
      itemStyle: {
        normal: {
          label: {
            show: true,
            position: 'top',
            textStyle: { color: 'rgba(231, 122, 14)', fontSize: 16 }
          }
        }
      }
    }]
  };
}

function warehouseDisplay(record: any) {
  showtime();
  dataRecord.value = record;
  const data = JSON.parse(record.programmeJson);
  const ids = data.map((item: any) => item.id);
  const requestData = { inventoryIds: ids.join(',') };

  if (!timeRun.value) {
    timeRun.value = true;
    timeOut.value = window.setInterval(showtime, 1000);
    setTimeout(() => {
      if (dataSync.value.length > 7) {
        getScroll();
      }
    }, 1500);
  }

  dataRefreh();
  boardApi(requestData).then(response => {
    if (response.code === 200) {
      loading.value = false;
      Warehouse_type.value = true;
      const xArray: string[] = [];
      const quantityNum: number[] = [];
      const availableNum: number[] = [];

      response.data.forEach((item: any) => {
        xArray.push(item.inventoryName);
        quantityNum.push(item.inventoryQuantity);
        availableNum.push(item.safeStorage);
      });

      routeDataXAxis.value = xArray;
      inventoryQuantityArray.value = quantityNum;
      availableQuantityArray.value = availableNum;
      dataSync.value = response.data;
      orgOptions(); // 更新图表
    }
  });
}

function showtime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  time.value = `${year}年${month}月${day}日  ${hour}:${minute}:${second}`;
}

function dataRefreh() {
  if (intervalId.value) return;

  intervalId.value = window.setInterval(() => {
    warehouseDisplay(dataRecord.value);
  }, 2000);
}

function clear() {
  if (intervalId.value) clearInterval(intervalId.value);
  intervalId.value = null;
  routeData.value = [];
  if (timeOut.value) clearTimeout(timeOut.value);
  timeOut.value = null;
  timeRun.value = false;
  if (timeScroll.value) clearInterval(timeScroll.value);
  timeScroll.value = null;
}

function enterFullscreen() {
  isFullScreen.value = true;
  const docElm = document.documentElement;
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen();
  } else if (docElm.mozRequestFullScreen) {
    docElm.mozRequestFullScreen();
  } else if (docElm.webkitRequestFullScreen) {
    docElm.webkitRequestFullScreen();
  } else if (docElm.msRequestFullscreen) {
    docElm.msRequestFullscreen();
  }
}

function exitFullscreenExit() {
  isFullScreen.value = false;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function exit_ware() {
  Warehouse_type.value = false;
  exitFullscreenExit();
  clear();
}

function sync() {
  activeKey.value = 1;
  dataBatch.value = [];
  expandedRowKeys.value = [];
}

function tabChange(key: string) {
  activeKey.value = Number(key);
}
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';
.choice-project {
  width: 300px;
  margin-top: 10px;
  text-align: right;
  margin-bottom: 10px;
  display: flex;
  line-height: 36px;
  .choice-item {
    flex: 1;
  }
  .choice-item:nth-child(1) {
    flex: 0 0 50px;
  }
}

// 看板样式
.flex-tial {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 47, 71);
  padding: 10px;
  z-index: 1;
  .batch-data-box {
    margin-top: 10px;
    color: #19d0d8;
    border: 1px solid #19d0d8;
    letter-spacing: 1px;
    line-height: 46px;
    padding: 0px 10px;
    .data-title {
      display: flex;
      border-bottom: 1px solid #19d0d8;
      .item {
        flex: 1;
        padding: 0 10px;
      }
    }
    .data-list-box {
      height: 324px;
      overflow-y: scroll;
      .data-list-mask {
        position: absolute;
        z-index: 800;
        width: 99%;
        height: 324px;
        background: rgba(0, 0, 0, 0);
      }
    }
    .data-list {
      display: flex;
      .item {
        flex: 1;
        padding: 0 10px;
        border: none;
        font-size: 16px;
        font-weight: bold;
        color: rgba(231, 122, 14);
      }
    }
  }
  .time-text {
    color: #19d0d8;
    font-size: 18px;
    text-align: right;
    padding-right: 10px;
    font-weight: bold;
  }
  .route-item {
    div {
      line-height: 32px;
    }
    border: 1px solid #19d0d8;
    padding: 5px;
    color: #19d0d8;
    font-size: 14px;
  }
  .item-number {
    font-size: 18px;
    font-weight: bold;
    color: rgba(231, 122, 14);
  }
  div::-webkit-scrollbar {
    display: none;
  }
}
.warehose_maun {
  display: flex;
  flex-direction: row-reverse;
  height: 32px;
  .btn {
    cursor: pointer;
    height: 32px;
    color: #19d0d8;
    border: 1px solid #19d0d8;
  }
}

.warehose_list {
  max-height: 300px;
  min-height: 200px;
  overflow: scroll;
  border: 1px solid #cacaca;
}

.warehose_name_title {
  width: 100%;
  text-align: center;
  color: #19d0d8;
  height: 40px;
  line-height: 40px;
  margin-bottom: 10px;
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 1px;
}

.warehose_picture {
  display: flex;
  padding: 10px;
  padding-top: 30px;
}

.warehose_top {
  display: flex;
  .warehose_lit {
    width: 30%;
    border: 1px solid #cacaca;
    text-align: center;
  }
}

.note-warpper-inout {
  padding: 10px;
  .note-add {
    width: 100%;
    height: 260px;
    line-height: 260px;
    font-size: 60px;
    color: #888;
    box-shadow: 0px 0px 5px #ccc;
    text-align: center;
    cursor: pointer;
  }
  .note-item {
    box-shadow: 0px 0px 5px #ccc;
    height: 260px;
    border-radius: 4px;
    .note-title-box {
      height: 30px;
      line-height: 30px;
      padding-left: 5px;
      overflow: hidden;
      border-bottom: 1px solid #eee;
      display: flex;
      .note-title {
        width: 70%;
        flex: 0 0 70%;
        overflow: hidden;
      }
      .note-option {
        flex: 0 0 30%;
        overflow: hidden;
        float: right;
        text-align: right;
        padding-right: 5px;
        cursor: pointer;
      }
    }
    .note-content {
      height: 200px;
      padding: 5px;
      overflow-y: auto;
    }
    .note-content-li {
      list-style: none;
      padding: 0px;
    }
    .note-time {
      padding-left: 10px;
      height: 30px;
      line-height: 30px;
      padding-right: 5px;
      text-align: left;
      border-top: 1px solid #eee;
    }
  }
  .note-item:hover {
    box-shadow: 0px 0px 5px rgb(248, 100, 100);
  }
}
.from-wrapper-spectculars {
  display: flex;
  width: 320px;
  line-height: 32px;
  margin-bottom: 20px;
  .from-name {
    flex: 0 0 70px;
  }
  .from-input {
    flex: 1;
  }
}
.shuttle-btn {
  width: 10%;
  margin-top: 20%;
  float: left;
  text-align: center;
  font-size: 36px;
}
</style>