<template>
  <div id="documents-wrapper" ref="print" class="voucher-wrapper">
    <div class="voucher-header">
      <div class="voucher-title">
        <a-button type="primary" size="small" @click="newForecast" icon="plus" v-if="['add', 'edit'].includes(this.state)">新增</a-button>
        <a-button type="primary" size="small" @click="choiceBillsFromProductionOrder" icon="search" v-if="['add', 'edit'].includes(this.state)">选计划订单</a-button>
        <a-dropdown v-if="['add', 'edit'].includes(this.state)">
          <a-button size="small" icon="ellipsis">
            更多
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="submitOrder">提交</a-menu-item>
            <a-menu-item key="2" @click="clearAll">清空</a-menu-item>
          </a-menu>
        </a-dropdown>
        <span class="voucher-bill-type">委外加工单</span>
        <span class="voucher-bill-code" v-if="form.billCode">{{form.billCode}}</span>
        <a-button type="primary" size="small" @click="submitClick" v-if="['add', 'edit'].includes(this.state)">提交申请</a-button>
      </div>
      <div class="voucher-status" v-if="form.billStateName">{{form.billStateName}}</div>
    </div>

    <a-form-model :model="form" layout="inline" :label-col="{span: 8}" :wrapper-col="{span: 16}" class="voucher-form">
      <a-row :gutter="[{xs: 8, sm: 16, md: 24, lg: 32}, 20]">
        <a-col :span="6">
          <a-form-model-item label="单据日期" prop="billDate">
            <a-date-picker v-model="form.billDate" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="单据编号" prop="billCode">
            <a-input v-model="form.billCode" placeholder="自动生成" disabled />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="来源单类型">
            <a-input v-model="form.sourceName" placeholder="计划订单" disabled />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="来源单号" prop="sourceCode">
            <a-input v-model="form.sourceCode" placeholder="点击选单" @click="choiceBillsFromProductionOrder" />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="委外商" prop="supplierId">
            <a-select v-model="form.supplierId" placeholder="请选择委外商" @change="onSelectSupplier">
              <a-select-option v-for="item in supplierList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="委外商编码">
            <a-input v-model="form.supplierCode" disabled />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="部门">
            <a-input v-model="form.departmentName" disabled />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="业务员">
            <a-input v-model="form.staffName" disabled />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="币别" prop="currencyId">
            <a-select v-model="form.currencyId" placeholder="请选择币别">
              <a-select-option v-for="item in currencyList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="汇率">
            <a-input v-model="form.exchangeRate" disabled />
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="结算方式" prop="settlementMethodId">
            <a-select v-model="form.settlementMethodId" placeholder="请选择结算方式">
              <a-select-option v-for="item in settlementMethodList" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="6">
          <a-form-model-item label="结算日期" prop="settlementDate">
            <a-date-picker v-model="form.settlementDate" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="备注" prop="remarks">
            <a-input v-model="form.remarks" placeholder="请输入备注" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="附件">
            <file-upload v-model="fileList" :multiple="true" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>

    <div class="voucher-table">
      <div class="table-title">加工单明细</div>
      <a-table
        :columns="columnsWork"
        :data-source="dataSource"
        bordered
        style="margin-bottom: 16px"
        :rowClassName="rowClassNameWork"
        @rowClick="onRowClickWork"
        @rowContextMenu="onContextMenuWork"
      >
        <template slot="action" slot-scope="text, record, index">
          <span class="table-action-btn" @click="showBomDetails(record, index)">物料明细</span>
          <span class="table-action-btn" @click="showDetailsRoute(record, index)">工艺明细</span>
        </template>
      </a-table>
    </div>

    <!-- 物料明细抽屉 -->
    <a-drawer
      title="物料明细"
      placement="right"
      :width="800"
      :visible="visibleBom"
      @close="onCloseBom"
    >
      <div v-if="visibleBom">
        <div class="drawer-form">
          <a-form-model :model="bomForm" layout="inline" :label-col="{span: 8}" :wrapper-col="{span: 16}">
            <a-row :gutter="[{xs: 8, sm: 16, md: 24, lg: 32}, 20]">
              <a-col :span="12">
                <a-form-model-item label="产品编码">
                  <a-input v-model="bomForm.inventoryCode" disabled />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="产品名称">
                  <a-input v-model="bomForm.inventoryName" disabled />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="规格型号">
                  <a-input v-model="bomForm.inventorySpecification" disabled />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="单位">
                  <a-input v-model="bomForm.unitName" disabled />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="BOM编码">
                  <a-input v-model="bomForm.bomCode" disabled />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="BOM版本">
                  <a-input v-model="bomForm.bomVersion" disabled />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-form-model>
        </div>

        <div class="drawer-table">
          <a-table
            :columns="columnsBom"
            :data-source="dataSourceBom"
            bordered
            :rowKey="(record, index) => index"
            @rowContextMenu="openMenuDetails"
          >
            <template v-for="col in columnsBom" v-if="col.dataIndex === 'inventoryCode' || col.dataIndex === 'inventoryName'" :slot="col.dataIndex" slot-scope="text, record, index">
              <editable-cell-min
                :index="index"
                :data-index="col.dataIndex"
                :title="col.title"
                :record="record"
                :inputType="'search'"
                :searchType="'inventory'"
                :is-multiple="false"
                @change="onCellChangeMinBom"
              />
            </template>
            <template v-for="col in columnsBom" v-if="col.dataIndex === 'subUnitName'" :slot="col.dataIndex" slot-scope="text, record, index">
              <editable-cell-min
                :index="index"
                :data-index="col.dataIndex"
                :title="col.title"
                :record="record"
                :inputType="'search'"
                :searchType="'unit'"
                :is-multiple="false"
                :unit-group-id="record.unitGroupId"
                @change="onCellChangeMinBom"
              />
            </template>
            <template v-for="col in columnsBom" v-if="['plannedQuantity', 'requireQuantity', 'lossQuantity', 'lossRate'].includes(col.dataIndex)" :slot="col.dataIndex" slot-scope="text, record, index">
              <editable-cell-min
                :index="index"
                :data-index="col.dataIndex"
                :title="col.title"
                :record="record"
                :inputType="'number'"
                @change="onCellChangeMinBom"
              />
            </template>
            <template v-for="col in columnsBom" v-if="['baseUnitName', 'subUnitName', 'inventorySpecification', 'inventoryCategoryName', 'taxRate'].includes(col.dataIndex)" :slot="col.dataIndex" slot-scope="text">
              <span>{{text}}</span>
            </template>
          </a-table>

          <div class="drawer-footer">
            <a-button type="primary" @click="handleAddDetails" v-if="['add', 'edit'].includes(this.state)">新增</a-button>
            <a-button @click="onCloseBom">关闭</a-button>
          </div>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div class="context-menu" v-if="visibleDetails" :style="{top: topDetails + 'px', left: leftDetails + 'px'}">
        <ul>
          <li @click="handleAddDetails" v-if="['add', 'edit'].includes(this.state)">新增</li>
          <li @click="handleDeleteDetails" v-if="['add', 'edit'].includes(this.state)">删除</li>
        </ul>
      </div>
    </a-drawer>

    <!-- 工艺明细抽屉 -->
    <a-drawer
      title="工艺明细"
      placement="right"
      :width="800"
      :visible="visibleRoute"
      @close="onCloseRoute"
    >
      <div v-if="visibleRoute">
        <div class="drawer-form">
          <a-form-model :model="routeForm" layout="inline" :label-col="{span: 8}" :wrapper-col="{span: 16}">
            <a-row :gutter="[{xs: 8, sm: 16, md: 24, lg: 32}, 20]">
              <a-col :span="12">
                <a-form-model-item label="工艺路线编码">
                  <a-input v-model="routeForm.processRouteCode" disabled />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="工艺路线名称">
                  <a-input v-model="routeForm.processRouteName" disabled />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-form-model>
        </div>

        <div class="drawer-table">
          <a-table
            :columns="columnsRoute"
            :data-source="dataSourceRoute"
            bordered
            :rowKey="(record, index) => index"
          >
            <template v-for="col in columnsRoute" v-if="col.dataIndex === 'workerName'" :slot="col.dataIndex" slot-scope="text, record, index">
              <editable-cell-min
                :index="index"
                :data-index="col.dataIndex"
                :title="col.title"
                :record="record"
                :inputType="'search'"
                :searchType="'worker'"
                :is-multiple="false"
                @change="onCellChangeMinRoute"
              />
            </template>
            <template v-for="col in columnsRoute" v-if="col.dataIndex === 'teamName'" :slot="col.dataIndex" slot-scope="text, record, index">
              <editable-cell-min
                :index="index"
                :data-index="col.dataIndex"
                :title="col.title"
                :record="record"
                :inputType="'search'"
                :searchType="'team'"
                :is-multiple="false"
                @change="onCellChangeMinRoute"
              />
            </template>
            <template v-for="col in columnsRoute" v-if="['sequenceNumber', 'procedureCode', 'procedureName', 'workHours', 'machineHours'].includes(col.dataIndex)" :slot="col.dataIndex" slot-scope="text, record, index">
              <editable-cell-min
                :index="index"
                :data-index="col.dataIndex"
                :title="col.title"
                :record="record"
                :inputType="col.dataIndex === 'sequenceNumber' || col.dataIndex === 'workHours' || col.dataIndex === 'machineHours' ? 'number' : 'text'"
                @change="onCellChangeMinRoute"
              />
            </template>
          </a-table>

          <div class="drawer-footer">
            <a-button @click="onCloseRoute">关闭</a-button>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 选单组件 -->
    <search-list ref="searchList" @ok="onSelectChangeMain" :isShowBusinessType="true" :isShowMultiSelect="false" :businessType="2" />

    <!-- 审核弹窗 -->
    <examine-modal ref="examineModal" @ok="onExamineOk" />

    <!-- 删除弹窗 -->
    <delete-modal ref="deleteModal" @ok="onDeleteOk" />

    <!-- 提交弹窗 -->
    <submit-modal ref="submitModal" @ok="onSubmitOk" />
  </div>
</template>
<script>
import { save, examine, remove, getCode, getIdDetails, getBomDetails, getClDetails, submitOrder } from '@/api/production/productionWork';
import { details as bomDetails } from '@/api/production/bom';
import { details as routeDetails } from '@/api/production/processRoute';
import { pro } from '@/mixins/procurement/pro';
import EditableCellMin from '@/components/editable-cell-min/EditableCellMin.vue';
import { clearValue, clearKeys, IdFieldToNameField } from '@/utils/tools';

// 搜索选单组件
import SearchList from '@/components/search-list/SearchList.vue';
// 审核弹窗
import ExamineModal from '@/components/examine-modal/ExamineModal.vue';
// 删除弹窗
import DeleteModal from '@/components/delete-modal/DeleteModal.vue';
// 提交弹窗
import SubmitModal from '@/components/submit-modal/SubmitModal.vue';
// 文件上传组件
import FileUpload from '@/components/file-upload/FileUpload.vue';

export default {
  name: 'ProductionWork',
  components: {
    EditableCellMin,
    SearchList,
    ExamineModal,
    DeleteModal,
    SubmitModal,
    FileUpload
  },
  mixins: [pro],
  data () {
    return {
      // 基础数据
      basePostData: {
        sourceCode: 'ProductionOrder',
        businessType: 2
      },
      // 来源单类型
      sourceCode: 'ProductionOrder',
      // 表单数据
      form: {
        billDate: new Date(),
        billCode: '',
        sourceCode: '',
        sourceName: '计划订单',
        supplierId: '',
        supplierCode: '',
        departmentId: '',
        departmentName: '',
        staffId: '',
        staffName: '',
        currencyId: '',
        exchangeRate: 1,
        settlementMethodId: '',
        settlementDate: '',
        remarks: '',
        billState: 0,
        billStateName: '未提交'
      },
      // 表格列配置-加工单明细
      columnsWork: [
        {
          title: '产品编码',
          dataIndex: 'inventoryCode',
          width: 120
        },
        {
          title: '产品名称',
          dataIndex: 'inventoryName',
          width: 150
        },
        {
          title: '规格型号',
          dataIndex: 'inventorySpecification',
          width: 120
        },
        {
          title: '单位',
          dataIndex: 'unitName',
          width: 80
        },
        {
          title: '数量',
          dataIndex: 'quantity',
          width: 80
        },
        {
          title: 'BOM编码',
          dataIndex: 'bomCode',
          width: 120
        },
        {
          title: '工艺路线',
          dataIndex: 'processRouteName',
          width: 120
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 120
        }
      ],
      // 表格数据-加工单明细
      dataSource: [],
      // 表格列配置-物料明细
      columnsBom: [
        {
          title: '物料编码',
          dataIndex: 'inventoryCode',
          width: 120
        },
        {
          title: '物料名称',
          dataIndex: 'inventoryName',
          width: 150
        },
        {
          title: '规格型号',
          dataIndex: 'inventorySpecification',
          width: 120
        },
        {
          title: '基本单位',
          dataIndex: 'baseUnitName',
          width: 80
        },
        {
          title: '辅计量',
          dataIndex: 'subUnitName',
          width: 80
        },
        {
          title: '换算率',
          dataIndex: 'unitExchangeRate',
          width: 80
        },
        {
          title: '计划数量',
          dataIndex: 'plannedQuantity',
          width: 80
        },
        {
          title: '需要数量',
          dataIndex: 'requireQuantity',
          width: 80
        },
        {
          title: '损耗数量',
          dataIndex: 'lossQuantity',
          width: 80
        },
        {
          title: '损耗率(%)',
          dataIndex: 'lossRate',
          width: 80
        },
        {
          title: '存货分类',
          dataIndex: 'inventoryCategoryName',
          width: 120
        },
        {
          title: '税率(%)',
          dataIndex: 'taxRate',
          width: 80
        }
      ],
      // 表格数据-物料明细
      dataSourceBom: [],
      // 表格列配置-工艺明细
      columnsRoute: [
        {
          title: '序号',
          dataIndex: 'sequenceNumber',
          width: 80
        },
        {
          title: '工序编码',
          dataIndex: 'procedureCode',
          width: 120
        },
        {
          title: '工序名称',
          dataIndex: 'procedureName',
          width: 150
        },
        {
          title: '工时',
          dataIndex: 'workHours',
          width: 80
        },
        {
          title: '机时',
          dataIndex: 'machineHours',
          width: 80
        },
        {
          title: '工人',
          dataIndex: 'workerName',
          width: 150
        },
        {
          title: '班组',
          dataIndex: 'teamName',
          width: 120
        }
      ],
      // 表格数据-工艺明细
      dataSourceRoute: [],
      // 物料明细抽屉
      visibleBom: false,
      // 工艺明细抽屉
      visibleRoute: false,
      // BOM表单数据
      bomForm: {
        inventoryCode: '',
        inventoryName: '',
        inventorySpecification: '',
        unitName: '',
        bomCode: '',
        bomVersion: ''
      },
      // 工艺路线表单数据
      routeForm: {
        processRouteCode: '',
        processRouteName: ''
      },
      // 当前选中的加工单明细索引
      classWorkCurrent: 0,
      // 当前选中的BOM ID
      currentBomId: '',
      // 当前选中的工艺路线ID
      currentRouteId: '',
      // 右键菜单相关
      visibleDetails: false,
      topDetails: 0,
      leftDetails: 0,
      thisClickIdDetails: 0,
      // 用于刷新表格的key
      isRouterAliveWork: true,
      // 来源单数据
      reportCodeDetail: [],
      // 数据来源数量(其他)
      dataSourceNumberOther: 0,
      // 文件列表
      fileList: []
    };
  },
  created () {
    // 初始化
    this.init();
  },
  mounted () {
    // 点击空白处关闭右键菜单
    document.addEventListener('click', this.closeMenuDetails);
  },
  destroyed () {
    document.removeEventListener('click', this.closeMenuDetails);
  },
  watch: {
    // 监听物料数量变化
    dataSourceBomNumber: function (newVal) {
      if (newVal > 0) {
        this.dataSourceNumberOther = newVal - 1;
      }
    },
    // 监听物料明细变化
    dataSourceBom: function (newVal) {
      this.dataSourceBomNumber = newVal.length;
    },
    // 监听工艺明细变化
    dataSourceRoute: function (newVal) {
      this.dataSourceRouteNumber = newVal.length;
    }
  },
  computed: {
    // 物料明细数量
    dataSourceBomNumber: {
      get: function () {
        return this.dataSourceBom.length;
      },
      set: function () {}
    },
    // 工艺明细数量
    dataSourceRouteNumber: {
      get: function () {
        return this.dataSourceRoute.length;
      },
      set: function () {}
    }
  },
  methods: {
    // 初始化
    init () {
      // 获取供应商列表
      this.getSupplierList();
      // 获取币别列表
      this.getCurrencyList();
      // 获取结算方式列表
      this.getSettlementMethodList();

      // 如果是编辑或查看
      if (this.id) {
        this.getIdDetails();
      } else {
        // 新增
        this.getCode();
      }
    },
    // 获取单据编号
    getCode () {
      getCode().then(res => {
        if (res.success) {
          this.form.billCode = res.data;
        }
      });
    },
    // 获取详情
    getIdDetails () {
      getIdDetails(this.id).then(res => {
        if (res.success) {
          let data = res.data;
          this.form = data;
          this.form.billDate = data.billDate ? new Date(data.billDate) : new Date();
          this.form.settlementDate = data.settlementDate ? new Date(data.settlementDate) : '';
          this.dataSource = data.productionWorkDetails;

          // 设置文件列表
          if (data.fileList && data.fileList.length > 0) {
            this.fileList = data.fileList.map(item => ({
              uid: item.id,
              name: item.fileName,
              status: 'done',
              url: item.fileUrl
            }));
          }
        }
      });
    },
    // 获取BOM详情
    getBomDetails (bomId, inventoryId) {
      return new Promise((resolve, reject) => {
        bomDetails(bomId).then(res => {
          if (res.success) {
            let data = res.data;
            this.bomForm = {
              inventoryCode: data.inventoryCode,
              inventoryName: data.inventoryName,
              inventorySpecification: data.inventorySpecification,
              unitName: data.unitName,
              bomCode: data.code,
              bomVersion: data.version
            };

            // 获取物料信息
            this.getInventoryDetails(inventoryId).then(inventoryRes => {
              if (inventoryRes.success) {
                let inventoryData = inventoryRes.data;
                this.dataSource.forEach(item => {
                  if (item.bomId === bomId) {
                    item.inventoryCategoryName = inventoryData.inventoryCategoryName;
                    item.inventoryCategoryId = inventoryData.inventoryCategoryId;
                    item.commodityAttribute = inventoryData.commodityAttribute;
                  }
                });
              }
            });

            // 处理BOM明细
            let bomDetails = data.bomDetails;
            this.dataSourceBom = bomDetails.map((item, index) => ({
              number: index,
              inventoryCode: item.inventoryCode,
              inventoryName: item.inventoryName,
              inventorySpecification: item.inventorySpecification,
              baseUnit: item.unitId,
              baseUnitName: item.unitName,
              subUnit: '',
              subUnitName: '',
              unitExchangeRate: '',
              plannedQuantity: item.quantity,
              requireQuantity: item.quantity,
              lossQuantity: 0,
              lossRate: 0,
              subPlannedQuantity: '',
              subRequireQuantity: '',
              subLossQuantity: '',
              inventoryCategoryName: item.inventoryCategoryName,
              inventoryCategoryId: item.inventoryCategoryId,
              taxRate: item.taxRate || 0,
              unitGroupId: item.unitGroupId
            }));

            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    // 获取BOM详情2
    getBomDetails2 (bomId, baseQuantity) {
      return new Promise((resolve, reject) => {
        bomDetails(bomId).then(res => {
          if (res.success) {
            let data = res.data;
            // 处理BOM明细
            let bomDetails = data.bomDetails;
            this.dataSourceBom = bomDetails.map((item, index) => ({
              number: index,
              inventoryCode: item.inventoryCode,
              inventoryName: item.inventoryName,
              inventorySpecification: item.inventorySpecification,
              baseUnit: item.unitId,
              baseUnitName: item.unitName,
              subUnit: '',
              subUnitName: '',
              unitExchangeRate: '',
              plannedQuantity: (item.quantity * baseQuantity).toFixed(4),
              requireQuantity: (item.quantity * baseQuantity).toFixed(4),
              lossQuantity: 0,
              lossRate: 0,
              subPlannedQuantity: '',
              subRequireQuantity: '',
              subLossQuantity: '',
              inventoryCategoryName: item.inventoryCategoryName,
              inventoryCategoryId: item.inventoryCategoryId,
              taxRate: item.taxRate || 0,
              unitGroupId: item.unitGroupId
            }));

            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    // 获取工艺路线详情
    getRouteDetails (routeId) {
      return new Promise((resolve, reject) => {
        routeDetails(routeId).then(res => {
          if (res.success) {
            let data = res.data;
            this.routeForm = {
              processRouteCode: data.code,
              processRouteName: data.name
            };

            // 处理工艺路线明细
            let routeDetails = data.procedureDetails;
            this.dataSourceRoute = routeDetails.map((item, index) => ({
              sequenceNumber: item.sequenceNumber,
              procedureCode: item.code,
              procedureName: item.name,
              workHours: item.workHours,
              machineHours: item.machineHours,
              workerIds: '',
              workerNames: '',
              teamId: '',
              teamName: ''
            }));

            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    // 获取工艺路线详情2
    getRouteDetails2 (routeId) {
      return new Promise((resolve, reject) => {
        routeDetails(routeId).then(res => {
          if (res.success) {
            let data = res.data;
            // 处理工艺路线明细
            let routeDetails = data.procedureDetails;
            this.dataSourceRoute = routeDetails.map((item, index) => ({
              sequenceNumber: item.sequenceNumber,
              procedureCode: item.code,
              procedureName: item.name,
              workHours: item.workHours,
              machineHours: item.machineHours,
              workerIds: '',
              workerNames: '',
              teamId: '',
              teamName: ''
            }));

            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    // 获取客户BOM详情
    getClDetails (id) {
      getClDetails(id).then(res => {
        if (res.success) {
          let data = res.data;
          this.bomForm = {
            inventoryCode: data.inventoryCode,
            inventoryName: data.inventoryName,
            inventorySpecification: data.inventorySpecification,
            unitName: data.unitName,
            bomCode: data.code,
            bomVersion: data.version
          };

          // 处理BOM明细
          let bomDetails = data.bomDetails;
          this.dataSourceBom = bomDetails.map((item, index) => ({
            number: index,
            inventoryCode: item.inventoryCode,
            inventoryName: item.inventoryName,
            inventorySpecification: item.inventorySpecification,
            baseUnit: item.unitId,
            baseUnitName: item.unitName,
            subUnit: '',
            subUnitName: '',
            unitExchangeRate: '',
            plannedQuantity: item.quantity,
            requireQuantity: item.quantity,
            lossQuantity: 0,
            lossRate: 0,
            subPlannedQuantity: '',
            subRequireQuantity: '',
            subLossQuantity: '',
            inventoryCategoryName: item.inventoryCategoryName,
            inventoryCategoryId: item.inventoryCategoryId,
            taxRate: item.taxRate || 0,
            unitGroupId: item.unitGroupId
          }));
        }
      });
    },
    // 显示物料明细
    showBomDetails (record, index) {
      this.classWorkCurrent = index;
      this.currentBomId = record.bomId;
      this.getBomDetails(record.bomId, record.inventoryId);
      this.visibleBom = true;
    },
    // 显示工艺明细
    showDetailsRoute (record, index) {
      this.classWorkCurrent = index;
      this.currentRouteId = record.id;
      this.getRouteDetails(record.processRouteId);
      this.visibleRoute = true;
    },
    // 关闭物料明细抽屉
    onCloseBom () {
      this.visibleBom = false;
    },
    // 关闭工艺明细抽屉
    onCloseRoute () {
      this.visibleRoute = false;
    },
    // 加工单明细行点击
    onRowClickWork (record, index) {
      this.classWorkCurrent = index;
    },
    // 加工单明细行右键
    onContextMenuWork (e, record, index) {
      e.preventDefault();
      this.classWorkCurrent = index;
    },
    // 物料明细表单修改回调处理
    onCellChangeMinBom (indexTable, dataIndex, value) {
      let dataSourceBom = [];
      this.dataSource.forEach(item => {
        if (item.bomId == this.currentBomId) {
          dataSourceBom = item.bomDetails;
        }
      });

      const target = dataSourceBom.find((item, index) => index === indexTable);

      if (dataIndex == 'plannedQuantity') {
        //计划数量
        this.$set(target, dataIndex, value);
        //计划数量 || 需要数量
        if (target.plannedQuantity != null && target.requireQuantity != null) {
          //计算  损耗数量=计划数量-需要数量
          target.lossQuantity = (Number(target.plannedQuantity) - Number(target.requireQuantity)).toFixed(4);
          //计算  损耗率=（损耗数量/需要数量）*100
          let losstate = (Number(target.lossQuantity) / Number(target.requireQuantity)) * 100;
          target.lossRate = losstate.toFixed(4);
        }

        //如果有辅计量换算率就计算辅计量的计划数量
        if (target.unitExchangeRate) {
          //辅计量计划数量
          target.subPlannedQuantity = (Number(target.plannedQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量需要数量
          target.subRequireQuantity = (Number(target.requireQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量损耗数量
          target.subLossQuantity = (Number(target.subPlannedQuantity) - Number(target.subRequireQuantity)).toFixed(4);
        }
      } else if (dataIndex == 'requireQuantity') {
        //需要数量
        this.$set(target, dataIndex, value);
        //需要数量 || 计划数量
        if (target.requireQuantity != null && target.plannedQuantity != null) {
          //计算  损耗数量=计划数量-需要数量
          target.lossQuantity = (Number(target.plannedQuantity) - Number(target.requireQuantity)).toFixed(4);
          //计算  损耗率=（损耗数量/需要数量）*100
          let losstate = (Number(target.lossQuantity) / Number(target.requireQuantity)) * 100;
          target.lossRate = losstate.toFixed(4);
        }
        //需要数量 || 损耗率
        if (target.requireQuantity != null && target.lossRate != null) {
          //计算  损耗数量=需要数量*损耗率/100
          target.lossQuantity = ((Number(target.requireQuantity) * Number(target.lossRate)) / 100).toFixed(4);
          //计算 计划数量=需要数量+损耗数量
          target.plannedQuantity = (Number(target.requireQuantity) + Number(target.lossQuantity)).toFixed(4);
        }

        //如果有辅计量换算率就计算辅计量的计划数量
        if (target.unitExchangeRate) {
          //辅计量计划数量
          target.subPlannedQuantity = (Number(target.plannedQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量需要数量
          target.subRequireQuantity = (Number(target.requireQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量损耗数量
          target.subLossQuantity = (Number(target.subPlannedQuantity) - Number(target.subRequireQuantity)).toFixed(4);
        }
      } else if (dataIndex == 'lossQuantity') {
        this.$set(target, dataIndex, value);
        //损耗数量 || 损耗率
        if (target.lossQuantity != null && target.requireQuantity != null) {
          //计算  损耗率=（损耗数量/需要数量）*100
          let losstate = (Number(target.lossQuantity) / Number(target.requireQuantity)) * 100;
          target.lossRate = losstate.toFixed(4);
        }
        if (target.requireQuantity != null && target.lossQuantity != null) {
          //计算 计划数量=需要数量+损耗数量
          target.plannedQuantity = (Number(target.requireQuantity) + Number(target.lossQuantity)).toFixed(4);
        }

        //如果有辅计量换算率就计算辅计量的计划数量
        if (target.unitExchangeRate) {
          //辅计量计划数量
          target.subPlannedQuantity = (Number(target.plannedQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量需要数量
          target.subRequireQuantity = (Number(target.requireQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量损耗数量
          target.subLossQuantity = (Number(target.subPlannedQuantity) - Number(target.subRequireQuantity)).toFixed(4);
        }

      } else if (dataIndex == 'lossRate') {
        this.$set(target, dataIndex, value);
        //输入损耗率
        if (target.lossRate != null && target.requireQuantity != null) {
          //计算  损耗数量=需要数量*损耗率/100
          target.lossQuantity = ((Number(target.requireQuantity) * Number(target.lossRate)) / 100).toFixed(4);
        }
        if (target.requireQuantity != null && target.lossQuantity != null) {
          //计算 计划数量=需要数量+损耗数量
          target.plannedQuantity = (Number(target.requireQuantity) + Number(target.lossQuantity)).toFixed(4);
        }

        //如果有辅计量换算率就计算辅计量的计划数量
        if (target.unitExchangeRate) {
          //辅计量计划数量
          target.subPlannedQuantity = (Number(target.plannedQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量需要数量
          target.subRequireQuantity = (Number(target.requireQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量损耗数量
          target.subLossQuantity = (Number(target.subPlannedQuantity) - Number(target.subRequireQuantity)).toFixed(4);
        }
      }


      else if (dataIndex == 'subUnitName') {
        target['subUnit'] = value.id;//辅计量
        target['subUnitName'] = value.name;//辅计量名称
        target['unitExchangeRate'] = value.unitExchangeRate;//换算率

        if (target.plannedQuantity && target.requireQuantity) {
          //辅计量计划数量
          target.subPlannedQuantity = (Number(target.plannedQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          console.log(target.plannedQuantity, target.unitExchangeRate, target.subPlannedQuantity);
          //辅计量需要数量
          target.subRequireQuantity = (Number(target.requireQuantity) / Number(target.unitExchangeRate)).toFixed(4);
          //辅计量损耗数量
          target.subLossQuantity = (Number(target.subPlannedQuantity) - Number(target.subRequireQuantity)).toFixed(4);
        }
      } else if (dataIndex == 'inventoryCode' || dataIndex == 'inventoryName') {
        clearValue(target);
        target['inventoryCode'] = value.inventoryCode;//物料编码
        target['inventoryId'] = value.id;//物料名称
        target['inventoryName'] = value.inventoryName;//物料名称
        target['inventorySpecification'] = value.inventorySpecification;//规格型号
        target['taxRate'] = value.taxRate ? value.taxRate : 0;//税率
        // target['price'] = value.latestCost ? value.latestCost : value.referenceCost ? value.referenceCost : '';//单价（最新成本or参考成本）
        target['inventoryCategoryName'] = value.inventoryCategoryName;//存货分类
        target['inventoryCategoryId'] = value.inventoryCategoryId;  //存货分类id
        target['commodityAttribute'] = value.commodityAttribute;    //存货商品属性
        target['baseRequireQuantity'] = 1;   //需求基数默认1
        target['lossQuantity'] = 0;   //损耗数量
        target['lossRate'] = 0;   //损耗率
        if(this.dataSource[this.classWorkCurrent].baseQuantity){
          target['requireQuantity'] = this.dataSource[this.classWorkCurrent].baseQuantity * 1;
          target['plannedQuantity'] = this.dataSource[this.classWorkCurrent].baseQuantity * 1;
        }


        if (value.unitType == '多计量') {
          target['baseUnit'] = value.mainUnit;
          target['baseUnitName'] = value.mainUnitName;
          target['mainUnit'] = value.mainUnit;
          target['unitGroupId'] = value.unitGroupId;
        } else {
          target['baseUnit'] = value.unitId;
          target['baseUnitName'] = value.unitName;
          target['unitId'] = value.unitId;
        }
      } else {
        if (target) {
          this.$set(target, dataIndex, value)
        }
      }

      this.$nextTick(() => {
        this.dataSourceBom = dataSourceBom;
        this.reloadWork();
      })
    },
    //工艺明细表单修改回调处理（工序）
    onCellChangeMinRoute (indexTable, dataIndex, value) {
      console.log(indexTable, dataIndex, value,);
      let dataSourceRoute = [];
      this.dataSource.forEach(item => {
        if (item.processRouteId == this.currentRouteId) {
          dataSourceRoute = item.procedureDetails;
        }
      });

      const target = dataSourceRoute.find((item, index) => index === indexTable);


      if (dataIndex == 'workerName') {
        //工人姓名
        if (value) {
          target['workerNames'] = value.name;
          target['workerIds'] = value.id;
        } else {
          target['workerNames'] = null;
          target['workerIds'] = null;
        }
      } else if (dataIndex == 'teamName') {
        //班组
        if (value) {
          target['teamName'] = value.name;
          target['teamId'] = value.id;
        } else {
          target['teamName'] = null;
          target['teamId'] = null;
        }
      } else {
        if (target) {
          this.$set(target, dataIndex, value)
        }
      }

      console.log(dataSourceRoute);
      this.$nextTick(() => {
        this.dataSource.forEach(item => {
          if (item.id == this.currentRouteId) {
            item.procedureDetails = dataSourceRoute;
          }
        });
        this.reload();
      })
    },
    // 选计划订单
    choiceBillsFromProductionOrder () {
      let postData = {
        sourceCode: 'ProductionOrder',      // 来源单
        title: '选计划订单',
        businessType: 2, //1:退货业务 2：非退货业务 3: 退货 + 非退货 4: 发票
        someBusinessType: '0',    // 指定业务类型 默认 0
        startVoucherState: 0,
        endVoucherState: 10
      }
      this.$refs.searchList.onOpenBox(postData);
    },






    //--------------------------------------右键-----------------------------
    reloadWork () {
      this.isRouterAliveWork = false;
      this.$nextTick(function () {
        this.isRouterAliveWork = true;
      });
    },
    openMenuDetails (e) {
      //显示右键菜单
      var x = e.pageX - 250;
      var y = e.pageY - 40;
      this.topDetails = y;
      this.leftDetails = x;
      this.visibleDetails = true;
    },
    closeMenuDetails () {
      //隐藏右键菜单
      this.visibleDetails = false;
    },
    handleAddDetails () {
      //新增数据
      let data = [];
      data = this.dataSourceBom;
      const newData = {
        number: data.length,
      };
      this.$nextTick(() => {
        data.splice(data.length, 0, newData);
        document.getElementById('documents-wrapper').scroll(0, this.$refs.print.scrollHeight);

        this.dataSourceBom = data;

        this.reloadWork();
      })
    },
    handleDeleteDetails () {
      //删除整行
      let _this = this;
      let numberId = this.thisClickIdDetails;
      let data = [];
      data = this.dataSourceBom;
      this.$confirm({
        title: "确认",
        content: (
          <span>
            您确定要{<span style="color:red;">删除</span>}该记录吗？
          </span>
        ),
        onOk () {
          let dataSource = [...data];
          if (dataSource.length - 1 > _this.dataSourceNumberOther) {
            //大于规定行数(删除)
            dataSource = dataSource.filter((item, index) => index !== numberId);
          } else {
            //小于规定行数(清空)
            for (let i = 0; i < dataSource.length; i++) {
              if (i === numberId) {
                for (const key in dataSource[i]) {
                  if (key != 'number') {
                    dataSource[i][key] = null;
                  }
                }
              }
            }
          }
          _this.dataSourceBom = dataSource;
          _this.reloadWork();
        },
        onCancel () { },
      });
    },
    onCellChangeTerms (indexTable, dataIndex, value) {
      let data = [];
      data = this.dataSourceBom;
      const dataSource = [...data];
      const target = dataSource.find((item, index) => index === indexTable);
      console.log(target, dataIndex, value, indexTable);
      this.$set(target, dataIndex, value)
      if (dataIndex == 'codeTerms' || dataIndex == 'nameTerms') {
        //工序编码
        if (value) {
          target['name'] = value.name;
          target['code'] = value.code;
          target['content'] = value.content;
          target['remarks'] = value.remarks;
        } else {
          target['name'] = null;
          target['code'] = null;
          target['content'] = null;
          target['remarks'] = null;
        }
      } else if (dataIndex == 'paymentType') {
        //结算类型
        target['type'] = value;
      } else if (dataIndex == 'fileUrl') {
        //合同附件
        target['fileName'] = value.fileName;
        target['fileUrl'] = value.fileUrl;
        target['fileType'] = value.fileType;
      }
      this.$nextTick(() => {
        this.dataSourceBom = dataSource;
        this.reloadWork();
      })
    },
    //--------------------------------------右键-----------------------------
  }
};
</script>
<style lang="less">
    @import '~@/style/purchase/voucher.less';
    .hoverWorkStyle {
        background-color: rgba(24, 144, 255, 0.2);
        td {
            color: #222;
        }
    }

    .wuliao-mask {
        z-index: 10;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        height: calc(100% - 20px);
        width: calc(100% - 20px);
        background: rgba(0, 0, 0, 0);
    }
</style>