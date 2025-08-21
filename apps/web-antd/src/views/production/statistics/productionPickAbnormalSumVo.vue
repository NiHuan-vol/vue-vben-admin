<template>
  <div class="production-pick-abnormal-sum-vo">
    <BasicTable
      @register="registerTable"
      :expandedRowKeys="expandedRowKeys"
      @expand="handleExpand"
      :rowClassName="rowClassName"
    >
      <template #toolbar>
        <a-row :gutter="[16]">
          <a-col :span="24">
            <a-space>
              <a-button type="primary" @click="searchDynamic">查询</a-button>
              <a-button @click="exportOrder">导出</a-button>
            </a-space>
          </a-col>
        </a-row>
      </template>
    </BasicTable>

    <!-- 查询弹窗 -->
    <Modal
      v-model:visible="searchModalVisible"
      title="查询条件"
      width="800px"
      @ok="handleSearchSubmit"
      @cancel="handleSearchCancel"
    >
      <a-form layout="vertical" :model="searchForm" :rules="searchRules">
        <a-row :gutter="[16]">
          <a-col :span="12">
            <a-form-item label="计划开工日期" name="expectStartDate">
              <RangePicker
                v-model:value="searchForm.expectStartDate"
                format="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计划结束日期" name="expectFinishDate">
              <RangePicker
                v-model:value="searchForm.expectFinishDate"
                format="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="生产车间" name="officeName">
              <ProSelect
                v-model:value="searchForm.officeName"
                placeholder="请选择生产车间"
                style="width: 100%"
                @click="handleSearch('officeName')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="物料名称" name="inventoryName">
              <ProSelect
                v-model:value="searchForm.inventoryName"
                placeholder="请选择物料名称"
                style="width: 100%"
                @click="handleSearch('inventoryName')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="物料编码" name="inventoryCode">
              <Input
                v-model:value="searchForm.inventoryCode"
                placeholder="物料编码"
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="规格型号" name="inventorySpecification">
              <Input
                v-model:value="searchForm.inventorySpecification"
                placeholder="规格型号"
                disabled
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ProSelect } from '@ant-design/pro-components';
import { RangePicker, Input, Modal, message } from 'ant-design-vue';
import { BasicTable, useTable } from '@/components/Table';
import { useModal } from '@/hooks/web/useModal';
import { postAction, exportPostAction } from '@/api/manage';

// 引入mixins
import { usePagination } from '@/mixins/pagination';
import { useSearchForm } from '@/mixins/searchForm';

// 类型定义
interface ProductionPickAbnormalSumVo {
  id: string;
  officeId: string;
  officeName: string;
  materialInventoryId: string;
  materialInventoryCode: string;
  materialInventoryName: string;
  materialInventorySpecification: string;
  inventoryCode: string;
  inventoryName: string;
  inventorySpecification: string;
  baseUnitName: string;
  baseQuantity: number;
  materialBaseUnitName: string;
  plannedQuantity: number;
  cumTotalPickQuantity: number;
  pickOffset: number;
  cumPickQuantity: number;
  cumRepairQuantity: number;
  cumRetQuantity: number;
  expectStartDate: string;
  expectFinishDate: string;
  startDate: string;
  finishDate: string;
  dataType: number;
}

// 搜索表单
const searchForm = reactive<{
  expectStartDate: [string, string] | null;
  expectFinishDate: [string, string] | null;
  officeId: string;
  officeName: string;
  inventoryId: string;
  inventoryCode: string;
  inventoryName: string;
  inventorySpecification: string;
}>({
  expectStartDate: null,
  expectFinishDate: null,
  officeId: '',
  officeName: '',
  inventoryId: '',
  inventoryCode: '',
  inventoryName: '',
  inventorySpecification: '',
});

// 搜索规则
const searchRules = {
  // 可以根据需要添加验证规则
};

// 搜索弹窗可见性
const searchModalVisible = ref(false);

// 表格数据
const { tableContext } = useTable<ProductionPickAbnormalSumVo>({
  title: '生产领料差异汇总表',
  api: async (params) => {
    // 构建请求参数
    const postData = {
      ...searchForm,
      page: params,
      dataSource: ['ProductionWork', 'DelegateProductionWork'], // 单据类型
    };

    // 处理日期范围
    if (searchForm.expectStartDate) {
      postData.expectStartDateStart = searchForm.expectStartDate[0];
      postData.expectStartDateEnd = searchForm.expectStartDate[1];
    }

    if (searchForm.expectFinishDate) {
      postData.expectFinishDateStart = searchForm.expectFinishDate[0];
      postData.expectFinishDateEnd = searchForm.expectFinishDate[1];
    }

    const result = await postAction('/production/work/pageProductionPickAbnormalSumVo', postData);
    if (result.code === 200) {
      const dataSource = result.data.records || [];
      return {
        list: formatData(dataSource),
        total: result.data.total,
      };
    }
    return { list: [], total: 0 };
  },
  columns: [
    {
      title: '生产车间',
      dataIndex: 'officeName',
      width: 120,
    },
    {
      title: '物料编码',
      dataIndex: 'materialInventoryCode',
      width: 100,
    },
    {
      title: '物料名称',
      dataIndex: 'materialInventoryName',
      width: 100,
    },
    {
      title: '物料规格',
      dataIndex: 'materialInventorySpecification',
      width: 120,
    },
    {
      title: '产品编码',
      dataIndex: 'inventoryCode',
      width: 100,
    },
    {
      title: '产品名称',
      dataIndex: 'inventoryName',
      width: 100,
    },
    {
      title: '规格型号',
      dataIndex: 'inventorySpecification',
      width: 120,
    },
    {
      title: '产品单位',
      dataIndex: 'baseUnitName',
      width: 60,
    },
    {
      title: '计划生产数量',
      dataIndex: 'baseQuantity',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '物料单位',
      dataIndex: 'materialBaseUnitName',
      width: 60,
    },
    {
      title: '应领领数',
      dataIndex: 'plannedQuantity',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '已领领数',
      dataIndex: 'cumTotalPickQuantity',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '领料差异数',
      dataIndex: 'pickOffset',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '领料数',
      dataIndex: 'cumPickQuantity',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '补料数',
      dataIndex: 'cumRepairQuantity',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '退料数',
      dataIndex: 'cumRetQuantity',
      width: 100,
      valueType: 'number',
      valueEnum: {
        customRender: ({ text }) => {
          return text?.toFixed(3) || '0.000';
        },
      },
    },
    {
      title: '预计开工日期',
      dataIndex: 'expectStartDate',
      width: 120,
    },
    {
      title: '预计完工日期',
      dataIndex: 'expectFinishDate',
      width: 120,
    },
    {
      title: '开工日期',
      dataIndex: 'startDate',
      width: 150,
    },
    {
      title: '完工日期',
      dataIndex: 'finishDate',
      width: 150,
    },
  ],
  rowKey: 'id',
  expandable: true,
});

const { registerTable } = tableContext;
const expandedRowKeys = ref<string[]>([]);
const { createModal } = useModal();

// 格式化数据，添加合计行
function formatData(list: ProductionPickAbnormalSumVo[]): ProductionPickAbnormalSumVo[] {
  const newList: ProductionPickAbnormalSumVo[] = [];
  let sumOffice: ProductionPickAbnormalSumVo | null = null;
  let sumInventory: ProductionPickAbnormalSumVo | null = null;

  const length = list.length;

  list.forEach((item, index) => {
    const { officeId, officeName, materialInventoryId, materialInventoryCode } = item;
    let { plannedQuantity, cumPickQuantity, cumRepairQuantity, cumRetQuantity } = item;

    plannedQuantity = plannedQuantity || 0;
    cumPickQuantity = cumPickQuantity || 0;
    cumRepairQuantity = cumRepairQuantity || 0;
    cumRetQuantity = cumRetQuantity || 0;

    const cumTotalPickQuantity = cumPickQuantity + cumRepairQuantity - cumRetQuantity;
    const pickOffset = plannedQuantity - cumTotalPickQuantity;

    // 更新当前项的数据
    const updatedItem = {
      ...item,
      cumTotalPickQuantity: Number(cumTotalPickQuantity.toFixed(3)),
      pickOffset: Number(pickOffset.toFixed(3)),
    };

    // 处理物料合计
    if (!sumInventory) {
      sumInventory = {
        id: `sumInventory-${materialInventoryId}`,
        dataType: 2,
        officeId,
        officeName,
        materialInventoryId,
        materialInventoryCode: `${materialInventoryCode}(合计)`,
        materialInventoryName: '',
        materialInventorySpecification: '',
        inventoryCode: '',
        inventoryName: '',
        inventorySpecification: '',
        baseUnitName: '',
        baseQuantity: 0,
        materialBaseUnitName: '',
        plannedQuantity,
        cumTotalPickQuantity,
        pickOffset,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
        expectStartDate: '',
        expectFinishDate: '',
        startDate: '',
        finishDate: '',
      };
    } else if (officeId === sumInventory.officeId && materialInventoryId === sumInventory.materialInventoryId) {
      sumInventory.plannedQuantity += plannedQuantity || 0;
      sumInventory.cumPickQuantity += cumPickQuantity || 0;
      sumInventory.cumRepairQuantity += cumRepairQuantity || 0;
      sumInventory.cumRetQuantity += cumRetQuantity || 0;
      sumInventory.cumTotalPickQuantity += cumTotalPickQuantity || 0;
      sumInventory.pickOffset += pickOffset || 0;
    } else {
      // 添加之前的物料合计
      sumInventory.plannedQuantity = Number(sumInventory.plannedQuantity.toFixed(3));
      sumInventory.cumPickQuantity = Number(sumInventory.cumPickQuantity.toFixed(3));
      sumInventory.cumRepairQuantity = Number(sumInventory.cumRepairQuantity.toFixed(3));
      sumInventory.cumRetQuantity = Number(sumInventory.cumRetQuantity.toFixed(3));
      sumInventory.cumTotalPickQuantity = Number(sumInventory.cumTotalPickQuantity.toFixed(3));
      sumInventory.pickOffset = Number(sumInventory.pickOffset.toFixed(3));

      newList.push(sumInventory);

      // 创建新的物料合计
      sumInventory = {
        id: `sumInventory-${materialInventoryId}`,
        dataType: 2,
        officeId,
        officeName,
        materialInventoryId,
        materialInventoryCode: `${materialInventoryCode}(合计)`,
        materialInventoryName: '',
        materialInventorySpecification: '',
        inventoryCode: '',
        inventoryName: '',
        inventorySpecification: '',
        baseUnitName: '',
        baseQuantity: 0,
        materialBaseUnitName: '',
        plannedQuantity,
        cumTotalPickQuantity,
        pickOffset,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
        expectStartDate: '',
        expectFinishDate: '',
        startDate: '',
        finishDate: '',
      };
    }

    // 处理车间合计
    if (!sumOffice) {
      sumOffice = {
        id: `sumOffice-${officeId}`,
        dataType: 3,
        officeId,
        officeName: `${officeName}(合计)`,
        materialInventoryId: '',
        materialInventoryCode: '',
        materialInventoryName: '',
        materialInventorySpecification: '',
        inventoryCode: '',
        inventoryName: '',
        inventorySpecification: '',
        baseUnitName: '',
        baseQuantity: 0,
        materialBaseUnitName: '',
        plannedQuantity,
        cumTotalPickQuantity,
        pickOffset,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
        expectStartDate: '',
        expectFinishDate: '',
        startDate: '',
        finishDate: '',
      };
    } else if (officeId === sumOffice.officeId) {
      sumOffice.plannedQuantity += plannedQuantity || 0;
      sumOffice.cumPickQuantity += cumPickQuantity || 0;
      sumOffice.cumRepairQuantity += cumRepairQuantity || 0;
      sumOffice.cumRetQuantity += cumRetQuantity || 0;
      sumOffice.cumTotalPickQuantity += cumTotalPickQuantity || 0;
      sumOffice.pickOffset += pickOffset || 0;
    } else {
      // 添加之前的车间合计
      sumOffice.plannedQuantity = Number(sumOffice.plannedQuantity.toFixed(3));
      sumOffice.cumPickQuantity = Number(sumOffice.cumPickQuantity.toFixed(3));
      sumOffice.cumRepairQuantity = Number(sumOffice.cumRepairQuantity.toFixed(3));
      sumOffice.cumRetQuantity = Number(sumOffice.cumRetQuantity.toFixed(3));
      sumOffice.cumTotalPickQuantity = Number(sumOffice.cumTotalPickQuantity.toFixed(3));
      sumOffice.pickOffset = Number(sumOffice.pickOffset.toFixed(3));

      newList.push(sumOffice);

      // 创建新的车间合计
      sumOffice = {
        id: `sumOffice-${officeId}`,
        dataType: 3,
        officeId,
        officeName: `${officeName}(合计)`,
        materialInventoryId: '',
        materialInventoryCode: '',
        materialInventoryName: '',
        materialInventorySpecification: '',
        inventoryCode: '',
        inventoryName: '',
        inventorySpecification: '',
        baseUnitName: '',
        baseQuantity: 0,
        materialBaseUnitName: '',
        plannedQuantity,
        cumTotalPickQuantity,
        pickOffset,
        cumPickQuantity,
        cumRepairQuantity,
        cumRetQuantity,
        expectStartDate: '',
        expectFinishDate: '',
        startDate: '',
        finishDate: '',
      };
    }

    // 添加当前项
    newList.push(updatedItem);

    // 处理最后一项
    if (index === length - 1) {
      // 添加物料合计
      sumInventory.plannedQuantity = Number(sumInventory.plannedQuantity.toFixed(3));
      sumInventory.cumPickQuantity = Number(sumInventory.cumPickQuantity.toFixed(3));
      sumInventory.cumRepairQuantity = Number(sumInventory.cumRepairQuantity.toFixed(3));
      sumInventory.cumRetQuantity = Number(sumInventory.cumRetQuantity.toFixed(3));
      sumInventory.cumTotalPickQuantity = Number(sumInventory.cumTotalPickQuantity.toFixed(3));
      sumInventory.pickOffset = Number(sumInventory.pickOffset.toFixed(3));

      newList.push(sumInventory);

      // 添加车间合计
      sumOffice.plannedQuantity = Number(sumOffice.plannedQuantity.toFixed(3));
      sumOffice.cumPickQuantity = Number(sumOffice.cumPickQuantity.toFixed(3));
      sumOffice.cumRepairQuantity = Number(sumOffice.cumRepairQuantity.toFixed(3));
      sumOffice.cumRetQuantity = Number(sumOffice.cumRetQuantity.toFixed(3));
      sumOffice.cumTotalPickQuantity = Number(sumOffice.cumTotalPickQuantity.toFixed(3));
      sumOffice.pickOffset = Number(sumOffice.pickOffset.toFixed(3));

      newList.push(sumOffice);
    }
  });

  return newList;
}

// 处理展开/折叠
function handleExpand(expanded: boolean, record: ProductionPickAbnormalSumVo) {
  const id = record.id;
  if (expanded) {
    expandedRowKeys.value.push(id);
  } else {
    const index = expandedRowKeys.value.findIndex((e) => e === id);
    if (index !== -1) {
      expandedRowKeys.value.splice(index, 1);
    }
  }
}

// 行样式
function rowClassName(record: ProductionPickAbnormalSumVo) {
  return record.dataType === 2 || record.dataType === 3
    ? 'bg-soft-warning font-medium' // 使用vue-vben-admin的样式
    : '';
}

// 导出
function exportOrder() {
  // 构建请求参数
  const postData = {
    ...searchForm,
    dataSource: ['ProductionWork', 'DelegateProductionWork'], // 单据类型
  };

  // 处理日期范围
  if (searchForm.expectStartDate) {
    postData.expectStartDateStart = searchForm.expectStartDate[0];
    postData.expectStartDateEnd = searchForm.expectStartDate[1];
  }

  if (searchForm.expectFinishDate) {
    postData.expectFinishDateStart = searchForm.expectFinishDate[0];
    postData.expectFinishDateEnd = searchForm.expectFinishDate[1];
  }

  exportPostAction('/production/work/pageProductionPickAbnormalSumVo', postData).then(
    (response) => {
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/vnd.ms-excel' })
      );
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', '生产领料差异汇总表.xls');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    (error) => {
      message.error('导出失败，请重试');
    }
  );
}

// 动态查询
function searchDynamic() {
  searchModalVisible.value = true;
}

// 搜索提交
function handleSearchSubmit() {
  searchModalVisible.value = false;
  tableContext.reload();
}

// 搜索取消
function handleSearchCancel() {
  searchModalVisible.value = false;
}

// 处理搜索
function handleSearch(type: string) {
  // 这里实现搜索逻辑，根据实际项目中的组件进行调整
  createModal({
    title: type === 'officeName' ? '选择生产车间' : '选择物料名称',
    width: 800,
    // 这里应该是搜索组件
    content: <div>搜索组件</div>,
    onOk: (data) => {
      if (type === 'officeName') {
        searchForm.officeName = data?.[0]?.name || '';
        searchForm.officeId = data?.[0]?.id || '';
      } else if (type === 'inventoryName') {
        searchForm.inventoryName = data?.[0]?.inventoryName || '';
        searchForm.inventoryCode = data?.[0]?.inventoryCode || '';
        searchForm.inventorySpecification = data?.[0]?.inventorySpecification || '';
        searchForm.inventoryId = data?.[0]?.id || '';
      }
    },
  });
}

// 初始化
onMounted(() => {
  // 加载表格数据
  tableContext.reload();
});
</script>

<style lang="less" scoped>
.production-pick-abnormal-sum-vo {
  padding: 16px;
}

.bg-soft-warning {
  background-color: @warning-color-1;
}

.font-medium {
  font-weight: 500;
}
</style>