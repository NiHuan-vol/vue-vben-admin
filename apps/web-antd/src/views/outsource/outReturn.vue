<!--
 * @Descripttion: 委外退料单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-06-28 16:57:06
 * @LastEditors: GW
 * @LastEditTime: 2021-12-21 10:26:21
-->
<template>
  <div class="out-return-container">
    <Card :title="voucherTitle" class="mb-4">
      <!-- 按钮工具栏 -->
      <template #extra>
        <div class="flex space-x-2">
          <a-dropdown>
            <a-button type="primary" class="flex items-center">
              <Icon icon="ic:outline-file-add" class="mr-2" /> 新增
              <Icon icon="ant-design:down-outlined" class="ml-1" />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="0" @click="newForecast">
                  <Icon icon="ic:outline-plus" class="mr-2" /> 新增
                </a-menu-item>
                <a-menu-item key="1" @click="choiceBillsWork">
                  <Icon icon="ant-design:file-search-outlined" class="mr-2" /> 选委外订单
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button @click="printOrder" class="flex items-center">
            <Icon icon="ic:outline-print" class="mr-2" /> 打印
          </a-button>
          <a-button @click="exportDetail" class="flex items-center">
            <Icon icon="ic:outline-download" class="mr-2" /> 导出
          </a-button>
        </div>
      </template>

      <!-- 状态标签 -->
      <div class="mb-4">
        <span v-if="voucherState === 0" class="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">待审核</span>
        <span v-else-if="voucherState === 1" class="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">已审核</span>
        <span v-else-if="voucherState === 2" class="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">已确认</span>
        <span v-else-if="voucherState === 10" class="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">关闭</span>
      </div>

      <!-- 列表视图 -->
      <BasicTable @register="registerTable" v-if="showModel === 'list'">
        <template #toolbar>
          <div class="flex justify-between items-center w-full">
            <div class="flex space-x-2">
              <a-button @click="switchToList" class="flex items-center">
                <Icon icon="ant-design:table-outlined" class="mr-2" /> 列表
              </a-button>
              <a-button @click="switchToDetail" class="flex items-center">
                <Icon icon="ant-design:details-outlined" class="mr-2" /> 明细
              </a-button>
              <a-button @click="switchToStatistical" class="flex items-center">
                <Icon icon="ant-design:pie-chart-outlined" class="mr-2" /> 统计
              </a-button>
            </div>
            <ProForm
              :schema="searchSchema"
              layout="inline"
              :submitButtonProps="{ hidden: true }"
              @valuesChange="handleSearch"
            />
          </div>
        </template>
      </BasicTable>

      <!-- 订单视图 -->
      <div v-else-if="showModel === 'order'">
        <!-- 订单头部 -->
        <ProForm
          :schema="headerSchema"
          :formProps="{ labelCol: { span: 6 }, wrapperCol: { span: 18 } }"
          :initialValues="orderHeaderData"
          @valuesChange="handleHeaderChange"
        />

        <!-- 订单表格 -->
        <BasicTable @register="registerOrderTable" class="mt-4" bordered>
          <template #number="{ record, index }">
            <div v-if="index === tableData.value.length - 1">合计</div>
            <div v-else>{{ index + 1 }}</div>
          </template>
          <template #action="{ record, index }">
            <div class="flex space-x-2">
              <a-button type="link" @click="handleEditRow(index)">编辑</a-button>
              <a-button type="link" danger @click="handleDeleteRow(index)">删除</a-button>
            </div>
          </template>
        </BasicTable>

        <!-- 订单底部 -->
        <ProForm
          :schema="footerSchema"
          :formProps="{ labelCol: { span: 6 }, wrapperCol: { span: 18 } }"
          :initialValues="orderFooterData"
          class="mt-4"
        />

        <!-- 操作按钮 -->
        <div class="mt-4 flex justify-end space-x-2">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSave">保存</a-button>
          <a-button type="primary" v-if="voucherState !== 1" @click="handleSubmit">提交</a-button>
        </div>
      </div>

      <!-- 明细视图 -->
      <div v-else-if="showModel === 'detail'">
        <BasicTable @register="registerDetailTable" bordered />
      </div>

      <!-- 统计视图 -->
      <div v-else-if="showModel === 'statistical'">
        <BasicTable @register="registerStatisticalTable" bordered />
      </div>
    </Card>

    <!-- 加载中 -->
    <Loading v-if="loading" />

    <!-- 打印模态框 -->
    <Modal v-model:visible="printVisible" title="打印预览" @cancel="cancelPrint">
      <div ref="printDom">{{ incomingPrintData }}</div>
      <template #footer>
        <a-button @click="cancelPrint">关闭</a-button>
        <a-button type="primary" @click="confirmPrint">确认打印</a-button>
      </template>
    </Modal>

    <!-- 选委外订单模态框 -->
    <Modal v-model:visible="choiceOrderVisible" title="选委外订单" width="80%" @cancel="cancelChoiceOrder">
      <div class="p-4">
        <ProForm
          :schema="choiceOrderSearchSchema"
          layout="inline"
          :submitButtonProps="{ hidden: true }"
          @valuesChange="handleChoiceOrderSearch"
          class="mb-4"
        />
        <a-button type="primary" @click="searchBillsWork" class="mb-4">搜索</a-button>

        <div class="mb-4">
          <h3 class="text-lg font-bold mb-2">产成品明细</h3>
          <BasicTable @register="registerWorkOrderMainTable" bordered />
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">物料明细</h3>
          <BasicTable @register="registerWorkOrderDetailTable" bordered />
        </div>
      </div>
      <template #footer>
        <a-button @click="cancelChoiceOrder">关闭</a-button>
        <a-button type="primary" @click="confirmChoiceOrder">确认</a-button>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Card, Modal, message, Button } from 'ant-design-vue';
import { BasicTable, useTable, TableAction } from '@/components/Table';
import { ProForm, ProFormText, ProFormDatePicker, ProFormSelect } from '@/components/ProForm';
import { Icon } from '/@/components/Icon';
import { useI18n } from 'vue-i18n';
import { useModal } from '/@/components/Modal';
import { Loading } from '/@/components/Loading';
import { save, examine, remove, getCode, submitOrder as apiSubmitOrder } from '@/api/outsource/outReturn';
import { usePermission } from '/@/hooks/web/usePermission';
import { useDrawer } from '/@/components/Drawer';

const { t } = useI18n();
const { hasPermission } = usePermission();
const { createDrawer } = useDrawer();
const { createModal } = useModal();

// 状态管理
const showModel = ref<'list' | 'order' | 'detail' | 'statistical'>('list');
const orderId = ref<string>('');
const voucherState = ref<number>(-1);
const loading = ref<boolean>(false);
const editMask = ref<boolean>(true);
const printVisible = ref<boolean>(false);
const incomingPrintData = ref<any>({});
const sourceCode = ref<string>('DelegateReturn');
const voucherTitle = ref<string>('委外退料单');
const choiceOrderVisible = ref<boolean>(false);

// 表格数据
const tableData = ref<any[]>([]);
const orderHeaderData = ref<any>({});
const orderFooterData = ref<any>({});
const workOrderMainData = ref<any[]>([]);
const workOrderDetailData = ref<any[]>([]);
const searchData = ref<any>({});

// 搜索表单schema
const searchSchema = [
  {
    field: 'billDate',
    component: 'RangePicker',
    label: '单据日期',
    componentProps: {
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'billCode',
    component: 'Input',
    label: '单据编号',
  },
  {
    field: 'vendorName',
    component: 'Select',
    label: '委外供应商',
    componentProps: {
      showSearch: true,
      optionFilterProp: 'children',
    },
    // 实际使用时需要添加options
  },
];

// 表头表单schema
const headerSchema = [
  {
    field: 'billCode',
    component: 'Input',
    label: '单据编号',
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'billDate',
    component: 'DatePicker',
    label: '单据日期',
    componentProps: {
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'vendorName',
    component: 'Select',
    label: '委外供应商',
    required: true,
    componentProps: {
      showSearch: true,
      optionFilterProp: 'children',
    },
    // 实际使用时需要添加options
  },
  {
    field: 'contactPerson',
    component: 'Input',
    label: '联系人',
  },
  {
    field: 'contactPhone',
    component: 'Input',
    label: '联系电话',
  },
  {
    field: 'remark',
    component: 'Input.TextArea',
    label: '备注',
    componentProps: {
      rows: 2,
    },
  },
];

// 表尾表单schema
const footerSchema = [
  {
    field: 'totalAmount',
    component: 'Input',
    label: '总金额',
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'creator',
    component: 'Input',
    label: '制单人',
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'createTime',
    component: 'DatePicker',
    label: '制单日期',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      disabled: true,
    },
  },
  {
    field: 'auditor',
    component: 'Input',
    label: '审核人',
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'auditTime',
    component: 'DatePicker',
    label: '审核日期',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      disabled: true,
    },
  },
];

// 选委外订单搜索schema
const choiceOrderSearchSchema = [
  {
    field: 'productionWorkCode',
    component: 'Input',
    label: '加工单号',
  },
  {
    field: 'vendorName',
    component: 'Input',
    label: '委外供应商',
  },
  {
    field: 'inventoryName',
    component: 'Input',
    label: '产品名称',
  },
];

// 列表表格列配置
const columns = [
  { title: '单据编号', dataIndex: 'billCode', width: 150 },
  { title: '单据日期', dataIndex: 'billDate', width: 120 },
  { title: '委外供应商', dataIndex: 'vendorName', width: 180 },
  { title: '总金额', dataIndex: 'totalAmount', width: 120 },
  { title: '制单人', dataIndex: 'creator', width: 100 },
  { title: '制单日期', dataIndex: 'createTime', width: 180 },
  { title: '审核人', dataIndex: 'auditor', width: 100 },
  { title: '审核日期', dataIndex: 'auditTime', width: 180 },
  { title: '状态', dataIndex: 'status', width: 100, customRender: ({ text }) => {
    if (text === 0) return '待审核';
    if (text === 1) return '已审核';
    if (text === 2) return '已确认';
    if (text === 10) return '关闭';
    return '未知';
  }},
  { title: '操作', width: 150, fixed: 'right', customRender: ({ record }) => (
    <div class="flex space-x-2">
      <a-button type="primary" size="small" @click="handleEdit(record)">编辑</a-button>
      <a-button danger size="small" @click="handleDelete(record.id)">删除</a-button>
    </div>
  )},
];

// 订单表格列配置
const orderColumns = [
  { title: '序号', dataIndex: 'index', width: 60, slot: 'number' },
  { title: '物料编码', dataIndex: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
  { title: '单价', dataIndex: 'unitPrice', width: 100 },
  { title: '金额', dataIndex: 'amount', width: 120 },
  { title: '备注', dataIndex: 'remark', width: 150 },
  { title: '操作', width: 120, fixed: 'right', slot: 'action' },
];

// 明细表格列配置
const detailColumns = [
  { title: '单据编号', dataIndex: 'billCode', width: 150 },
  { title: '物料编码', dataIndex: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
  { title: '单价', dataIndex: 'unitPrice', width: 100 },
  { title: '金额', dataIndex: 'amount', width: 120 },
  { title: '日期', dataIndex: 'createTime', width: 180 },
];

// 统计表格列配置
const statisticalColumns = [
  { title: '物料编码', dataIndex: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '总数量', dataIndex: 'totalQuantity', width: 100 },
  { title: '总金额', dataIndex: 'totalAmount', width: 120 },
  { title: '单据数', dataIndex: 'billCount', width: 100 },
];

// 委外订单主表列配置
const workOrderMainColumns = [
  { title: '加工单号', dataIndex: 'productionWorkCode', width: 150 },
  { title: '委外供应商', dataIndex: 'vendorName', width: 180 },
  { title: '产品编码', dataIndex: 'productCode', width: 120 },
  { title: '产品名称', dataIndex: 'productName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
  { title: '预计开工日期', dataIndex: 'planStartDate', width: 150 },
  { title: '预计完工日期', dataIndex: 'planEndDate', width: 150 },
];

// 委外订单明细表列配置
const workOrderDetailColumns = [
  { title: '物料编码', dataIndex: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
  { title: '已领数量', dataIndex: 'issuedQuantity', width: 100 },
  { title: '未领数量', dataIndex: 'unissuedQuantity', width: 100 },
];

// 注册表格
const { registerTable, tableContext } = useTable({
  columns,
  dataSource: tableData,
  bordered: true,
  pagination: true,
  rowKey: 'id',
});

// 注册订单表格
const { registerOrderTable } = useTable({
  columns: orderColumns,
  dataSource: tableData,
  bordered: true,
  pagination: false,
  rowKey: 'id',
});

// 注册明细表格
const { registerDetailTable } = useTable({
  columns: detailColumns,
  dataSource: [], // 实际使用时需要设置数据源
  bordered: true,
  pagination: true,
  rowKey: 'id',
});

// 注册统计表格
const { registerStatisticalTable } = useTable({
  columns: statisticalColumns,
  dataSource: [], // 实际使用时需要设置数据源
  bordered: true,
  pagination: true,
  rowKey: 'id',
});

// 注册委外订单主表
const { registerWorkOrderMainTable } = useTable({
  columns: workOrderMainColumns,
  dataSource: workOrderMainData,
  bordered: true,
  pagination: false,
  rowKey: 'id',
  rowSelection: {
    type: 'radio',
    onChange: (selectedRowKeys, selectedRows) => {
      if (selectedRows.length > 0) {
        // 加载对应的物料明细
        loadWorkOrderDetails(selectedRows[0].id);
      }
    },
  },
});

// 注册委外订单明细表
const { registerWorkOrderDetailTable } = useTable({
  columns: workOrderDetailColumns,
  dataSource: workOrderDetailData,
  bordered: true,
  pagination: false,
  rowKey: 'id',
  rowSelection: {
    type: 'checkbox',
  },
});

// 处理搜索
const handleSearch = (values: any) => {
  // 实际搜索逻辑
  console.log('搜索参数:', values);
};

// 切换到列表视图
const switchToList = () => {
  showModel.value = 'list';
};

// 切换到订单视图
const handleEdit = (record: any) => {
  orderId.value = record.id;
  voucherState.value = record.status;
  // 加载订单数据
  loadOrderData(record.id);
  showModel.value = 'order';
};

// 切换到明细视图
const switchToDetail = () => {
  showModel.value = 'detail';
  // 加载明细数据
  loadDetailData();
};

// 切换到统计视图
const switchToStatistical = () => {
  showModel.value = 'statistical';
  // 加载统计数据
  loadStatisticalData();
};

// 新增
const newForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  orderId.value = '';
  // 初始化表单
  initForm();
};

// 选委外订单
const choiceBillsWork = () => {
  choiceOrderVisible.value = true;
  // 加载委外订单数据
  loadWorkOrderMainData();
};

// 搜索委外订单
const searchBillsWork = () => {
  // 实际搜索逻辑
  console.log('搜索委外订单参数:', searchData.value);
  loadWorkOrderMainData();
};

// 取消选择委外订单
const cancelChoiceOrder = () => {
  choiceOrderVisible.value = false;
};

// 确认选择委外订单
const confirmChoiceOrder = () => {
  // 处理选择的数据
  message.success('选择成功');
  choiceOrderVisible.value = false;
};

// 保存
const handleSave = () => {
  if (!orderHeaderData.value.vendorName) {
    message.warning('请填写委外供应商');
    return;
  }
  loading.value = true;
  const requestData = {
    id: orderId.value,
    header: orderHeaderData.value,
    details: tableData.value,
    footer: orderFooterData.value,
  };
  save(requestData).then((response) => {
    loading.value = false;
    if (response.code === 200) {
      message.success('保存成功');
      editMask.value = true;
      if (!orderId.value) {
        orderId.value = response.data.id;
        // 获取最新数据
        loadOrderData(response.data.id);
      }
    } else {
      message.error(response.message || '保存失败');
    }
  }).catch(() => {
    loading.value = false;
    message.error('保存失败');
  });
};

// 提交
const handleSubmit = () => {
  if (!orderId.value) {
    message.warning('请先保存订单');
    return;
  }
  loading.value = true;
  const data = {
    id: orderId.value,
    status: 0, // 提交状态
  };
  apiSubmitOrder(data).then((response) => {
    loading.value = false;
    if (response.code === 200) {
      message.success('提交成功');
      voucherState.value = 0;
    } else {
      message.error(response.message || '提交失败');
    }
  }).catch(() => {
    loading.value = false;
    message.error('提交失败');
  });
};

// 取消
const handleCancel = () => {
  if (showModel.value === 'order') {
    showModel.value = 'list';
  }
};

// 删除
const handleDelete = (id: string) => {
  createModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    onOk: () => {
      loading.value = true;
      remove(id).then((response) => {
        loading.value = false;
        if (response.code === 200) {
          message.success('删除成功');
          // 刷新列表
          refreshList();
        } else {
          message.error(response.message || '删除失败');
        }
      }).catch(() => {
        loading.value = false;
        message.error('删除失败');
      });
    },
  });
};

// 编辑行
const handleEditRow = (index: number) => {
  // 实际编辑行逻辑
  message.info('编辑行功能待实现');
};

// 删除行
const handleDeleteRow = (index: number) => {
  tableData.value.splice(index, 1);
  message.success('删除行成功');
};

// 打印订单
const printOrder = () => {
  if (!orderId.value) {
    message.warning('请先选择订单');
    return;
  }
  printVisible.value = true;
  // 加载打印数据
  loadPrintData(orderId.value);
};

// 取消打印
const cancelPrint = () => {
  printVisible.value = false;
};

// 确认打印
const confirmPrint = () => {
  // 实际打印逻辑
  message.success('打印成功');
  printVisible.value = false;
};

// 导出明细
const exportDetail = () => {
  // 实际导出逻辑
  message.info('导出功能待实现');
};

// 初始化表单
const initForm = () => {
  orderHeaderData.value = {
    billDate: new Date(),
  };
  orderFooterData.value = {};
  tableData.value = [];
};

// 加载订单数据
const loadOrderData = (id: string) => {
  loading.value = true;
  // 实际加载订单数据逻辑
  setTimeout(() => {
    loading.value = false;
    // 模拟数据
    orderHeaderData.value = {
      billCode: 'WCTL20210628001',
      billDate: '2021-06-28',
      vendorName: '供应商A',
      contactPerson: '张三',
      contactPhone: '13800138000',
      remark: '测试委外退料单',
    };
    tableData.value = [
      {
        id: '1',
        materialCode: 'MAT001',
        materialName: '原材料A',
        specification: '规格A',
        unit: '个',
        quantity: 10,
        unitPrice: 10,
        amount: 100,
        remark: '',
      },
      {
        id: '2',
        materialCode: 'MAT002',
        materialName: '原材料B',
        specification: '规格B',
        unit: 'kg',
        quantity: 5,
        unitPrice: 20,
        amount: 100,
        remark: '',
      },
    ];
    orderFooterData.value = {
      totalAmount: 200,
      creator: '管理员',
      createTime: '2021-06-28 16:30:00',
      auditor: '审核员',
      auditTime: '2021-06-28 17:00:00',
    };
  }, 1000);
};

// 加载委外订单主表数据
const loadWorkOrderMainData = () => {
  loading.value = true;
  // 实际加载数据逻辑
  setTimeout(() => {
    loading.value = false;
    workOrderMainData.value = [
      {
        id: '1',
        productionWorkCode: 'WCGD20210628001',
        vendorName: '供应商A',
        productCode: 'PRO001',
        productName: '产品A',
        specification: '规格A',
        unit: '个',
        quantity: 100,
        planStartDate: '2021-06-28',
        planEndDate: '2021-07-05',
      },
      {
        id: '2',
        productionWorkCode: 'WCGD20210628002',
        vendorName: '供应商B',
        productCode: 'PRO002',
        productName: '产品B',
        specification: '规格B',
        unit: '个',
        quantity: 200,
        planStartDate: '2021-06-29',
        planEndDate: '2021-07-10',
      },
    ];
  }, 1000);
};

// 加载委外订单明细数据
const loadWorkOrderDetails = (id: string) => {
  loading.value = true;
  // 实际加载数据逻辑
  setTimeout(() => {
    loading.value = false;
    workOrderDetailData.value = [
      {
        id: '1',
        materialCode: 'MAT001',
        materialName: '原材料A',
        specification: '规格A',
        unit: '个',
        quantity: 100,
        issuedQuantity: 90,
        unissuedQuantity: 10,
      },
      {
        id: '2',
        materialCode: 'MAT002',
        materialName: '原材料B',
        specification: '规格B',
        unit: 'kg',
        quantity: 50,
        issuedQuantity: 45,
        unissuedQuantity: 5,
      },
    ];
  }, 1000);
};

// 加载明细数据
const loadDetailData = () => {
  // 实际加载明细数据逻辑
};

// 加载统计数据
const loadStatisticalData = () => {
  // 实际加载统计数据逻辑
};

// 加载打印数据
const loadPrintData = (id: string) => {
  // 实际加载打印数据逻辑
  incomingPrintData.value = '打印数据预览';
};

// 刷新列表
const refreshList = () => {
  // 实际刷新列表逻辑
};

// 处理表头变化
const handleHeaderChange = (values: any) => {
  orderHeaderData.value = { ...orderHeaderData.value, ...values };
};

// 处理选委外订单搜索变化
const handleChoiceOrderSearch = (values: any) => {
  searchData.value = { ...searchData.value, ...values };
};

// 初始化
onMounted(() => {
  // 加载列表数据
  refreshList();
});
</script>

<style lang="less" scoped>
.out-return-container {
  padding: 16px;
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .space-x-2 > * {
    margin-right: 8px;
  }
  .mt-4 {
    margin-top: 16px;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
  .text-lg {
    font-size: 16px;
  }
  .font-bold {
    font-weight: bold;
  }
  .text-sm {
    font-size: 12px;
  }
  .rounded-full {
    border-radius: 9999px;
  }
  .bg-yellow-100 {
    background-color: #fff7e6;
  }
  .text-yellow-800 {
    color: #734a12;
  }
  .bg-green-100 {
    background-color: #e6ffed;
  }
  .text-green-800 {
    color: #1a6632;
  }
  .bg-blue-100 {
    background-color: #e6f7ff;
  }
  .text-blue-800 {
    color: #123a5a;
  }
  .bg-gray-100 {
    background-color: #f5f5f5;
  }
  .text-gray-800 {
    color: #333;
  }
  .px-2 {
    padding-left: 8px;
    padding-right: 8px;
  }
  .py-1 {
    padding-top: 4px;
    padding-bottom: 4px;
  }
  .p-4 {
    padding: 16px;
  }
}
</style>