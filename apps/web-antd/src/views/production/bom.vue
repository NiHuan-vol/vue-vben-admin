<template>
  <div class="credentials-bom-wrapper-bb">
    <BasicPageHeader :title="'物料清单管理'" :showBack="false" />

    <!-- 按钮区域 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex space-x-2">
        <Button type="primary" @click="handleAdd" v-if="hasPermission('create')">新增</Button>
        <Button @click="handleSave" v-if="hasPermission('edit')">保存</Button>
        <Button @click="handleAudit(1)" v-if="hasPermission('audit') && voucherState === 0">审核</Button>
        <Button @click="handleAudit(0)" v-if="hasPermission('unaudit') && voucherState === 1">弃审</Button>
        <Button @click="handleDelete" v-if="hasPermission('delete') && voucherState === 0">删除</Button>
        <Button @click="handleCopy" v-if="hasPermission('copy')">复制</Button>
        <Button @click="handleRefresh">刷新</Button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-white p-4 rounded-md shadow-sm mb-4">
      <Input
        placeholder="搜索BOM..."
        v-model:value="searchKey"
        @change="handleTreeSearch"
        style="width: 300px;"
      />
    </div>

    <div class="grid grid-cols-12 gap-4">
      <!-- 左侧树形结构 -->
      <div class="col-span-3 bom-tree-wrapper">
        <Tree
          v-model:selectedKeys="selectedKeys"
          :treeData="typsTreeData"
          blockNode
          @select="handleTreeSelect"
        />
      </div>

      <!-- 右侧表单和表格 -->
      <div class="col-span-9 bg-white rounded-md shadow-sm p-4">
        <!-- 表单区域 -->
        <Collapse defaultActiveKey="1" class="mb-4">
          <CollapsePanel key="1" title="BOM基本信息">
            <Form ref="bomForm" :model="dataJson" layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem label="母件编码" name="inventoryCode" required>
                    <Input
                      v-model:value="dataJson.inventoryCode"
                      placeholder="请输入母件编码"
                      @focus="handleInputFocus(1)"
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="母件名称" name="inventoryName" required>
                    <Input
                      v-model:value="dataJson.inventoryName"
                      placeholder="请输入母件名称"
                      @focus="handleInputFocus(2)"
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="规格型号" name="specification">
                    <Input v-model:value="dataJson.specification" placeholder="请输入规格型号" />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="计量单位" name="unitName">
                    <Input v-model:value="dataJson.unitName" placeholder="请输入计量单位" disabled />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="BOM分组" name="bomGroupName" required>
                    <Select
                      v-model:value="dataJson.bomGroupName"
                      placeholder="请选择BOM分组"
                      @click="searchGroup(1)"
                    >
                      <SelectOption v-for="item in bomGroupList" :key="item.id" :value="item.name">
                        {{ item.name }}
                      </SelectOption>
                    </Select>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="工艺路线" name="processRouteName" required>
                    <Select
                      v-model:value="dataJson.processRouteName"
                      placeholder="请选择工艺路线"
                      @click="searchGroup(2)"
                    >
                      <SelectOption v-for="item in processRouteList" :key="item.id" :value="item.name">
                        {{ item.name }}
                      </SelectOption>
                    </Select>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="成品率" name="finishProductRate" required>
                    <Input
                      v-model:value="dataJson.finishProductRate"
                      placeholder="请输入成品率"
                      type="number"
                      :min="0"
                      :max="100"
                      :precision="4"
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="版本说明" name="remarks">
                    <Input v-model:value="dataJson.remarks" placeholder="请输入版本说明" />
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </CollapsePanel>
        </Collapse>

        <!-- 子件明细表格 -->
        <div class="tabbl-bom mt-4">
          <div class="flex justify-between items-center mb-2">
            <Button type="primary" size="small" @click="handleAddRow">新增行</Button>
            <Button size="small" @click="handleSelectMaterial">选物料</Button>
          </div>
          <Table
            v-model:selectedRowKeys="selectedRowKeys"
            :columns="columns"
            :dataSource="dataSource"
            bordered
            rowKey="key"
          >
            <template #bodyCell="{ column, record, index }">
              <EditableCell
                v-if="column.dataIndex === 'inventoryCode'"
                :record="record"
                :column="column"
                :index="index"
                @change="handleCellChange"
              />
              <EditableCell
                v-else-if="column.dataIndex === 'requireQuantity'"
                :record="record"
                :column="column"
                :index="index"
                @change="handleCellChange"
              />
              <EditableCell
                v-else-if="column.dataIndex === 'unitExchangeRate'"
                :record="record"
                :column="column"
                :index="index"
                @change="handleCellChange"
              />
              <EditableCell
                v-else-if="column.dataIndex === 'subQuantity'"
                :record="record"
                :column="column"
                :index="index"
                @change="handleCellChange"
              />
              <EditableCell
                v-else-if="column.dataIndex === 'lossRate'"
                :record="record"
                :column="column"
                :index="index"
                @change="handleCellChange"
              />
              <div v-else>{{ record[column.dataIndex] }}</div>
            </template>
          </Table>
        </div>
      </div>
    </div>

    <!-- 物料选择弹窗 -->
    <Mask :visible="maskArchives" @close="closeArchives" />
    <SearchArchives
      ref="searchArchivesRef"
      :visible="maskArchives"
      @close="closeArchives"
      @select="handleSelectMaterialConfirm"
    />

    <!-- 工艺路线选择弹窗 -->
    <ProcessSearch ref="processSearch" @searchBackData="handleSearchBackData" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { Button, Table, Input, Form, Select, Collapse, Tree, message, Modal } from 'ant-design-vue';
import { BasicPageHeader } from '/@/components/Page';
import { usePermission } from '/@/hooks/web/usePermission';
import { useMessage } from '/@/hooks/web/useMessage';
import EditableCell from './components/EditableCell';
import Mask from '/@/components/Mask';
import SearchArchives from '/@/components/SearchArchives';
import ProcessSearch from '/@/components/ProcessSearch';

const { hasPermission } = usePermission();
const { createMessage } = useMessage();

// 表格列定义
const columns = [
  {
    title: '子件编码',
    dataIndex: 'inventoryCode',
    width: 120
  },
  {
    title: '子件名称',
    dataIndex: 'inventoryName',
    width: 150
  },
  {
    title: '规格型号',
    dataIndex: 'specification',
    width: 120
  },
  {
    title: '计量单位',
    dataIndex: 'unitName',
    width: 80
  },
  {
    title: '主计量数量',
    dataIndex: 'requireQuantity',
    width: 100
  },
  {
    title: '换算率',
    dataIndex: 'unitExchangeRate',
    width: 80
  },
  {
    title: '辅计量数量',
    dataIndex: 'subQuantity',
    width: 100
  },
  {
    title: '损耗率(%)',
    dataIndex: 'lossRate',
    width: 100
  },
  {
    title: '操作',
    width: 80,
    render: (_: any, record: any, index: number) => (
      <Button
        type="text"
        danger
        @click={() => handleDeleteRow(index)}
      >
        删除
      </Button>
    )
  }
];

// 响应式数据
const dataJson = reactive<{
  id: string | null;
  inventoryCode: string;
  inventoryName: string;
  specification: string;
  unitName: string;
  bomGroupName: string;
  processRouteName: string;
  finishProductRate: number;
  remarks: string;
  voucherState: number;
}>({
  id: null,
  inventoryCode: '',
  inventoryName: '',
  specification: '',
  unitName: '',
  bomGroupName: '',
  processRouteName: '',
  finishProductRate: 100,
  remarks: '',
  voucherState: 0
});

const dataSource = ref<any[]>([]);
const selectedRowKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const searchKey = ref('');
const typsTreeData = ref<any[]>([]);
const bomGroupList = ref<any[]>([]);
const processRouteList = ref<any[]>([]);
const maskArchives = ref(false);
const voucherState = ref(0);
const searchArchivesRef = ref<any>(null);
const processSearch = ref<any>(null);
const bomForm = ref<any>(null);

// 生命周期
onMounted(() => {
  getBomGroupList();
  getProcessRouteList();
  getTreeData();
});

// 方法
function handleAdd() {
  resetForm();
  dataSource.value = [];
  voucherState.value = 0;
  dataJson.id = null;
}

function handleSave() {
  bomForm.value.validate().then(() => {
    // 保存逻辑
    const params = {
      ...dataJson,
      details: dataSource.value
    };

    // 模拟保存成功
    createMessage.success('保存成功');
    getTreeData();
  }).catch(err => {
    console.error('表单验证失败:', err);
  });
}

function handleAudit(status: number) {
  if (!dataJson.id) {
    createMessage.warning('请先选择BOM');
    return;
  }

  // 模拟审核/弃审
  voucherState.value = status;
  dataJson.voucherState = status;
  createMessage.success(status === 1 ? '审核成功' : '弃审成功');
}

function handleDelete() {
  if (!dataJson.id) {
    createMessage.warning('请先选择BOM');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除当前BOM吗？',
    onOk: () => {
      // 模拟删除
      createMessage.success('删除成功');
      resetForm();
      dataSource.value = [];
      getTreeData();
    }
  });
}

function handleCopy() {
  if (!dataJson.id) {
    createMessage.warning('请先选择BOM');
    return;
  }

  // 复制当前BOM
  dataJson.id = null;
  dataJson.voucherState = 0;
  voucherState.value = 0;
  createMessage.success('复制成功，请修改后保存');
}

function handleRefresh() {
  if (dataJson.id) {
    // 刷新当前BOM
    getBomDetails(dataJson.id);
  } else {
    // 刷新列表
    getTreeData();
  }
}

function handleTreeSearch() {
  // 树形结构搜索逻辑
  getTreeData(searchKey.value);
}

function handleTreeSelect(keys: string[]) {
  if (keys.length > 0) {
    const id = keys[0];
    getBomDetails(id);
  }
}

function handleAddRow() {
  dataSource.value.push({
    key: Date.now().toString(),
    inventoryCode: '',
    inventoryName: '',
    specification: '',
    unitName: '',
    requireQuantity: 1,
    unitExchangeRate: 1,
    subQuantity: 1,
    lossRate: 0
  });
}

function handleDeleteRow(index: number) {
  dataSource.value.splice(index, 1);
}

function handleSelectMaterial() {
  maskArchives.value = true;
}

function handleSelectMaterialConfirm(data: any) {
  maskArchives.value = false;

  if (data && data.length > 0) {
    const newItem = {
      key: Date.now().toString(),
      inventoryCode: data[0].code,
      inventoryName: data[0].name,
      specification: data[0].specification,
      unitName: data[0].unitName,
      requireQuantity: 1,
      unitExchangeRate: 1,
      subQuantity: 1,
      lossRate: 0
    };

    dataSource.value.push(newItem);
  }
}

function handleInputFocus(type: number) {
  // 处理输入框聚焦
  maskArchives.value = true;
  // 根据type设置不同的搜索类型
}

function handleCellChange(row: any, column: any, value: any) {
  // 处理表格单元格编辑
  const newData = [...dataSource.value];
  const index = newData.findIndex(item => item.key === row.key);
  if (index !== -1) {
    newData[index][column.dataIndex] = value;
    dataSource.value = newData;
  }
}

function handleSearchBackData(data: any, type: number) {
  // 处理搜索返回数据
  if (type === 1) {
    // BOM分组
    dataJson.bomGroupName = data.name;
  } else if (type === 2) {
    // 工艺路线
    dataJson.processRouteName = data.name;
  }
}

function closeArchives() {
  maskArchives.value = false;
}

function resetForm() {
  dataJson.id = null;
  dataJson.inventoryCode = '';
  dataJson.inventoryName = '';
  dataJson.specification = '';
  dataJson.unitName = '';
  dataJson.bomGroupName = '';
  dataJson.processRouteName = '';
  dataJson.finishProductRate = 100;
  dataJson.remarks = '';
  dataJson.voucherState = 0;
  voucherState.value = 0;

  if (bomForm.value) {
    bomForm.value.resetFields();
  }
}

function getBomGroupList() {
  // 模拟获取BOM分组
  bomGroupList.value = [
    { id: '1', name: '标准BOM' },
    { id: '2', name: '测试BOM' },
    { id: '3', name: '样品BOM' }
  ];
}

function getProcessRouteList() {
  // 模拟获取工艺路线
  processRouteList.value = [
    { id: '1', name: '标准工艺' },
    { id: '2', name: '快速工艺' },
    { id: '3', name: '定制工艺' }
  ];
}

function getTreeData(search?: string) {
  // 模拟获取树形数据
  typsTreeData.value = [
    {
      title: 'BOM分组',
      key: 'group',
      children: [
        {
          title: '标准BOM',
          key: '1',
          children: [
            { title: 'BOM001', key: '101' },
            { title: 'BOM002', key: '102' }
          ]
        },
        {
          title: '测试BOM',
          key: '2',
          children: [
            { title: 'BOM003', key: '201' }
          ]
        }
      ]
    }
  ];
}

function getBomDetails(id: string) {
  // 模拟获取BOM详情
  dataJson.id = id;
  dataJson.inventoryCode = 'PRD001';
  dataJson.inventoryName = '产品A';
  dataJson.specification = '规格A';
  dataJson.unitName = '个';
  dataJson.bomGroupName = '标准BOM';
  dataJson.processRouteName = '标准工艺';
  dataJson.finishProductRate = 98.5;
  dataJson.remarks = '标准产品BOM';
  dataJson.voucherState = 0;
  voucherState.value = 0;

  // 模拟子件数据
  dataSource.value = [
    {
      key: '1',
      inventoryCode: 'MAT001',
      inventoryName: '物料A',
      specification: '规格A',
      unitName: '个',
      requireQuantity: 2,
      unitExchangeRate: 1,
      subQuantity: 2,
      lossRate: 0
    },
    {
      key: '2',
      inventoryCode: 'MAT002',
      inventoryName: '物料B',
      specification: '规格B',
      unitName: 'kg',
      requireQuantity: 1.5,
      unitExchangeRate: 1,
      subQuantity: 1.5,
      lossRate: 1
    }
  ];
}
</script>

<style scoped lang="less">
.credentials-bom-wrapper-bb {
  padding: 12px 10px 0;
  height: auto;
  overflow-y: auto;
  font-size: 14px;

  .ant-form-item {
    margin: 0;
  }

  .mask-archives {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0);
    z-index: 2;
  }

  .ant-table-tbody > tr > td {
    cursor: pointer;
  }

  .hoverRowStyl {
    background-color: rgba(24, 144, 255, 0.2);

    td {
      color: #222;
    }
  }

  .ant-table colgroup > col.ant-table-selection-col {
    width: 30px;
  }

  .edit-mask-route {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 800;
    background: rgba(255, 255, 255, 0.1);
  }

  .inner-table {
    margin: 0 !important;
  }

  .look-table {
    .ant-table-body {
      min-height: 300px;
    }
  }

  .order-dynamic-form-wrapper {
    label:not(.form-check-label):not(.custom-file-label) {
      font-weight: normal;
    }

    .ant-form-item-label,
    .ant-form-item-control {
      line-height: 32px;
    }
  }

  .atable-edit {
    .ant-table-tbody > tr > td {
      padding: 0px !important;
    }
  }

  .drag-line-top td {
    border-top: 1px dashed #1890ff;
  }

  .drag-line-bottom td {
    border-bottom: 1px dashed #1890ff !important;
  }

  .position-zindex-1 {
    position: relative;
    z-index: 71;
  }

  .ant-select-selection--single {
    height: 28px;
  }

  .ant-tree-title {
    max-width: 500px !important;
  }
}

.tabbl-bom {
  padding: 6px;

  .ant-table-scroll {
    height: 450px !important;
  }

  .ant-table-wrapper .ant-table-pagination {
    text-align: right !important;
  }
}

bom-tree-wrapper {
  height: 560px;
  border-right: 1px solid #ccc;

  .tree-box {
    overflow-y: auto;
    width: auto;
  }
}

#editBom_tb,
#lookBom_tb {
  margin: 8px 0;
}

hideBomNode {
  display: none;
}
</style>