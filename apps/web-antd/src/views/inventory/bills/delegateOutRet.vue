<!--
 * @Descripttion: 库存管理->委外退料单
 * @version: V1.0
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
        <h3 class="text-center">{{voucherTitle}}</h3>
        <section v-show="showModel=='list'">
          <!-- 列表 -->
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
        <section v-show="showModel=='order'">
          <div>
            <span class="audit-status" v-show="voucherState==0">待审核</span>
            <span class="audit-status" v-show="(voucherState==1 || voucherState==10) && !isSource">{{voucherState==1?'已审核':'关闭'}}</span>
            <span class="audit-status" v-show="(voucherState==1 || voucherState==10) && isSource">{{voucherState==1?'已审核':'关闭'}}</span>
            <span class="audit-status" v-show="voucherState==2">{{voucherState==2?'已入库':''}}</span>
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
                :data-source="dataSource"
                :customRow="customClick"
                :scroll="{ x: 1000, y: 347 }"
                :pagination="false"
                @change="onTableChange"
                :size="'small'"
                bordered
              >
                <template #number="{ text, record, index }">
                  <div v-if="index == dataSource.length-1">合计</div>
                  <div v-else>{{index+1}}</div>
                </template>
                <template v-for="col in slotArray" :slot="col" slot-scope="{ text, record, index }">
                  <div data-key="">
                    <EditableCell
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
            :dataSourceCode="dataSourceCode"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>
        <section v-show="showModel=='statistical'">
          <!--统计-->
          <DynamicListDetails
            ref="statisticalSearchRef"
            :reportCode="reportCodeStatistical"
            :dataSourceCode="dataSourceCode"
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
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useModal } from '/@/components/Modal';
import { defHttp } from '/@/utils/http/axios';
import { saveDelegateOutRet, examineDelegateOutRet, deleteDelegateOutRet, getDelegateOutRetCode, confirmDelegateOutRet, submitDelegateOutRet, getDelegateOutRetDetail, exportDelegateOutRetData } from '/@/api/inventory/delegateOutRet';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import pro from '@/mixins/procurement/pro';

export default defineComponent({
  name: 'DelegateOutRet',
  mixins: [pro],
  components: {
    BtnsWrapper: () => import('./components/BtnsWrapper.vue'),
    DynamicList: () => import('./components/DynamicList.vue'),
    OrderDynamicForm: () => import('./components/OrderDynamicForm.vue'),
    BasicTable: () => import('/@/components/Table/index.vue'),
    EditableCell: () => import('./components/EditableCell.vue'),
    DynamicListDetails: () => import('./components/DynamicListDetails.vue'),
    DrawerBox: () => import('./components/DrawerBox.vue'),
    PrintModal: () => import('./components/PrintModal.vue'),
  },
  setup() {
    const { t } = useI18n();
    const message = useMessage();
    const { createModal } = useModal();
    return {
      t,
      message,
      createModal,
    };
  },
  data() {
    return {
      //基础 查询条件（列表 + 翻页）
      basePostData: {
        someBusinessType: '5',
        isMyWarehouse: true,
      },
      sourceCode: 'DelegateDispatchVoucher',
      reportCodeDetail: 'DelegateDispatchVoucher_Detail_Report',          //明细code
      reportCodeStatistical: 'DelegateDispatchVoucher_Statistic_Report',   //统计code
      reportCodeList: 'DelegateDispatchVoucher_List_Report',               //列表code
      isPRF: true,
      headerInBusinessType: true,//表头业务类型不可修改
      receiveDeliverType: 1,//1入，2出
      checkType: 'is_material',//生产耗用
      productCheckType: 'is_made_request',     //产品属性：委外加工产品
      // 其他基础数据
      showModel: 'list',
      orderId: '',
      voucherState: 0,
      editMask: true,
      createUserId: '',
      voucherTitle: '委外退料单',
      isSource: false,
      loading: false,
      printVisible: false,
      incomingPrintData: {},
      visible: false,
      left: 0,
      top: 0,
      receiptNumber: '',
      isSaveRun: false,
      sourceVoucherData: {},
      formLayout: 'horizontal',
      orderHeaderData: [],
      orderFooterData: [],
      dataSource: [],
      columns: [],
      slotArray: [],
      isRouterAlive: true,
      unitData: [],
      unitsData: [],
      unitsDataDetails: [],
      unitsAssistSelect: [],
      dynamicFormData: {},
      dynamicFormDataMap: {},
    };
  },
  created() {
    this.initForm(1);
  },
  methods: {
    //新增
    newForecast() {
      this.showModel = 'order';
      this.editMask = false;
      this.loading = false;
      this.voucherState = -1;
      this.sourceVoucherData = {};//清空来源数据
      this.initForm(1);
      this.isSource = false;
    },
    //保存
    submit(requestData) {
      requestData.businessType = 5;
      this.loading = true;
      this.isSaveRun = false;
      saveDelegateOutRet(requestData)
        .then(response => {
          this.loading = false;
          this.isSaveRun = true;
          if (response.code === 0) {
            this.message.success('保存成功');
            this.editMask = true;
            if (!this.orderId) {
              this.getIdByData(); //获取最新一条数据
            }
          } else {
            this.message.error(response.message || '保存失败');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.isSaveRun = true;
          this.message.error('保存失败: ' + (error.message || '网络错误'));
        });
    },
    //单据提交
    submitOrder(type) {
      let data = {
        id: this.orderId,
        status: type,//状态 -1:撤回提交,0:提交
      }
      if (!this.orderId) {
        this.message.warning('该单据未保存不需要提交');
        return;
      }
      if (this.voucherState == -1 && type == -1) {
        this.message.warning('该单据未提交无需撤回提交');
        return;
      }
      this.loading = true;
      submitDelegateOutRet(data)
        .then(res => {
          this.loading = false;
          if (res.code === 0) {
            if (type == 0) {
              this.message.success('提交成功');
            } else {
              this.message.success('撤回提交成功');
            }
            this.getIdByData();
          } else {
            this.message.error(res.message || '操作失败');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.message.error('操作失败: ' + (error.message || '网络错误'));
        });
    },
    //审核
    auditClick(type) {
      let requestData = {
        id: this.orderId,
        status: type
      }
      this.loading = true;
      examineDelegateOutRet(requestData)
        .then((response) => {
          this.loading = false;
          if (response.code === 0) {
            if (type === 1) {
              this.message.success('审核成功');
              this.getIdByData();
            }
            if (type === 0) {
              if (this.isSource) {
                this.message.success('退单成功');
              } else {
                this.message.success('弃审成功');
              }
              this.getIdByData();
            }
          } else {
            this.message.error(response.message || '操作失败');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.message.error('操作失败: ' + (error.message || '网络错误'));
        });
    }
    },
    //删除
    remove(postData) {
      this.loading = true;
      deleteDelegateOutRet({ id: postData.id })
        .then(response => {
          this.loading = false;
          if (response.code === 0) {
            this.message.success('删除成功');
            this.orderId = '';
            this.voucherState = 0;
            this.getIdByData();//获取最新一条数据
          } else {
            this.message.error(response.message || '删除失败');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.message.error('删除失败: ' + (error.message || '网络错误'));
        });
    }},{"old_str":
    },
    //获取单据编号
    getCode() {
      this.loading = true;
      getDelegateOutRetCode({ sourceCode: this.sourceCode })
        .then((res) => {
          this.loading = false;
          if (res.code === 0) {
            this.receiptNumber = res.message;
            for (let i = 0; i < this.orderHeaderData.length; i++) {
              if (this.orderHeaderData[i].code == 'voucherCode') {
                this.$set(this.orderHeaderData[i], 'onEdit', false)
                this.$set(this.orderHeaderData[i], 'value', this.receiptNumber)
              }
            }
          } else {
            this.message.error(res.message || '获取单据编号失败');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.message.error('获取单据编号失败: ' + (error.message || '网络错误'));
        });
    },
    //入库
    theGoods() {
      this.$confirm({
        title: "提示",
        content: (
          <span style="color:red">
            入库后将更新库存数据，是否入库？
          </span>
        ),
        onOk: () => {
          let requestData = {
            id: this.orderId
          }
          this.loading = true;
          confirmDelegateOutRet(requestData)
            .then((response) => {
              this.loading = false;
              if (response.code === 0) {
                this.message.success('入库成功');
                this.getIdByData();
              } else {
                this.message.error(response.message || '入库失败');
              }
            })
            .catch((error) => {
              this.loading = false;
              this.message.error('入库失败: ' + (error.message || '网络错误'));
            });
        },
        onCancel: () => {}
      });
    },
    //获取数据
    getIdByData() {
      if (!this.orderId) {
        this.message.warning('请先选择单据');
        return;
      }

      this.loading = true;

      // 符合新API规范，添加必要的业务参数
      getDelegateOutRetDetail({
        id: this.orderId,
        someBusinessType: this.basePostData.someBusinessType,
        isMyWarehouse: this.basePostData.isMyWarehouse
      })
        .then(response => {
          this.loading = false;
          if (response.code === 0) {
            // 处理成功响应，设置表单数据
            const data = response.data;
            this.voucherState = data.voucherState;
            this.createUserId = data.createUserId;
            this.orderHeaderData = data.orderHeaderData || [];
            this.orderFooterData = data.orderFooterData || [];
            this.dataSource = data.dataSource || [];
            this.columns = data.columns || [];
            this.slotArray = data.slotArray || [];
            this.unitsDataDetails = data.unitsDataDetails || [];
            this.unitsAssistSelect = data.unitsAssistSelect || [];
            this.dynamicFormData = data.dynamicFormData || {};
            this.dynamicFormDataMap = data.dynamicFormDataMap || {};
            this.unitData = data.unitData || [];
            this.unitsData = data.unitsData || [];

            // 更新单据编号
            for (let i = 0; i < this.orderHeaderData.length; i++) {
              if (this.orderHeaderData[i].code === 'voucherCode') {
                this.receiptNumber = this.orderHeaderData[i].value;
                break;
              }
            }
          } else {
            this.message.error(response.message || '获取单据详情失败');
          }
        })
        .catch(error => {
          this.loading = false;
          this.message.error('获取单据详情失败: ' + (error.message || '网络错误'));
        });
    },
    //初始化表单
    initForm(type) {
      // 实现初始化表单逻辑
    },
    //表格行点击
    customClick(record, index) {
      return {
        onContextmenu: (e) => {
          e.preventDefault();
          this.visible = true;
          this.left = e.clientX;
          this.top = e.clientY;
          // 保存当前选中行
          this.currentRow = record;
          this.currentIndex = index;
        },
      };
    },
    //处理新增行
    handleAdd() {
      // 实现新增行逻辑
    },
    //处理删除行
    handleDelete() {
      // 实现删除行逻辑
    },
    //单元格变更
    onCellChange(index, col, value) {
      // 实现单元格变更逻辑
    },
    //选择添加数据
    choiceAddData(index, col, data) {
      // 实现选择添加数据逻辑
    },
    //切换列表视图
    switchList(type) {
      this.showModel = type;
    },
    //搜索点击
    searchClick() {
      // 实现搜索点击逻辑
    },
    //打印订单
    printOrder() {
      // 实现打印订单逻辑
    },
    //编辑点击
    clickEdit() {
      this.editMask = false;
    },
    //删除订单
    deleteOrder() {
      this.$confirm({
        title: '确认删除',
        content: '确定要删除该订单吗？',
        onOk: () => {
          this.remove({ id: this.orderId });
        }
      });
    },
    // 日期格式化函数
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    },

    //导出详情
    exportDetail() {
      if (!this.orderId) {
        this.message.warning('请先选择要导出的单据');
        return;
      }

      // 获取仓库ID
      let warehouseId = '';
      for (let i = 0; i < this.orderHeaderData.length; i++) {
        if (this.orderHeaderData[i].code === 'warehouseId') {
          warehouseId = this.orderHeaderData[i].value;
          break;
        }
      }

      if (!warehouseId) {
        this.message.warning('请选择仓库');
        return;
      }

      this.loading = true;

      // 获取日期
      let date = '';
      for (let i = 0; i < this.orderHeaderData.length; i++) {
        if (this.orderHeaderData[i].code === 'voucherDate') {
          date = this.orderHeaderData[i].value;
          break;
        }
      }

      exportDelegateOutRetData({
        id: this.orderId,
        warehouseId: warehouseId,
        date: date
      })
        .then((response) => {
          this.loading = false;
          if (response instanceof Blob) {
            const blob = response;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // 格式化文件名，使用当前日期
            const currentDate = this.formatDate(new Date());
            a.download = `委外退料单_${this.receiptNumber || this.orderId}_${currentDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.message.success('导出成功');
          } else {
            // 处理非Blob响应
            this.message.error('导出失败: 无效的响应格式');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.message.error('导出失败: ' + (error.message || '网络错误'));
        });
    },
    //编辑订单
    editClickOrder(data) {
      // 实现编辑订单逻辑
    },
    //取消打印
    cancelPrint() {
      this.printVisible = false;
    },
    //设置值
    setValue(data) {
      // 实现设置值逻辑
    },
    //切换页面
    turnThePage(page) {
      // 实现切换页面逻辑
    },
    //同步订单
    syncOrder() {
      // 实现同步订单逻辑
    },
    //提交服务器
    submitServer() {
      // 实现提交服务器逻辑
    },
    //时间变更
    onChangeTime(time) {
      // 实现时间变更逻辑
    },
    //表格变更
    onTableChange(pagination, filters, sorter) {
      // 实现表格变更逻辑
    },
  },
});
</script>
<style lang="less">
@import '~@/style/purchase/voucher.less';

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 待审核 */
.audit-status[v-show="voucherState==0"] {
  background-color: #fff3cd;
  color: #856404;
}

/* 已审核 */
.audit-status[v-show="voucherState==1"] {
  background-color: #d4edda;
  color: #155724;
}

/* 关闭 */
.audit-status[v-show="voucherState==10"] {
  background-color: #f8d7da;
  color: #721c24;
}

/* 已入库 */
.audit-status[v-show="voucherState==2"] {
  background-color: #cce5ff;
  color: #004085;
}
</style>