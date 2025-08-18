<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮区 -->
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

        <!-- 列表视图 -->
        <section v-show="showModel === 'list'">
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            @switchList="switchList"
            @dblclick="getIdByData"
            :reportCode="reportCodeList"
          />
        </section>

        <!-- 单据视图 -->
        <section v-show="showModel === 'order'">
          <div>
            <span class="audit-status" v-show="voucherState === 0">待审核</span>
            <span class="audit-status" v-show="(voucherState === 1 || voucherState === 10) && !isSource">{{voucherState === 1 ? '已审核' : '关闭'}}</span>
            <span class="audit-status" v-show="(voucherState === 1 || voucherState === 10) && isSource">{{voucherState === 1 ? '已审核' : '关闭'}}</span>
            <span class="audit-status" v-show="voucherState === 2">{{voucherState === 2 ? '已入库' : ''}}</span>
          </div>

          <a-form-model :layout="formLayout">
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
                :size="'small'"
                bordered
              >
                <template #number="{ text, record, index }">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
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
                      @choiceAddData="choiceAddData(index, col, $event)"
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
          </a-form-model>
        </section>

        <!-- 明细视图 -->
        <section v-show="showModel === 'detail'">
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>

        <!-- 统计视图 -->
        <section v-show="showModel === 'statistical'">
          <DynamicListDetails
            ref="statisticalSearchRef"
            :reportCode="reportCodeStatistical"
            :componentType="2"
            :basePostData="basePostData"
          />
        </section>
      </div>

      <!-- 右键菜单 -->
      <div class="contextmenu-box">
        <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
          <li @click="handleAdd()">新增行</li>
          <li @click="handleDelete()">删除行</li>
        </ul>
      </div>

      <!-- 搜索抽屉 -->
      <DrawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder" />
    </div>

    <!-- 加载中 -->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>

    <!-- 打印模态框 -->
    <PrintModal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineComponent, reactive } from 'vue';
import { defHttp } from '@/utils/http/axios';
import { message } from 'ant-design-vue';
import { BtnsWrapper, BasicTable, Icon, DrawerBox, PrintModal } from '@/components';
import OrderDynamicForm from '@/components/OrderDynamicForm/index.vue';
import DynamicList from '@/components/DynamicList/index.vue';
import DynamicListDetails from '@/components/DynamicListDetails/index.vue';
import EditableCell from '@/components/EditableCell/index.vue';
import { saveDelegateIn, deleteDelegateIn, examineDelegateIn, getDelegateInCode, confirmDelegateIn, submitDelegateIn, exportDelegateInData, importDelegateInData, downloadDelegateInTemplate, getDelegateInList, getDelegateInDetail } from '@/api/inventory/delegateIn';
import { usePermission } from '@/hooks/usePermission';

// 基础数据
const basePostData = reactive<Record<string, any>>({
  someBusinessType: 0,
  isMyWarehouse: true,
});

enum VoucherState {
  DRAFT = -1,
  PENDING = 0,
  AUDITED = 1,
  CLOSED = 10,
  IN_STOCK = 2,
}

// 状态管理
const showModel = ref('order'); // 'order' 单据视图, 'list' 列表视图, 'detail' 明细视图, 'statistical' 统计视图
const editMask = ref(false);
const voucherState = ref(VoucherState.DRAFT);
const orderId = ref('');
const voucherTitle = ref('委外入库单');
const formLayout = ref('horizontal');
const loading = ref(false);
const isSource = ref(false);
const createUserId = ref('');
const isRouterAlive = ref(true);
const visible = ref(false);
const left = ref(0);
const top = ref(0);
const printVisible = ref(false);
const incomingPrintData = ref<any>({});
const receiptNumber = ref('');
const isSaveRun = ref(true);
const sourceVoucherData = ref<any>({});

// 数据源
const dataSource = ref<any[]>([]);
const orderHeaderData = ref<any[]>([]);
const orderFooterData = ref<any[]>([]);
const columns = ref<any[]>([]);
const slotArray = ref<string[]>([]);
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any>({});
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<any>({});

// 配置信息
const sourceCode = ref('DelegateReceiveVoucher');
const reportCodeDetail = ref('DelegateReceiveVoucher_Detail_Report');
const reportCodeStatistical = ref('DelegateReceiveVoucher_Statistic_Report');
const reportCodeList = ref('DelegateReceiveVoucher_List_Report');
const receiveDeliverType = ref(1); // 1入，2出
const isHideWherehouse = ref(true);
const checkType = ref('is_made_request'); // 委外

// 权限检查
const { hasPermission } = usePermission();

// 生命周期
onMounted(() => {
  initForm(1);
  // getIdByData(); // 获取最新一条数据
});

// 初始化表单
function initForm(type: number) {
  // 实际项目中应根据type初始化表单数据
  orderHeaderData.value = [
    { code: 'voucherCode', label: '单据编号', value: '', required: true },
    { code: 'date', label: '日期', value: new Date(), required: true },
    { code: 'warehouseId', label: '仓库', value: '', required: true },
    { code: 'supplierId', label: '供应商', value: '', required: true },
    { code: 'contactPerson', label: '联系人', value: '' },
    { code: 'phone', label: '电话', value: '' },
  ];

  orderFooterData.value = [
    { code: 'totalAmount', label: '总金额', value: 0, disabled: true },
    { code: 'remark', label: '备注', value: '' },
  ];

  columns.value = [
    { title: '序号', dataIndex: 'index', width: 50, slots: { customRender: 'number' } },
    { title: '物料编码', dataIndex: 'materialCode', width: 120, slots: { customRender: 'materialCode' } },
    { title: '物料名称', dataIndex: 'materialName', width: 150 },
    { title: '规格', dataIndex: 'specification', width: 100 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '数量', dataIndex: 'quantity', width: 80, slots: { customRender: 'quantity' } },
    { title: '单价', dataIndex: 'price', width: 80, slots: { customRender: 'price' } },
    { title: '金额', dataIndex: 'amount', width: 100, slots: { customRender: 'amount' } },
    { title: '备注', dataIndex: 'remark', width: 150, slots: { customRender: 'remark' } },
  ];

  slotArray.value = ['materialCode', 'quantity', 'price', 'amount', 'remark'];

  dataSource.value = [];
  addEmptyRow();

  if (type === 1) {
    getCode();
  }
}

// 添加空行
function addEmptyRow() {
  dataSource.value.push({
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '',
    quantity: 0,
    price: 0,
    amount: 0,
    remark: '',
  });
}

// 新增单据
function newForecast() {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = VoucherState.DRAFT;
  sourceVoucherData.value = {}; // 清空来源数据
  initForm(1);
  isSource.value = false;
}

// 保存单据
async function submit(requestData: any) {
  if (!isSaveRun.value) return;
  isSaveRun.value = false;
  loading.value = true;

  try {
    const params = {
      id: orderId.value,
      voucherCode: requestData.voucherCode,
      date: requestData.date,
      warehouseId: requestData.warehouseId,
      supplierId: requestData.supplierId,
      contactPerson: requestData.contactPerson,
      phone: requestData.phone,
      totalAmount: requestData.totalAmount,
      remark: requestData.remark,
      details: dataSource.value,
    };

    const res = await saveDelegateIn(params);
    if (res.code === 0) {
      message.success('保存成功');
      editMask.value = true;
      orderId.value = res.data.id;
      voucherState.value = VoucherState.DRAFT;
      if (!orderId.value) {
        getIdByData(); // 获取最新一条数据
      }
    } else {
      message.error(res.message || '保存失败');
    }
  } catch (error) {
    message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
    isSaveRun.value = true;
  }
}

// 提交单据
async function submitOrder(type: number) {
  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === VoucherState.DRAFT && type === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  try {
    loading.value = true;
    const data = {
      id: orderId.value,
      status: type, // 状态 -1:撤回提交,0:提交
    };

    const res = await submitDelegateIn(data);
    if (res.code === 0) {
      if (type === 0) {
        message.success('提交成功');
        voucherState.value = VoucherState.PENDING;
      } else {
        message.success('撤回提交成功');
        voucherState.value = VoucherState.DRAFT;
      }
      getIdByData();
    } else {
      message.error(res.message || '操作失败');
    }
  } catch (error) {
    message.error('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
  }
}

// 审核单据
async function auditClick(type: number) {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    loading.value = true;
    const requestData = {
      id: orderId.value,
      status: type,
    };

    const res = await examineDelegateIn(requestData);
    if (res.code === 0) {
      if (type === 1) {
        message.success('审核成功');
        voucherState.value = VoucherState.AUDITED;
      } else if (type === 0) {
        if (isSource.value) {
          message.success('退单成功');
        } else {
          message.success('弃审成功');
          voucherState.value = VoucherState.DRAFT;
        }
      }
      getIdByData();
    } else {
      message.error(res.message || '操作失败');
    }
  } catch (error) {
    message.error('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
  }
}

// 删除单据
async function remove(postData: any) {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    loading.value = true;
    const res = await deleteDelegateIn({ id: orderId.value });
    if (res.code === 0) {
      message.success('删除成功');
      orderId.value = '';
      voucherState.value = VoucherState.DRAFT;
      getIdByData(); // 获取最新一条数据
    } else {
      message.error(res.message || '删除失败');
    }
  } catch (error) {
    message.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
  }
}

// 获取单据编号
async function getCode() {
  try {
    loading.value = true;
    const res = await getDelegateInCode({ sourceCode: sourceCode.value });
    if (res.code === 0) {
      receiptNumber.value = res.data;
      // 更新表单中的单据编号
      const codeItem = orderHeaderData.value.find(item => item.code === 'voucherCode');
      if (codeItem) {
        codeItem.value = receiptNumber.value;
      }
    } else {
      message.error(res.message || '获取单据编号失败');
    }
  } catch (error) {
    message.error('获取单据编号失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
  }
}

// 获取单据详情
async function getIdByData() {
  if (!orderId.value) {
    // 实际项目中应获取最新单据
    return;
  }

  try {
    loading.value = true;
    // 添加someBusinessType和isMyWarehouse参数，与其他API调用保持一致
    const res = await getDelegateInDetail({
      id: orderId.value,
      someBusinessType: basePostData.someBusinessType,
      isMyWarehouse: basePostData.isMyWarehouse
    });
    if (res.code === 0) {
      const data = res.data;
      orderHeaderData.value = [
        { code: 'voucherCode', label: '单据编号', value: data.voucherCode, required: true },
        { code: 'date', label: '日期', value: new Date(data.date), required: true },
        { code: 'warehouseId', label: '仓库', value: data.warehouseId, required: true },
        { code: 'supplierId', label: '供应商', value: data.supplierId, required: true },
        { code: 'contactPerson', label: '联系人', value: data.contactPerson },
        { code: 'phone', label: '电话', value: data.phone },
      ];

      orderFooterData.value = [
        { code: 'totalAmount', label: '总金额', value: data.totalAmount, disabled: true },
        { code: 'remark', label: '备注', value: data.remark },
      ];

      dataSource.value = data.details || [];
      voucherState.value = data.state;
      createUserId.value = data.createUserId;
    } else {
      message.error(res.message || '获取单据详情失败');
    }
  } catch (error) {
    message.error('获取单据详情失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
  }
}

// 其他方法（简化版）
function searchClick() { /* 实现搜索逻辑 */ }
function switchList(mode: string) { showModel.value = mode; }
function submitServer() { /* 实现提交服务器逻辑 */ }
function clickEdit() { editMask.value = false; }
function deleteOrder() { remove({ id: orderId.value }); }
function turnThePage(type: number) { /* 实现翻页逻辑 */ }
function syncOrder() { if (orderId.value) getIdByData(); else message.warning('请先选择单据'); }
// 日期格式化函数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 导出明细
async function exportDetail() {
  const warehouseId = orderHeaderData.value.find(item => item.code === 'warehouseId')?.value;
  const date = orderHeaderData.value.find(item => item.code === 'date')?.value;

  if (!warehouseId) {
    message.warning('请先选择仓库');
    return;
  }

  loading.value = true;

  try {
    // 准备导出参数
    const params = {
      id: orderId.value || undefined,
      warehouseId,
      date: date ? new Date(date).toISOString().split('T')[0] : undefined
    };

    // 调用导出API
    const response = await exportDelegateInData(params);

    // 检查响应是否为Blob类型
    if (!(response instanceof Blob)) {
      message.error('导出失败: 无效的响应格式');
      return;
    }

    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `委外入库单明细_${formatDate(new Date())}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('导出成功');
  } catch (error) {
    message.error('导出失败: ' + (error instanceof Error ? error.message : '网络错误'));
  } finally {
    loading.value = false;
  }
}
// 确认入库
async function theGoods() {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    loading.value = true;
    const res = await confirmDelegateIn({ id: orderId.value });
    if (res.code === 0) {
      message.success('入库成功');
      voucherState.value = VoucherState.IN_STOCK;
      getIdByData();
    } else {
      message.error(res.message || '入库失败');
    }
  } catch (error) {
    message.error('入库失败: ' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    loading.value = false;
  }
}
function printOrder() { printVisible.value = true; }
function cancelPrint() { printVisible.value = false; }
function onChangeTime() { /* 实现时间变更逻辑 */ }
function setValue() { /* 实现设置值逻辑 */ }
function customClick() { /* 实现自定义行点击逻辑 */ }
function onTableChange() { /* 实现表格变更逻辑 */ }
function choiceAddData() { /* 实现选择添加数据逻辑 */ }
function onCellChange() { /* 实现单元格变更逻辑 */ }
function handleAdd() { addEmptyRow(); }
function handleDelete() { /* 实现删除行逻辑 */ }
function editClickOrder() { /* 实现编辑点击订单逻辑 */ }
</script>

<style scoped lang="less">
@import '~@/style/purchase/voucher.less';

.btn-wrapper {
  margin-bottom: 10px;
}

.btns {
  display: inline-block;
  padding: 8px 16px;
  cursor: pointer;
  text-align: center;
}

.btns-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.btns-text {
  font-size: 12px;
}

.btns-disable {
  opacity: 0.5;
  cursor: not-allowed;
}

.credentials-bom-wrapper {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.audit-status[v-show="voucherState === 0"] {
  background-color: #faad14;
  color: #fff;
}

.audit-status[v-show="(voucherState === 1 || voucherState === 10) && !isSource"],
.audit-status[v-show="(voucherState === 1 || voucherState === 10) && isSource"] {
  background-color: #52c41a;
  color: #fff;
}

.audit-status[v-show="voucherState === 2"] {
  background-color: #1890ff;
  color: #fff;
}
</style>