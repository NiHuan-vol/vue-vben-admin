<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <div ref="print" class="credentials-wrapper" id="documents-wrapper">
        <div style="min-height: 400px;">
          <h3 class="text-center">
            <span class="text-name">生产订单执行明细表</span><br>
          </h3>
          <!-- 按钮 -->
          <div class="btn-wrapper clearfix" style="border: none;">
            <a-row class="text-center clearfix">
              <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                <a-col :xs="btn_grid.xs" :sm="btn_grid.sm" :md="btn_grid.md" :lg="btn_grid.lg" :xl="btn_grid.xl">
                  <div class="btns" @click="searchDynamic">
                    <a-icon class="btns-icon" type="search" />
                    <div class="btns-text">查询</div>
                  </div>
                </a-col>
              </a-col>
              <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                <a-col :offset="22" :xs="btn_grid.xs" :sm="btn_grid.sm" :md="btn_grid.md" :lg="btn_grid.lg" :xl="btn_grid.xl">
                  <div class="btns" @click="exportOrder">
                    <a-icon class="btns-icon" type="export" />
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
                    :request-fn="getList"
                    :row-key="(record) => record.id"
                    :row-class-name="rowClassName"
                    :pagination="pagination"
                    :expandable="expandable"
                    :size="'small'"
                    :scroll="{ x: 600, y: 550 }"
                    bordered
                  >
                    <template #baseQuantity="{ record }">{{ formatNumber(record.baseQuantity) }}</template>
                    <template #cumQualifiedQuantity="{ record }">{{ formatNumber(record.cumQualifiedQuantity) }}</template>
                    <template #cumUnqualifiedQuantity="{ record }">{{ formatNumber(record.cumUnqualifiedQuantity) }}</template>
                    <template #cumReworkQuantity="{ record }">{{ formatNumber(record.cumReworkQuantity) }}</template>
                    <template #cumScrapQuantity="{ record }">{{ formatNumber(record.cumScrapQuantity) }}</template>
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

    <!--加载中-->
    <div class="loading-wrapper" v-show="loading">
      <a-spin class="loading-content" tip="加载中..." />
    </div>

    <!--查询弹窗-->
    <SearchModal
      v-model:visible="searchVisible"
      @search="searchPlan"
      :post-data="postData"
      @update:post-data="(data) => postData = { ...postData, ...data }"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { BasicTable, useTable } from '@/components/Table';
import { Button, Spin, Input, DatePicker, Form, FormItem } from 'ant-design-vue';
import { postAction, exportPostAction } from '@/api/http/axios';
import { formatToDateTime, isEmpty } from '@/utils';
import { moment } from 'moment';

// 类型定义
interface PostData {
  dataSource: string[];
  expectStartDateStartMoment: moment.Moment | null;
  expectStartDateEndMoment: moment.Moment | null;
  expectFinishDateStartMoment: moment.Moment | null;
  expectFinishDateEndMoment: moment.Moment | null;
  expectStartDateStart: string | null;
  expectStartDateEnd: string | null;
  expectFinishDateStart: string | null;
  expectFinishDateEnd: string | null;
  officeId: string | null;
  inventoryId: string | null;
  page: { current: number; size: number };
}

interface TableRecord {
  id: string;
  officeName: string;
  inventoryCode: string;
  inventoryName: string;
  inventorySpecification: string;
  baseUnitName: string;
  expectStartDate: string;
  expectFinishDate: string;
  startDate: string;
  finishDate: string;
  baseQuantity: number;
  cumQualifiedQuantity: number;
  cumUnqualifiedQuantity: number;
  cumReworkQuantity: number;
  cumScrapQuantity: number;
}

// 状态定义
const postData = reactive<PostData>({
  dataSource: ['ProductionWork', 'DelegateProductionWork'],
  expectStartDateStartMoment: null,
  expectStartDateEndMoment: null,
  expectFinishDateStartMoment: null,
  expectFinishDateEndMoment: null,
  expectStartDateStart: null,
  expectStartDateEnd: null,
  expectFinishDateStart: null,
  expectFinishDateEnd: null,
  officeId: null,
  inventoryId: null,
  page: { current: 1, size: 200 },
});

const officeName = ref('');
const inventoryCode = ref('');
const inventoryName = ref('');
const inventorySpecification = ref('');
const pagination = reactive({
  current: 1,
  pageSize: 200,
  total: 0,
  showTotal: (total: number) => {
    return (
      <div>
        共 {total} 条数据，每页
        <Input
          style={{ height: '22px !important', width: '3.2rem' }}
          value={pagination.pageSize}
          min={1}
          max={200}
          size="small"
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

const loading = ref(false);
const editMask = ref(false);
const searchVisible = ref(false);
const tableExplandKey = ref<string[]>([]);
const btn_grid = reactive({
  xs: 2,
  sm: 2,
  md: 2,
  lg: 2,
  xl: 2,
});

// 表格列定义
const columns = [
  { title: '生产车间', dataIndex: 'officeName', width: 120, align: 'left' },
  { title: '产品编码', dataIndex: 'inventoryCode', width: 100, align: 'left' },
  { title: '产品名称', dataIndex: 'inventoryName', width: 100, align: 'left' },
  { title: '规格型号', dataIndex: 'inventorySpecification', width: 120, align: 'left' },
  { title: '计量单位', dataIndex: 'baseUnitName', align: 'left' },
  { title: '预计开工日期', dataIndex: 'expectStartDate', width: 150, align: 'left' },
  { title: '预计完工日期', dataIndex: 'expectFinishDate', width: 150, align: 'left' },
  { title: '开工日期', dataIndex: 'startDate', width: 150, align: 'left' },
  { title: '完工日期', dataIndex: 'finishDate', width: 150, align: 'left' },
  { title: '计划生产数量', dataIndex: 'baseQuantity', width: 100, align: 'right', slots: { customRender: 'baseQuantity' } },
  { title: '累计合格数量', dataIndex: 'cumQualifiedQuantity', width: 100, align: 'right', slots: { customRender: 'cumQualifiedQuantity' } },
  { title: '累计不合格数量', dataIndex: 'cumUnqualifiedQuantity', width: 100, align: 'right', slots: { customRender: 'cumUnqualifiedQuantity' } },
  { title: '累计返工数量', dataIndex: 'cumReworkQuantity', align: 'right', slots: { customRender: 'cumReworkQuantity' } },
  { title: '累计报废数量', dataIndex: 'cumScrapQuantity', width: 100, align: 'right', slots: { customRender: 'cumScrapQuantity' } },
];

// 展开配置
const expandable = {
  expandedRowKeys: tableExplandKey,
  onExpand: (expanded: boolean, record: TableRecord) => {
    if (expanded) {
      tableExplandKey.value.push(record.id);
    } else {
      const index = tableExplandKey.value.findIndex(key => key === record.id);
      if (index !== -1) {
        tableExplandKey.value.splice(index, 1);
      }
    }
  },
};

// 数字格式化
const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0.000';
  return num.toFixed(3);
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  tableExplandKey.value = [];
  postData.page.current = pagination.current;
  postData.page.size = pagination.pageSize;

  // 格式化日期
  if (postData.expectStartDateStartMoment) {
    postData.expectStartDateStart = postData.expectStartDateStartMoment.format('YYYY-MM-DD');
  }
  if (postData.expectStartDateEndMoment) {
    postData.expectStartDateEnd = postData.expectStartDateEndMoment.format('YYYY-MM-DD');
  }
  if (postData.expectFinishDateStartMoment) {
    postData.expectFinishDateStart = postData.expectFinishDateStartMoment.format('YYYY-MM-DD');
  }
  if (postData.expectFinishDateEndMoment) {
    postData.expectFinishDateEnd = postData.expectFinishDateEndMoment.format('YYYY-MM-DD');
  }

  try {
    const response = await postAction('/production/work/pageProductionWorkCumDetailVo', postData);
    if (response.code === 200) {
      if (response.data) {
        pagination.total = response.data.total;
        return {
          items: response.data.records || [],
          total: response.data.total,
        };
      }
    }
    return { items: [], total: 0 };
  } catch (error) {
    console.error('获取数据失败:', error);
    return { items: [], total: 0 };
  } finally {
    loading.value = false;
  }
};

// 改变分页大小
const changePageSize = (e: Event) => {
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
  pagination.pageSize = size;
  getList();
};

// 导出订单
const exportOrder = async () => {
  try {
    const response = await exportPostAction('/production/work/pageProductionWorkCumSummaryVo', postData);
    if (response) {
      const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '生产订单执行汇总表.xls');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('导出失败:', error);
  }
};

// 动态查询
const searchDynamic = () => {
  searchVisible.value = true;
};

// 查询
const searchPlan = () => {
  pagination.current = 1;
  getList();
  searchVisible.value = false;
};

// 行样式
const rowClassName = (record: TableRecord) => {
  return !record.inventoryName ? 'changeColorClass' : '';
};

// 初始化
onMounted(() => {
  getList();
});

// 搜索弹窗组件（简化版，实际项目中应抽取为独立组件）
const SearchModal = defineComponent({
  props: {
    visible: Boolean,
    postData: Object,
  },
  emits: ['update:visible', 'search', 'update:post-data'],
  setup(props, { emit }) {
    const localPostData = reactive({ ...props.postData });

    watch(() => props.postData, (newVal) => {
      Object.assign(localPostData, newVal);
    });

    const handleSearch = () => {
      emit('update:post-data', { ...localPostData });
      emit('search');
    };

    return {
      localPostData,
      handleSearch,
      moment,
    };
  },
  template: `
    <a-modal
      v-model:visible="visible"
      title="查询条件"
      @ok="handleSearch"
      @cancel="() => $emit('update:visible', false)"
    >
      <a-row>
        <a-col :span="24">
          <div class="filter">
            <label class="filter-label">计划开工日期：</label>
            <div class="filter-control">
              <a-date-picker
                format="YYYY-MM-DD"
                v-model:value="localPostData.expectStartDateStartMoment"
              /> 至
              <a-date-picker
                format="YYYY-MM-DD"
                v-model:value="localPostData.expectStartDateEndMoment"
              />
            </div>
          </div>
        </a-col>
        <a-col :span="24">
          <div class="filter">
            <label class="filter-label">计划结束日期：</label>
            <div class="filter-control">
              <a-date-picker
                format="YYYY-MM-DD"
                v-model:value="localPostData.expectFinishDateStartMoment"
              /> 至
              <a-date-picker
                format="YYYY-MM-DD"
                v-model:value="localPostData.expectFinishDateEndMoment"
              />
            </div>
          </div>
        </a-col>
        <a-col :span="24">
          <div class="filter">
            <label class="filter-label">生产车间：</label>
            <div class="filter-control">
              <a-input-search placeholder="请选择生产车间：" size="small" />
            </div>
          </div>
        </a-col>
        <a-col :span="24">
          <div class="filter">
            <label class="filter-label">物料名称：</label>
            <div class="filter-control">
              <a-input size="small" placeholder="请输入物料名称" />
            </div>
          </div>
        </a-col>
      </a-row>
    </a-modal>
  `,
});
</script>

<style lang="less">
@import '~@/style/purchase/voucher.less';

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

.loading-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
}

.btns-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.btns-text {
  font-size: 12px;
}

/deep/ .filter-label {
  width: 160px !important;
}
</style>