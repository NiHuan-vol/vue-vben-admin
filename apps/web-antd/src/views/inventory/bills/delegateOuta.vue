<!--
 * @Descripttion: 库存管理->委外产品出库单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-04-25 12:11:56
 * @LastEditors: GW
 * @LastEditTime: 2022-01-03 14:13:54
-->

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
          :createUserId="createUserId"
          :isSource="isSource"
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
          @theGoods="theGoods"
        >
          <template slot="neworder">
            <a-dropdown class="btns" key="new" style="display:block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增
                  <a-icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
                </div>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="0">
                  <a href="javascript:void(0)" @click="newForecast">新增</a>
                </a-menu-item>
                <a-menu-item key="1">
                  <a href="javascript:void(0)" @click="choiceDelegateInOrder">选委外入库单</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </BtnsWrapper>
      </div>
      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{voucherTitle}}</h3>
        <section v-show="showModel=='list'">
          <!--列表-->
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            @switchList="switchList"
            @dblclick="getIdByData"
            :reportCode="reportCodeList"
          />
        </section>
        <section v-show="showModel=='order'">
          <div>
            <span class="audit-status" v-show="voucherState==0">待审核</span>
            <span class="audit-status" v-show="(voucherState==1 || voucherState==10) && !isSource">{{voucherState==1?'已审核':'关闭'}}</span>
            <span class="audit-status" v-show="(voucherState==1 || voucherState==10) && isSource">{{voucherState==1?'已审核':'关闭'}}</span>
            <span class="audit-status" v-show="voucherState==2">{{voucherState==2?'已出库':''}}</span>
          </div>
          <AFormModel :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm :FormData="orderHeaderData" @changetime="onChangeTime" @clickItem="setValue" />
              <div class="edit-mask-header" v-show="editMask"><!-- 遮罩 --></div>
            </div>
            <div class="table-box">
              <BasicTable
                id="bills_tb"
                :columns="columns"
                :data-source="dataSource"
                :customRow="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                :size="small"
                bordered
              >
                <template v-if="isRouterAlive" slot="number" slot-scope="text, record, index">
                  <div v-if="index == dataSource.length-1">合计</div>
                  <div v-else>{{index+1}}</div>
                </template>
                <template v-for="col in slotArray" :slot="col" slot-scope="text, record,index">
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
                      @choiceAddData="choiceAddData(index,col,$event)"
                      @change="onCellChange(index, col, $event)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </BasicTable>
              <div class="edit-mask" v-show="editMask"><!-- 遮罩 --></div>
            </div>
            <div class="footer-box">
              <OrderDynamicForm :FormData="orderFooterData" @changetime="onChangeTime" @clickItem="setValue" />
              <div class="edit-mask-footer" v-show="editMask"><!-- 遮罩 --></div>
            </div>
          </AFormModel>
        </section>
        <section v-show="showModel=='detail'">
          <!--明细-->
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>
        <section v-show="showModel=='statistical'">
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
        <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
          <li @click="handleAdd()">新增行</li>
          <li @click="handleDelete()">删除行</li>
        </ul>
      </div>
      <DrawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder" />
    </div>

    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>
    <PrintModal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { saveDelegateOuta, getDelegateOutaDetail, deleteDelegateOuta, auditDelegateOuta, submitDelegateOutaOrder, getDelegateOutaCode, confirmDelegateOuta, exportDelegateOuta } from '/@/api/inventory/bills';
import { BasicTable, TableColumn } from '/@/components/Table';
import { BtnsWrapper, DynamicList, DynamicListDetails, OrderDynamicForm, EditableCell, DrawerBox, PrintModal } from '/@/components/Inventory';
import { useMessage } from '/@/hooks/web/useMessage';
import { useConfirm } from '/@/hooks/web/useConfirm';

// 导入mixin
const proMixin = {
  methods: {
    // 这里可以放置公共方法
  }
};

export default defineComponent({
  mixins: [proMixin],
  components: {
    BtnsWrapper,
    DynamicList,
    DynamicListDetails,
    OrderDynamicForm,
    EditableCell,
    DrawerBox,
    PrintModal,
    BasicTable,
  },
  setup() {
    const message = useMessage();
    const confirm = useConfirm();
    const isRouterAlive = ref(true);

    // 基础状态
    const state = reactive({
      // 基础查询条件
      basePostData: {
        someBusinessType: 95,
        isMyWarehouse: true,
      },
      // 选单查询条件
      choiceBillPostData: {
        sourceCode: 'DelegateReceiveVoucher',
        title: '选委外入库单',
        businessType: 1,
        someBusinessType: '0',
        startVoucherState: 1,
        endVoucherState: 10,
      },
      sourceCode: 'DelegateReceiveVoucher',
      reportCodeDetail: 'DelegateReceiveVoucher_Detail_Report',
      reportCodeStatistical: 'DelegateReceiveVoucher_Statistic_Report',
      reportCodeList: 'DelegateReceiveVoucher_List_Report',
      receiveDeliverType: 2, // 1入，2出
      checkType: 'is_made_request', // 委外

      // 其他状态
      showModel: 'list',
      editMask: false,
      loading: false,
      voucherState: 0,
      orderId: '',
      createUserId: '',
      voucherTitle: '委外产品出库单',
      receiptNumber: '',
      isSource: false,
      sourceVoucherData: {},
      isSaveRun: false,
      formLayout: 'horizontal',
      visible: false,
      left: 0,
      top: 0,
      printVisible: false,
      incomingPrintData: {},
      stylePrint: '',

      // 表格数据
      columns: [] as TableColumn[],
      dataSource: [],
      slotArray: [],
      orderHeaderData: [],
      orderFooterData: [],
      unitsDataDetails: [],
      unitsAssistSelect: [],
      dynamicFormData: [],
      dynamicFormDataMap: {},
      unitData: [],
      unitsData: [],
    });

    // 初始化表单
    const initForm = (type: number) => {
      // 实现初始化表单逻辑
      state.orderHeaderData = [];
      state.orderFooterData = [];
      state.dataSource = [];
      state.slotArray = [];

      // 获取单据编号
      if (type === 1) {
        getCode();
      }
    };

    // 新增
    const newForecast = () => {
      state.showModel = 'order';
      state.editMask = false;
      state.loading = false;
      state.voucherState = -1;
      state.sourceVoucherData = {};
      initForm(1);
      state.isSource = false;
    };

    // 保存
    const submit = (requestData: any) => {
      requestData.businessType = 95;
      state.isSaveRun = false;

      saveDelegateOuta(requestData)
        .then(response => {
          if (response.code === 200) {
            message.success('保存成功');
            state.editMask = true;
            state.isSaveRun = true;
            if (!state.orderId) {
              getIdByData();
            }
          } else {
            message.error(response.message);
            state.isSaveRun = true;
          }
        })
        .catch(() => {
          state.isSaveRun = true;
        });
    };

    // 单据提交
    const submitOrder = (type: number) => {
      const data = {
        id: state.orderId,
        status: type, // 状态 -1:撤回提交,0:提交
      };

      if (!state.orderId) {
        message.warning('该单据未保存不需要提交');
        return;
      }

      if (state.voucherState === -1 && type === -1) {
        message.warning('该单据未提交无需撤回提交');
        return;
      }

      submitDelegateOutaOrder(data)
        .then(res => {
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

    // 审核
    const auditClick = (type: number) => {
      const requestData = {
        id: state.orderId,
        status: type,
      };

      auditDelegateOuta(requestData)
        .then(response => {
          if (response.code === 200) {
            if (type === 1) {
              message.success('审核成功');
              getIdByData();
            }
            if (type === 0) {
              if (state.isSource) {
                message.success('退单成功');
              } else {
                message.success('弃审成功');
              }
              getIdByData();
            }
          }
        });
    };

    // 删除
    const remove = (postData: any) => {
      deleteDelegateOuta(postData)
        .then(response => {
          if (response.code === 200) {
            message.success('删除成功');
            state.orderId = '';
            state.voucherState = 0;
            getIdByData();
          } else {
            message.error(response.message);
          }
        });
    };

    // 获取单据编号
    const getCode = () => {
      const data = {
        sourceCode: state.sourceCode,
      };

      getDelegateOutaCode(data)
        .then(res => {
          if (res.code === 200) {
            state.receiptNumber = res.message;
            for (let i = 0; i < state.orderHeaderData.length; i++) {
              if (state.orderHeaderData[i].code === 'voucherCode') {
                state.orderHeaderData[i].onEdit = false;
                state.orderHeaderData[i].value = state.receiptNumber;
              }
            }
          }
        });
    };

    // 出库
    const theGoods_delete = () => {
      confirm({
        title: '提示',
        content: (
          <span style="color:red">出库后，此单据不能做任何修改，是否确认出库？</span>
        ),
        onOk: () => {
          const requestData = {
            id: state.orderId,
          };

          confirmDelegateOuta(requestData)
            .then(response => {
              if (response.code === 200) {
                message.success('出库成功');
                getIdByData();
              }
            });
        },
      });
    };

    // 选委外入库单
    const choiceDelegateInOrder = () => {
      state.$refs.searchList.onOpenBox(state.choiceBillPostData);
    };

    // 获取数据
    const getIdByData = () => {
      // 实现获取数据逻辑
    };

    // 日期格式化函数
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    // 其他方法...
    const searchClick = () => {};
    const switchList = () => {};
    const submitServer = () => {};
    const clickEdit = () => {};
    const deleteOrder = () => {};
    const turnThePage = () => {};
    const syncOrder = () => {};
    const exportDetail = () => {
      if (!state.orderId) {
        message.warning('请先选择要导出的单据');
        return;
      }

      // 获取仓库ID
      let warehouseId = '';
      for (let i = 0; i < state.orderHeaderData.length; i++) {
        if (state.orderHeaderData[i].code === 'warehouseId') {
          warehouseId = state.orderHeaderData[i].value;
          break;
        }
      }

      if (!warehouseId) {
        message.warning('请选择仓库');
        return;
      }

      state.loading = true;

      // 获取日期
      let date = '';
      for (let i = 0; i < state.orderHeaderData.length; i++) {
        if (state.orderHeaderData[i].code === 'voucherDate') {
          date = state.orderHeaderData[i].value;
          break;
        }
      }

      exportDelegateOuta({
        id: state.orderId,
        warehouseId: warehouseId,
        date: date
      })
        .then((response) => {
          state.loading = false;
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // 格式化文件名，使用当前日期
          const currentDate = formatDate(new Date());
          a.download = `委外产品出库单_${state.receiptNumber || state.orderId}_${currentDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          message.success('导出成功');
        })
        .catch((error) => {
          state.loading = false;
          message.error('导出失败: ' + (error.message || '未知错误'));
        });
    };
    const theGoods = () => {};
    const printOrder = () => {};
    const onChangeTime = () => {};
    const setValue = () => {};
    const onTableChange = () => {};
    const customClick = () => {};
    const choiceAddData = () => {};
    const onCellChange = () => {};
    const handleAdd = () => {};
    const handleDelete = () => {};
    const editClickOrder = () => {};
    const cancelPrint = () => {};

    onMounted(() => {
      // 初始化逻辑
    });

    onUnmounted(() => {
      state.isRouterAlive = false;
    });

    return {
      ...state,
      newForecast,
      submit,
      submitOrder,
      auditClick,
      remove,
      getCode,
      theGoods_delete,
      choiceDelegateInOrder,
      getIdByData,
      searchClick,
      switchList,
      submitServer,
      clickEdit,
      deleteOrder,
      turnThePage,
      syncOrder,
      exportDetail,
      theGoods,
      printOrder,
      onChangeTime,
      setValue,
      onTableChange,
      customClick,
      choiceAddData,
      onCellChange,
      handleAdd,
      handleDelete,
      editClickOrder,
      cancelPrint,
    };
  },
});
</script>
<style lang="less">
@import '~@/style/purchase/voucher.less';

// 审核状态样式
.audit-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 12px;
}

// 待审核
.audit-status[v-show="voucherState==0"] {
  background-color: #ffecb3;
  color: #ff9800;
}

// 已审核
.audit-status[v-show="(voucherState==1 || voucherState==10) && !isSource"],
.audit-status[v-show="(voucherState==1 || voucherState==10) && isSource"] {
  background-color: #e8f5e9;
  color: #4caf50;
}

// 已出库
.audit-status[v-show="voucherState==2"] {
  background-color: #e3f2fd;
  color: #2196f3;
}
</style>