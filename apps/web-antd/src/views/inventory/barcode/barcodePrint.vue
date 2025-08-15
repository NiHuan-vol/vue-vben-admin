<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper warehouse-type-wrapper requisition-set-wrapper" style="margin: 2px 8px;">
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="showModel === 'order'">{{ 'test' }}</a-col>
            <a-col :span="2" v-if="showModel === 'order'">{{ 'test' }}</a-col>
            <a-col :span="2" v-if="showModel === 'order'">{{ 'test' }}</a-col>
            <a-col :span="2" v-if="showModel === 'list'">{{ 'test' }}</a-col>
            <a-col :span="2" :class="showModel === 'order' ? '' : 'btns-disable'">
              <div class="btns" @click="showModel === 'order' ? newAdd() : ''">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" :class="showModel === 'order' ? '' : 'btns-disable'">
              <div class="btns" @click="showModel === 'order' ? generateByline(3) : ''">
                <Icon class="btns-icon" icon="save" />
                <div class="btns-text">保存</div>
              </div>
            </a-col>
            <a-col :span="2" :class="showModel === 'list' ? '' : 'btns-disable'">
              <div class="btns" @click="showModel === 'list' ? showDetails() : ''">
                <Icon class="btns-icon" icon="container" />
                <div class="btns-text">查看详情</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 打印记录列表视图 -->
      <div class="table-wrapper-box" v-show="showModel === 'list'">{{ 'test' }}</div>

      <!-- 条码打印视图 -->
      <div class="order-warpper-box" v-show="showModel === 'order'">{{ 'test' }}</div>
    </div>

    <!-- 选单弹窗 -->
    <Modal v-model:visible="visible" :title="businessObjectName + '列表'" :width="1000" @cancel="closeCheckOrder">{{ 'test' }}</Modal>

    <!-- 打印预览弹窗 -->
    <Modal v-model:visible="printView" title="打印预览" :width="800" @cancel="() => { printView = false; }">{{ 'test' }}</Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, provide } from 'vue';
import { Button, Form, Input, Select, message, Modal } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { Icon } from '@/components/Icon';
import { TableCell } from './tableEditCompontent';
import { queryBusinessObject, queryBarcodeRules, queryBarcodeTemplates, queryPrintRecords, generateBarcodes } from '@/api/inventory/barcode';

// 状态管理
const showModel = ref('list'); // list: 打印记录视图, order: 打印条码视图
const voucherState = ref(0);
const businessObject = ref([]);
const businessObjectName = ref('');
const ruleJson = ref([]);
const ruleId = ref('');
const templateJson = ref([]);
const templateId = ref('');
const remark = ref('');
const dataList = ref([]);
const selectedKeysList = ref([]);
const dataSource = ref([]);
const dataSourcePrint = ref([]);
const visible = ref(false);
const printView = ref(false);
const isRouterAlive = ref(true);
const loading = ref(false);
const datailsDataSource = ref([]);
const selectedKeys = ref([]);

// 样式配置
const formLayout = ref('horizontal');
const labelCol = ref({ span: 10 });
const wrapperCol = ref({ span: 14 });
const grid = ref({
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
});

// 分页配置
const paginationList = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

const paginationDetails = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

// 表格列定义
const columns = [
  { title: '打印单号', dataIndex: 'printCode' },
  { title: '业务对象', dataIndex: 'businessObject' },
  { title: '规则名称', dataIndex: 'ruleName' },
  { title: '模板名称', dataIndex: 'templateName' },
  { title: '打印时间', dataIndex: 'printTime' },
  { title: '打印人', dataIndex: 'printUser' },
  { title: '状态', dataIndex: 'status', customRender: ({ text }) => (text === 1 ? '已打印' : '未打印') },
];

const columnsDataSource = [
  { title: '序号', dataIndex: 'index', width: 50, customRender: ({ index }) => index + 1 },
  { title: '源单类型', dataIndex: 'sourceVoucherType' },
  { title: '源单编号', dataIndex: 'sourceVoucherCode' },
  { title: '物料编码', dataIndex: 'materialCode' },
  { title: '物料名称', dataIndex: 'materialName' },
  { title: '批次', dataIndex: 'batch' },
  { title: '数量', dataIndex: 'quantity' },
  { title: '包装数', dataIndex: 'minPackageQuantity' },
  { title: '预计打印数', dataIndex: 'expectedPrintQuantity' },
  { title: '备注', dataIndex: 'remark' },
];

const columnsPrint = [
  { title: '序号', dataIndex: 'index', width: 50, customRender: ({ index }) => index + 1 },
  { title: '条码内容', dataIndex: 'barcodeContent' },
  { title: '数量', dataIndex: 'quantity' },
];

const datailColumns = [
  { title: '序号', dataIndex: 'index', width: 50, customRender: ({ index }) => index + 1 },
  { title: '源单类型', dataIndex: 'sourceVoucherType' },
  { title: '源单编号', dataIndex: 'sourceVoucherCode' },
  { title: '物料编码', dataIndex: 'materialCode' },
  { title: '物料名称', dataIndex: 'materialName' },
  { title: '批次', dataIndex: 'batch' },
  { title: '数量', dataIndex: 'quantity' },
];

const slotArray = ['quantity'];

// 生命周期
onMounted(() => {
  queryBusinessObjectData();
  queryPrintRecordsData();
});

// 切换视图
const changeView = (view: string) => {
  showModel.value = view;
  if (view === 'order') {
    queryBarcodeRulesData();
    queryBarcodeTemplatesData();
  }
};

// 查询业务对象
const queryBusinessObjectData = async () => {
  try {
    const res = await queryBusinessObject({});
    if (res.success) {
      businessObject.value = res.data || [];
    }
  } catch (error) {
    message.error('获取业务对象失败');
  }
};

// 业务对象变更
const businessChange = (value: string) => {
  businessObjectName.value = value;
};

// 查询条码规则
const queryBarcodeRulesData = async () => {
  try {
    const res = await queryBarcodeRules({});
    if (res.success) {
      ruleJson.value = res.data || [];
    }
  } catch (error) {
    message.error('获取条码规则失败');
  }
};

// 规则变更
const ruleChange = (value: string) => {
  ruleId.value = value;
};

// 查询条码模板
const queryBarcodeTemplatesData = async () => {
  try {
    const res = await queryBarcodeTemplates({});
    if (res.success) {
      templateJson.value = res.data || [];
    }
  } catch (error) {
    message.error('获取条码模板失败');
  }
};

// 模板变更
const templateChange = (value: string) => {
  templateId.value = value;
};

// 查询打印记录
const queryPrintRecordsData = async () => {
  try {
    const res = await queryPrintRecords({
      page: paginationList.value.current,
      pageSize: paginationList.value.pageSize,
    });
    if (res.success) {
      dataList.value = res.data.records || [];
      paginationList.value.total = res.data.total || 0;
    }
  } catch (error) {
    message.error('获取打印记录失败');
  }
};

// 新增
const newAdd = () => {
  dataSource.value = [];
  dataSourcePrint.value = [];
  remark.value = '';
};

// 选取打印明细
const openOrderView = () => {
  visible.value = true;
  // 这里应该加载源单数据
};

// 生成条码
const generateByline = async (type: number) => {
  if (dataSource.value.length === 0) {
    message.warning('请先选取打印明细');
    return;
  }

  try {
    loading.value = true;
    const res = await generateBarcodes({
      type: type,
      ruleId: ruleId.value,
      templateId: templateId.value,
      details: dataSource.value,
    });
    if (res.success) {
      dataSourcePrint.value = res.data || [];
      message.success('生成条码成功');
    }
  } catch (error) {
    message.error('生成条码失败');
  } finally {
    loading.value = false;
  }
};

// 清空源单明细
const clearDataSource = () => {
  dataSource.value = [];
};

// 清空条码明细
const clearDataSourcePrint = () => {
  dataSourcePrint.value = [];
};

// 打印预览
const printPreviewLodop = () => {
  if (dataSourcePrint.value.length === 0) {
    message.warning('请先生成条码');
    return;
  }

  try {
    // 尝试加载LODOP控件
    const LODOP = window['getLodop']();
    if (!LODOP) {
      message.error('未安装打印控件，请先安装');
      return;
    }

    LODOP.PRINT_INIT('条码打印预览');
    // 这里应该生成打印内容
    LODOP.PREVIEW();
  } catch (error) {
    message.error('打印功能出错: ' + (error as Error).message);
  }
};

// 查看模板
const showTemplate = () => {
  message.info('查看模板功能待实现');
};

// 查看详情
const showDetails = () => {
  if (selectedKeysList.value.length === 0) {
    message.warning('请选择一条记录');
    return;
  }
  // 这里应该显示详情
};

// 关闭选单弹窗
const closeCheckOrder = () => {
  visible.value = false;
  selectedKeys.value = [];
};

// 确认选单
const handleOk = () => {
  if (selectedKeys.value.length === 0) {
    message.warning('请选择要打印的明细');
    return;
  }
  // 这里应该处理选中的明细
  visible.value = false;
};

// 选择行变化（列表视图）
const onSelectChangeList = (selectedRowKeys: string[]) => {
  selectedKeysList.value = selectedRowKeys;
};

// 选择行变化（选单弹窗）
const onSelectChange = (selectedRowKeys: string[]) => {
  selectedKeys.value = selectedRowKeys;
};

// 单元格变化
const onCellChange = (index: number, key: string, value: any) => {
  if (key === 'expectedPrintQuantity' || key === 'quantity' || key === 'minPackageQuantity' || key === 'remark') {
    dataSource.value[index][key] = value;
  }
};

// 格式化数字
const NumFormat = (value: any) => {
  if (value === undefined || value === null) return '';
  return Number(value).toFixed(2);
};

// 格式化单位
const unitFormart = (value: any) => {
  if (value === undefined || value === null) return '';
  return value;
};

// 转换订单名称
const conversionOrderName = (value: any) => {
  if (value === undefined || value === null) return '';
  return value;
};
</script>

<style scoped lang="less">
@import '~@/style/purchase/voucher.less';

.table-wrapper-box {
  padding: 10px;
}

.order-warpper-box {
  overflow-y: auto;
  padding: 10px;
  height: calc(100% - 45px);
}

.table-box-one {
  margin-bottom: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.table-title {
  padding: 8px 16px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #e8e8e8;
  font-weight: bold;
}

.table-button {
  padding: 8px 16px;
  border-bottom: 1px solid #e8e8e8;
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

.margin-left-10 {
  margin-left: 10px;
}

audit-status {
  display: inline-block;
  padding: 2px 8px;
  background-color: #52c41a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}
</style>