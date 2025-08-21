<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <div ref="print" class="credentials-wrapper" id="documents-wrapper">
        <div style="min-height: 400px;">
          <h3 class="text-center">
            <span class="text-name">生产领料异常表</span><br />
          </h3>
          <!-- 按钮 -->
          <div class="btn-wrapper clearfix" style="border: none;">
            <a-row class="text-center clearfix">
              <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                <a-col
                  :xs="btnGrid.xs"
                  :sm="btnGrid.sm"
                  :md="btnGrid.md"
                  :lg="btnGrid.lg"
                  :xl="btnGrid.xl"
                >
                  <div class="btns" @click="searchDynamic">
                    <Icon class="btns-icon" icon="search" />
                    <div class="btns-text">查询</div>
                  </div>
                </a-col>
              </a-col>
              <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                <a-col
                  :offset="22"
                  :xs="btnGrid.xs"
                  :sm="btnGrid.sm"
                  :md="btnGrid.md"
                  :lg="btnGrid.lg"
                  :xl="btnGrid.xl"
                >
                  <div class="btns" @click="exportOrder">
                    <Icon class="btns-icon" icon="export" />
                    <div class="btns-text">导出</div>
                  </div>
                </a-col>
              </a-col>
            </a-row>
          </div>
          <section>
            <a-row>
              <a-col :span="24">
                <div class="table-box">
                  <BasicTable
                    id="bills_tb"
                    :columns="columns"
                    :dataSource="dataSource"
                    :pagination="pagination"
                    :rowClassName="rowClassName"
                    :expandedRowKeys="tableExplandKey"
                    :scroll="{ x: 600, y: 550 }"
                    bordered
                    size="small"
                    @expand="expand"
                  >
                    <template #baseQuantity="{ text, record }">
                      <div v-if="!record.dataType">{{ text | numFormat }}</div>
                    </template>
                    <template #plannedQuantity="{ text }">{{ text | numFormat }}</template>
                    <template #cumPickQuantity="{ text }">{{ text | numFormat }}</template>
                    <template #cumRepairQuantity="{ text }">{{ text | numFormat }}</template>
                    <template #cumRetQuantity="{ text }">{{ text | numFormat }}</template>
                  </BasicTable>
                </div>
              </a-col>
            </a-row>
            <div class="edit-mask" v-show="editMask">
              <!-- 遮罩（点击修改关闭遮罩） -->
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div class="loading-wrapper" v-show="loading">
      <Spin class="loading-content" tip="加载中..." />
    </div>

    <!-- 查询弹窗 -->
    <SearchWrapperNotPlan
      ref="searchWrapperRef"
      @newPlan="getMyselfPlan"
      @changePlane="changePlane"
      :type="searchType"
      @searchPlan="searchPlan"
    >
      <template #searchConditions>
        <a-col :span="12">
          <div class="filter">
            <label class="filter-label">计划开工日期：</label>
            <div class="filter-control">
              <DatePicker
                format="YYYY-MM-DD"
                v-model:value="postData.expectStartDateStartMoment"
              /> 至
              <DatePicker
                format="YYYY-MM-DD"
                v-model:value="postData.expectStartDateEndMoment"
              />
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="filter">
            <label class="filter-label">计划结束日期：</label>
            <div class="filter-control">
              <DatePicker
                format="YYYY-MM-DD"
                v-model:value="postData.expectFinishDateStartMoment"
              /> 至
              <DatePicker
                format="YYYY-MM-DD"
                v-model:value="postData.expectFinishDateEndMoment"
              />
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="filter">
            <label class="filter-label">生产车间：</label>
            <div class="filter-control">
              <div
                style="background: rgba(0,0,0,0); width: 100%; height: 28px; z-index: 2; position: absolute; top: 10px; left: 0;"
                @click="handleSearch('officeNameRef')"
              ></div>
              <InputSearch
                placeholder="请选择生产车间："
                v-model:value="officeName"
                size="small"
                @search="handleSearch('officeNameRef')"
              />
              <FormSearchGroup
                ref="officeNameRef"
                :dynamicData="{ name: '生产车间：', val: 'office', code: 'officeIdId', value: officeName }"
                @clickItem="onOfficeNameCallBack"
              ></FormSearchGroup>
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="filter">
            <label class="filter-label">物料名称：</label>
            <div class="filter-control" ref="inventoryNameWarpper" id="inventoryNameId">
              <Input
                size="small"
                :style="{ 'position': 'relative', 'z-index': zIndex }"
                v-model:value="inventoryName"
                @pressEnter="handleEnter(2)"
                @change="handleNameChange"
                @click="handlInputArchives(3, 'inventoryNameWarpper')"
              />
              <SearchArchivesName
                v-if="maskArchivesName"
                ref="searchArchivesRefName"
                :inventoryDomTop="inventoryDomTop"
                :inputType="inputType"
                :inputVal="inputVal"
                @closeArchives="closeArchives"
                @check="checkArchives"
              ></SearchArchivesName>
              <div
                class="mask-archives-name"
                v-show="maskArchivesName"
                @click="handlCloseArchives"
              ></div>
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="filter">
            <label class="filter-label">物料编码：</label>
            <div class="filter-control">{{ inventoryCode }}</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="filter">
            <label class="filter-label">规格型号：</label>
            <div class="filter-control">{{ inventorySpecification }}</div>
          </div>
        </a-col>
      </template>
    </SearchWrapperNotPlan>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onActivated } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  BasicTable,
  TableColumn,
  TableAction,
  TableExpand,
} from '/@/components/Table';
import { Spin, Input, InputSearch, DatePicker, Icon } from 'ant-design-vue';
import { exportPostAction, postAction } from '/@/api/manage';
import moment, { Moment } from 'moment';
import SearchWrapperNotPlan from '/@/components/SearchWrapper/index.vue';
import FormSearchGroup from '/@/components/Form/FormSearchGroup.vue';
import SearchArchivesName from '/@/components/OrderDynamicForm/searchArchivesName.vue';
import { Controlwidth } from '/@/utils/antTableComponents';
import { useMessage } from '/@/hooks/web/useMessage';
import { formatToDate } from '/@/utils/dateUtil';
import { numFormat } from '/@/utils/format';

const { t } = useI18n();
const message = useMessage();
const print = ref<HTMLDivElement | null>(null);
const searchWrapperRef = ref<InstanceType<typeof SearchWrapperNotPlan> | null>(null);
const officeNameRef = ref<InstanceType<typeof FormSearchGroup> | null>(null);
const searchArchivesRefName = ref<InstanceType<typeof SearchArchivesName> | null>(null);

// 状态定义
const loading = ref(false);
const editMask = ref(false);
const officeName = ref('');
const inventoryName = ref('');
const inventoryCode = ref('');
const inventorySpecification = ref('');
const zIndex = ref(5);
const zIndexType = ref(5);
const inputType = ref<number | null>(null);
const inventoryDomTop = ref(0);
const maskArchivesName = ref(false);
const tableExplandKey = ref<string[]>([]);
const setTime = ref<number | null>(null);
const total = ref(0);
const pageSize = ref(200);
const btnGrid = reactive({
  xs: 2,
  sm: 2,
  md: 2,
  lg: 2,
  xl: 2,
});

// 分页配置
const pagination = reactive<{ [key: string]: any }>({
  size: 'small',
  current: 1,
  pageSize: 200,
  total: 0,
  showTotal: (total: number) => {
    return (
      <div>
        共 {total} 条数据，每页
        <Input
          style={{ height: '22px !important', width: '3.2rem' }}
          v-model:value={pageSize.value}
          min={1}
          max={500}
          size="small"
          step={1}
          onPressEnter={changePageSize}
        />
        条
      </div>
    );
  },
  onChange: (page: number) => {
    pagination.current = page;
    getList();
  },
});

// 查询参数
const postData = reactive<{ [key: string]: any }>({
  dataSource: ['ProductionWork', 'DelegateProductionWork'], // 单据类型
  expectStartDateStartMoment: null as Moment | null,
  expectStartDateEndMoment: null as Moment | null,
  expectFinishDateStartMoment: null as Moment | null,
  expectFinishDateEndMoment: null as Moment | null,
  expectStartDateStart: null as string | null,
  expectStartDateEnd: null as string | null,
  expectFinishDateStart: null as string | null,
  expectFinishDateEnd: null as string | null,
  officeId: null as string | null,
  inventoryId: null as string | null,
});

// 表格列定义
const columns = reactive<TableColumn[]>([
  {
    title: '生产车间',
    dataIndex: 'officeName',
    width: 120,
    align: 'left',
  },
  {
    title: '物料编码',
    dataIndex: 'materialInventoryCode',
    width: 100,
    align: 'left',
  },
  {
    title: '物料名称',
    dataIndex: 'materialInventoryName',
    width: 100,
    align: 'left',
  },
  {
    title: '物料规格',
    dataIndex: 'materialInventorySpecification',
    width: 120,
    align: 'left',
  },
  {
    title: '产品编码',
    dataIndex: 'inventoryCode',
    width: 100,
    align: 'left',
  },
  {
    title: '产品名称',
    dataIndex: 'inventoryName',
    width: 100,
    align: 'left',
  },
  {
    title: '规格型号',
    dataIndex: 'inventorySpecification',
    width: 120,
    align: 'left',
  },
  {
    title: '计量单位',
    dataIndex: 'baseUnitName',
    width: 60,
    align: 'left',
  },
  {
    title: '计划生产数量',
    dataIndex: 'baseQuantity',
    width: 100,
    align: 'right',
    slots: { customRender: 'baseQuantity' },
  },
  {
    title: '物料单位',
    dataIndex: 'materialBaseUnitName',
    width: 60,
    align: 'left',
  },
  {
    title: '计划领料数',
    dataIndex: 'plannedQuantity',
    align: 'right',
    width: 100,
    slots: { customRender: 'plannedQuantity' },
  },
  {
    title: '领料数',
    dataIndex: 'cumPickQuantity',
    align: 'right',
    width: 100,
    slots: { customRender: 'cumPickQuantity' },
  },
  {
    title: '补料数',
    dataIndex: 'cumRepairQuantity',
    align: 'right',
    width: 100,
    slots: { customRender: 'cumRepairQuantity' },
  },
  {
    title: '退料数',
    dataIndex: 'cumRetQuantity',
    align: 'right',
    width: 100,
    slots: { customRender: 'cumRetQuantity' },
  },
  {
    title: '预计开工日期',
    dataIndex: 'expectStartDate',
    width: 120,
    align: 'left',
  },
  {
    title: '预计完工日期',
    dataIndex: 'expectFinishDate',
    width: 120,
    align: 'left',
  },
  {
    title: '开工日期',
    dataIndex: 'startDate',
    width: 150,
    align: 'left',
  },
  {
    title: '完工日期',
    dataIndex: 'finishDate',
    width: 150,
    align: 'left',
  },
]);

// 数据源
const dataSource = ref<Record<string, any>[]>([]);

// 生命周期钩子
onMounted(() => {
  Controlwidth('bills_tb', 50);
});

onActivated(() => {
  getList();
});

// 方法定义
function getList() {
  loading.value = true;
  tableExplandKey.value = [];

  // 处理日期格式
  if (postData.expectStartDateStartMoment) {
    postData.expectStartDateStart = formatToDate(postData.expectStartDateStartMoment);
  }
  if (postData.expectStartDateEndMoment) {
    postData.expectStartDateEnd = formatToDate(postData.expectStartDateEndMoment);
  }
  if (postData.expectFinishDateStartMoment) {
    postData.expectFinishDateStart = formatToDate(postData.expectFinishDateStartMoment);
  }
  if (postData.expectFinishDateEndMoment) {
    postData.expectFinishDateEnd = formatToDate(postData.expectFinishDateEndMoment);
  }

  const params = {
    ...postData,
    page: {
      current: pagination.current,
      size: pageSize.value,
    },
  };

  postAction('/production/work/pageProductionPickAbnormalVo', params)
    .then((response) => {
      loading.value = false;
      if (response.code === 200) {
        if (response.data) {
          pagination.pageSize = pageSize.value;
          pagination.total = response.data.total;
          total.value = response.data.total;
          if (total.value > 0) {
            dataFormat(response.data.records);
          } else {
            dataSource.value = [];
          }
        } else {
          dataSource.value = [];
        }
      }
    })
    .catch((error) => {
      loading.value = false;
      message.error('获取数据失败');
    });
}

function dataFormat(list: any[]) {
  const newList: any[] = [];
  let sumOffice: any = null;
  let sumInventory: any = null;
  const length = list.length;
  let offSet = 0;

  list.forEach((item, index) => {
    const { officeId, officeName, materialInventoryId, materialInventoryCode } = item;
    let { plannedQuantity, cumPickQuantity, cumRepairQuantity, cumRetQuantity } = item;

    plannedQuantity = plannedQuantity || 0;
    cumPickQuantity = cumPickQuantity || 0;
    cumRepairQuantity = cumRepairQuantity || 0;
    cumRetQuantity = cumRetQuantity || 0;

    if (!sumInventory) {
      sumInventory = {
        dataType: 2,
        officeId,
        officeName,
        materialInventoryId,
        materialInventoryCode: `${materialInventoryCode}(合计)`,
        baseQuantity: '',
        plannedQuantity,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
      };
    } else if (officeId === sumInventory.officeId && materialInventoryId === sumInventory.materialInventoryId) {
      sumInventory.plannedQuantity += plannedQuantity || 0;
      sumInventory.cumPickQuantity += cumPickQuantity || 0;
      sumInventory.cumRepairQuantity += cumRepairQuantity || 0;
      sumInventory.cumRetQuantity += cumRetQuantity || 0;
    } else {
      offSet++;
      sumInventory.plannedQuantity = Number(sumInventory.plannedQuantity.toFixed(3)) || 0;
      sumInventory.cumPickQuantity = Number(sumInventory.cumPickQuantity.toFixed(3)) || 0;
      sumInventory.cumRepairQuantity = Number(sumInventory.cumRepairQuantity.toFixed(3)) || 0;
      sumInventory.cumRetQuantity = Number(sumInventory.cumRetQuantity.toFixed(3)) || 0;

      newList.push(sumInventory);
      sumInventory = {
        dataType: 2,
        officeId,
        officeName,
        materialInventoryId,
        materialInventoryCode: `${materialInventoryCode}(合计)`,
        baseQuantity: '',
        plannedQuantity,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
      };
    }

    if (!sumOffice) {
      sumOffice = {
        dataType: 3,
        officeId,
        officeName: `${officeName}(合计)`,
        baseQuantity: '',
        plannedQuantity,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
      };
    } else if (officeId === sumOffice.officeId) {
      sumOffice.plannedQuantity += plannedQuantity || 0;
      sumOffice.cumPickQuantity += cumPickQuantity || 0;
      sumOffice.cumRepairQuantity += cumRepairQuantity || 0;
      sumOffice.cumRetQuantity += cumRetQuantity || 0;
    } else {
      offSet++;
      sumOffice.plannedQuantity = Number(sumOffice.plannedQuantity.toFixed(3)) || 0;
      sumOffice.cumPickQuantity = Number(sumOffice.cumPickQuantity.toFixed(3)) || 0;
      sumOffice.cumRepairQuantity = Number(sumOffice.cumRepairQuantity.toFixed(3)) || 0;
      sumOffice.cumRetQuantity = Number(sumOffice.cumRetQuantity.toFixed(3)) || 0;
      newList.push(sumOffice);
      sumOffice = {
        dataType: 3,
        officeId,
        officeName: `${officeName}(合计)`,
        baseQuantity: '',
        plannedQuantity,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
      };
    }

    newList.push(item);

    if (index === length - 1) {
      offSet += 2;
      sumInventory.plannedQuantity = Number(sumInventory.plannedQuantity.toFixed(3)) || 0;
      sumInventory.cumPickQuantity = Number(sumInventory.cumPickQuantity.toFixed(3)) || 0;
      sumInventory.cumRepairQuantity = Number(sumInventory.cumRepairQuantity.toFixed(3)) || 0;
      sumInventory.cumRetQuantity = Number(sumInventory.cumRetQuantity.toFixed(3)) || 0;

      sumOffice.plannedQuantity = Number(sumOffice.plannedQuantity.toFixed(3)) || 0;
      sumOffice.cumPickQuantity = Number(sumOffice.cumPickQuantity.toFixed(3)) || 0;
      sumOffice.cumRepairQuantity = Number(sumOffice.cumRepairQuantity.toFixed(3)) || 0;
      sumOffice.cumRetQuantity = Number(sumOffice.cumRetQuantity.toFixed(3)) || 0;
      newList.push(sumInventory);
      newList.push(sumOffice);
    }
  });

  const pages = Math.floor(total.value / pageSize.value) + (total.value % pageSize.value > 0 ? 1 : 0);
  pagination.pageSize = pageSize.value + offSet;
  pagination.total = total.value + offSet * pages;
  dataSource.value = newList;
}

function exportOrder() {
  loading.value = true;
  const params = { ...postData };

  // 处理日期格式
  if (postData.expectStartDateStartMoment) {
    params.expectStartDateStart = formatToDate(postData.expectStartDateStartMoment);
  }
  if (postData.expectStartDateEndMoment) {
    params.expectStartDateEnd = formatToDate(postData.expectStartDateEndMoment);
  }
  if (postData.expectFinishDateStartMoment) {
    params.expectFinishDateStart = formatToDate(postData.expectFinishDateStartMoment);
  }
  if (postData.expectFinishDateEndMoment) {
    params.expectFinishDateEnd = formatToDate(postData.expectFinishDateEndMoment);
  }

  exportPostAction('/production/work/pageProductionWorkCumSummaryVo', params)
    .then((response) => {
      loading.value = false;
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/vnd.ms-excel' })
      );
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', '生产订单执行汇总表.xls');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      loading.value = false;
      message.error('导出失败');
    });
}

function searchDynamic() {
  searchWrapperRef.value?.showModel();
}

function onOfficeNameCallBack(data: any) {
  officeName.value = data.name;
  postData.officeId = data.id;
}

function compareTime(start: string, end: string) {
  const oDate1 = new Date(start);
  const oDate2 = new Date(end);
  if (oDate1.getTime() > oDate2.getTime()) {
    // 这里需要根据实际情况调整日期赋值
  }
}

function changePageSize(e: Event) {
  const target = e.target as HTMLInputElement;
  const value = target.value;
  let size = Number.parseInt(value);
  if (!size) {
    size = 20;
  }
  if (size > 500) {
    size = 500;
  }
  pagination.current = 1;
  pageSize.value = size;
  getList();
}

function handleSearch(n: string) {
  const ref = officeNameRef.value;
  if (ref && n === 'officeNameRef') {
    ref.showModal();
  }
}

function handlInputArchives(type: number, ref: string) {
  const element = document.getElementsByClassName('ant-modal-content')[0];
  if (element) {
    (element as HTMLElement).style.transform = 'none';
  }

  inputType.value = type;
  if (type === 3) {
    zIndex.value = 5;
    zIndexType.value = 1;
    maskArchivesName.value = true;
  }

  // 获取位置
  const loc = (document.getElementById(ref) as HTMLElement).getBoundingClientRect();
  inventoryDomTop.value = Math.abs(loc.top);
}

function handleNameChange() {
  // 物料名称搜索
  if (searchArchivesRefName.value) {
    searchArchivesRefName.value.inputVal = inventoryName.value;
    searchArchivesRefName.value.getData(1);
  }
  postData.inventoryId = null;
  inventoryCode.value = '';
  inventorySpecification.value = '';
}

function handleEnter(t: number) {
  if (t === 2 && searchArchivesRefName.value) {
    searchArchivesRefName.value.handleEnter();
  }
}

function closeArchives() {
  maskArchivesName.value = false;
}

function handlCloseArchives() {
  const element = document.getElementsByClassName('ant-modal-content')[0];
  if (element) {
    (element as HTMLElement).style.transform = 'translate(0px, 0px)';
  }

  if (inputType.value === 3) {
    maskArchivesName.value = false;
    if (searchArchivesRefName.value) {
      searchArchivesRefName.value.closeModel();
    }
  }

  closeArchives();
}

function checkArchives(data: any) {
  maskArchivesName.value = false;

  // 返回值处理
  if (data[1] === 3) {
    // 物料编码名称
    inventoryName.value = data[0][0].inventoryName;
    inventoryCode.value = data[0][0].inventoryCode;
    inventorySpecification.value = data[0][0].inventorySpecification;
    postData.inventoryId = data[0][0].id;
  }

  closeArchives();
}

function rowClassName(record: any) {
  return !record.inventoryName ? 'changeColorClass' : '';
}

function searchPlan() {
  pagination.current = 1;
  getList();
  searchWrapperRef.value?.cancel(); // 关闭弹窗
}

function expand(expanded: boolean, record: any) {
  // 点击展开图标时触发
  const id = record.key;
  if (expanded) {
    tableExplandKey.value.push(id);
  } else {
    const index = tableExplandKey.value.findIndex((e) => e === id);
    if (index !== -1) {
      tableExplandKey.value.splice(index, 1);
    }
  }
}
</script>

<style lang="less">
@import '/@/style/purchase/voucher.less';

.changeColorClass {
  font-weight: bold;
  background-color: #fffceb;
}

.credentials-wrapper {
  padding: 10px;
  height: auto;
  overflow-y: auto;
  font-size: 14px;

  .date-tp {
    margin-bottom: 10px;

    .header-tp {
      text-align: left;
    }
  }

  .footer-tp {
    text-align: center;
    margin-top: 10px;
  }

  .text-name {
    padding-bottom: 5px;
  }

  .bills-box-header {
    display: flex;
    justify-content: space-around;

    .filter {
      display: table;
      width: 280px;
      margin-bottom: 5px;

      .filter-label {
        display: table-cell;
        font-weight: normal;
        max-width: 160px;
        line-height: 32px;
        white-space: nowrap;
        vertical-align: bottom;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .filter-control {
        display: table-cell;
        width: 100%;
      }
    }
  }
}

.date-radio-box {
  border: 1px solid #ccc;
  padding: 8px;

  .ant-radio {
    margin-top: 20px;
  }

  span.ant-radio + * {
    padding: 0;
    padding-right: 4px;
  }
}

.filter-label {
  width: 160px !important;
}
</style>