<template>
  <ContentWrap>
    <div class="inventory-setting-container">
      <div class="slide-menu">
        <div class="title">基础设置</div>
        <Menu :defaultSelectedKeys="[currentKey]" mode="vertical">
          <MenuItem v-for="(item, index) in menuItems" :key="item.key || index" @click="handleMenuClick(item)">
            {{ item.label }}
          </MenuItem>
        </Menu>
      </div>
      <div class="view-area">
        <component :is="currentComponent"></component>
      </div>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Menu, MenuItem } from 'ant-design-vue';
import { ContentWrap } from '@vben/components';
import { useMessage } from '@vben/hooks';

// 导入子组件
const WarehouseGoods = () => import('./warehouseGoods.vue');
const Measurement = () => import('./measurement.vue');
const Classification = () => import('./classificationSet.vue');
const Archives = () => import('./archives.vue');
const Balance = () => import('./balance.vue');
const WarehouseTypes = () => import('./warehouseTypes.vue');
const InvoiceType = () => import('./invoiceType.vue');
const PdaSet = () => import('./pdaSet.vue');
const ProductionCost = () => import('./productionCost.vue');
const PurchaseType = () => import('./purchaseType.vue');
const SaleType = () => import('./saleType.vue');
const InventoryCateGory = () => import('./inventoryCateGory.vue');
const WarehouseSetting = () => import('./WarehouseSetting.vue');

const message = useMessage();
const currentKey = ref('warehouseGoods');
const currentComponent = ref(WarehouseGoods);

const menuItems = [
  { label: '会计期间', key: '' },
  { label: '编码规则', key: '' },
  { label: '数据精度', key: '' },
  { label: '单据编号规则', key: '' },
  { label: '仓库设置', key: 'warehouseSetting' },
  { label: '仓库货位', key: 'warehouseGoods' },
  { label: '物料分类', key: 'classification' },
  { label: '计量单位', key: 'measurement' },
  { label: '物料档案', key: 'archives' },
  { label: '出入库类别', key: 'warehouseTypes' },
  { label: '期初结存', key: 'balance' },
  { label: '发票类型', key: 'invoiceType' },
  { label: 'PDA设置', key: 'pdaSet' },
  { label: '生产成本', key: 'productionCost' },
  { label: '采购类型', key: 'purchaseType' },
  { label: '销售类型', key: 'saleType' },
  { label: '库存分类', key: 'inventoryCateGory' },
];

const handleMenuClick = (item: any) => {
  if (item.key) {
    currentKey.value = item.key;
    switch (item.key) {
      case 'warehouseSetting':
        currentComponent.value = WarehouseSetting;
        break;
      case 'warehouseGoods':
        currentComponent.value = WarehouseGoods;
        break;
      case 'classification':
        currentComponent.value = Classification;
        break;
      case 'measurement':
        currentComponent.value = Measurement;
        break;
      case 'archives':
        currentComponent.value = Archives;
        break;
      case 'balance':
        currentComponent.value = Balance;
        break;
      case 'warehouseTypes':
        currentComponent.value = WarehouseTypes;
        break;
      case 'invoiceType':
        currentComponent.value = InvoiceType;
        break;
      case 'pdaSet':
        currentComponent.value = PdaSet;
        break;
      case 'productionCost':
        currentComponent.value = ProductionCost;
        break;
      case 'purchaseType':
        currentComponent.value = PurchaseType;
        break;
      case 'saleType':
        currentComponent.value = SaleType;
        break;
      case 'inventoryCateGory':
        currentComponent.value = InventoryCateGory;
        break;
      default:
        currentComponent.value = WarehouseGoods;
    }
  } else {
    message.warning('该功能未开发');
  }
};
</script>

<style scoped lang="scss">
.inventory-setting-container {
  display: flex;
  height: 100%;

  .slide-menu {
    width: 200px;
    border-right: 1px solid #e5e6eb;
    height: 100%;

    .title {
      font-size: 16px;
      font-weight: bold;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e6eb;
    }

    :deep(.ant-menu-vertical) {
      border-right: none;
    }
  }

  .view-area {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }
}
</style>