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
          :sourceCode="sourceCode"
          @theGoods="theGoods"
        >
          <template #neworder>
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
              </a-menu>
            </a-dropdown>
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
          <span class="audit-status" v-show="voucherState === 0">待审核</span>
          <span class="audit-status"
            v-show="(voucherState === 1 || voucherState === 10) && !isSource"
            >{{ voucherState === 1 ? '已审核' : '关闭' }}</span
          >
          <span class="audit-status"
            v-show="(voucherState === 1 || voucherState === 10) && isSource"
            >{{ voucherState === 1 ? '已审核' : '关闭' }}</span
          >
          <span class="audit-status" v-show="voucherState === 2">{{ voucherState === 2 ? '已入库' : '' }}</span>

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
              <a-table
                id="bills_tb"
                v-if="isRouterAlive"
                :columns="columns"
                :data-source="dataSource"
                :customRow="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                :size="small"
                bordered
              >
                <template slot="number" slot-scope="text, record, index">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
                <template v-for="col in slotArray" :slot="col" slot-scope="text, record, index">
                  <div data-key="">
                    <EditableCell
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
              </a-table>
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
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, toRefs, onMounted } from 'vue';
import {
  saveOtherIn,
  examineOtherIn,
  deleteOtherIn,
  getOtherInCode,
  confirmOtherIn,
  submitOtherIn,
} from '@/api/inventory/otherIn';
import { useMessage } from 'naive-ui';
import pro from '@/mixins/procurement/pro';
import BtnsWrapper from '@/components/BtnsWrapper/index.vue';
import DynamicList from '@/components/DynamicList/index.vue';
import OrderDynamicForm from '@/components/OrderDynamicForm/index.vue';
import EditableCell from '@/views/inventory/bills/components/EditableCell.vue';
import DrawerBox from '@/components/DrawerBox/index.vue';
import PrintModal from '@/components/PrintModal/index.vue';
import DynamicListDetails from '@/components/DynamicListDetails/index.vue';

export default defineComponent({
  name: 'OtherIn',
  mixins: [pro],
  components: {
    BtnsWrapper,
    DynamicList,
    OrderDynamicForm,
    EditableCell,
    DrawerBox,
    PrintModal,
    DynamicListDetails,
  },
  setup() {
    const message = useMessage();
    const state = reactive<{
      basePostData: any;
      sourceCode: string;
      reportCodeDetail: string;
      reportCodeStatistical: string;
      reportCodeList: string;
      receiveDeliverType: number;
      showModel: string;
      editMask: boolean;
      loading: boolean;
      voucherState: number;
      orderId: string;
      isSource: boolean;
      sourceVoucherData: any;
      isSaveRun: boolean;
      receiptNumber: string;
      orderHeaderData: any[];
      orderFooterData: any[];
      columns: any[];
      dataSource: any[];
      slotArray: string[];
      isRouterAlive: boolean;
      visible: boolean;
      left: number;
      top: number;
      printVisible: boolean;
      incomingPrintData: any;
      formLayout: 'horizontal' | 'vertical' | 'inline';
      createUserId: string;
      voucherTitle: string;
      unitData: any;
      unitsData: any;
      unitsDataDetails: any;
      dynamicFormData: any;
      dynamicFormDataMap: any;
    }>({
      // 基础 查询条件（列表 + 翻页）
      basePostData: {
        someBusinessType: null,
        isMyWarehouse: true, // 是否
      },
      sourceCode: 'OtherReceiveVoucher',
      reportCodeDetail: 'OtherReceiveVoucher_Detail_Report',
      reportCodeStatistical: 'OtherReceiveVoucher_Statistic_Report',
      reportCodeList: 'OtherReceiveVoucher_List_Report', // 列表code
      receiveDeliverType: 1, // 1入，2出
      showModel: 'list',
      editMask: false,
      loading: false,
      voucherState: 0,
      orderId: '',
      isSource: false,
      sourceVoucherData: {},
      isSaveRun: true,
      receiptNumber: '',
      orderHeaderData: [],
      orderFooterData: [],
      columns: [],
      dataSource: [],
      slotArray: [],
      isRouterAlive: true,
      visible: false,
      left: 0,
      top: 0,
      printVisible: false,
      incomingPrintData: {},
      formLayout: 'horizontal',
      createUserId: '',
      voucherTitle: '其他入库单',
      unitData: {},
      unitsData: {},
      unitsDataDetails: {},
      dynamicFormData: {},
      dynamicFormDataMap: {},
    });

    // 新增
    const newForecast = () => {
      state.showModel = 'order';
      state.editMask = false;
      state.loading = false;
      state.voucherState = -1;
      state.sourceVoucherData = {}; // 清空来源数据
      state.initForm(1);
    };

    // 保存
    const submit = (requestData: any) => {
      saveOtherIn(requestData)
        .then((response: any) => {
          if (response.code === 200) {
            message.success('保存成功');
            state.editMask = true;
            state.isSaveRun = true;
            if (!state.orderId) {
              getIdByData(); // 获取最新一条数据
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
      submitOtherIn(data).then((res: any) => {
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
      examineOtherIn(requestData).then((response: any) => {
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

    // 删除
    const remove = (postData: any) => {
      deleteOtherIn(postData).then((response: any) => {
        if (response.code === 200) {
          message.success('删除成功');
          state.orderId = '';
          state.voucherState = 0;
          getIdByData(); // 获取最新一条数据
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
      getOtherInCode(data).then((res: any) => {
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

    // 入库
    const theGoods_delete = () => { // 废弃方法
      const _this = state;
      _this.$confirm({
        title: '提示',
        content: (
          <span style="color:red">入库后将更新库存数据，是否入库？</span>
        ),
        onOk() {
          const requestData = {
            id: _this.orderId,
          };
          confirmOtherIn(requestData).then((response: any) => {
            if (response.code === 200) {
              message.success('入库成功');
              getIdByData();
            }
          });
        },
        onCancel() {},
      });
    };

    // 获取最新一条数据
    const getIdByData = () => {
      // 实现获取最新数据的逻辑
    };

    // 搜索点击
    const searchClick = () => {
      // 实现搜索逻辑
    };

    // 切换列表
    const switchList = () => {
      // 实现切换列表逻辑
    };

    // 打印订单
    const printOrder = () => {
      // 实现打印逻辑
    };

    // 提交服务器
    const submitServer = () => {
      // 实现提交服务器逻辑
    };

    // 点击编辑
    const clickEdit = () => {
      // 实现点击编辑逻辑
    };

    // 删除订单
    const deleteOrder = () => {
      // 实现删除订单逻辑
    };

    // 翻页
    const turnThePage = () => {
      // 实现翻页逻辑
    };

    // 同步订单
    const syncOrder = () => {
      // 实现同步订单逻辑
    };

    // 导出明细
    const exportDetail = () => {
      // 实现导出明细逻辑
    };

    // 入库
    const theGoods = () => {
      // 实现入库逻辑
    };

    // 编辑点击订单
    const editClickOrder = () => {
      // 实现编辑点击订单逻辑
    };

    // 取消打印
    const cancelPrint = () => {
      state.printVisible = false;
    };

    // 初始化表单
    const initForm = (type: number) => {
      // 实现初始化表单逻辑
    };

    // 自定义行点击
    const customClick = () => {
      // 实现自定义行点击逻辑
    };

    // 表格变化
    const onTableChange = () => {
      // 实现表格变化逻辑
    };

    // 选择添加数据
    const choiceAddData = (index: number, col: string, event: any) => {
      // 实现选择添加数据逻辑
    };

    // 单元格变化
    const onCellChange = (index: number, col: string, event: any) => {
      // 实现单元格变化逻辑
    };

    // 处理添加
    const handleAdd = () => {
      // 实现处理添加逻辑
    };

    // 处理删除
    const handleDelete = () => {
      // 实现处理删除逻辑
    };

    // 改变时间
    const onChangeTime = () => {
      // 实现改变时间逻辑
    };

    // 设置值
    const setValue = () => {
      // 实现设置值逻辑
    };

    onMounted(() => {
      // 初始化逻辑
    });

    return {
      ...toRefs(state),
      newForecast,
      submit,
      submitOrder,
      auditClick,
      remove,
      getCode,
      theGoods_delete,
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
      editClickOrder,
      cancelPrint,
      initForm,
      customClick,
      onTableChange,
      choiceAddData,
      onCellChange,
      handleAdd,
      handleDelete,
      onChangeTime,
      setValue,
    };
  },
});
</script>

<style lang="less" scoped>
@import '~@/style/purchase/voucher.less';

.content-wrapper {
  padding: 16px;
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
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.contextmenu {
  position: absolute;
  z-index: 100;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.contextmenu li {
  padding: 4px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background: #f5f5f5;
}
</style>