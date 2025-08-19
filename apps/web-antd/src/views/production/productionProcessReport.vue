<!-- 生产执行->工序汇报单 -->
<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper" style="display:block">
      <!-- 按钮 -->
      <div class="btn-wrapper clearfix">
        <BtnsWrapper
          @searchClick="searchClick"
          :showModel="showModel"
          :orderId="orderId"
          :voucherState="voucherState"
          :editMask="editMask"
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
          :sourceCode="sourceCode"
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
                <a-menu-item key="1">
                  <a href="javascript:void(0)" @click="choiceProduct">选单</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </BtnsWrapper>
      </div>
      <div ref="print" class="documents-wrapper" id="documents-wrapper">
        <h3 class="text-center">{{ voucherTitle }}</h3>
        <section v-show="showModel === 'list'">
          <!--列表-->
          <DynamicList
            ref="dyList"
            :basePostData="basePostData"
            :sourceCode="sourceCode"
            @switchList="switchList"
            @dblclick="getIdByData"
            :reportCode="reportCodeList"
          />
        </section>
        <section v-show="showModel === 'order'">
          <div>
            <span class="audit-status" v-show="voucherState === 0">待审核</span>
            <span class="audit-status" v-show="voucherState === 1 || voucherState === 10">{{ voucherState === 1 ? '已审核' : '关闭' }}</span>
          </div>
          <a-form-model :layout="formLayout">
            <div class="header-box">
              <OrderDynamicForm
                v-if="isHeaderShow"
                :FormData="orderHeaderData"
                @changetime="onChangeTime"
                @clickItem="setValue"
              />
              <div class="edit-mask-header" v-show="editMask">
                <!-- 遮罩（点击修改关闭遮罩） -->
              </div>
            </div>
            <div class="table-box">
              <a-table
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
                <template #number="{ text, record, index }" v-if="isRouterAlive">
                  <div v-if="index === dataSource.length - 1">合计</div>
                  <div v-else>{{ index + 1 }}</div>
                </template>
                <template v-for="col in slotArray" :slot="col" :key="col" slot-scope="{ text, record, index }">
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
                      @choiceAddData="(index, col, event) => choiceAddData(index, col, event)"
                      @change="(index, col, event) => onCellChange(index, col, event)"
                      @newAddData="handleAdd"
                    />
                  </div>
                </template>
              </a-table>
              <div class="edit-mask" v-show="editMask">
                <!-- 遮罩（点击修改关闭遮罩） -->
              </div>
            </div>
            <div class="footer-box">
              <OrderDynamicForm v-if="isHeaderShow" :FormData="orderFooterData" />
              <div class="edit-mask-footer" v-show="editMask">
                <!-- 遮罩（点击修改关闭遮罩） -->
              </div>
            </div>
          </a-form-model>
        </section>
        <section v-show="showModel === 'detail'">
          <!--明细-->
          <DynamicListDetails
            ref="detailSearchRef"
            :reportCode="reportCodeDetail"
            :componentType="1"
            :basePostData="basePostData"
          />
        </section>
        <section v-show="showModel === 'statistical'">
          <!--统计-->
          <DynamicListDetails
            ref="statisticalSearchRef"
            :reportCode="reportCodeStatistical"
            :componentType="2"
            :basePostData="basePostData"
          />
        </section>
      </div>
      <div class="contextmenu-box">
        <!-- 右键菜单 -->
        <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
          <li @click="handleAdd">新增行</li>
          <li @click="handleDelete">删除行</li>
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

    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>
    <!--用做横向打印-->
    <PrintModal
      ref="printDom"
      v-if="printVisible"
      :incomingPrintData="incomingPrintData"
      @cancelPrint="cancelPrint"
    />
    <!--分单-->
    <ProductionInModal ref="productionInRef" />

    <!-- 选生产任务单 -->
    <a-modal
      title="选择生产产品"
      :visible="visibleProcessing"
      centered
      width="1100px"
      @cancel="cancelProcessing"
    >
      <template>
        <div style="min-height: 230px;">
          <a-table
            :scroll="{ x: 1000, y: 200 }"
            :columns="columnCheckMax"
            :data-source="columnCheckMaxData"
            bordered
            :pagination="false"
            :row-selection="{ selectedRowKeys: selectedRowMaxKeys, onChange: onSelectChangeMax, columnsWidth: 20 }"
          />
        </div>
        <div class="titleDiv">
          <div>汇报日期:{{ dayDate }}</div>
          <div class="title">工序汇报</div>
        </div>
        <div class="table-box-mmp" style="min-height: 230px;">
          <a-table
            :scroll="{ x: 1000, y: 200 }"
            :columns="columnCheckMin"
            :data-source="columnCheckMinData"
            bordered
            :pagination="false"
            :row-selection="{ selectedRowKeys: selectedRowMinKeys, onChange: onSelectChangeMin, columnsWidth: 40 }"
          >
            <template v-for="col in slotArry" :slot="col" :key="col" slot-scope="{ text, record, index }">
              <div data-key="">
                <EditableCells
                  v-if="isRouterAlive"
                  :dynamicAllData="timeSlotArr"
                  :showTotal="false"
                  :text="text"
                  :col="col"
                  :index="index"
                  :record="record"
                  @change="(index, col, event) => onCellChange(index, col, event)"
                  :dataSource="modalList2"
                />
              </div>
            </template>
          </a-table>
        </div>
      </template>
      <template #footer>
        <div>
          <a-button type="primary" @click="addClick">确定</a-button>
          <a-button @click="cancelProcessing" class="margin-left-10">关闭</a-button>
        </div>
      </template>
      <div class="contextmenu-box" ref="contextmenuBox">
        <!-- 右键菜单 -->
        <ul v-show="visible" class="contextmenu">
          <li @click="handleDelete">删除行</li>
        </ul>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { saveReport, exameReport, deleteReport, getCodeReport, submitOrder, getUnFinishProductionWorkVo } from '@/api/production/productionProcessReport';
import { listProcessRouteAndPriceDetailVoByRouteDetailIds } from '@/api/production/processRoute';
import { useProMixins } from '@/mixins/procurement/pro';
import { getCurrentMoment } from '@/utils/tool/date';
import { useMessage } from 'naive-ui';
import ProductionInModal from '@/components/SeparateBill/productionInModal.vue';
import { Icon } from '@iconify/vue';

// 组件实例
const instance = getCurrentInstance();
const message = useMessage();
const proMixins = useProMixins();

// 响应式数据
const basePostData = reactive<Record<string, any>>({
  someBusinessType: null, // 指定业务类型 默认 0
});

const sourceCode = ref('ProductionWorkReport');
const reportCodeDetail = ref('ProductionWorkReport_Detail_Report'); // 明细code
const reportCodeStatistical = ref('ProductionWorkReport_Statistic_Report'); // 统计code
const reportCodeList = ref('ProductionWorkReport_List_Report'); // 列表code
const receiveDeliverType = ref(1); // 1入，2出

// 隐藏明细当中的仓库和仓库编码
const isHideWherehouse = ref(false);
const checkType = ref('is_made_self'); // 自制
const isHeaderShow = ref(true); // 是否显示 表头表尾

const visibleProcessing = ref(false);
const maxClickId = ref<number | null>(null);
const dayDate = ref(getCurrentMoment().format('YYYY-MM-DD'));

// 表格列配置
const columnCheckMax = ref([
  {
    title: '生产车间',
    dataIndex: 'officeName',
    align: 'center',
    width: 80,
  },
  {
    title: '生产单号',
    dataIndex: 'productionWorkCode',
    align: 'center',
    width: 80,
  },
  {
    title: '物料名称',
    dataIndex: 'inventoryName',
    align: 'center',
    width: 80,
    scopedSlots: {
      customRender: 'inventoryName',
    },
  },
  {
    title: '规格型号',
    dataIndex: 'inventorySpecification',
    align: 'center',
    width: 80,
    scopedSlots: {
      customRender: 'inventorySpecification',
    },
  },
  {
    title: '生产数量',
    dataIndex: 'baseQuantity',
    align: 'center',
    width: 80,
    scopedSlots: {
      customRender: 'baseQuantity',
    },
  },
  {
    title: '完成数量',
    dataIndex: 'cumExecuteQuantity',
    align: 'center',
    width: 80,
    scopedSlots: {
      customRender: 'cumExecuteQuantity',
    },
  },
  {
    title: '预计完工时间',
    dataIndex: 'expectFinishDate',
    align: 'center',
    width: 80,
    scopedSlots: {
      customRender: 'expectFinishDate',
    },
  },
]);

const columnCheckMaxData = ref<Record<string, any>[]>([]);

const columnCheckMin = ref([
  {
    title: '工序名称',
    dataIndex: 'procedureName',
    align: 'center',
    width: 80,
  },
  {
    title: '工序标识',
    dataIndex: 'workFlag',
    align: 'center',
    width: 80,
    customRender: (text: number) => {
      switch (text) {
        case 1: return '首工序';
        case 2: return '尾工序';
        case 3: return '中间工序';
        default: return '';
      }
    },
  },
  {
    title: '生产设备',
    dataIndex: 'equipmentName',
    align: 'center',
    width: 80,
  },
  {
    title: '累计合格数量',
    dataIndex: 'cumQualifiedQuantity',
    align: 'center',
    width: 100,
  },
  {
    title: '累计返工数量',
    dataIndex: 'cumReworkQuantity',
    align: 'center',
    width: 100,
  },
  {
    title: '累计不合格数量',
    dataIndex: 'cumUnqualifiedQuantity',
    align: 'center',
    width: 100,
  },
  {
    title: '累计报废数量',
    dataIndex: 'cumScrapQuantity',
    align: 'center',
    width: 100,
  },
]);

const columnCheckMinData = ref<Record<string, any>[]>([]);

// 选择项
const selectedRowMaxKeys = ref<number[]>([]);
const selectedRowMaxRows = ref<Record<string, any>[]>([]);
const selectedRowMinKeys = ref<number[]>([]);
const selectedRowMinRows = ref<Record<string, any>[]>([]);

// 继承mixin的数据和方法
const { 
  showModel, editMask, loading, voucherState, orderId, sourceVoucherData, 
  orderHeaderData, orderFooterData, dataSource, columns, slotArray, 
  dynamicFormData, dynamicFormDataMap, unitsDataDetails, unitsAssistSelect, 
  isRouterAlive, printVisible, incomingPrintData, voucherTitle, formLayout,
  // 方法
  searchClick, printOrder, switchList, submitServer, clickEdit, deleteOrder, 
  getIdByData, auditClick, turnThePage, syncOrder, submitOrder: mixinSubmitOrder, 
  exportDetail, onChangeTime, setValue, onTableChange, customClick, handleAdd, 
  handleDelete, cancelPrint, editClickOrder, reload, addTotal
} = proMixins;

expose({
  // 暴露需要的方法给父组件
});

// 生命周期
onMounted(() => {
  // 初始化数据
});

onUnmounted(() => {
  // 清理工作
});

// 自定义方法
const newForecast = () => {
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {}; // 清空来源数据
  initForm(1);
};

const initForm = (type: number) => {
  // 初始化表单数据
};

const submit = (requestData: Record<string, any>) => {
  saveReport(requestData)
    .then((response) => {
      if (response.code === 200) {
        message.success('保存成功');
        editMask.value = true;
        // 获取最新一条数据
        getIdByData();
      } else {
        message.error(response.message);
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const submitOrderLocal = (type: number) => {
  const data = {
    id: orderId.value,
    status: type, // 状态 -1:撤回提交,0:提交
  };

  if (!orderId.value) {
    message.warning('该单据未保存不需要提交');
    return;
  }

  if (voucherState.value === -1 && type === -1) {
    message.warning('该单据未提交无需撤回提交');
    return;
  }

  submitOrder(data)
    .then((res) => {
      if (res.code === 200) {
        if (type === 0) {
          message.success('提交成功');
        } else {
          message.success('撤回提交成功');
        }
        getIdByData();
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const auditClickLocal = (type: number) => {
  const requestData = {
    id: orderId.value,
    status: type,
  };

  exameReport(requestData)
    .then((response) => {
      if (response.code === 200) {
        if (type === 1) {
          message.success('审核成功');
          getIdByData();
        }
        if (type === 0) {
          message.success('弃审成功');
          getIdByData();
        }
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const remove = (postData: Record<string, any>) => {
  deleteReport(postData)
    .then((response) => {
      if (response.code === 200) {
        message.success('删除成功');
        orderId.value = '';
        voucherState.value = 0;
        getIdByData(); // 获取最新一条数据
      } else {
        message.error(response.message);
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const getCode = () => {
  getCodeReport()
    .then((res) => {
      if (res.code === 200) {
        const receiptNumber = res.message;
        for (let i = 0; i < orderHeaderData.value.length; i++) {
          if (orderHeaderData.value[i].code === 'voucherCode') {
            orderHeaderData.value[i].onEdit = false;
            orderHeaderData.value[i].value = receiptNumber;
          }
        }
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const choiceProduct = () => {
  visibleProcessing.value = true;
  getProduct();
};

const cancelProcessing = () => {
  visibleProcessing.value = false;
  selectedRowMaxKeys.value = [];
  selectedRowMaxRows.value = [];
  selectedRowMinKeys.value = [];
  selectedRowMinRows.value = [];
};

const getProduct = () => {
  // 选择加工产品
  getUnFinishProductionWorkVo({})
    .then((res) => {
      if (res.code === 200) {
        const maxData = res.data.unFinishProductionWorkDetailSimpleVoList;
        const minData = res.data.unFinishProductionWorkProcedureVoList;

        maxData.forEach((item: any) => {
          item.key = item.id;
        });
        minData.forEach((item: any) => {
          item.key = item.productionWorkProcedureDetailId;
        });

        columnCheckMaxData.value = maxData;
        columnCheckMinData.value = minData;
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const onSelectChangeMax = (keys: number[], rows: Record<string, any>[]) => {
  selectedRowMaxKeys.value = keys;
  selectedRowMaxRows.value = rows;

  selectedRowMinKeys.value = [];
  selectedRowMinRows.value = [];

  columnCheckMinData.value.forEach((item) => {
    keys.forEach((key) => {
      if (key === item.productionWorkDetailId) {
        selectedRowMinKeys.value.push(item.key);
        selectedRowMinRows.value.push(item);
      }
    });
  });
};

const onSelectChangeMin = (keys: number[], rows: Record<string, any>[]) => {
  selectedRowMinKeys.value = keys;
  selectedRowMinRows.value = rows;

  selectedRowMaxKeys.value = [];
  selectedRowMaxRows.value = [];

  columnCheckMaxData.value.forEach((item) => {
    rows.forEach((row) => {
      if (row.productionWorkDetailId === item.id) {
        selectedRowMaxKeys.value.push(item.id);
        selectedRowMaxRows.value.push(item);
      }
    });
  });
};

const listProcessRouteAndPriceDetailVoByRouteDetailIdsLocal = (data: any[], ids: Set<number>) => {
  listProcessRouteAndPriceDetailVoByRouteDetailIds(Array.from(ids))
    .then((res) => {
      if (res.code === 200) {
        const priceMap = new Map();
        res.data.forEach((item: any) => {
          priceMap.set(item.processRouteDetailId, item);
        });

        const wagesTypeDesign = dynamicFormDataMap.value.get('wagesType_明细');

        data.forEach((detail) => {
          const priceItem = priceMap.get(detail.processRouteDetailId);
          if (!priceItem) return;

          detail.qualifiedPrice = priceItem.lastQualifiedPrice || priceItem.qualifiedPrice || 0.00;
          detail.reworkPrice = priceItem.lastReworkPrice || priceItem.reworkPrice || 0.00;
          detail.unqualifiedPrice = priceItem.lastUnqualifiedPrice || priceItem.unqualifiedPrice || 0.00;
          detail.scrapPrice = priceItem.lastScrapPrice || priceItem.scrapPrice || 0.00;
          detail.workHourPrice = priceItem.lastWorkHourPrice || priceItem.workHourPrice || 0.00;
          detail.procedureOrder = priceItem.procedureOrder;

          if (wagesTypeDesign && wagesTypeDesign.columnType === '下拉选择') {
            const label = handleDownChoice(priceItem.wagesType, wagesTypeDesign.val);
            detail['wagesType'] = label;
            detail['wagesType' + 'Id'] = priceItem.wagesType;
          } else {
            detail.wagesType = priceItem.wagesType;
          }
        });

        reload();
      }
    })
    .catch(() => {
      // 错误处理
    });
};

const handleDownChoice = (value: number, options: any[]) => {
  const item = options.find((opt) => opt.id === value);
  return item ? item.name : '';
};

const addClick = () => {
  if (selectedRowMaxRows.value.length < 1) {
    message.warning('请选择加工产品');
    return;
  }

  orderId.value = null;
  showModel.value = 'order';
  editMask.value = false;
  loading.value = false;
  voucherState.value = -1;
  sourceVoucherData.value = {}; // 清空来源数据

  dynamicFormData.value.forEach((item) => {
    delete item.value;
    if (item.columnType === '日期') {
      item.value = getCurrentMoment().format('YYYY-MM-DD');
    } else if (item.code === 'officeId') {
      item.valueId = selectedRowMaxRows.value[0].officeId;
      item.valueName = selectedRowMaxRows.value[0].officeName;
      item.value = selectedRowMaxRows.value[0].officeName;
    } else if (item.code === 'voucherState') {
      item.value = -1;
    }
  });

  const map = new Map();
  const data: any[] = [];

  selectedRowMaxRows.value.forEach((item) => {
    item.id = null;
    map.set(item.key, item);
  });

  const processRouteDetailIdsSet = new Set<number>();
  const wagesTypeDesign = dynamicFormDataMap.value.get('wagesType_明细');

  selectedRowMinRows.value.forEach((item, index) => {
    processRouteDetailIdsSet.add(item.processRouteDetailId);
    const wagesType = item.wagesType;

    data[index] = Object.assign(item, map.get(item.productionWorkDetailId));
    data[index].procedureFlag = item.workFlag;
    data[index].procedureOrder = item.procedureOrder;
    data[index].productionWorkMainCode = item.productionWorkCode;

    if (wagesTypeDesign && wagesTypeDesign.columnType === '下拉选择') {
      const label = handleDownChoice(wagesType, wagesTypeDesign.val);
      data[index].wagesType = label;
      data[index].wagesTypeId = wagesType;
    } else {
      data[index].wagesType = wagesType;
    }

    delete item.id;
  });

  listProcessRouteAndPriceDetailVoByRouteDetailIdsLocal(data, processRouteDetailIdsSet);
  dataSource.value = data;

  // 补足表格
  if (dataSource.value.length < 5) {
    for (let i = dataSource.value.length; i < 5; i++) {
      const array = {
        number: i + 1,
      };
      dataSource.value.push(array);
    }
    addTotal(); // 添加合计
  } else {
    for (let i = 0; i < 2; i++) {
      const array = {
        number: i + 1,
      };
      dataSource.value.push(array);
    }
    addTotal(); // 添加合计
  }

  cancelProcessing(); // 关闭弹窗
  reload();
  getCode();
};

// 单元格变更处理
const onCellChange = (index: number, col: string, event: any) => {
  // 实现单元格变更逻辑
};

// 选择添加数据
const choiceAddData = (index: number, col: string, event: any) => {
  // 实现选择添加数据逻辑
};
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';

.hoverRowCard {
  background-color: rgba(24, 144, 255, 0.2);
  td {
    color: #222;
  }
}

// 适配vue-vben-admin风格
.content-wrapper {
  padding: 16px;
  background-color: @content-bg;
  min-height: 100%;
}

.btn-wrapper {
  margin-bottom: 16px;
  .btns {
    margin-right: 8px;
    .btns-icon {
      margin-right: 4px;
    }
  }
}

.table-box {
  margin-top: 16px;
  .ant-table {
    background-color: #fff;
    border-radius: 4px;
  }
}

.audit-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
  &[v-show="voucherState === 0"] {
    background-color: #fff212;
    color: #77491e;
  }
  &[v-show="voucherState === 1"] {
    background-color: #52c41a;
    color: #fff;
  }
  &[v-show="voucherState === 10"] {
    background-color: #bfbfbf;
    color: #fff;
  }
}
</style>