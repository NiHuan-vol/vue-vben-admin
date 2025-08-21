<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper" style="display:block">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <BtnsWrapper
          @searchClick="handleSearch"
          :showModel="showModel"
          :orderId="orderId"
          :voucherState="voucherState"
          :editMask="editMask"
          @printOrder="handlePrint"
          @switchList="switchList"
          @submitServer="handleSubmitServer"
          @clickEdit="handleEdit"
          @deleteOrder="handleDelete"
          @getIdByData="getIdByData"
          @auditClick="handleAudit"
          @turnThePage="turnThePage"
          @syncOrder="syncOrder"
          @submitOrder="handleSubmitOrder"
          @exportDetail="exportDetail"
          :sourceCode="sourceCode"
        >
          <template #neworder>
            <a-dropdown class="btns" key="new" style="display:block">
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">新增
                  <Icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
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
            <a-dropdown class="btns" key="sheng" style="display:block">
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                <Icon class="btns-icon" icon="snippets" />
                <div class="btns-text">生单
                  <Icon type="down" />
                </div>
              </a>
              <a-menu v-if="voucherState === 1" slot="overlay">
                <a-menu-item key="0">
                  <a href="javascript:void(0)" @click="() => generateBills('ProductReceiveVoucher')">生成生产入库单</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </BtnsWrapper>
      </div>

      <div ref="printRef" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>

        <section v-show="showModel === 'list'">
          <!-- 列表 -->
          <DynamicList
            ref="dyListRef"
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
                @changetime="handleChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"><!-- 遮罩（点击修改关闭遮罩） --></div>
            </div>

            <div class="table-box">
              <a-table
                id="bills_tb"
                :columns="columns"
                :data-source="dataSource"
                :customRow="customClick"
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
                <template v-for="col in slotArray" :key="col" :slot="col" slot-scope="{ text, record, index }">
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
              <div class="edit-mask" v-show="editMask"><!-- 遮罩（点击修改关闭遮罩） --></div>
            </div>

            <div class="footer-box">
              <OrderDynamicForm
                :FormData="orderFooterData"
                @changetime="handleChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-footer" v-show="editMask"><!-- 遮罩（点击修改关闭遮罩） --></div>
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
        <ul
          v-show="visible"
          :style="{ left: left + 'px', top: top + 'px' }"
          class="contextmenu"
        >
          <li @click="handleAdd">新增行</li>
          <li @click="handleDelete">删除行</li>
        </ul>
      </div>

      <DrawerBox
        ref="searchListRef"
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

    <PrintModal
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />

    <!-- 分单 -->
    <ProductionInModal ref="productionInRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { save, examine, remove, getCode, submitOrder } from '@/api/production/finish';
import { useMessage } from 'naive-ui';
import { useRoute } from 'vue-router';

// 导入组件
import BtnsWrapper from '@/components/BtnsWrapper.vue';
import DynamicList from '@/components/DynamicList.vue';
import OrderDynamicForm from '@/components/OrderDynamicForm.vue';
import EditableCell from '@/components/EditableCell.vue';
import DynamicListDetails from '@/components/DynamicListDetails.vue';
import DrawerBox from './drawerBox.vue';
import PrintModal from '@/components/PrintModal.vue';
import ProductionInModal from '@/components/SeparateBill/productionInModal.vue';
import { Icon } from '@ant-design/icons-vue';

// 导入mixins
import { proMixin } from '@/mixins/procurement/pro';

// 使用mixins
const { initForm, getIdByData, turnThePage, syncOrder, exportDetail } = proMixin();

// 响应式数据
const sourceCode = ref('ProductionFinish');
const reportCodeDetail = ref('ProductionFinish_Detail_Report');
const reportCodeStatistical = ref('ProductionFinish_Statistic_Report');
const reportCodeList = ref('ProductionFinish_List_Report');
const receiveDeliverType = ref(1); // 1入，2出
const isHideWherehouse = ref(false);
const checkType = ref('is_made_self'); // 自制

const orderId = ref('');
const voucherState = ref(-1);
const editMask = ref(true);
const showModel = ref('list');
const loading = ref(false);
const formLayout = ref('horizontal');
const isSaveRun = ref(true);
const receiptNumber = ref('');
const sourceVoucherData = reactive<Record<string, any>>({});
const orderHeaderData = reactive<any[]>([]);
const orderFooterData = reactive<any[]>([]);
const dataSource = reactive<any[]>([]);
const columns = reactive<any[]>([]);
const slotArray = reactive<string[]>([]);
const unitsDataDetails = reactive<Record<string, any>>({});
const unitsAssistSelect = reactive<Record<string, any>>({});
const dynamicFormData = reactive<Record<string, any>>({});
const dynamicFormDataMap = reactive<Record<string, any>>({});
const basePostData = reactive<Record<string, any>>({});
const visible = ref(false);
const left = ref(0);
const top = ref(0);
const printVisible = ref(false);
const incomingPrintData = reactive<Record<string, any>>({});
const voucherTitle = ref('生产完工单');

// 引用
const printRef = ref<HTMLElement | null>(null);
const dyListRef = ref<any>(null);
const detailSearchRef = ref<any>(null);
const statisticalSearchRef = ref<any>(null);
const searchListRef = ref<any>(null);
const productionInRef = ref<any>(null);

// 工具函数
const message = useMessage();
const route = useRoute();

// 生命周期
onMounted(() => {
  // 初始化表单
  // initForm(1);
});

// 方法
const newForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {}; // 清空来源数据
  initForm(1);
};

const handleSubmit = async (requestData: Record<string, any>) => {
  if (!isSaveRun.value) return;
  isSaveRun.value = false;
  loading.value = true;

  try {
    const response = await save(requestData);
    if (response.code === 200) {
      message.success('保存成功');
      editMask.value = true;
      isSaveRun.value = true;
      loading.value = false;

      if (!orderId.value) {
        getIdByData(); // 获取最新一条数据
      }
    } else {
      message.error(response.message);
      isSaveRun.value = true;
      loading.value = false;
    }
  } catch (error) {
    message.error('保存失败，请重试');
    isSaveRun.value = true;
    loading.value = false;
  }
};

const handleSubmitOrder = async (type: number) => {
  const data = {
    id: orderId.value,
    status: type, // 状态 -1:撤回提交,0:提交
  };

  console.log(orderId.value);

  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === -1 && type === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  try {
    const res = await submitOrder(data);
    if (res.code === 200) {
      if (type === 0) {
        message.success('提交成功');
      } else {
        message.success('撤回提交成功');
      }
      getIdByData();
    }
  } catch (error) {
    message.error('操作失败，请重试');
  }
};

const handleAudit = async (type: number) => {
  const requestData = {
    id: orderId.value,
    status: type,
  };

  try {
    const response = await examine(requestData);
    if (response.code === 200) {
      if (type === 1) {
        message.success('审核成功');
        getIdByData();
      }
      if (type === 0) {
        message.success('弃审成功');
        getIdByData();
      }
    } else {
      message.warning(response.message);
    }
  } catch (error) {
    message.error('操作失败，请重试');
  }
};

const handleDelete = async (postData: Record<string, any>) => {
  try {
    const response = await remove(postData);
    if (response.code === 200) {
      message.success('删除成功');
      orderId.value = '';
      voucherState.value = 0;
      getIdByData(); // 获取最新一条数据
    } else {
      message.error(response.message);
    }
  } catch (error) {
    message.error('删除失败，请重试');
  }
};

const getVoucherCode = async () => {
  try {
    const res = await getCode();
    if (res.code === 200) {
      console.log(res);
      receiptNumber.value = res.message;
      console.log(orderHeaderData);

      for (let i = 0; i < orderHeaderData.length; i++) {
        if (orderHeaderData[i].code === 'voucherCode') {
          orderHeaderData[i].onEdit = false;
          orderHeaderData[i].value = receiptNumber.value;
        }
      }
    } else {
      message.warning(res.message);
    }
  } catch (error) {
    message.error('获取单据编号失败');
  }
};

const generateBills = (type: string) => {
  // 生成单据的逻辑
  console.log('生成单据:', type);
  // 这里可以调用相应的API或显示模态框
};

const handleSearch = () => {
  // 搜索逻辑
};

const handlePrint = () => {
  // 打印逻辑
  printVisible.value = true;
  // 准备打印数据
  incomingPrintData.value = {
    // 打印数据
  };
};

const switchList = (mode: string) => {
  showModel.value = mode;
};

const handleSubmitServer = () => {
  // 提交服务器逻辑
};

const handleEdit = () => {
  editMask.value = false;
};

const handleChangeTime = (time: any) => {
  // 处理时间变更
};

const setValue = (value: any) => {
  // 设置值
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

const onTableChange = (pagination: any, filters: any, sorter: any) => {
  // 表格变化处理
};

const choiceAddData = (index: number, col: string, event: any) => {
  // 选择添加数据
};

const onCellChange = (index: number, col: string, event: any) => {
  // 单元格变化处理
};

const handleAdd = () => {
  // 添加行
};

const editClickOrder = (data: any) => {
  // 编辑订单
};

const cancelPrint = () => {
  printVisible.value = false;
};
</script>

<style lang="less" scoped>
@import '~@/styles/purchase/voucher.less';

.content-wrapper {
  padding: 16px;
  background-color: #fff;
}

.btn-wrapper {
  margin-bottom: 16px;
}

.documents-wrapper {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-box {
  margin: 16px 0;
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.audit-status:nth-child(1) {
  background-color: #ffc53d;
  color: #fff;
}

.audit-status:nth-child(2) {
  background-color: #52c41a;
  color: #fff;
}

.audit-status:nth-child(3) {
  background-color: #888;
  color: #fff;
}

.contextmenu {
  position: absolute;
  z-index: 1000;
  width: 120px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  list-style: none;
  margin: 0;
}

.contextmenu li {
  padding: 5px 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.contextmenu li:hover {
  background-color: #f5f5f5;
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>