<template>
  <div class="content-wrapper">
    <BasicPageHeader
      :title="'需求计划'"
      :sub-title="'需求建议'"
      :show-breadcrumb="true"
    />

    <div class="mrp-result-box p-4 bg-white rounded-md shadow-sm mt-4">
      <!-- 按钮区域 -->
      <div class="btn-wrapper flex justify-center mb-4">
        <div class="flex space-x-3">
          <template v-if="activeKey === '1'"><!-- 采购建议 --></template>
          <template v-if="activeKey === '2'"><!-- 生产建议 --></template>
        </div>
      </div>

      <!-- 标签页 -->
      <Tabs
        v-model:value="activeKey"
        type="card"
        size="middle"
        @change="handleTabChange"
      >
        <TabPane key="1" title="采购建议">
          <div class="mt-4">
            <BasicButton
              type="primary"
              ghost
              @click="handleGenerateBillDropdown"
              class="mb-3"
              :icon="<DownOutlined />"
            >
              生单
            </BasicButton>
            <BasicTable
              :columns="columns"
              :data-source="procurementData"
              :pagination="false"
              :row-selection="{ selectedRowKeys: selectedRowKeysCai, onChange: handleSelectChangeCai }"
              bordered
            />
          </div>
        </TabPane>
        <TabPane key="2" title="生产建议">
          <div class="mt-4">
            <BasicButton
              type="primary"
              ghost
              @click="handleGenerateProductionDropdown"
              class="mb-3"
              :icon="<DownOutlined />"
            >
              生单
            </BasicButton>
            <BasicTable
              :columns="columns"
              :data-source="productionData"
              :pagination="false"
              :row-selection="{ selectedRowKeys: selectedRowKeysSen, onChange: handleSelectChangeSen }"
              bordered
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { BasicTable } from '/@/components/Table';
import { Tabs, TabPane } from 'ant-design-vue';
import { BasicButton } from '/@/components/Button';
import { BasicPageHeader } from '/@/components/Page';
import { DownOutlined, MessageOutlined } from '@ant-design/icons-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { useRouter } from 'vue-router';
import moment from 'moment';

// 定义表格列
const columns = [
  { title: '序号', width: 50, customRender: ({ index }) => index + 1, align: 'center' },
  { title: 'MRP运算单号', dataIndex: 'mrpCode' },
  { title: '物料编码', dataIndex: 'inventoryCode' },
  { title: '物料名称', dataIndex: 'inventoryName' },
  { title: '规格型号', dataIndex: 'inventorySpecification' },
  { title: '子件BOM', dataIndex: 'bomVersionCode', width: 80 },
  { title: '计量单位', dataIndex: 'unitName' },
  { title: '数量', dataIndex: 'baseQuantity' },
  { title: '建议量', dataIndex: 'suggestAmount', width: 120 },
  { title: '累积下达数量', dataIndex: 'releasedQuantity', width: 120 },
  { title: '需求日期', dataIndex: 'needDate', width: 120 },
];

// 响应式数据
const activeKey = ref('1');
const procurementData = ref<any[]>([]);
const productionData = ref<any[]>([]);
const selectedRowKeysCai = ref<string[]>([]);
const selectedRowKeysSen = ref<string[]>([]);
const selectedDataCai = ref<any[]>([]);
const selectedDataSen = ref<any[]>([]);
const mrpData = ref<any[]>([]); // 模拟从store获取的数据

// 注入依赖
const message = useMessage();
const router = useRouter();

// 生命周期
onMounted(() => {
  // 模拟从store获取数据
  // 实际项目中应该通过props或pinia获取
  procurementData.value = [];
  productionData.value = [];

  if (mrpData.value.length > 0) {
    mrpData.value.forEach((item) => {
      if (item.type === 1) {
        item.needDate = item.planBeginDate;
        procurementData.value.push(item);
      } else if (item.type === 2) {
        item.needDate = item.planEndDate;
        productionData.value.push(item);
      }
    });
  }
});

// 方法
const handleTabChange = (key: string) => {
  activeKey.value = key;
};

const handleSelectChangeCai = (keys: string[], rows: any[]) => {
  selectedRowKeysCai.value = keys;
  selectedDataCai.value = rows;
};

const handleSelectChangeSen = (keys: string[], rows: any[]) => {
  selectedRowKeysSen.value = keys;
  selectedDataSen.value = rows;
};

const generateBills = (t: number) => {
  if (selectedDataCai.value.length < 1) {
    message.warning('未选择采购建议数据');
    return;
  }

  const processedData = selectedDataCai.value.map((item) => ({
    ...item,
    baseUnit: item.unitId,
    baseUnitName: item.unitName,
    baseUnit_temp_id: item.unitId,
    baseQuantity: item.suggestAmount,
    mrpResultId: item.id,
    mrpCode: item.mrpCode,
  }));

  const array = {
    voucherCode: '',
    detailList: processedData,
    sourceVoucherCode: processedData[0].mrpCode,
    sourceVoucherType: 'MrpRecord',
    sourceVoucherDate: '',
    voucherDate: moment().format('YYYY-MM-DD'),
    mrpCode: processedData[0].mrpCode,
    generateSourceCode: t === 1 ? 'PurchaseRequisition' : 'PurchaseOrder',
  };

  // 模拟store提交
  // 实际项目中应该使用pinia

  selectedRowKeysCai.value = [];
  selectedDataCai.value = [];

  setTimeout(() => {
    if (t === 1) {
      router.push({ path: '/procurement/purchaseRequisition' });
    } else if (t === 2) {
      router.push({ path: '/procurement/purchaseOrder' });
    }
  }, 500);
};

const generateProduction = (t: number) => {
  if (selectedDataSen.value.length < 1) {
    message.warning('未选择生产建议数据');
    return;
  }

  const processedData = selectedDataSen.value.map((item) => ({
    ...item,
    baseUnit: item.unitId,
    baseUnitName: item.unitName,
    baseUnit_temp_id: item.unitId,
    baseQuantity: item.suggestAmount,
    mrpResultId: item.id,
    mrpCode: item.mrpCode,
    planBeginDate: item.planBeginDate,
    planEndDate: item.needDate,
  }));

  const array = {
    detailList: processedData,
    sourceVoucherCode: processedData[0].mrpCode,
    sourceVoucherType: 'MrpRecord',
    sourceVoucherDate: '',
    voucherDate: moment().format('YYYY-MM-DD'),
    mrpCode: processedData[0].mrpCode,
    generateSourceCode: 'ProductionOrder',
  };

  // 模拟store提交
  // 实际项目中应该使用pinia

  selectedRowKeysSen.value = [];
  selectedDataSen.value = [];

  setTimeout(() => {
    if (t === 1) {
      router.push({ path: '/production/management/productionOrder' });
    } else if (t === 2) {
      router.push({ path: '/production/productionWork' });
    }
  }, 500);
};

// 下拉菜单处理
const handleGenerateBillDropdown = () => {
  // 这里应该显示下拉菜单
  // 实际项目中可以使用Dropdown组件
};

const handleGenerateProductionDropdown = () => {
  // 这里应该显示下拉菜单
  // 实际项目中可以使用Dropdown组件
};
</script>

<style lang="less" scoped>
.mrp-result-box {
  .ant-tabs-tabpane-active {
    padding: 16px 0;
  }
}

.advice-warpper {
  margin-top: 10px;
  .ant-table-placeholder {
    position: relative !important;
    top: 0;
  }
}
</style>"