import { RouteRecordRaw } from 'vue-router';
import { LAYOUT } from '@/router/constant';
import { RoleEnum } from '@/enums/roleEnum';
import { t } from '@/hooks/web/useI18n';

const financeRoute: RouteRecordRaw = {
  path: '/crm/finance',
  name: 'CrmFinance',
  component: LAYOUT,
  redirect: '/crm/finance/list',
  meta: {
    orderNo: 30,
    icon: 'mdi:finance',
    title: t('routes.crm.finance.title'),
    hidden: false,
    // 这里可以设置权限
    roles: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN],
  },
  children: [
    {
      path: 'list',
      name: 'CrmFinanceList',
      component: () => import('@/views/crm/finance/list.vue'),
      meta: {
        // 这里可以设置更细粒度的权限
        title: t('routes.crm.finance.list'),
        icon: 'mdi:list',
        hidden: false,
      },
    },
  ],
};

export default financeRoute;