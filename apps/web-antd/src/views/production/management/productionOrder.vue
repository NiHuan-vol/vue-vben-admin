<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper" style="display: block">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <BtnsWrapper
          @searchClick="searchClick"
          :showModel="showModel"
          :orderId="orderId"
          :voucherState="voucherState"
          :editMask="editMask"
          @printOrder="printOrder"
          @switchList="switchList"
          @submitServer="submitServer"
          @clickEdit="clickEdit"
          @deleteOrder="deleteOrder"
          @getIdByData="getIdByData"
          @auditClick="auditClick"
          @turnThePage="turnThePage"
          @syncOrder="syncOrder"
          @submitOrder="submitOrder"
          @exportDetail="exportDetail"
          :sourceCode="sourceCode"
        >
          <template #neworder>
            <a-dropdown class="btns" key="new" style="display: block">
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">
                  新增
                  <Icon type="down" style="color: rgb(24, 144, 255); vertical-align: middle;" />
                </div>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="0">
                  <a href="javascript:void(0)" @click="newForecast">新增</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>

          <template #shengdan>
            <a-dropdown class="btns" key="sheng" style="display: block">
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                <Icon class="btns-icon" icon="snippets" />
                <div class="btns-text">
                  下达
                  <Icon type="down" />
                </div>
              </a>
              <a-menu slot="overlay">
                <template v-if="[-1, 0].includes(voucherState)">
                  <a-menu-item key="0">
                    <a href="javascript:void(0)">
                      <span :class="'color-gray'">下达生产</span>
                    </a>
                  </a-menu-item>
                  <a-menu-item key="1">
                    <a href="javascript:void(0)">
                      <span :class="'color-gray'">下达委外</span>
                    </a>
                  </a-menu-item>
                  <a-menu-item key="2">
                    <a href="javascript:void(0)">
                      <span :class="'color-gray'">下达请购</span>
                    </a>
                  </a-menu-item>
                </template>
                <template v-else>
                  <a-menu-item key="0" v-show="num === 2">
                    <a href="javascript:void(0)" @click="generateBills('ReleaseProduction', 0, listArr)">下达生产</a>
                  </a-menu-item>
                  <a-menu-item key="1" v-show="num === 3">
                    <a href="javascript:void(0)" @click="generateBills('AssignOutsourcing', 1, listArr)">下达委外</a>
                  </a-menu-item>
                  <a-menu-item key="2" v-show="num === 1">
                    <a href="javascript:void(0)" @click="generateBills('ReleaseProcurement', 2, listArr)">下达请购</a>
                  </a-menu-item>
                </template>
              </a-menu>
            </a-dropdown>
          </template>

          <template #moreBtn>
            <a-col class="btn-item" :class="[-1, 0].includes(voucherState) ? 'btns-disable' : ''">
              <a-dropdown class="btns" key="sheng" style="display: block">
                <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                  <Icon class="btns-icon" icon="snippets" />
                  <div class="btns-text">
                    合拆
                    <Icon type="down" />
                  </div>
                </a>
                <a-menu slot="overlay">
                  <template v-if="[-1, 0].includes(voucherState)">
                    <a-menu-item key="0">
                      <a href="javascript:void(0)">
                        <span :class="'color-gray'">合并</span>
                      </a>
                    </a-menu-item>
                    <a-menu-item key="1">
                      <a href="javascript:void(0)">
                        <span :class="'color-gray'">拆分</span>
                      </a>
                    </a-menu-item>
                  </template>
                  <template v-else>
                    <a-menu-item key="0">
                      <a href="javascript:void(0)" @click="merge">合并</a>
                    </a-menu-item>
                    <a-menu-item key="1">
                      <a href="javascript:void(0)" @click="split">拆分</a>
                    </a-menu-item>
                  </template>
                </a-menu>
              </a-dropdown>
            </a-col>
          </template>
        </BtnsWrapper>
      </div>

      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>

        <section v-show="showModel === 'list'">
          <!-- 列表 -->
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            @switchList="switchList"
            @dblclick="getIdByData"
            :reportCode="reportCodeList"
          />
        </section>

        <section v-show="showModel === 'order'">
          <div>
            <span class="audit-status" v-show="voucherState === 0">待审核</span>
            <span class="audit-status" v-show="voucherState === 1 || voucherState === 10">{{ voucherState === 1 ? '已审核' : '关闭' }}</span>
          </div>

          <a-form :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"><!-- 遮罩 --></div>
            </div>

            <div class="search-btn-box-gw">
              <div class="item-small" ref="planLi">
                <ul>
                  <li
                    class="item-plan"
                    :class="planActive === 0 ? 'active' : ''"
                    @click="onUserSearchChange(0)"
                  >
                    所有
                  </li>
                  <li
                    class="item-plan"
                    :class="planActive === 1 ? 'active' : ''"
                    @click="onUserSearchChange(1)"
                  >
                    采购计划
                  </li>
                  <li
                    class="item-plan"
                    :class="planActive === 2 ? 'active' : ''"
                    @click="onUserSearchChange(2)"
                  >
                    生产计划
                  </li>
                  <li
                    class="item-plan"
                    :class="planActive === 3 ? 'active' : ''"
                    @click="onUserSearchChange(3)"
                  >
                    委外计划
                  </li>
                </ul>
              </div>
              <div class="item-small-down" v-if="showDownPlan" @click="showDownPlanFun">
                <Icon v-if="iconDirection" icon="down" />
                <Icon v-else icon="up" />
              </div>
            </div>

            <div class="table-box">
              <a-table
                :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                id="bills_tb"
                :columns="columns"
                :data-source="dataSource"
                :custom-row="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                size="small"
                bordered
              >
                <template #number="{ text, record, index }">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
                <template v-for="col in slotArray" :key="col" #"{{ col }}"="{ text, record, index }">
                  <div data-key="">
                    <EditableCell
                      :checkType="checkType"
                      :text="text"
                      :col="col"
                      :index="index"
                      :record="record"
                      :dataSource="dataSource"
                      :unitsDataDetails="unitsDataDetails"
                      :unitsAssistSelect="unitsAssistSelect"
                      :dynamicAllData="dynamicFormData"
                      :dynamicFormDataMap="dynamicFormDataMap"
                      @choiceAddData="(index, col, event) => choiceAddData(index, col, event)"
                      @change="(index, col, event) => onCellChange(index, col, event)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </a-table>
              <div class="edit-mask edit-mask-selection" v-show="editMask"><!-- 遮罩 --></div>
            </div>

            <div class="footer-box">
              <OrderDynamicForm
                :FormData="orderFooterData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-footer" v-show="editMask"><!-- 遮罩 --></div>
            </div>
          </a-form>
        </section>

        <section v-show="showModel === 'detail'">
          <!-- 明细 -->
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>

        <section v-show="showModel === 'statistical'">
          <!-- 统计 -->
          <DynamicListDetails
            ref="statisticalSearchRef"
            :reportCode="reportCodeStatistical"
            :componentType="2"
            :basePostData="basePostData"
          />
        </section>
      </div>

      <div class="contextmenu-box">
        <!-- 右键菜单 -->
        <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
          <li @click="handleAdd()">新增行</li>
          <li @click="handleDelete()">删除行</li>
        </ul>
      </div>

      <DrawerBox
        ref="searchList"
        :unitData="unitData"
        :unitsData="unitsData"
        :unitsDataDetails="unitsDataDetails"
        @editClickOrder="editClickOrder"
      />
    </div>

    <!-- 加载中 -->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>

    <!-- 打印弹窗 -->
    <PrintModal
      v-if="printVisible"
      ref="printDom"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />

    <!-- 生单弹窗 -->
    <RawListModal ref="purchaseInRef" />

    <!-- 拆分弹窗 -->
    <SplitMaterial
      v-if="visibleSplit"
      ref="splitmaterial"
      :splitData="splitData"
      :data-source="dataSource"
      @close="close"
      @splitSubmit="splitSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onActivated, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import { save, examine, remove, getCode, submitOrder, setMerge, setSplit } from '@/api/production/productionOrder';
import { useProMixin } from '@/mixins/procurement/pro';
import RawListModal from '@/components/productionModal/rawListModal.vue';
import SplitMaterial from '../splitMaterial';
import { Icon } from '@ant-design/icons-vue';
import { Button, Dropdown, Menu, Table, Form } from 'ant-design-vue';

// 组件定义
const BtnsWrapper = defineAsyncComponent(() => import('@/components/BtnsWrapper.vue'));
const DynamicList = defineAsyncComponent(() => import('@/components/DynamicList.vue'));
const DynamicListDetails = defineAsyncComponent(() => import('@/components/DynamicListDetails.vue'));
const OrderDynamicForm = defineAsyncComponent(() => import('@/components/OrderDynamicForm.vue'));
const EditableCell = defineAsyncComponent(() => import('@/components/EditableCell.vue'));
const DrawerBox = defineAsyncComponent(() => import('@/components/DrawerBox.vue'));
const PrintModal = defineAsyncComponent(() => import('@/components/PrintModal.vue'));

// 使用mixin
const { pro } = useProMixin();

// 响应式数据
const sourceCode = ref('MasterProductionSchedule');
const reportCodeDetail = ref('ProductionOrder_Detail_Report');
const reportCodeStatistical = ref('ProductionOrder_Statistic_Report');
const reportCodeList = ref('ProductionOrder_List_Report');
const isDetailCrmId = ref(true);
const checkType = ref('is_made_self,is_made_request');
const selectedRowKeysList = ref<number[]>([]);
const selectedRowKeys = ref<number[]>([]);
const visibleSplit = ref(false);
const splitData = ref('');
const dataSource = ref<any[]>([]);
const n = ref(1);
const listArr = ref<any[]>([]);
const planActive = ref(0);
const num = ref(0);
const loading = ref(false);
const printVisible = ref(false);
const incomingPrintData = ref<any>({});
const visible = ref(false);
const left = ref(0);
const top = ref(0);
const showModel = ref('list');
const orderId = ref('');
const voucherState = ref(0);
const editMask = ref(false);
const formLayout = ref('horizontal');
const orderHeaderData = ref<any>({});
const orderFooterData = ref<any>({});
const basePostData = ref<any>({});
const voucherTitle = ref('生产订单');
const showDownPlan = ref(false);
const iconDirection = ref(true);
const columns = ref<any[]>([]);
const slotArray = ref<string[]>([]);
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<any>({});

// 状态管理
const store = useStore();
const { proxy } = getCurrentInstance() as any;

// 方法定义
const close = (value: boolean) => {
  visibleSplit.value = value;
};

const splitSubmit = async (list: any[]) => {
  const data = formatDataSource(list);
  try {
    const res = await setSplit(data);
    if (res.success) {
      proxy.$message.success('拆分成功');
      visibleSplit.value = false;
      getIdByData();
    } else {
      proxy.$message.error(res.message || '拆分失败');
    }
  } catch (error) {
    proxy.$message.error('拆分操作异常');
    console.error('splitSubmit error:', error);
  }
};

const formatDataSource = (list: any[]) => {
  // 实现数据格式化逻辑
  return list.map(item => ({
    ...item,
    // 根据需要添加格式化字段
  }));
};

const newForecast = () => {
  // 新增预测订单逻辑
  showModel.value = 'order';
  orderHeaderData.value = {};
  orderFooterData.value = {};
  dataSource.value = [];
};

const generateBills = async (type: string, index: number, arr: any[]) => {
  // 生单逻辑
  loading.value = true;
  try {
    // 实现生单API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('生单失败');
    console.error('generateBills error:', error);
  }
};

const merge = () => {
  // 合并订单逻辑
  if (selectedRowKeys.value.length < 2) {
    proxy.$message.warning('请选择至少两条记录进行合并');
    return;
  }
  // 实现合并逻辑
};

const split = () => {
  // 拆分订单逻辑
  if (selectedRowKeys.value.length !== 1) {
    proxy.$message.warning('请选择一条记录进行拆分');
    return;
  }
  const selectedData = dataSource.value.find((_, index) => selectedRowKeys.value.includes(index));
  if (selectedData) {
    splitData.value = selectedData;
    visibleSplit.value = true;
  }
};

const onUserSearchChange = (index: number) => {
  planActive.value = index;
  // 实现搜索切换逻辑
};

const showDownPlanFun = () => {
  iconDirection.value = !iconDirection.value;
};

const onSelectChange = (selectedRowKeys: number[]) => {
  selectedRowKeys.value = selectedRowKeys;
};

const onTableChange = (pagination: any, filters: any, sorter: any) => {
  // 表格变化处理
};

const customClick = (record: any, index: number) => {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault();
      visible.value = true;
      left.value = e.clientX;
      top.value = e.clientY;
    },
  };
};

const choiceAddData = (index: number, col: string, event: any) => {
  // 选择添加数据逻辑
};

const onCellChange = (index: number, col: string, event: any) => {
  // 单元格变化处理
  if (dataSource.value[index]) {
    dataSource.value[index][col] = event;
    dataSource.value = [...dataSource.value];
  }
};

const handleAdd = () => {
  // 新增行逻辑
  dataSource.value.push({});
  dataSource.value = [...dataSource.value];
};

const handleDelete = () => {
  // 删除行逻辑
  if (selectedRowKeys.value.length === 0) {
    proxy.$message.warning('请选择要删除的行');
    return;
  }
  dataSource.value = dataSource.value.filter((_, index) => !selectedRowKeys.value.includes(index));
  selectedRowKeys.value = [];
  visible.value = false;
};

const getIdByData = async () => {
  // 获取数据逻辑
  loading.value = true;
  try {
    // 实现获取数据API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('获取数据失败');
    console.error('getIdByData error:', error);
  }
};

const searchClick = () => {
  // 搜索逻辑
};

const printOrder = () => {
  // 打印订单逻辑
  printVisible.value = true;
};

const switchList = (model: string) => {
  showModel.value = model;
};

const submitServer = async () => {
  // 提交服务器逻辑
  loading.value = true;
  try {
    // 实现提交API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('提交失败');
    console.error('submitServer error:', error);
  }
};

const clickEdit = () => {
  // 编辑逻辑
  editMask.value = false;
};

const deleteOrder = async () => {
  // 删除订单逻辑
  loading.value = true;
  try {
    // 实现删除API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('删除失败');
    console.error('deleteOrder error:', error);
  }
};

const auditClick = async () => {
  // 审核逻辑
  loading.value = true;
  try {
    // 实现审核API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('审核失败');
    console.error('auditClick error:', error);
  }
};

const turnThePage = () => {
  // 翻页逻辑
};

const syncOrder = async () => {
  // 同步订单逻辑
  loading.value = true;
  try {
    // 实现同步API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('同步失败');
    console.error('syncOrder error:', error);
  }
};

const submitOrder = async () => {
  // 提交订单逻辑
  loading.value = true;
  try {
    // 实现提交订单API调用
    loading.value = false;
  } catch (error) {
    loading.value = false;
    proxy.$message.error('提交订单失败');
    console.error('submitOrder error:', error);
  }
};

const exportDetail = () => {
  // 导出明细逻辑
};

const onChangeTime = (time: any) => {
  // 时间变化处理
};

const setValue = (value: any) => {
  // 设置值逻辑
};

const cancelPrint = () => {
  printVisible.value = false;
};

const editClickOrder = (order: any) => {
  // 编辑订单逻辑
};

// 生命周期钩子
onMounted(() => {
  if (n.value === 1) {
    const mrpBackData = store.state.order.mrpBackData || [];
    dataSource.value = mrpBackData;
    if (mrpBackData.length > 0) {
      onUserSearchChange(0);
      // 调用newForecasts方法（假设这是一个笔误，原代码中应该是newForecast）
      newForecast();
    } else {
      getIdByData();
    }
  }
});

onActivated(() => {
  if (n.value === 1) {
    const mrpBackData = store.state.order.mrpBackData || [];
    dataSource.value = mrpBackData;
    if (mrpBackData.length > 0) {
      onUserSearchChange(0);
      newForecast();
    } else {
      getIdByData();
    }
  }
});
</script>

<style lang="less" scoped>
.content-wrapper {
  padding: 16px;
  background-color: #fff;
}

.btn-wrapper {
  margin-bottom: 16px;
}

.btns {
  display: inline-block;
  margin-right: 8px;
}

.btns-icon {
  margin-right: 4px;
}

.btns-text {
  display: inline-block;
  vertical-align: middle;
}

.documents-wrapper {
  margin-top: 16px;
}

.table-box {
  margin-top: 16px;
  overflow: hidden;
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.audit-status[v-show="voucherState === 0"] {
  background-color: #ffecb3;
  color: #ff9800;
}

.audit-status[v-show="voucherState === 1"] {
  background-color: #e8f5e9;
  color: #4caf50;
}

.audit-status[v-show="voucherState === 10"] {
  background-color: #e0e0e0;
  color: #757575;
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
}

.contextmenu {
  position: absolute;
  z-index: 100;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.contextmenu li {
  padding: 6px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background-color: #f5f5f5;
}

.color-gray {
  color: #999;
  cursor: not-allowed;
}

.btns-disable {
  pointer-events: none;
  opacity: 0.5;
}
</style>