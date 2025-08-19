<template>
  <div class="production-process-card">
    <BasicLayout title="派工单管理">
      <!-- 顶部操作按钮 -->
      <template #toolbar>
        <ButtonGroup>
          <a-button type="primary" @click="newForecast" v-if="hasPermission('production:processCard:add')">
            <Icon icon="ant-design:plus-outlined" />
            新增
          </a-button>
          <a-button @click="syncOrder" v-if="hasPermission('production:processCard:view')">
            <Icon icon="ant-design:reload-outlined" />
            刷新
          </a-button>
          <a-button @click="deleteOrder" v-if="hasPermission('production:processCard:delete')" :disabled="!orderId">
            <Icon icon="ant-design:delete-outlined" />
            删除
          </a-button>
          <a-button type="primary" @click="submitServer" v-if="hasPermission('production:processCard:edit')" :disabled="!orderId || voucherState !== 0">
            <Icon icon="ant-design:save-outlined" />
            保存
          </a-button>
          <a-button @click="submitOrder(0)" v-if="hasPermission('production:processCard:submit')" :disabled="!orderId || voucherState !== 0">
            <Icon icon="ant-design:upload-outlined" />
            提交
          </a-button>
          <a-button @click="submitOrder(-1)" v-if="hasPermission('production:processCard:withdraw')" :disabled="!orderId || voucherState !== -1">
            <Icon icon="ant-design:download-outlined" />
            撤回提交
          </a-button>
          <a-button @click="auditClick(1)" v-if="hasPermission('production:processCard:audit')" :disabled="!orderId || voucherState !== 0">
            <Icon icon="ant-design:check-circle-outlined" />
            审核
          </a-button>
          <a-button @click="auditClick(0)" v-if="hasPermission('production:processCard:unaudit')" :disabled="!orderId || voucherState !== 1">
            <Icon icon="ant-design:undo-outlined" />
            弃审
          </a-button>
          <a-button @click="printOrder">
            <Icon icon="ant-design:printer-outlined" />
            打印
          </a-button>
        </ButtonGroup>
      </template>

      <!-- 单据头部信息 -->
      <div class="order-header">
        <div class="order-title">
          <h3>派工单</h3>
          <span :class="getStatusClass(dataJson.voucherState)">{{ dataJson.voucherStateText }}</span>
        </div>

        <div class="order-info">
          <Form :model="dataJson" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" layout="inline">
            <Form.Item name="code" label="派工单编号">
              <Input v-model:value="dataJson.code" disabled />
            </Form.Item>
            <Form.Item name="ProcessingOrderNo" label="加工单编号">
              <Input v-model:value="dataJson.ProcessingOrderNo" disabled />
            </Form.Item>
            <Form.Item name="saleOrderCode" label="销售订单号">
              <Input v-model:value="dataJson.saleOrderCode" disabled />
            </Form.Item>
            <Form.Item name="voucherDate" label="单据日期">
              <DatePicker v-model:value="dataJson.voucherDate" style="width: 100%" />
            </Form.Item>
            <Form.Item name="dispatchDate" label="派工日期">
              <DatePicker v-model:value="dataJson.dispatchDate" style="width: 100%" />
            </Form.Item>
            <Form.Item name="expectFinishDate" label="预计完工日期">
              <DatePicker v-model:value="dataJson.expectFinishDate" style="width: 100%" />
            </Form.Item>
          </Form>
        </div>

        <div class="product-info">
          <Form :model="dataJson" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" layout="inline">
            <Form.Item name="inventoryCode" label="产品编码">
              <Input v-model:value="dataJson.inventoryCode" disabled />
            </Form.Item>
            <Form.Item name="inventoryName" label="产品名称">
              <Input v-model:value="dataJson.inventoryName" disabled />
            </Form.Item>
            <Form.Item name="inventorySpecification" label="规格型号">
              <Input v-model:value="dataJson.inventorySpecification" disabled />
            </Form.Item>
            <Form.Item name="baseUnit" label="单位">
              <Input v-model:value="dataJson.baseUnit" disabled />
            </Form.Item>
            <Form.Item name="baseQuantity" label="总下达量">
              <Input v-model:value="dataJson.baseQuantity" disabled />
            </Form.Item>
            <Form.Item name="quantityreleasedThisTime" label="本次下达量">
              <Input v-model:value="dataJson.quantityreleasedThisTime" />
            </Form.Item>
            <Form.Item name="timesOfRelease" label="下达次数">
              <Input v-model:value="dataJson.timesOfRelease" disabled />
            </Form.Item>
            <Form.Item name="completedQuantity" label="已完成数量">
              <Input v-model:value="dataJson.completedQuantity" disabled />
            </Form.Item>
            <Form.Item name="officeName" label="车间">
              <Input v-model:value="dataJson.officeName" disabled />
            </Form.Item>
            <Form.Item name="processRouteName" label="工艺路线">
              <Input v-model:value="dataJson.processRouteName" disabled />
            </Form.Item>
            <Form.Item name="bomVersion" label="BOM版本">
              <Input v-model:value="dataJson.bomVersion" disabled />
            </Form.Item>
            <Form.Item name="personInCharge" label="负责人">
              <Input v-model:value="dataJson.personInCharge" placeholder="点击选择" @click="searchGroup" />
            </Form.Item>
          </Form>
        </div>
      </div>

      <!-- 派工明细表格 -->
      <div class="tab-container">
        <Tabs default-active-key="1">
          <TabPane tab="派工明细" key="1">
            <BasicTable
              v-loading="tableShowLoding"
              :columns="personColumns"
              :data-source="dataSourceWork"
              :row-key="(record, index) => index"
              bordered
              :pagination="false"
              class="atable-edit"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'processRouteName'">
                  <Select
                    v-model:value="record.processRouteName"
                    placeholder="请选择工序"
                    style="width: 100%"
                    @change="handleSelectChange(record, index, 'processRouteName')"
                  >
                    <Option v-for="item in processRouteList" :key="item.workId" :value="item.workName">
                      {{ item.workName }}
                    </Option>
                  </Select>
                </template>
                <template v-else-if="column.dataIndex === 'name'">
                  <Select
                    v-model:value="record.name"
                    placeholder="请选择操作工"
                    style="width: 100%"
                    @change="handleSelectChange(record, index, 'name')"
                  >
                    <Option v-for="item in employeeList" :key="item.userId" :value="item.empName">
                      {{ item.empName }}
                    </Option>
                  </Select>
                </template>
                <template v-else-if="column.dataIndex === 'startDate'">
                  <DatePicker v-model:value="record.startDate" style="width: 100%" />
                </template>
                <template v-else-if="column.dataIndex === 'productionEquipment'">
                  <Input v-model:value="record.productionEquipment" />
                </template>
                <template v-else-if="column.dataIndex === 'operation'">
                  <Space>
                    <Button type="link" @click="handleAdd">+</Button>
                    <Button type="link" @click="handleDelete(index)">-</Button>
                  </Space>
                </template>
              </template>
            </BasicTable>
          </TabPane>

          <!-- 物料明细表格 -->
          <TabPane tab="物料明细" key="2">
            <BasicTable
              :columns="materialColumns"
              :data-source="dataSource"
              :row-key="(record, index) => index"
              bordered
              :pagination="false"
              class="atable-edit"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'plannedQuantity'">
                  <Input
                    v-model:value="record.plannedQuantity"
                    @change="handleInputChange(record, index, 'plannedQuantity')"
                  />
                </template>
                <template v-else-if="column.dataIndex === 'lossRate'">
                  <Input
                    v-model:value="record.lossRate"
                    suffix="%"
                    @change="handleInputChange(record, index, 'lossRate')"
                  />
                </template>
                <template v-else-if="column.dataIndex === 'lossQuantity'">
                  <Input
                    v-model:value="record.lossQuantity"
                    @change="handleInputChange(record, index, 'lossQuantity')"
                  />
                </template>
                <template v-else-if="column.dataIndex === 'pickingProcedureName'">
                  <Select
                    v-model:value="record.pickingProcedureName"
                    placeholder="请选择工序"
                    style="width: 100%"
                  >
                    <Option v-for="item in processRouteList" :key="item.workId" :value="item.workName">
                      {{ item.workName }}
                    </Option>
                  </Select>
                </template>
                <template v-else-if="column.dataIndex === 'warehouseName'">
                  <Select
                    v-model:value="record.warehouseName"
                    placeholder="请选择仓库"
                    style="width: 100%"
                  >
                    <Option v-for="item in warehouseList" :key="item.whId" :value="item.whName">
                      {{ item.whName }}
                    </Option>
                  </Select>
                </template>
              </template>
            </BasicTable>
          </TabPane>
        </Tabs>
      </div>
    </BasicLayout>

    <!-- 选择加工单弹窗 -->
    <Modal
      v-model:visible="visibleProcessing"
      title="选择加工单"
      width="800px"
      @ok="addClick"
      @cancel="cancel"
    >
      <div class="modal-content">
        <div class="modal-table">
          <h4>加工单列表</h4>
          <BasicTable
            :columns="processingOrderColumns"
            :data-source="modalList1"
            :row-key="'id'"
            bordered
            :pagination="false"
            @select="onSelectChange1"
          />
        </div>
        <div class="modal-table">
          <h4>加工单明细</h4>
          <BasicTable
            :columns="processingOrderDetailColumns"
            :data-source="modalList2"
            :row-key="'id'"
            bordered
            :pagination="false"
            @select="onSelectChange2"
          />
        </div>
      </div>
    </Modal>

    <!-- 选择人员弹窗 -->
    <Modal v-model:visible="visibleEmployee" title="选择人员" width="500px" @cancel="closeEmployeeModal">
      <BasicTable
        :columns="employeeColumns"
        :data-source="employeeList"
        :row-key="'userId'"
        bordered
        @select="onSelectEmployee"
      />
      <template #footer>
        <Button @click="closeEmployeeModal">关闭</Button>
        <Button type="primary" @click="confirmEmployeeSelection">确认</Button>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { usePermission } from '/@/hooks/web/usePermission';
import { BasicLayout, BasicTable, Form, Input, Select, Option, Button, ButtonGroup, Tabs, TabPane, Modal, DatePicker, Space, Icon } from 'ant-design-vue';
import { listNotFinishMain, listNotDispatchedDetail, getCode, dispatch, details, examine, submitOrder as apiSubmitOrder, deleteApi } from '/@/api/production/processCard';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { formatToDate } from '/@/utils/dateUtil';

// 权限检查
const { hasPermission } = usePermission();
// 消息提示
const { createMessage } = useMessage();
// 国际化
const { t } = useI18n();

// 响应式数据
const dataJson = reactive<Record<string, any>>({
  code: '',
  ProcessingOrderNo: '',
  saleOrderCode: '',
  voucherDate: formatToDate(new Date()),
  dispatchDate: formatToDate(new Date()),
  expectFinishDate: '',
  inventoryCode: '',
  inventoryName: '',
  inventorySpecification: '',
  baseUnit: '',
  baseQuantity: 0,
  quantityreleasedThisTime: 0,
  timesOfRelease: 1,
  completedQuantity: 0,
  officeName: '',
  processRouteName: '',
  bomVersion: '',
  personInCharge: '',
  personInChargeId: '',
  voucherState: 0,
  voucherStateText: '未审核',
  productionWorkMainId: '',
  productionWorkDetailId: '',
  processRouteId: '',
  bomId: '',
  companyId: '',
});

// 表格数据
const dataSourceWork = reactive<Array<Record<string, any>>>([]);
const dataSource = reactive<Array<Record<string, any>>>([]);
const modalList1 = reactive<Array<Record<string, any>>>([]);
const modalList2 = reactive<Array<Record<string, any>>>([]);
const processRouteList = reactive<Array<Record<string, any>>>([]);
const employeeList = reactive<Array<Record<string, any>>>([]);
const warehouseList = reactive<Array<Record<string, any>>>([]);

// 状态变量
const visibleProcessing = ref(false);
const visibleEmployee = ref(false);
const tableShowLoding = ref(false);
const orderId = ref<string | null>(null);
const voucherState = ref(0);
const selectedRowKeys1 = ref<number[]>([]);
const selectedRowKeys2 = ref<number[]>([]);
const selectedEmployee = ref<Record<string, any> | null>(null);
const dataSourceNumber = ref(7);

// 派工明细表格列
const personColumns = [
  { title: '工序名称', dataIndex: 'processRouteName', width: 120 },
  { title: '操作工姓名', dataIndex: 'name', width: 100 },
  { title: '开工日期', dataIndex: 'startDate', width: 100 },
  { title: '生产设备', dataIndex: 'productionEquipment', width: 120 },
  { title: '操作', dataIndex: 'operation', width: 80, fixed: 'right' },
];

// 物料明细表格列
const materialColumns = [
  { title: '物料编码', dataIndex: 'inventoryCode', width: 120 },
  { title: '物料名称', dataIndex: 'inventoryName', width: 150 },
  { title: '规格型号', dataIndex: 'inventorySpecification', width: 120 },
  { title: '单位', dataIndex: 'baseUnit', width: 80 },
  { title: '计划数量', dataIndex: 'plannedQuantity', width: 100 },
  { title: '损耗率(%)', dataIndex: 'lossRate', width: 100 },
  { title: '损耗数量', dataIndex: 'lossQuantity', width: 100 },
  { title: '领料工序', dataIndex: 'pickingProcedureName', width: 120 },
  { title: '预出仓库', dataIndex: 'warehouseName', width: 120 },
];

// 加工单表格列
const processingOrderColumns = [
  { title: '加工单编号', dataIndex: 'voucherCode', width: 150 },
  { title: '产品编码', dataIndex: 'inventoryCode', width: 120 },
  { title: '产品名称', dataIndex: 'inventoryName', width: 150 },
  { title: '规格型号', dataIndex: 'inventorySpecification', width: 120 },
  { title: '车间', dataIndex: 'officeName', width: 100 },
  { title: '总数量', dataIndex: 'baseQuantity', width: 100 },
  { title: '已派工数量', dataIndex: 'cumDispatchQuantity', width: 100 },
  { title: '剩余数量', dataIndex: 'surplusNumber', width: 100 },
];

// 加工单明细表格列
const processingOrderDetailColumns = [
  { title: '产品编码', dataIndex: 'inventoryCode', width: 120 },
  { title: '产品名称', dataIndex: 'inventoryName', width: 150 },
  { title: '规格型号', dataIndex: 'inventorySpecification', width: 120 },
  { title: '工艺路线', dataIndex: 'processRouteName', width: 120 },
  { title: 'BOM版本', dataIndex: 'bomName', width: 100 },
  { title: '总数量', dataIndex: 'baseQuantity', width: 100 },
  { title: '已派工数量', dataIndex: 'cumDispatchQuantity', width: 100 },
  { title: '剩余数量', dataIndex: 'surplusNumber', width: 100 },
];

// 人员选择表格列
const employeeColumns = [
  { title: '人员姓名', dataIndex: 'empName', width: 100 },
  { title: '人员编码', dataIndex: 'empNo', width: 100 },
  { title: '所属部门', dataIndex: 'deptName', width: 150 },
];

// 生命周期钩子
onMounted(() => {
  getList();
  // 初始化工艺路线和仓库数据
  initProcessRoute();
  initWarehouse();
  initEmployee();
});

// 初始化工艺路线
function initProcessRoute() {
  // 实际项目中这里应该调用API获取工艺路线数据
  processRouteList.push(
    { workId: '1', workName: '切割' },
    { workId: '2', workName: '焊接' },
    { workId: '3', workName: '打磨' },
    { workId: '4', workName: '组装' },
    { workId: '5', workName: '检验' }
  );
}

// 初始化仓库数据
function initWarehouse() {
  // 实际项目中这里应该调用API获取仓库数据
  warehouseList.push(
    { whId: '1', whName: '原材料仓库' },
    { whId: '2', whName: '半成品仓库' },
    { whId: '3', whName: '成品仓库' }
  );
}

// 初始化人员数据
function initEmployee() {
  // 实际项目中这里应该调用API获取人员数据
  employeeList.push(
    { userId: '1', empName: '张三', empNo: 'EMP001', deptName: '生产部' },
    { userId: '2', empName: '李四', empNo: 'EMP002', deptName: '生产部' },
    { userId: '3', empName: '王五', empNo: 'EMP003', deptName: '生产部' }
  );
}

// 获取列表数据
function getList() {
  // 实际项目中这里应该调用API获取派工单列表
  // 这里模拟数据
  dataSourceWork.length = 0;
  for (let i = 0; i < dataSourceNumber.value; i++) {
    dataSourceWork.push({});
  }
  dataSource.push({}); // 解决最后一行不能编辑的问题
}

// 新增派工单
function newForecast() {
  // 清空数据
  Object.keys(dataJson).forEach(key => {
    dataJson[key] = '';
  });
  dataJson.voucherDate = formatToDate(new Date());
  dataJson.dispatchDate = formatToDate(new Date());
  dataJson.voucherState = 0;
  dataJson.voucherStateText = '未审核';
  dataJson.timesOfRelease = 1;
  orderId.value = null;
  voucherState.value = 0;

  // 清空表格数据
  dataSourceWork.length = 0;
  for (let i = 0; i < dataSourceNumber.value; i++) {
    dataSourceWork.push({});
  }
  dataSource.length = 0;
  dataSource.push({});

  // 打开选择加工单弹窗
  searchBillsWork(true);
}

// 搜索加工单
function searchBillsWork(type: boolean) {
  tableShowLoding.value = true;
  listNotFinishMain()
    .then(res => {
      if (res.code === 200) {
        modalList1.length = 0;
        res.data.forEach((item: any) => {
          modalList1.push(item);
        });
      }
      if (type) visibleProcessing.value = true;
      tableShowLoding.value = false;
    })
    .catch(() => {
      tableShowLoding.value = false;
    });
}

// 选择加工单
function onSelectChange1(keys: number[], items: any[]) {
  selectedRowKeys1.value = keys;
  if (keys.length > 0) {
    detailsList2(items[0].id);
  }
}

// 选择加工单明细
function onSelectChange2(keys: number[], items: any[]) {
  selectedRowKeys2.value = keys;
}

// 根据加工单ID查询未完工产品明细
function detailsList2(id: string) {
  listNotDispatchedDetail({ mainId: id })
    .then(res => {
      if (res.code === 200) {
        modalList2.length = 0;
        if (res.data.length > 0) {
          res.data.forEach((item: any) => {
            item.surplusNumber = item.baseQuantity - item.cumDispatchQuantity;
            modalList2.push(item);
          });
        }
      }
    })
    .catch(() => {
      createMessage.error('获取加工单明细失败');
    });
}

// 确认选择加工单
function addClick() {
  if (selectedRowKeys1.value.length === 0) {
    createMessage.warning('请选择加工单');
    return;
  }
  if (selectedRowKeys2.value.length === 0) {
    createMessage.warning('请选择加工单明细');
    return;
  }

  // 获取派工单编号
  getCode()
    .then(res => {
      if (res.code === 200) {
        const mainItem = modalList1[selectedRowKeys1.value[0]];
        const detailItem = modalList2[selectedRowKeys2.value[0]];

        dataJson.code = res.data;
        dataJson.ProcessingOrderNo = mainItem.voucherCode;
        dataJson.processRouteName = detailItem.processRouteName;
        dataJson.productionWorkMainId = mainItem.id;
        dataJson.saleOrderCode = detailItem.saleOrderCode;
        dataJson.productionWorkDetailId = detailItem.id;
        dataJson.processRouteId = detailItem.processRouteId;
        dataJson.bomVersion = detailItem.bomName;
        dataJson.bomId = detailItem.bomId;
        dataJson.officeId = mainItem.officeId;
        dataJson.officeName = mainItem.officeName;
        dataJson.inventoryCode = detailItem.inventoryCode;
        dataJson.inventoryName = detailItem.inventoryName;
        dataJson.inventorySpecification = detailItem.inventorySpecification;
        dataJson.baseUnit = detailItem.baseUnit;
        dataJson.baseQuantity = detailItem.baseQuantity;
        dataJson.completedQuantity = detailItem.completedQuantity;
        dataJson.companyId = detailItem.companyId;
        dataJson.quantityreleasedThisTime = detailItem.baseQuantity - detailItem.cumDispatchQuantity;

        // 根据工艺id查询工序列表
        // 实际项目中这里应该调用API获取工序数据
        dataSourceWork.length = 0;
        processRouteList.forEach((item, index) => {
          if (index < dataSourceNumber.value) {
            dataSourceWork.push({
              processRouteId: item.workId,
              processRouteName: item.workName,
              officeId: dataJson.officeId,
            });
          }
        });

        // 根据加工单明细ID查询最大下达次数
        // 实际项目中这里应该调用API获取最大下达次数
        dataJson.timesOfRelease = 1;

        visibleProcessing.value = false;
      }
    })
    .catch(() => {
      createMessage.error('获取派工单编号失败');
    });
}

// 保存派工单
function submitServer() {
  // 表单验证
  if (!dataJson.quantityreleasedThisTime) {
    createMessage.warning('本次下达量必须填写');
    return;
  }
  if (!dataJson.dispatchDate) {
    createMessage.warning('请选择派工日期');
    return;
  }
  if (!dataJson.voucherDate) {
    createMessage.warning('请选择单据日期');
    return;
  }

  // 派工明细验证
  let valid = true;
  const validDetails = dataSourceWork.filter(item => item.processRouteName || item.name || item.startDate);

  if (validDetails.length === 0) {
    createMessage.warning('至少填写一条派工明细数据');
    return;
  }

  validDetails.forEach(item => {
    if (!item.processRouteName) {
      createMessage.warning('请选择工序名称');
      valid = false;
    }
    if (!item.name) {
      createMessage.warning('请选择操作工姓名');
      valid = false;
    }
    if (!item.startDate) {
      createMessage.warning('请选择开工日期');
      valid = false;
    }
  });

  if (!valid) return;

  // 物料明细验证
  const materialDetails = [...dataSource];
  materialDetails.pop(); // 移除最后一行空数据

  materialDetails.forEach(item => {
    if (!item.plannedQuantity) {
      createMessage.warning('请填写计划数量');
      valid = false;
    }
    if (!item.lossQuantity) {
      createMessage.warning('请填写损耗数量');
      valid = false;
    }
    if (item.lossRate === undefined || item.lossRate === null) {
      createMessage.warning('请填写损耗率');
      valid = false;
    }
  });

  if (!valid) return;

  // 准备提交数据
  const submitData = {
    id: orderId.value,
    baseUnit: dataJson.baseUnit,
    chargeUserId: dataJson.personInChargeId,
    chargeUserName: dataJson.personInCharge,
    companyId: dataJson.companyId,
    dispatchDate: dataJson.dispatchDate,
    dispatchInventoryQuantity: dataJson.quantityreleasedThisTime,
    dispatchTimes: dataJson.timesOfRelease,
    expectFinishDate: dataJson.expectFinishDate,
    finishInventoryQuantity: dataJson.completedQuantity,
    inventoryCode: dataJson.inventoryCode,
    inventoryName: dataJson.inventoryName,
    inventorySpecification: dataJson.inventorySpecification,
    officeId: dataJson.officeId,
    officeName: dataJson.officeName,
    processRouteId: dataJson.processRouteId,
    processRouteName: dataJson.processRouteName,
    productionWorkCode: dataJson.ProcessingOrderNo,
    productionWorkDetailId: dataJson.productionWorkDetailId,
    productionWorkMainId: dataJson.productionWorkMainId,
    saleOrderCode: dataJson.saleOrderCode,
    voucherCode: dataJson.code,
    voucherDate: dataJson.voucherDate,
    bomId: dataJson.bomId,
    bomName: dataJson.bomVersion,
    totalInventoryQuantity: dataJson.baseQuantity,
    procedureDetails: validDetails.map(item => ({
      equipmentName: item.productionEquipment,
      finishDate: item.endDate,
      procedureId: item.processRouteId,
      procedureName: item.processRouteName,
      workerId: item.nameId,
      workerName: item.name,
      workerNo: item.nameCode,
    })),
  };

  // 提交数据
  dispatch(submitData)
    .then(res => {
      if (res.code === 200) {
        createMessage.success('保存成功');
        orderId.value = res.data.id;
        voucherState.value = 0;
        dataJson.voucherState = 0;
        dataJson.voucherStateText = '未审核';
      }
    })
    .catch(() => {
      createMessage.error('保存失败');
    });
}

// 提交派工单
function submitOrder(type: number) {
  if (!orderId.value) {
    createMessage.warning('该单据未保存不需要提交');
    return;
  }

  const submitData = {
    id: orderId.value,
    status: type,
  };

  apiSubmitOrder(submitData)
    .then(res => {
      if (res.code === 200) {
        if (type === 0) {
          createMessage.success('提交成功');
          voucherState.value = -1;
          dataJson.voucherState = -1;
          dataJson.voucherStateText = '已提交';
        } else {
          createMessage.success('撤回提交成功');
          voucherState.value = 0;
          dataJson.voucherState = 0;
          dataJson.voucherStateText = '未审核';
        }
      }
    })
    .catch(() => {
      createMessage.error('操作失败');
    });
}

// 审核派工单
function auditClick(type: number) {
  if (!orderId.value) {
    createMessage.warning('请先保存单据');
    return;
  }

  const auditData = {
    id: orderId.value,
    status: type,
  };

  examine(auditData)
    .then(res => {
      if (res.code === 200) {
        if (type === 1) {
          createMessage.success('审核成功');
          voucherState.value = 1;
          dataJson.voucherState = 1;
          dataJson.voucherStateText = '已审核';
        } else {
          createMessage.success('弃审成功');
          voucherState.value = 0;
          dataJson.voucherState = 0;
          dataJson.voucherStateText = '未审核';
        }
      }
    })
    .catch(() => {
      createMessage.error('操作失败');
    });
}

// 删除派工单
function deleteOrder() {
  if (!orderId.value) {
    createMessage.warning('请选择要删除的单据');
    return;
  }

  deleteApi({ id: orderId.value })
    .then(res => {
      if (res.code === 200) {
        createMessage.success('删除成功');
        newForecast();
      }
    })
    .catch(() => {
      createMessage.error('删除失败');
    });
}

// 刷新数据
function syncOrder() {
  if (orderId.value) {
    // 实际项目中这里应该调用API获取最新数据
    createMessage.success('刷新成功');
  } else {
    getList();
  }
}

// 选择人员弹窗
function searchGroup() {
  visibleEmployee.value = true;
}

// 关闭人员弹窗
function closeEmployeeModal() {
  visibleEmployee.value = false;
  selectedEmployee.value = null;
}

// 选择人员
function onSelectEmployee(keys: string[], items: any[]) {
  if (keys.length > 0) {
    selectedEmployee.value = items[0];
  } else {
    selectedEmployee.value = null;
  }
}

// 确认选择人员
function confirmEmployeeSelection() {
  if (selectedEmployee.value) {
    dataJson.personInChargeId = selectedEmployee.value.userId;
    dataJson.personInCharge = selectedEmployee.value.empName;
    visibleEmployee.value = false;
  } else {
    createMessage.warning('请选择人员');
  }
}

// 处理选择框变化
function handleSelectChange(record: any, index: number, field: string) {
  // 实际项目中可能需要根据选择的值加载相关数据
  nextTick(() => {
    // 刷新表格
  });
}

// 处理输入变化
function handleInputChange(record: any, index: number, field: string) {
  // 数量、损耗率、损耗数量之间的相互计算
  if (field === 'plannedQuantity') {
    if (record.plannedQuantity && record.requireQuantity) {
      record.lossQuantity = Number(record.plannedQuantity) - Number(record.requireQuantity);
      if (record.lossQuantity && record.requireQuantity) {
        record.lossRate = ((Number(record.lossQuantity) / Number(record.requireQuantity)) * 100).toFixed(2);
      }
    }
  } else if (field === 'lossRate') {
    if (record.lossRate && record.requireQuantity) {
      record.lossQuantity = (Number(record.requireQuantity) * Number(record.lossRate)) / 100;
      if (record.requireQuantity && record.lossQuantity) {
        record.plannedQuantity = Number(record.requireQuantity) + Number(record.lossQuantity);
      }
    }
  } else if (field === 'lossQuantity') {
    if (record.lossQuantity && record.requireQuantity) {
      record.lossRate = ((Number(record.lossQuantity) / Number(record.requireQuantity)) * 100).toFixed(2);
      if (record.requireQuantity && record.lossQuantity) {
        record.plannedQuantity = Number(record.requireQuantity) + Number(record.lossQuantity);
      }
    }
  }
}

// 添加行
function handleAdd() {
  dataSourceWork.push({});
}

// 删除行
function handleDelete(index: number) {
  if (dataSourceWork.length > dataSourceNumber.value) {
    dataSourceWork.splice(index, 1);
  } else {
    createMessage.warning('小于7条不能删除');
  }
}

// 打印订单
function printOrder() {
  createMessage.info('打印功能开发中');
}

// 获取状态样式
function getStatusClass(status: number) {
  switch (status) {
    case 0:
      return 'status-draft';
    case 1:
      return 'status-audited';
    case -1:
      return 'status-submitted';
    case 9:
      return 'status-aborted';
    case 10:
      return 'status-completed';
    default:
      return '';
  }
}
</script>

<style lang="less" scoped>
@import '/@/style/variable.less';

.production-process-card {
  .order-header {
    background: @background-color-light;
    border-radius: @border-radius;
    padding: 16px;
    margin-bottom: 20px;

    .order-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      span {
        margin-left: 16px;
        padding: 2px 8px;
        border-radius: @border-radius-sm;
        font-size: 12px;
      }

      .status-draft {
        background: #f0f9eb;
        color: #67c23a;
      }

      .status-submitted {
        background: #e6f7ff;
        color: #1890ff;
      }

      .status-audited {
        background: #fffbe6;
        color: #faad14;
      }

      .status-aborted {
        background: #fff2f0;
        color: #ff4d4f;
      }

      .status-completed {
        background: #f6ffed;
        color: #52c41a;
      }
    }

    .order-info,
    .product-info {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .tab-container {
    background: @background-color-light;
    border-radius: @border-radius;
    padding: 16px;

    .ant-tabs {
      height: 100%;

      .ant-tabs-content {
        height: calc(100% - 40px);
      }
    }
  }

  .modal-content {
    .modal-table {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }

  .atable-edit {
    .ant-table-tbody > tr > td {
      padding: 4px !important;
    }
  }
}
</style>"}}}}