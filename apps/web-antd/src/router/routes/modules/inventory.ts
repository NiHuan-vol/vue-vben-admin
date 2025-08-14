import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';
import type { AppRouteModule } from '@/types/route';

const inventory: AppRouteModule = {
  path: '/inventory',
  name: 'Inventory',
  component: LAYOUT,
  redirect: '/inventory/setting',
  meta: {
    icon: 'lucide:box',
    title: t('menu.inventory'),
    orderNo: 50,
  },
  children: [
    {
      path: 'setting',
      name: 'InventorySetting',
      component: () => import('@/views/inventory/setting/setting.vue'),
      meta: {
        title: t('menu.inventory.setting'),
        icon: 'lucide:settings',
      },
    },
    {
      path: 'bills',
      name: 'InventoryBills',
      component: () => import('@/views/inventory/bills/index.vue'),
      meta: {
        title: t('menu.inventory.bills'),
        icon: 'lucide:file-text',
      },
    },
    {
      path: 'report',
      name: 'InventoryReport',
      component: () => import('@/views/inventory/report/index.vue'),
      meta: {
        title: t('menu.inventory.report'),
        icon: 'lucide:chart-pie',
      },
    },
    {
      path: 'transfers',
      name: 'InventoryTransfers',
      component: () => import('@/views/inventory/transfers/index.vue'),
      meta: {
        title: t('menu.inventory.transfers'),
        icon: 'lucide:exchange',
      },
    },
    {
      path: 'barcode',
      name: 'InventoryBarcode',
      component: () => import('@/views/inventory/barcode/index.vue'),
      meta: {
        title: t('menu.inventory.barcode'),
        icon: 'lucide:barcode',
      },
    },
  ],
};

export default inventory;