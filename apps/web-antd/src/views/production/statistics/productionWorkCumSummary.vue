<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <SearchWrapperNotPlan
        ref="searchWrapperRef"
        @search="searchPlan"
      />
      <FormSearchGroup
        :searchItem="searchItem"
        @search="handleSearch"
        @searchDynamic="searchDynamic"
      />
      <div class="btn_grid">
        <a-button
          type="primary"
          @click="exportOrder"
          :loading="exportLoading"
          icon={<DownloadOutlined />}
          class="export-button"
        >
          导出
        </a-button>
        <a-button
          type="primary"
          @click="printOrder"
          icon={<PrinterOutlined />}
          class="print-button"
        >
          打印
        </a-button>
        <a-button
          @click="syncFun"
          icon={<SyncOutlined />}
        >
          刷新
        </a-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div ref="print" class="table-wrapper">
      <a-table
        v-loading="tableLoading"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :rowClassName="rowClassName"
        :expandIcon="expandIcon"
        @expand="expand"
        bordered
        size="small"
      />
    </div>

    <!-- 物料档案弹窗 -->
    <SearchArchivesName
      ref="searchArchivesRefName"
      :visible="maskArchivesName"
      @checkArchives="checkArchives"
      @close="handlCloseArchives"
      :zIndex="zIndex"
    />
    <SearchArchives
      ref="searchArchivesRef"
      :visible="maskArchives"
      @checkArchives="checkArchives"
      @close="handlCloseArchives"
      :zIndex="zIndex"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onActivated, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { DownloadOutlined, PrinterOutlined, SyncOutlined } from '@ant-design/icons-vue';
import { postAction, exportPostAction } from '@/api/manage';
import SearchWrapperNotPlan from '@/components/SearchWrapperNotPlan/index.vue';
import FormSearchGroup from '@/components/FormSearchGroup/index.vue';
import SearchArchivesName from '@/components/SearchArchivesName/index.vue';
import SearchArchives from '@/components/SearchArchives/index.vue';
import { formatToDateTime, dayjs } from '@/utils/dateUtil';

// 表格列定义
const columns = ref([
  {
    title: '生产车间',
    dataIndex: 'officeName',
    key: 'officeName',
    width: 120,
  },
  {
    title: '产品编码',
    dataIndex: 'inventoryCode',
    key: 'inventoryCode',
    width: 120,
  },
  {
    title: '产品名称',
    dataIndex: 'inventoryName',
    key: 'inventoryName',
    width: 150,
  },
  {
    title: '规格型号',
    dataIndex: 'inventorySpecification',
    key: 'inventorySpecification',
    width: 120,
  },
  {
    title: '单位',
    dataIndex: 'inventoryUnit',
    key: 'inventoryUnit',
    width: 80,
  },
  {
    title: '计划生产数量',
    dataIndex: 'baseQuantity',
    key: 'baseQuantity',
    width: 120,
    customRender: ({ text }) => text?.toFixed(3) || '0.000',
  },
  {
    title: '累计合格数量',
    dataIndex: 'cumQualifiedQuantity',
    key: 'cumQualifiedQuantity',
    width: 120,
    customRender: ({ text }) => text?.toFixed(3) || '0.000',
  },
  {
    title: '累计不合格数量',
    dataIndex: 'cumUnqualifiedQuantity',
    key: 'cumUnqualifiedQuantity',
    width: 120,
    customRender: ({ text }) => text?.toFixed(3) || '0.000',
  },
  {
    title: '累计返工数量',
    dataIndex: 'cumReworkQuantity',
    key: 'cumReworkQuantity',
    width: 120,
    customRender: ({ text }) => text?.toFixed(3) || '0.000',
  },
  {
    title: '累计报废数量',
    dataIndex: 'cumScrapQuantity',
    key: 'cumScrapQuantity',
    width: 120,
    customRender: ({ text }) => text?.toFixed(3) || '0.000',
  },
]);

// 响应式数据
const state = reactive({
  postData: {
    officeId: '',
    officeName: '',
    inventoryId: '',
    inventoryCode: '',
    inventoryName: '',
    inventorySpecification: '',
    expectStartDateStart: '',
    expectStartDateEnd: '',
    expectFinishDateStart: '',
    expectFinishDateEnd: '',
  },
  pagination: {
    current: 1,
    pageSize: 200,
    total: 0,
  },
  pageSize: 200,
  total: 0,
  dataSource: [],
  tableLoading: false,
  exportLoading: false,
  tableExplandKey: [],
  // 搜索相关
  officeName: '',
  beginCode: '',
  endCode: '',
  inventoryName: '',
  inventoryCode: '',
  inventorySpecification: '',
  inventoryTypeIdArray: [],
  inventoryTypeNameArray: '',
  maskArchives: false,
  maskArchivesName: false,
  maskArchivesType: false,
  inputType: 0,
  inputVal: '',
  zIndex: 1,
  zIndexType: 1,
  inventoryDomTop: 0,
  setTime: null as any,
  // 日期相关
  voucherDateStart: '',
  voucherDateEnd: '',
  periodDate: [],
  startPeriod: '',
  endPeriod: '',
});

// 搜索项配置
const searchItem = ref([
  {
    label: '生产车间',
    key: 'officeName',
    component: 'Input',
    value: state.officeName,
    onChange: (e: any) => {
      state.officeName = e.target.value;
    },
    onPressEnter: () => searchGroup(2),
  },
  {
    label: '产品名称',
    key: 'inventoryName',
    component: 'Input',
    value: state.inventoryName,
    onChange: (e: any) => {
      state.inventoryName = e.target.value;
      handleNameChange();
    },
    onPressEnter: () => handleEnter(2),
    addonAfter: (
      <a-button
        size="small"
        @click="() => handlInputArchives(3, 'inventoryName')"
      >
        参照
      </a-button>
    ),
  },
  // 更多搜索项...
]);

// 生命周期钩子
onMounted(() => {
  getList();
});

onActivated(() => {
  getList();
});

// 导出订单
const exportOrder = () => {
  state.exportLoading = true;
  exportPostAction('/production/work/pageProductionWorkCumSummaryVo', state.postData)
    .then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/vnd.ms-excel' })
      );
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', '生产订单执行汇总表.xls');
      document.body.appendChild(link);
      link.click();
      message.success('导出成功');
    })
    .catch((error) => {
      message.error('导出失败');
      console.error(error);
    })
    .finally(() => {
      state.exportLoading = false;
    });
};

// 打印订单
const printOrder = () => {
  // 实现打印逻辑，这里使用window.print作为示例
  window.print();
};

// 动态查询搜索条件
const searchDynamic = () => {
  // @ts-ignore
  state.$refs.searchWrapperRef.showModel();
};

// 搜索组
const searchGroup = (t: number) => {
  if (t === 1) {
    // @ts-ignore
    state.$refs.credentialsSearch.showModal();
  } else {
    // 延迟请求
    if (state.setTime) {
      clearTimeout(state.setTime);
    }
    state.setTime = setTimeout(() => {
      // @ts-ignore
      state.$refs.credentialsSearch.inputSearch();
    }, 500);
  }
};

// 日期比较
const compareTime = (start: string, end: string) => {
  const oDate1 = new Date(start);
  const oDate2 = new Date(end);
  if (oDate1.getTime() > oDate2.getTime()) {
    state.voucherDateStart = state.voucherDateEnd;
  }
};

// 获取列表数据
const getList = () => {
  state.tableLoading = true;
  state.tableExplandKey = [];

  const postData = {
    ...state.postData,
    page: {
      current: state.pagination.current,
      size: state.pageSize,
    },
  };

  // 处理日期格式
  if (postData.expectStartDateStart) {
    postData.expectStartDateStart = formatToDateTime(postData.expectStartDateStart);
  }
  if (postData.expectStartDateEnd) {
    postData.expectStartDateEnd = formatToDateTime(postData.expectStartDateEnd);
  }
  if (postData.expectFinishDateStart) {
    postData.expectFinishDateStart = formatToDateTime(postData.expectFinishDateStart);
  }
  if (postData.expectFinishDateEnd) {
    postData.expectFinishDateEnd = formatToDateTime(postData.expectFinishDateEnd);
  }

  postAction('/production/work/pageProductionWorkCumSummaryVo', postData)
    .then((response) => {
      if (response.code === 200) {
        if (response.data) {
          state.pagination.pageSize = state.pageSize;
          state.pagination.total = response.data.total;
          state.total = response.data.total;
          if (state.total > 0) {
            dataFormat(response.data.records);
          } else {
            state.dataSource = [];
          }
        } else {
          state.dataSource = [];
        }
      }
    })
    .catch((error) => {
      console.error(error);
      message.error('获取数据失败');
    })
    .finally(() => {
      state.tableLoading = false;
    });
};

// 数据格式化
const dataFormat = (list: any[]) => {
  const newList: any[] = [];
  let sumOffice: any = null;
  let sumInventory: any = null;
  const length = list.length;
  let offSet = 0;

  list.forEach((item, index) => {
    const { officeId, officeName, inventoryId, inventoryCode, baseQuantity, cumQualifiedQuantity, cumUnqualifiedQuantity, cumReworkQuantity, cumScrapQuantity } = item;
    const baseQty = baseQuantity || 0;
    const qualifiedQty = cumQualifiedQuantity || 0;
    const unqualifiedQty = cumUnqualifiedQuantity || 0;
    const reworkQty = cumReworkQuantity || 0;
    const scrapQty = cumScrapQuantity || 0;

    // 物料合计
    if (!sumInventory) {
      sumInventory = {
        officeId,
        officeName,
        inventoryId,
        inventoryCode: `${inventoryCode}(合计)`,
        baseQuantity: baseQty,
        cumQualifiedQuantity: qualifiedQty,
        cumUnqualifiedQuantity: unqualifiedQty,
        cumReworkQuantity: reworkQty,
        cumScrapQuantity: scrapQty,
      };
    } else if (officeId === sumInventory.officeId && inventoryId === sumInventory.inventoryId) {
      sumInventory.baseQuantity += baseQty;
      sumInventory.cumQualifiedQuantity += qualifiedQty;
      sumInventory.cumUnqualifiedQuantity += unqualifiedQty;
      sumInventory.cumReworkQuantity += reworkQty;
      sumInventory.cumScrapQuantity += scrapQty;
    } else {
      offSet++;
      sumInventory.baseQuantity = sumInventory.baseQuantity.toFixed(3) || 0;
      sumInventory.cumQualifiedQuantity = sumInventory.cumQualifiedQuantity.toFixed(3) || 0;
      sumInventory.cumUnqualifiedQuantity = sumInventory.cumUnqualifiedQuantity.toFixed(3) || 0;
      sumInventory.cumReworkQuantity = sumInventory.cumReworkQuantity.toFixed(3) || 0;
      sumInventory.cumScrapQuantity = sumInventory.cumScrapQuantity.toFixed(3) || 0;
      newList.push(sumInventory);
      sumInventory = {
        officeId,
        officeName,
        inventoryId,
        inventoryCode: `${inventoryCode}(合计)`,
        baseQuantity: baseQty,
        cumQualifiedQuantity: qualifiedQty,
        cumUnqualifiedQuantity: unqualifiedQty,
        cumReworkQuantity: reworkQty,
        cumScrapQuantity: scrapQty,
      };
    }

    // 车间合计
    if (!sumOffice) {
      sumOffice = {
        officeId,
        officeName: `${officeName}(合计)`,
        baseQuantity: baseQty,
        cumQualifiedQuantity: qualifiedQty,
        cumUnqualifiedQuantity: unqualifiedQty,
        cumReworkQuantity: reworkQty,
        cumScrapQuantity: scrapQty,
      };
    } else if (officeId === sumOffice.officeId) {
      sumOffice.baseQuantity += baseQty;
      sumOffice.cumQualifiedQuantity += qualifiedQty;
      sumOffice.cumUnqualifiedQuantity += unqualifiedQty;
      sumOffice.cumReworkQuantity += reworkQty;
      sumOffice.cumScrapQuantity += scrapQty;
    } else {
      offSet++;
      sumOffice.baseQuantity = sumOffice.baseQuantity.toFixed(3) || 0;
      sumOffice.cumQualifiedQuantity = sumOffice.cumQualifiedQuantity.toFixed(3) || 0;
      sumOffice.cumUnqualifiedQuantity = sumOffice.cumUnqualifiedQuantity.toFixed(3) || 0;
      sumOffice.cumReworkQuantity = sumOffice.cumReworkQuantity.toFixed(3) || 0;
      sumOffice.cumScrapQuantity = sumOffice.cumScrapQuantity.toFixed(3) || 0;
      newList.push(sumOffice);
      sumOffice = {
        officeId,
        officeName: `${officeName}(合计)`,
        baseQuantity: baseQty,
        cumQualifiedQuantity: qualifiedQty,
        cumUnqualifiedQuantity: unqualifiedQty,
        cumReworkQuantity: reworkQty,
        cumScrapQuantity: scrapQty,
      };
    }

    newList.push(item);

    // 最后一项处理
    if (index === length - 1) {
      offSet += 2;
      sumInventory.baseQuantity = sumInventory.baseQuantity.toFixed(3) || 0;
      sumInventory.cumQualifiedQuantity = sumInventory.cumQualifiedQuantity.toFixed(3) || 0;
      sumInventory.cumUnqualifiedQuantity = sumInventory.cumUnqualifiedQuantity.toFixed(3) || 0;
      sumInventory.cumReworkQuantity = sumInventory.cumReworkQuantity.toFixed(3) || 0;
      sumInventory.cumScrapQuantity = sumInventory.cumScrapQuantity.toFixed(3) || 0;

      sumOffice.baseQuantity = sumOffice.baseQuantity.toFixed(3) || 0;
      sumOffice.cumQualifiedQuantity = sumOffice.cumQualifiedQuantity.toFixed(3) || 0;
      sumOffice.cumUnqualifiedQuantity = sumOffice.cumUnqualifiedQuantity.toFixed(3) || 0;
      sumOffice.cumReworkQuantity = sumOffice.cumReworkQuantity.toFixed(3) || 0;
      sumOffice.cumScrapQuantity = sumOffice.cumScrapQuantity.toFixed(3) || 0;
      newList.push(sumInventory);
      newList.push(sumOffice);
    }
  });

  const pages = Math.floor(state.total / state.pageSize) + (state.total % state.pageSize > 0 ? 1 : 0);
  state.pagination.pageSize = state.pageSize + offSet;
  state.pagination.total = state.total + offSet * pages;
  state.dataSource = newList;
};

// 改变分页大小
const changePageSize = (e: any) => {
  const value = e.target.value;
  let size = Number.parseInt(value);
  if (!size) {
    size = 20;
  }
  if (size > 500) {
    size = 500;
  }
  state.pagination.current = 1;
  state.pageSize = size;
  getList();
};

// 处理搜索
const handleSearch = (n: string) => {
  // @ts-ignore
  state.$refs[`${n}`].showModal();
};

// 物料档案弹窗交互
const handlInputArchives = (type: number, ref: string) => {
  // @ts-ignore
  document.getElementsByClassName('ant-modal-content')[0].style.transform = 'none';

  state.inputType = type;
  if (type === 1 || type === 2) {
    state.maskArchives = true;
    state.zIndex = 1;
    state.zIndexType = 1;
  } else if (type === 3) {
    state.zIndex = 5;
    state.zIndexType = 1;
    state.maskArchivesName = true;
  } else if (type === 4) {
    state.zIndexType = 6;
    state.zIndex = 1;
    state.maskArchivesType = true;
  }

  // @ts-ignore
  const loc = state.$refs[`${ref}`].getBoundingClientRect();
  state.inventoryDomTop = Math.abs(loc.top);
};

// 物料名称变化
const handleNameChange = () => {
  // @ts-ignore
  state.$refs.searchArchivesRefName.inputVal = state.inventoryName;
  // @ts-ignore
  state.$refs.searchArchivesRefName.getData(1);
  state.postData.inventoryId = null;
  state.inventoryCode = null;
  state.inventorySpecification = null;
};

// 处理回车
const handleEnter = (t: number) => {
  if (t === 1) {
    // @ts-ignore
    state.$refs.searchArchivesRef.handleEnter();
  } else {
    // @ts-ignore
    state.$refs.searchArchivesRefName.handleEnter();
  }
};

// 关闭档案弹窗
const closeArchives = () => {
  state.maskArchives = false;
  state.maskArchivesName = false;
  state.maskArchivesType = false;
};

// 处理关闭档案弹窗
const handlCloseArchives = () => {
  // @ts-ignore
  document.getElementsByClassName('ant-modal-content')[0].style.transform = 'translate(0px, 0px)';

  if (state.inputType === 1 || state.inputType === 2) {
    state.maskArchives = false;
    // @ts-ignore
    state.$refs.searchArchivesRef.closeModel();
  } else if (state.inputType === 3) {
    state.maskArchivesName = false;
    // @ts-ignore
    state.$refs.searchArchivesRefName.closeModel();
  } else if (state.inputType === 4) {
    state.maskArchivesType = false;
    // @ts-ignore
    state.$refs.searchArchivesRefType.closeModel();
  }
};

// 物料选择确认
const checkArchives = (data: any) => {
  state.maskArchives = false;
  state.maskArchivesName = false;

  if (data[1] === 1) {
    // 起始值
    state.beginCode = data[0][0].inventoryCode;
  }
  if (data[1] === 2) {
    // 结束值
    state.endCode = data[0][0].inventoryCode;
  }
  if (data[1] === 3) {
    // 物料编码名称
    state.inventoryName = data[0][0].inventoryName;
    state.inventoryCode = data[0][0].inventoryCode;
    state.inventorySpecification = data[0][0].inventorySpecification;
    state.postData.inventoryId = data[0][0].id;
  }

  if (data[1] === 4) {
    // 物料分类
    const tData = data[0].checkedNodes;
    const typeNameArray: string[] = [];
    const typeIdArray: string[] = [];
    tData.forEach((item: any) => {
      typeNameArray.push(item.data.class);
      typeIdArray.push(item.data.props.id);
    });

    state.inventoryTypeNameArray = typeNameArray.join(';');
    state.inventoryTypeIdArray = typeIdArray;
  }

  closeArchives();
};

// 行样式
const rowClassName = (record: any) => {
  return !record.inventoryName ? 'changeColorClass' : '';
};

// 搜索执行
const searchPlan = () => {
  state.pagination.current = 1;
  getList();
  // @ts-ignore
  state.$refs.searchWrapperRef.cancel(); // 关闭弹窗
};

// 刷新
const syncFun = () => {
  getList();
};

// 展开处理
const expand = (expanded: boolean, record: any) => {
  const id = record.key;
  if (expanded) {
    state.tableExplandKey.push(id);
  } else {
    const index = state.tableExplandKey.findIndex((e) => e === id);
    if (index !== -1) {
      state.tableExplandKey.splice(index, 1);
    }
  }
};

// 展开图标
const expandIcon = (props: any) => {
  const { expanded, record } = props;
  return (
    <a
      onClick={(e) => {
        e.stopPropagation();
        expand(!expanded, record);
      }}
    >
      {expanded ? '收起' : '展开'}
    </a>
  );
};
</script>

<style lang="less">
@import '~@vben/styles/purchase/voucher.less';

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
</style>

<style lang="less" scoped>
.filter-label {
  width: 160px !important;
}
</style>