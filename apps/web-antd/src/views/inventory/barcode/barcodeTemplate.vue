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
            <a-col :span="2">
              <div class="btns" @click="submitRequest">
                <Icon class="btns-icon" icon="save" />
                <div class="btns-text">保存</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="editDataFun(2)">
                <Icon class="btns-icon" icon="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="remove">
                <Icon class="btns-icon" icon="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="showModel === 'order'">{{ 'test' }}</a-col>
            <a-col :span="2">
              <div class="btns" @click="printPreview_1()">
                <Icon class="btns-icon" icon="profile" />
                <div class="btns-text">预览模板</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 列表视图 -->
      <div class="table-wrapper-box" v-show="showModel === 'list'">{{ 'test' }}</div>

      <!-- 表单视图 -->
      <div class="order-warpper-box" v-show="showModel === 'order'">{{ 'test' }}</div>
    </div>

    <!-- 条码工具组件 -->
    <BarcodeUtil ref="printPlugIn" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Button, Form, Input, Select, message, Modal } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { Icon } from '@/components/Icon';
import { saveTemplate, listTemplate, deleteTemplate, getVoucherDesign } from '@/api/inventory/barcode';
import BarcodeUtil from './barcodeUtil.vue';

// 状态管理
const showModel = ref('list'); // list: 列表视图, order: 表单视图
const voucherState = ref(0);
const data = ref([]);
const selectedKeys = ref([]);
const selectedRows = ref([]);
const businessObject = ref([]);
const businessObjectMap = ref(new Map());
const requestData = ref({
  name: '',
  code: '',
  applicableObject: '',
  content: '',
  remark: '',
});

// 样式配置
const labelCol = ref({ span: 6 });
const wrapperCol = ref({ span: 18 });
const grid = ref({
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 24,
  xxl: 24,
});

// 表格列定义
const columns = [
  { title: '模板编码', dataIndex: 'code' },
  { title: '模板名称', dataIndex: 'name' },
  { title: '适用对象', dataIndex: 'applicableObject', customRender: ({ text }) => businessObjectMap.value.get(text) || '' },
  { title: '备注', dataIndex: 'remarks' },
];

// 生命周期
onMounted(() => {
  queryBusinessObject();
  queryTemplates();
});

// 查询业务对象
const queryBusinessObject = async () => {
  try {
    const res = await getVoucherDesign({});
    if (res.success) {
      businessObject.value = res.data || [];
      // 构建业务对象映射
      businessObject.value.forEach(item => {
        businessObjectMap.value.set(item.voucherTypeCode, item.voucherTypeName);
      });
    }
  } catch (error) {
    message.error('获取业务对象失败');
  }
};

// 查询模板列表
const queryTemplates = async () => {
  try {
    const res = await listTemplate({});
    if (res.success) {
      data.value = res.data || [];
    }
  } catch (error) {
    message.error('获取模板列表失败');
  }
};

// 切换视图
const changeView = (view: string) => {
  showModel.value = view;
};

// 编辑数据（新增/修改）
const editDataFun = (type: number) => {
  if (type === 1) {
    // 新增
    showModel.value = 'order';
    requestData.value = {
      name: '',
      code: '',
      applicableObject: '',
      content: '',
      remark: '',
    };
  } else if (type === 2) {
    // 修改
    if (selectedKeys.value.length === 0) {
      message.warning('请选择一条记录');
      return;
    }
    showModel.value = 'order';
    // 这里应该加载选中记录的数据
  }
};

// 提交请求（保存模板）
const submitRequest = async () => {
  if (!requestData.value.code || !requestData.value.name) {
    message.warning('模板编码和名称不能为空');
    return;
  }

  try {
    const res = await saveTemplate(requestData.value);
    if (res.success) {
      message.success('保存成功');
      showModel.value = 'list';
      queryTemplates();
    }
  } catch (error) {
    message.error('保存失败');
  }
};

// 删除模板
const remove = async () => {
  if (selectedKeys.value.length === 0) {
    message.warning('请选择一条记录');
    return;
  }

  try {
    const res = await deleteTemplate({ id: selectedKeys.value[0] });
    if (res.success) {
      message.success('删除成功');
      queryTemplates();
      selectedKeys.value = [];
    }
  } catch (error) {
    message.error('删除失败');
  }
};

// 设计模板
const myBlankDesign = () => {
  message.info('设计模板功能待实现');
};

// 预览模板
const printPreview = () => {
  message.info('预览模板功能待实现');
};

// 预览模板（另一个方法）
const printPreview_1 = () => {
  printPreview();
};

// 选择行变化
const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedKeys.value = selectedRowKeys;
  selectedRows.value = selectedRows;
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

.template-barcode {
  margin-bottom: 10px;
}
</style>