<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
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
            <a-dropdown class="btns" key="new" style="display:block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">
                  新增
                  <a-icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
                </div>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="0">
                  <a href="javascript:void(0)" @click="choiceBillsFromPuArrival">选到货通知单</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </BtnsWrapper>
      </div>
      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>
        <section v-show="showModel === 'list'">
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            :dataSourceCode="dataSourceCode"
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
          <a-form-model :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                :businessType="businessType"
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
                @downSelectChange="downSelectChange"
              />
              <div class="edit-mask-header" v-show="editMask"></div>
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
                :size="'small'"
                bordered
              >
                <template v-if="isRouterAlive" #number="{ text, record, index }">{{ index === dataSource.length - 1 ? '合计' : index + 1 }}</template>
                <template v-for="col in slotArray" :slot="col" slot-scope="{ text, record, index }">
                  <div data-key="">
                    <EditableCell
                      v-if="isRouterAlive"
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
              <div class="edit-mask" v-show="editMask"></div>
            </div>
            <div class="footer-box">
              <OrderDynamicForm
                :FormData="orderFooterData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-footer" v-show="editMask"></div>
            </div>
          </a-form-model>
        </section>
        <section v-show="showModel === 'detail'">
          <!--明细-->
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>
        <section v-show="showModel === 'statistical'">
          <!--统计-->
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
          <li @click="handleAdd">新增行</li>
          <li @click="handleDelete">删除行</li>
        </ul>
      </div>
      <DrawerBox
        ref="searchList"
        :unitData="unitData"
        :unitsData="unitsData"
        :unitsDataDetails="unitsDataDetails"
        @editClickOrder="editClickOrder"
        :businessType="businessType"
      />
    </div>

    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>

    <PrintModal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint" />

    <!--分单-->
    <PurchaseInModal ref="purchaseInRef" :propsData="propsData" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { save, examine, remove, getCode, submitOrder } from '@/api/purchase/purchaseArrival';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { BillType, BasePostDataType, VoucherStateType } from '@/types/procurement';

// 导入组件
import BtnsWrapper from '@/components/procurement/BtnsWrapper.vue';
import DynamicList from '@/components/procurement/DynamicList.vue';
import DynamicListDetails from '@/components/procurement/DynamicListDetails.vue';
import OrderDynamicForm from '@/components/procurement/OrderDynamicForm.vue';
import EditableCell from '@/components/procurement/EditableCell.vue';
import DrawerBox from '@/components/procurement/DrawerBox.vue';
import PrintModal from '@/components/procurement/PrintModal.vue';
import PurchaseInModal from '@/components/SeparateBill/purchaseInModal.vue';

// 导入mixin
import { useProcurementPro } from '@/mixins/procurement/pro';

// 使用mixin
const {
  showModel,
  orderId,
  voucherState,
  editMask,
  voucherTitle,
  formLayout,
  orderHeaderData,
  orderFooterData,
  columns,
  dataSource,
  slotArray,
  isRouterAlive,
  checkType,
  unitsDataDetails,
  unitsAssistSelect,
  dynamicFormData,
  dynamicFormDataMap,
  loading,
  printVisible,
  incomingPrintData,
  visible,
  left,
  top,
  unitData,
  unitsData,
  isSaveRun,
  sourceVoucherData,
  receiptNumber,
  thisPageData,
  isDetailCrmId,

  // 方法
  searchClick,
  printOrder,
  switchList,
  submitServer,
  clickEdit,
  deleteOrder,
  getIdByData,
  auditClick,
  turnThePage,
  syncOrder,
  onChangeTime,
  setValue,
  onTableChange,
  customClick,
  choiceAddData,
  onCellChange,
  handleAdd,
  handleDelete,
  cancelPrint,
  editClickOrder,
  reload
} = useProcurementPro();

// 组件特有数据
const basePostData = reactive<BasePostDataType>({
  dataSource: 'PuArrival',
  someBusinessType: '97',
});

const sourceCode = 'PuArrival';
const reportCodeDetail = 'PuArrival_Detail_Report';
const reportCodeStatistical = 'PuArrival_Statistic_Report';
const reportCodeList = 'PuArrival_List_Report';
const dataSourceCode = 'PuArrival';
const businessType = 1; // 退货业务

const propsData = reactive<{ title: string; businessType: number }>({
  title: '采购退货入库',
  businessType: 1,
});

// 方法实现
const newForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {};
  initForm(1);
};

const submit = (requestData: any) => {
  isSaveRun.value = false;
  save(requestData)
    .then((response: any) => {
      if (response.code === 200) {
        message.success('保存成功');
        editMask.value = true;
        isSaveRun.value = true;
        if (!orderId.value) {
          getIdByData();
        }
      } else {
        message.error(response.message);
        isSaveRun.value = true;
      }
    })
    .catch(() => {
      isSaveRun.value = true;
    });
};

const submitOrderAction = (type: number) => {
  const data = {
    id: orderId.value,
    status: type, // 状态 -1:撤回提交,0:提交
  };

  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === -1 && type === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  submitOrder(data)
    .then((res: any) => {
      if (res.code === 200) {
        if (type === 0) {
          message.success('提交成功');
        } else {
          message.success('撤回提交成功');
        }
        getIdByData();
      }
    });
};

const auditClickAction = (type: number) => {
  const requestData = {
    id: orderId.value,
    status: type,
  };

  examine(requestData)
    .then((response: any) => {
      if (response.code === 200) {
        if (type === 1) {
          message.success('审核成功');
          getIdByData();
        }
        if (type === 0) {
          message.success('弃审成功');
          getIdByData();
        }
      }
    });
};

const removeAction = (postData: any) => {
  remove(postData)
    .then((response: any) => {
      if (response.code === 200) {
        message.success('删除成功');
        orderId.value = '';
        getIdByData();
      } else {
        message.error(response.message);
      }
    });
};

const getCodeAction = () => {
  getCode()
    .then((res: any) => {
      if (res.code === 200) {
        receiptNumber.value = res.message;
        for (let i = 0; i < orderHeaderData.value.length; i++) {
          if (orderHeaderData.value[i].code === 'voucherCode') {
            orderHeaderData.value[i].onEdit = false;
            orderHeaderData.value[i].value = receiptNumber.value;
          }
        }
      }
    });
};

const downSelectChange = (value: any) => {
  console.log('业务类型:', value);
  console.log('当前数据', dataSource.value);
  // 业务类型变更逻辑
  reload();
};

const choiceBillsFromPuArrival = () => {
  const postData = {
    sourceCode: 'PuArrival',
    title: '选到货单',
    dataSource: 'PuArrival',
    businessType: 1, // 1:退货业务 2：非退货业务 3: 退货 + 非退货 4: 发票
    someBusinessType: '0',
    startVoucherState: 0,
    endVoucherState: 10,
  };

  // @ts-ignore
  proxy.$refs.searchList.onOpenBox(postData);
};

// 初始化表单
const initForm = (type: number) => {
  // 表单初始化逻辑
  getCodeAction();
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';
</style>