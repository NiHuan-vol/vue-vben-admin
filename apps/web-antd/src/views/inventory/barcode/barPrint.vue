<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper warehouse-type-wrapper requisition-set-wrapper" style="margin: 2px 8px;">
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2">
              <div class="btns" @click="editDataFun(1)">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="showModel === 'order'">
              <div class="btns" @click="openOrderView()">
                <Icon class="btns-icon" icon="file" />
                <div class="btns-text">选单</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="printPreview">
                <Icon class="btns-icon" icon="save" />
                <div class="btns-text">打印预览</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <div class="order-warpper-box">
        <section>
          <div><span class="audit-status" style="z-index: 78" v-show="voucherState === 1">已审</span></div>
          <a-form-model :layout="formLayout">
            <div class="header-box">
              <a-row class="order-dynamic-form-wrapper">
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="业务对象名称" :rules="[{ required: true, message: '', trigger: 'input' }]">
                    <a-input v-model.trim="businessObject" />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="明细条码规则" :rules="[{ required: true, message: '', trigger: 'input' }]">
                    <a-input v-model.trim="businessRule" />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="明细条码模板" :rules="[{ required: true, message: '', trigger: 'input' }]">
                    <a-input-group>
                      <a-row :gutter="0">
                        <a-col :span="16">
                          <a-select style="width: 100%;" v-model="businessTemplate">
                            <a-select-option value="template1">模板1</a-select-option>
                            <a-select-option value="template2">模板2</a-select-option>
                          </a-select>
                        </a-col>
                        <a-col :span="8">
                          <a-button @click="viewTemplate">查看模板</a-button>
                        </a-col>
                      </a-row>
                    </a-input-group>
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div>
          </a-form-model>
        </section>
        <div class="table-wrapper-box">
          <BasicTable
            :rowSelection="{ selectedRowKeys: selectedKeys, onChange: onSelectChange }"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
            bordered
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Button, Form, Input, Select, message } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { Icon } from '@/components/Icon';
import { getVoucherDesign } from '@/api/inventory/barcode';

// 状态管理
const showModel = ref('list');
const voucherState = ref(0);
const businessObject = ref('');
const businessRule = ref('');
const businessTemplate = ref('template1');
const selectedKeys = ref([]);
const selectedRows = ref([]);

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

// 表格列定义
const columns = [
  { title: '单号', dataIndex: 'code' },
  { title: '批次', dataIndex: 'batch' },
  { title: '编号', dataIndex: 'number' },
  { title: '工序', dataIndex: 'process' },
  { title: '条码', dataIndex: 'barcode' },
];

// 模拟数据
const dataSource = ref([
  { code: 'XXY1-01', batch: '1', number: 'P1面高幢12', process: '1/8', barcode: '215689654871' },
  { code: 'XXY1-02', batch: '1', number: 'P1面高幢12', process: '2/8', barcode: '548512012302' },
  { code: 'XXY1-03', batch: '1', number: 'P1面高幢12', process: '3/8', barcode: '452102130212' },
  { code: 'XXY1-04', batch: '1', number: 'P1面高幢12', process: '4/8', barcode: '231241201242' },
  { code: 'XXY1-05', batch: '1', number: 'P1面高幢12', process: '5/8', barcode: '120512032121' },
]);

// 生命周期
onMounted(() => {
  getVoucherDesignData();
});

// 获取业务对象
const getVoucherDesignData = async () => {
  try {
    const res = await getVoucherDesign({});
    if (res.success) {
      businessObject.value = res.data || '';
    }
  } catch (error) {
    message.error('获取业务对象失败');
  }
};

// 查看模板
const viewTemplate = () => {
  message.info('查看模板功能待实现');
};

// 选单
const openOrderView = () => {
  message.info('选单功能待实现');
};

// 编辑数据
const editDataFun = (type: number) => {
  if (type === 1) {
    // 新增
    showModel.value = 'order';
    businessObject.value = '';
    businessRule.value = '';
    businessTemplate.value = 'template1';
  }
};

// 打印预览
const printPreview = () => {
  try {
    // 尝试加载LODOP控件
    const LODOP = window['getLodop']();
    if (!LODOP) {
      message.error('未安装打印控件，请先安装');
      return;
    }

    LODOP.PRINT_INIT('条码打印预览');
    generatePrintContent(LODOP);
    LODOP.PREVIEW();
  } catch (error) {
    message.error('打印功能出错: ' + (error as Error).message);
  }
};

// 生成打印内容
const generatePrintContent = (LODOP: any) => {
  for (let i = 0; i < dataSource.value.length; i++) {
    LODOP.NewPage();

    LODOP.SET_PRINT_MODE('PROGRAM_CONTENT_BYVAR', true);
    // 添加表格
    LODOP.ADD_PRINT_TABLE(
      127, 178, 393, 229,
      `<table style="border-collapse:collapse;width:268.6pt;margin-left:6.75pt;margin-right:6.75pt;border:1px solid black;">
        <tr style="height:13.7pt;">
          <td colspan="4" style="padding:0pt 5.4pt;border:1px solid black;">
            <p style="text-align:center;line-height:24pt;"><b style="font-family:幼圆;font-size:10.5pt;">重庆新西亚铝业（集团）股份有限公司</b></p>
          </td>
        </tr>
        <tr style="height:30.9pt;">
          <td style="width:21.25pt;padding:0pt 5.4pt;border:1px solid black;">
            <p style="line-height:12pt;"><span style="font-family:幼圆;font-size:9pt;">单号</span></p>
          </td>
          <td style="width:144.7pt;padding:0pt 5.4pt;border:1px solid black;"></td>
          <td style="width:25.4pt;padding:0pt 5.4pt;border:1px solid black;">
            <p style="text-align:center;line-height:12pt;"><span style="font-family:幼圆;font-size:9pt;">批次</span></p>
          </td>
          <td style="width:77.25pt;padding:0pt 5.4pt;border:1px solid black;"></td>
        </tr>
        <tr style="height:34.95pt;">
          <td style="width:21.25pt;padding:0pt 5.4pt;border:1px solid black;">
            <p style="line-height:12pt;"><span style="font-family:幼圆;font-size:9pt;">编号</span></p>
          </td>
          <td colspan="2" style="width:170.1pt;padding:0pt 5.4pt;border:1px solid black;"></td>
          <td style="width:77.25pt;padding:0pt 5.4pt;border:1px solid black;"></td>
        </tr>
        <tr style="height:50.1pt;">
          <td colspan="3" style="width:191.35pt;padding:0pt 5.4pt;border:1px solid black;"></td>
          <td style="width:77.25pt;padding:0pt 5.4pt;border:1px solid black;"></td>
        </tr>
      </table>`
    );

    // 添加条码
    LODOP.ADD_PRINT_BARCODE(
      277, 216, 215, 46, "128A", dataSource.value[i].barcode
    );

    // 添加文本
    LODOP.ADD_PRINT_TEXT(217, 458, 79, 40, dataSource.value[i].process);
    LODOP.SET_PRINT_STYLEA(0, "FontName", "幼圆");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 24);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.SET_PRINT_STYLEA(0, "Vorient", 3);

    LODOP.ADD_PRINT_TEXT(174, 237, 158, 33, dataSource.value[i].code);
    LODOP.SET_PRINT_STYLEA(0, "FontName", "幼圆");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 18);

    LODOP.ADD_PRINT_TEXT(223, 235, 201, 30, dataSource.value[i].number);
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 18);

    LODOP.ADD_PRINT_TEXT(171, 478, 41, 40, dataSource.value[i].batch);
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 20);
  }
};

// 选择行变化
const onSelectChange = (selectedRowKeys: string[]) => {
  selectedKeys.value = selectedRowKeys;
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

.barcode-box {
  .ant-form-item {
    margin-bottom: 0px;
  }
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

audit-status {
  display: inline-block;
  padding: 2px 8px;
  background-color: #52c41a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}
</style>