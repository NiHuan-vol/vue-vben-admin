<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮区域 -->
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
            <Dropdown class="btns" key="new" style="display: block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">
                  新增
                  <Icon icon="down" style="color: #1890ff; vertical-align: middle" />
                </div>
              </a>
              <Menu slot="overlay">
                <MenuItem key="0">
                  <a href="javascript:void(0)" @click="newForecast">新增</a>
                </MenuItem>
              </Menu>
            </Dropdown>
          </template>

          <template #shengdan>
            <Dropdown class="btns" key="sheng" style="display: block">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <Icon class="btns-icon" icon="snippets" />
                <div class="btns-text">
                  生单
                  <Icon icon="down" />
                </div>
              </a>
              <Menu v-if="voucherState === 1 || voucherState === 2" slot="overlay">
                <MenuItem key="0">
                  <a href="javascript:void(0)" @click="generateBills('PurchaseInvoice')">生成采购发票</a>
                </MenuItem>
              </Menu>
            </Dropdown>
          </template>
        </BtnsWrapper>
      </div>

      <!-- 文档内容 -->
      <div
        ref="print"
        class="documents-wrapper"
        id="documents-wrapper"
      >
        <h3 class="text-center">{{ voucherTitle }}</h3>

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

        <!-- 订单视图 -->
        <section v-show="showModel === 'order'">
          <div>
            <span class="audit-status" v-show="voucherState === 0">待审核</span>
            <span
              class="audit-status"
              v-show="(voucherState === 1 || voucherState === 10) && !isSource"
            >{{ voucherState === 1 ? '已审核' : '关闭' }}</span
            >
            <span
              class="audit-status"
              v-show="(voucherState === 1 || voucherState === 10) && isSource"
            >{{ voucherState === 1 ? '已审核' : '关闭' }}</span
            >
            <span class="audit-status" v-show="voucherState === 2">{{ voucherState === 2 ? '已入库' : '' }}</span>
          </div>

          <Form :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask"></div>
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
                      @choiceAddData="(index, col, data) => choiceAddData(index, col, data)"
                      @change="(index, col, value) => onCellChange(index, col, value)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </BasicTable>
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
          </Form>
        </section>

        <!-- 详情视图 -->
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
        <ul
          v-show="visible"
          :style="{ left: left + 'px', top: top + 'px' }"
          class="contextmenu"
        >
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
      <Spin class="loading-content" tip="加载中..." />
    </div>

    <!-- 打印模态框 -->
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { Button, Form, Dropdown, Menu, message, Spin } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { Icon } from '@/components/Icon';
import { savePurchaseIn, getPurchaseInDetail, deletePurchaseIn, auditPurchaseIn } from '@/api/inventory/bills';

// 组件引入
const BtnsWrapper = defineAsyncComponent(() => import('@/components/BtnsWrapper/index.vue'));
const DynamicList = defineAsyncComponent(() => import('@/components/DynamicList/index.vue'));
const OrderDynamicForm = defineAsyncComponent(() => import('@/components/OrderDynamicForm/index.vue'));
const EditableCell = defineAsyncComponent(() => import('@/components/EditableCell/index.vue'));
const DynamicListDetails = defineAsyncComponent(() => import('@/components/DynamicListDetails/index.vue'));
const DrawerBox = defineAsyncComponent(() => import('@/components/DrawerBox/index.vue'));
const PrintModal = defineAsyncComponent(() => import('@/components/PrintModal/index.vue'));

// 状态管理
const showModel = ref('list'); // 'list', 'order', 'detail', 'statistical'
const orderId = ref('');
const voucherState = ref(-1); // -1: 草稿, 0: 待审核, 1: 已审核, 2: 已入库, 10: 关闭
const editMask = ref(false);
const createUserId = ref('');
const isSource = ref(false);
const voucherTitle = ref('采购入库单');
const formLayout = ref('horizontal');
const orderHeaderData = ref<any>({});
const orderFooterData = ref<any>({});
const dataSource = ref<any[]>([]);
const loading = ref(false);
const visible = ref(false);
const left = ref(0);
const top = ref(0);
const printVisible = ref(false);
const incomingPrintData = ref<any>({});
const basePostData = ref<any>({
  isMyWarehouse: true,
});
const sourceCode = ref('PurchaseReceiveVoucher');
const reportCodeDetail = ref('PurchaseReceiveVoucher_Detail_Report');
const reportCodeStatistical = ref('PurchaseReceiveVoucher_Statistic_Report');
const reportCodeList = ref('PurchaseReceiveVoucher_List_Report');
const receiveDeliverType = ref(1); // 1入，2出
const isHideWherehouse = ref(true);
const checkType = ref('is_purchasing'); // 采购
const slotArray = ref(['materialCode', 'quantity', 'price', 'amount']);
const unitsDataDetails = ref<any[]>([]);
const unitsAssistSelect = ref<any[]>([]);
const dynamicFormData = ref<any[]>([]);
const dynamicFormDataMap = ref<any>({});
const unitData = ref<any[]>([]);
const unitsData = ref<any[]>([]);
const isRouterAlive = ref(true);
const isSaveRun = ref(false);
const sourceVoucherData = ref<any>({});

// 表格列定义
const columns = [
  { title: '序号', dataIndex: 'index', width: 50, slots: { customRender: 'number' } },
  { title: '物料编码', dataIndex: 'materialCode', width: 120, slots: { customRender: 'materialCode' } },
  { title: '物料名称', dataIndex: 'materialName', width: 150 },
  { title: '规格', dataIndex: 'specification', width: 120 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '数量', dataIndex: 'quantity', width: 100, slots: { customRender: 'quantity' } },
  { title: '单价', dataIndex: 'price', width: 100, slots: { customRender: 'price' } },
  { title: '金额', dataIndex: 'amount', width: 120, slots: { customRender: 'amount' } },
  { title: '备注', dataIndex: 'remark', width: 150 },
];

// 生命周期
onMounted(() => {
  // 获取最新一条数据
  getIdByData();
});

// 初始化表单
const initForm = (type: number) => {
  orderHeaderData.value = {
    // 初始化表头数据
    code: '',
    supplierName: '',
    supplierId: '',
    warehouseName: '',
    warehouseId: '',
    date: new Date(),
  };

  orderFooterData.value = {
    // 初始化表尾数据
    totalAmount: 0,
    remark: '',
  };

  dataSource.value = [
    // 初始化表格数据
    { index: 0, materialCode: '', materialName: '', specification: '', unit: '', quantity: 0, price: 0, amount: 0, remark: '' },
  ];
};

// 新增
const newForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {}; // 清空来源数据
  initForm(1);
  isSource.value = false;
};

// 保存
const submitServer = async () => {
  if (loading.value) return;

  try {
    loading.value = true;
    const params = {
      id: orderId.value,
      header: orderHeaderData.value,
      footer: orderFooterData.value,
      details: dataSource.value,
    };

    const res = await savePurchaseIn(params);
    if (res.success) {
      message.success('保存成功');
      editMask.value = true;
      isSaveRun.value = true;
      if (!orderId.value) {
        getIdByData(); // 获取最新一条数据
      }
    }
  } catch (error) {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
};

// 点击修改
const clickEdit = () => {
  editMask.value = false;
};

// 删除订单
const deleteOrder = async () => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  try {
    loading.value = true;
    const res = await deletePurchaseIn(orderId.value);
    if (res.success) {
      message.success('删除成功');
      initForm(1);
      orderId.value = '';
      voucherState.value = -1;
    }
  } catch (error) {
    message.error('删除失败');
  } finally {
    loading.value = false;
  }
};

// 获取最新一条数据
const getIdByData = async () => {
  try {
    loading.value = true;
    // 实际项目中应调用API获取最新数据
    // 这里模拟数据
    orderId.value = 'PR20230001';
    voucherState.value = 1;
    editMask.value = true;
    isSource.value = false;

    orderHeaderData.value = {
      code: 'PR20230001',
      supplierName: '供应商A',
      supplierId: 'supplier001',
      warehouseName: '主仓库',
      warehouseId: 'warehouse001',
      date: new Date('2023-06-10'),
    };

    orderFooterData.value = {
      totalAmount: 15000,
      remark: '测试采购入库单',
    };

    dataSource.value = [
      { index: 0, materialCode: 'MAT001', materialName: '原材料A', specification: '规格1', unit: 'kg', quantity: 100, price: 100, amount: 10000, remark: '' },
      { index: 1, materialCode: 'MAT002', materialName: '原材料B', specification: '规格2', unit: 'pcs', quantity: 50, price: 100, amount: 5000, remark: '' },
      { index: 2, materialCode: '', materialName: '', specification: '', unit: '', quantity: 0, price: 0, amount: 0, remark: '' },
    ];

    showModel.value = 'order';
  } catch (error) {
    message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 审核
const auditClick = async (status: number) => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  try {
    loading.value = true;
    const res = await auditPurchaseIn({
      id: orderId.value,
      status: status,
    });
    if (res.success) {
      message.success(status === 1 ? '审核成功' : '取消审核成功');
      voucherState.value = status;
    }
  } catch (error) {
    message.error(status === 1 ? '审核失败' : '取消审核失败');
  } finally {
    loading.value = false;
  }
};

// 打印订单
const printOrder = () => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  // 准备打印数据
  incomingPrintData.value = {
    orderId: orderId.value,
    header: orderHeaderData.value,
    details: dataSource.value,
    footer: orderFooterData.value,
  };

  printVisible.value = true;
};

// 取消打印
const cancelPrint = () => {
  printVisible.value = false;
};

// 切换视图
const switchList = (mode: string) => {
  showModel.value = mode;
};

// 搜索点击
const searchClick = () => {
  // 实际项目中应打开搜索面板
  message.info('打开搜索面板');
};

// 翻页
const turnThePage = (type: number) => {
  // 实际项目中应根据type参数翻页
  message.info(`翻页操作: ${type}`);
};

// 刷新订单
const syncOrder = () => {
  if (orderId.value) {
    // 实际项目中应重新获取订单数据
    message.info('刷新成功');
  } else {
    message.warning('请先选择订单');
  }
};

// 提交订单
const submitOrder = async () => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  try {
    loading.value = true;
    // 实际项目中应调用API提交订单
    message.success('提交成功');
    voucherState.value = 0; // 改为待审核状态
  } catch (error) {
    message.error('提交失败');
  } finally {
    loading.value = false;
  }
};

// 导出详情
const exportDetail = () => {
  message.info('导出详情功能待实现');
};

// 选商品
const theGoods = () => {
  message.info('选商品功能待实现');
};

// 生成单据
const generateBills = (type: string) => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }

  message.info(`生成${type}单据`);
};

// 表格行点击
const customClick = (record: any, index: number) => {
  return {
    on: {
      click: () => {
        // 右键菜单显示逻辑
        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          visible.value = true;
          left.value = e.clientX;
          top.value = e.clientY;
        });
      },
    },
  };
};

// 表格变化
const onTableChange = (pagination: any, filters: any, sorter: any) => {
  // 处理表格变化
};

// 时间改变
const onChangeTime = (date: any) => {
  orderHeaderData.value.date = date;
};

// 设置值
const setValue = (key: string, value: any) => {
  orderHeaderData.value[key] = value;
};

// 单元格变化
const onCellChange = (index: number, col: string, value: any) => {
  if (index < dataSource.value.length - 1) {
    dataSource.value[index][col] = value;
    // 计算金额
    if (col === 'quantity' || col === 'price') {
      dataSource.value[index].amount = dataSource.value[index].quantity * dataSource.value[index].price;
    }
    // 重新计算合计
    calculateTotal();
  }
};

// 计算合计
const calculateTotal = () => {
  let totalAmount = 0;
  dataSource.value.forEach((item, index) => {
    if (index < dataSource.value.length - 1) {
      totalAmount += item.amount || 0;
    }
  });
  orderFooterData.value.totalAmount = totalAmount;
  dataSource.value[dataSource.value.length - 1].amount = totalAmount;
};

// 选择添加数据
const choiceAddData = (index: number, col: string, data: any) => {
  // 处理选择添加的数据
  if (col === 'materialCode') {
    dataSource.value[index].materialCode = data.code;
    dataSource.value[index].materialName = data.name;
    dataSource.value[index].specification = data.specification;
    dataSource.value[index].unit = data.unit;
  }
};

// 新增行
const handleAdd = () => {
  const newRow = {
    index: dataSource.value.length - 1,
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '',
    quantity: 0,
    price: 0,
    amount: 0,
    remark: '',
  };

  // 插入到合计行之前
  dataSource.value.splice(dataSource.value.length - 1, 0, newRow);
  // 更新索引
  dataSource.value.forEach((item, index) => {
    item.index = index;
  });
};

// 删除行
const handleDelete = () => {
  if (dataSource.value.length > 2) {
    dataSource.value.splice(dataSource.value.length - 2, 1);
    // 更新索引
    dataSource.value.forEach((item, index) => {
      item.index = index;
    });
    // 重新计算合计
    calculateTotal();
  } else {
    message.warning('至少保留一行数据');
  }
};

// 编辑点击订单
const editClickOrder = (data: any) => {
  // 处理编辑点击订单
  orderId.value = data.id;
  voucherState.value = data.state;
  // 实际项目中应根据id获取订单详情
  showModel.value = 'order';
  editMask.value = true;
};
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

.documents-wrapper {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.header-box,
.footer-box {
  margin-bottom: 16px;
}

.table-box {
  margin-bottom: 16px;
  position: relative;
}

.edit-mask-header,
.edit-mask-footer,
.edit-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.01);
  z-index: 10;
}

.edit-mask-header,
.edit-mask-footer {
  height: 100%;
}

audit-status {
  display: inline-block;
  padding: 2px 8px;
  background-color: #52c41a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.contextmenu-box {
  position: fixed;
  z-index: 100;
}

.contextmenu {
  width: 120px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.contextmenu li {
  padding: 6px 16px;
  cursor: pointer;
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
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>