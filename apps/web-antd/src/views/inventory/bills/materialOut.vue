<!--
 * @Descripttion: 库存管理->材料出库
 * @version: V1.0
 * @Author: System
 * @Date: 2023-11-01 00:00:00
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
          <template #neworder>
            <a-dropdown class="btns" key="new" style="display:block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
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
          <a-form-model :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"><!-- 遮罩（点击修改关闭遮罩） --></div>
            </div>
            <div class="table-box">
              <BasicTable
                id="bills_tb"
                :columns="columns"
                :dataSource="dataSource"
                :customRow="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                :size="'small'"
                bordered
              >
                <template v-if="isRouterAlive" #number="{ text, record, index }">
                  <div v-if="index == dataSource.length-1">合计</div>
                  <div v-else>{{index+1}}</div>
                </template>
                <template v-for="col in slotArray" :slot="col" slot-scope="{ text, record, index }">
                  <div data-key="">
                    <EditableCell
                      v-if="isRouterAlive"
                      :checkType="checkType"
                      :productCheckType="productCheckType"
                      :text="text"
                      :col="col"
                      :index="index"
                      :record="record"
                      :dataSource="dataSource"
                      :unitsDataDetails="unitsDataDetails"
                      :unitsAssistSelect="unitsAssistSelect"
                      :dynamicAllData="dynamicFormData"
                      :dynamicFormDataMap="dynamicFormDataMap"
                      @choiceAddData="choiceAddData(index, col, $event)"
                      @change="onCellChange(index, col, $event)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </BasicTable>
              <div class="edit-mask" v-show="editMask"><!-- 遮罩（点击修改关闭遮罩） --></div>
            </div>
            <div class="footer-box">
              <OrderDynamicForm
                :FormData="orderFooterData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-footer" v-show="editMask"><!-- 遮罩（点击修改关闭遮罩） --></div>
            </div>
          </a-form-model>
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
      <DrawerBox
        ref="searchList"
        :unitData="unitData"
        :unitsData="unitsData"
        :unitsDataDetails="unitsDataDetails"
        @editClickOrder="editClickOrder"
      />
    </div>

    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed, toRefs } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { saveMaterialOut, auditMaterialOut, deleteMaterialOut, getMaterialOutCode, confirmMaterialOut, submitMaterialOutOrder, getMaterialOutDetail, exportMaterialOut } from '/@/api/inventory/bills';
import { BasicTable, TableColumn } from '/@/components/Table';
import { BtnsWrapper } from '/@/components/BtnsWrapper';
import { DynamicList, DynamicListDetails } from '/@/components/DynamicList';
import { OrderDynamicForm } from '/@/components/OrderDynamicForm';
import { PrintModal } from '/@/components/PrintModal';
import { Icon } from '/@/components/Icon';
import { createMessage } from '/@/utils/message';
import EditableCell from '/@/components/EditableCell';
import DrawerBox from '/@/components/DrawerBox';
import pro from '/@/mixins/procurement/pro';

export default defineComponent({
  name: 'MaterialOut',
  mixins: [pro],
  components: {
    BasicTable,
    BtnsWrapper,
    DynamicList,
    DynamicListDetails,
    OrderDynamicForm,
    PrintModal,
    Icon,
    EditableCell,
    DrawerBox,
  },
  setup() {
    const state = reactive({
      //基础 查询条件（列表 + 翻页）
      basePostData: {
        someBusinessType: '0',
        isMyWarehouse: true,
      },
      sourceCode: 'MaterialDispatchVoucher',
      reportCodeDetail: 'MaterialDispatchVoucher_Detail_Report',          //明细code
      reportCodeStatistical: 'MaterialDispatchVoucher_Statistic_Report',   //统计code
      reportCodeList: 'MaterialDispatchVoucher_List_Report',              //列表code
      receiveDeliverType: 2, //1入，2出

      //隐藏明细当中的仓库和仓库编码
      isHideWherehouse: true,
      checkType: 'is_material', //生产耗用
      productCheckType: 'is_made_self',     //产品属性：自制
      voucherTitle: '材料出库单',
      showModel: 'list',
      orderId: '',
      voucherState: 0,
      editMask: true,
      createUserId: '',
      loading: false,
      isSource: false,
      sourceVoucherData: {},
      isSaveRun: false,
      receiptNumber: '',
      orderHeaderData: [],
      orderFooterData: [],
      columns: [] as TableColumn[],
      dataSource: [],
      isRouterAlive: true,
      slotArray: [],
      visible: false,
      left: 0,
      top: 0,
      printVisible: false,
      incomingPrintData: {},
      formLayout: 'horizontal',
      unitData: [],
      unitsData: [],
      unitsDataDetails: [],
      dynamicFormData: [],
      dynamicFormDataMap: new Map(),
    });

    // 新增
    const newForecast = () => {
      state.showModel = 'order';
      state.editMask = false;
      state.loading = false;
      state.voucherState = -1;
      state.sourceVoucherData = {}; //清空来源数据
      initForm(1);
      state.isSource = false;
    };

    // 初始化表单
    const initForm = (type: number) => {
      // 这里应该实现表单初始化逻辑
      // 实际项目中，可能需要调用API获取表单结构
      state.orderHeaderData = [];
      state.orderFooterData = [];
      state.columns = [];
      state.dataSource = [];
      state.slotArray = [];

      // 如果是新增，获取单据编号
      if (type === 1) {
        getCode();
      }
    };

    // 保存
    const submit = (requestData: any) => {
      requestData.businessType = 0;
      state.loading = true;
      state.isSaveRun = false;

      saveMaterialOut(requestData)
        .then(response => {
          state.loading = false;
          if (response.code === 200) {
            createMessage.success('保存成功');
            state.editMask = true;
            state.isSaveRun = true;
            if (!state.orderId) {
              getIdByData(); //获取最新一条数据
            }
          } else {
            createMessage.error(response.message);
            state.isSaveRun = true;
          }
        })
        .catch((e) => {
          state.loading = false;
          state.isSaveRun = true;
          createMessage.error('保存失败');
        });
    };

    // 单据提交
    const submitOrder = (type: number) => {
      const data = {
        id: state.orderId,
        status: type, //状态 -1:撤回提交,0:提交
      };

      if (!state.orderId) {
        createMessage.warning('该单据未保存不需要提交');
        return;
      }

      if (state.voucherState === -1 && type === -1) {
        createMessage.warning('该单据未提交无需撤回提交');
        return;
      }

      state.loading = true;
      submitMaterialOutOrder(data)
        .then(res => {
          state.loading = false;
          if (res.code === 200) {
            if (type === 0) {
              createMessage.success('提交成功');
            } else {
              createMessage.success('撤回提交成功');
            }
            getIdByData();
          } else {
            createMessage.error(res.message);
          }
        })
        .catch((e) => {
          state.loading = false;
          createMessage.error('操作失败');
        });
    };

    // 审核
    const auditClick = (type: number) => {
      const requestData = {
        id: state.orderId,
        status: type,
      };

      state.loading = true;
      auditMaterialOut(requestData)
        .then((response) => {
          state.loading = false;
          if (response.code === 200) {
            if (type === 1) {
              createMessage.success('审核成功');
              getIdByData();
            }
            if (type === 0) {
              if (state.isSource) {
                createMessage.success('退单成功');
              } else {
                createMessage.success('弃审成功');
              }
              getIdByData();
            }
          } else {
            createMessage.error(response.message);
          }
        })
        .catch((e) => {
          state.loading = false;
          createMessage.error('操作失败');
        });
    };

    // 删除
    const remove = (postData: any) => {
      state.loading = true;
      deleteMaterialOut(postData)
        .then(response => {
          state.loading = false;
          if (response.code === 200) {
            createMessage.success('删除成功');
            state.orderId = '';
            state.voucherState = 0;
            getIdByData(); //获取最新一条数据
          } else {
            createMessage.error(response.message);
          }
        })
        .catch((e) => {
          state.loading = false;
          createMessage.error('删除失败');
        });
    };

    // 获取单据编号
    const getCode = () => {
      const data = {
        sourceCode: state.sourceCode,
      };

      getMaterialOutCode(data)
        .then((res) => {
          if (res.code === 200) {
            state.receiptNumber = res.message;
            for (let i = 0; i < state.orderHeaderData.length; i++) {
              if (state.orderHeaderData[i].code === 'voucherCode') {
                state.orderHeaderData[i].onEdit = false;
                state.orderHeaderData[i].value = state.receiptNumber;
              }
            }
          } else {
            createMessage.warning(res.message);
          }
        })
        .catch((e) => {
          createMessage.error('获取单据编号失败');
        });
    };

    // 获取数据
    const getIdByData = () => {
      state.loading = true;
      // 如果有orderId，获取详情，否则获取列表第一条数据
      if (state.orderId) {
        getMaterialOutDetail(state.orderId)
          .then((response) => {
            state.loading = false;
            if (response.code === 200) {
              const data = response.data;
              state.orderHeaderData = data.header || [];
              state.orderFooterData = data.footer || [];
              state.dataSource = data.details || [];
              state.voucherState = data.status || 0;
              // 设置其他必要数据
            } else {
              createMessage.error(response.message);
            }
          })
          .catch((e) => {
            state.loading = false;
            createMessage.error('获取详情失败');
          });
      } else {
        // 获取列表第一条数据
        // 这里应该调用获取列表的API
        state.loading = false;
        createMessage.warning('请先选择一条数据');
      }
    };

    // 日期格式化函数
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    // 其他必要的方法
    const searchClick = () => { /* 实现搜索逻辑 */ };
    const switchList = () => { /* 实现列表切换逻辑 */ };
    const printOrder = () => { /* 实现打印逻辑 */ };
    const submitServer = () => { /* 实现提交服务器逻辑 */ };
    const clickEdit = () => { /* 实现编辑逻辑 */ };
    const deleteOrder = () => { /* 实现删除订单逻辑 */ };
    const turnThePage = () => { /* 实现翻页逻辑 */ };
    const syncOrder = () => { /* 实现同步订单逻辑 */ };
    const exportDetail = () => {
      if (!state.orderId) {
        createMessage.warning('请先选择要导出的单据');
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
        createMessage.warning('请选择仓库');
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

      exportMaterialOut({
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
          a.download = `材料出库单_${state.receiptNumber || state.orderId}_${currentDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          createMessage.success('导出成功');
        })
        .catch((error) => {
          state.loading = false;
          createMessage.error('导出失败: ' + (error.message || '未知错误'));
        });
    };
    const theGoods = () => { /* 实现出库逻辑 */ };
    const onChangeTime = () => { /* 实现时间变更逻辑 */ };
    const setValue = () => { /* 实现设置值逻辑 */ };
    const onTableChange = () => { /* 实现表格变更逻辑 */ };
    const customClick = () => { /* 实现自定义行点击逻辑 */ };
    const choiceAddData = () => { /* 实现选择添加数据逻辑 */ };
    const onCellChange = () => { /* 实现单元格变更逻辑 */ };
    const handleAdd = () => { /* 实现添加行逻辑 */ };
    const handleDelete = () => { /* 实现删除行逻辑 */ };
    const editClickOrder = () => { /* 实现编辑点击订单逻辑 */ };
    const cancelPrint = () => { /* 实现取消打印逻辑 */ };

    onMounted(() => {
      // 组件挂载时的初始化逻辑
    });

    return {
      ...toRefs(state),
      newForecast,
      submit,
      submitOrder,
      auditClick,
      remove,
      getCode,
      getIdByData,
      searchClick,
      switchList,
      printOrder,
      submitServer,
      clickEdit,
      deleteOrder,
      turnThePage,
      syncOrder,
      exportDetail,
      theGoods,
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
      initForm,
    };
  },
});
</script>

<style lang="less" scoped>
@import '/@/assets/styles/voucher.less';

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

// 待审核
.audit-status:nth-child(1) {
  background-color: #fff2cc;
  color: #ff9900;
}

// 已审核/已申请出库
.audit-status:nth-child(2) {
  background-color: #e6f7ff;
  color: #1890ff;
}

// 已出库
.audit-status:nth-child(4) {
  background-color: #e6ffed;
  color: #52c41a;
}

// 关闭
.audit-status:contains('关闭') {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.contextmenu {
  position: absolute;
  z-index: 1000;
  width: 100px;
  margin: 0;
  padding: 5px 0;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  list-style-type: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.contextmenu li {
  padding: 5px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.contextmenu li:hover {
  background-color: #f5f5f5;
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  font-size: 16px;
}
</style>