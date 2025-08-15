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
            <a-col :span="2" v-if="showModel === 'order'">
              <div class="btns" @click="changeView('list')">
                <Icon class="btns-icon" icon="unordered-list" />
                <div class="btns-text">列表</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <div class="table-wrapper-box" v-show="showModel === 'list'">
        <BasicTable
          :rowSelection="{ selectedRowKeys: selectedKeys, onChange: onSelectChange }"
          :columns="columns"
          :dataSource="data"
          :pagination="false"
          bordered
        />
      </div>
      <div class="order-warpper-box" v-show="showModel === 'order'">
        <section>
          <div><span class="audit-status" style="z-index: 78" v-show="voucherState === 1">已审</span></div>
          <a-form-model :layout="formLayout">
            <div class="header-box">
              <a-row class="order-dynamic-form-wrapper">
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="条码属性编码" :rules="[{ required: true, message: '', trigger: 'input' }]">
                    <a-input v-model.trim="requestData.code"></a-input>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="条码属性名称" :rules="[{ required: true, message: '', trigger: 'input' }]">
                    <a-input v-model.trim="requestData.name"></a-input>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="描述">
                    <a-input v-model.trim="requestData.remark"></a-input>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="类型">
                    <a-select v-model="requestData.type" style="width: 236px;">
                      <a-select-option v-for="(select, index) in typeSelect" :key="index" :value="select.key">
                        {{ select.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div>
            <div class="table-box">
              <BasicTable
                v-if="isRouterAlive"
                id="process_edit_tb"
                class="atable-edit"
                :columns="columnsAdd"
                :customRow="customClick"
                :dataSource="dataSource"
                :pagination="false"
                bordered
                :scroll="{ x: 1000, y: 384 }"
              >
                <template v-for="item in editColumnArraya" :slot="item" slot-scope="text, record, index">
                  <div :key="item">
                    <editable-cell :record="record" :col="item" :text="text" @change="onCellChange(index, item, $event)" />
                  </div>
                </template>
              </BasicTable>
            </div>
            <div class="footer-box">
              <a-row class="order-dynamic-form-wrapper">
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="创建人">
                    <a-input v-model="requestData.createUserName" :disabled="true" />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                  <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="创建时间">
                    <a-input v-model="requestData.createDate" :disabled="true" />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div>
          </a-form-model>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { BasicTable } from '@/components/Table';
import { Button, Select, Input, Form, message } from 'ant-design-vue';
import { listAttr, saveAttr, deleteAttr, getAttrObjectDetails } from '@/api/inventory/barcode';
import EditableCell from './editTable/EditableCell.vue';
import { Icon } from '@/components/Icon';

// 表格列定义
const columns = [
  { title: '条码属性编码', dataIndex: 'code' },
  { title: '条码属性名称', dataIndex: 'name' },
  { title: '描述', dataIndex: 'remark' },
  { title: '类型', dataIndex: 'type', customRender: ({ text }) => {
    const typeMap = { 1: '文本', 2: '数字', 3: '日期', 4: '单据编号' };
    return typeMap[text] || text;
  }} ,
];

// 表单列定义
const columnsAdd = [
  { title: '业务对象', dataIndex: 'voucherTypeName', slots: { customRender: 'voucherTypeName' } },
  { title: '业务字段', dataIndex: 'voucherFieldName', slots: { customRender: 'voucherFieldName' } },
  { title: '备注', dataIndex: 'remark', slots: { customRender: 'remark' } },
];

// 状态管理
const showModel = ref('list');
const data = ref([]);
const dataSource = ref([]);
const selectedKeys = ref([]);
const requestData = ref({ code: '', name: '', remark: '', type: 1, createUserName: '', createDate: '' });
const typeSelect = ref([
  { label: '文本', key: 1 },
  { label: '数字', key: 2 },
  { label: '日期', key: 3 },
  { label: '单据编号', key: 4 },
]);
const editColumnArraya = ref(['voucherTypeName', 'voucherFieldName', 'remark']);
const grid = ref({ xs: 24, sm: 24, md: 12, lg: 8, xl: 8, xxl: 6 });
const labelCol = ref({ span: 10 });
const wrapperCol = ref({ span: 14 });
const isRouterAlive = ref(true);
const voucherState = ref(0);

// 生命周期
onMounted(() => {
  loadData();
});

// 加载数据
const loadData = async () => {
  const res = await listAttr({});
  if (res.success) {
    data.value = res.data;
  }
};

// 切换视图
const changeView = (view) => {
  showModel.value = view;
};

// 选择行变化
const onSelectChange = (selectedRowKeys) => {
  selectedKeys.value = selectedRowKeys;
};

// 编辑数据
const editDataFun = (type) => {
  if (type === 1) {
    // 新增
    showModel.value = 'order';
    requestData.value = { code: '', name: '', remark: '', type: 1, createUserName: '', createDate: '' };
    dataSource.value = [{ id: 1, voucherTypeName: '', voucherFieldName: '', remark: '' }];
  } else if (type === 2) {
    // 修改
    if (selectedKeys.value.length !== 1) {
      message.warning('请选择一条数据进行编辑');
      return;
    }
    const id = selectedKeys.value[0];
    // TODO: 根据id获取详情
    showModel.value = 'order';
  }
};

// 提交请求
const submitRequest = async () => {
  // TODO: 调用保存API
  await saveAttr(requestData.value);
  showModel.value = 'list';
  loadData();
};

// 删除
const remove = async () => {
  if (selectedKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }
  // TODO: 调用删除API
  await deleteAttr({ ids: selectedKeys.value });
  loadData();
};

// 单元格变化
const onCellChange = (index, col, value) => {
  dataSource.value[index][col] = value;
};

// 自定义行点击
const customClick = (record, index) => {
  return {
    on: {
      contextmenu: (e) => {
        e.preventDefault();
        // 右键菜单逻辑
      },
    },
  };
};
</script>

<style scoped lang="less">
.content-wrapper {
  padding: 16px;
}

.btn-wrapper {
  margin-bottom: 16px;
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

.table-wrapper-box,
.order-warpper-box {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
}
</style>