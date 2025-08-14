import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const customer: AppRouteModule = {
  path: '/crm/customer',
  name: 'Customer',
  component: LAYOUT,
  redirect: '/crm/customer/new-list',
  meta: {
    icon: 'lucide:users',
    title: t('menu.customer'),
    orderNo: 30,
  },
  children: [
    {
      path: 'new-list',
      name: 'CustomerNewList',
      component: () => import('#/views/crm/customer/new-list.vue'),
      meta: {
        title: t('menu.customer.newList'),
        icon: 'lucide:list',
      },
    },
    {
      path: 'detail/:id',
      name: 'CustomerDetail',
      component: () => import('#/views/crm/customer/detail.vue'),
      meta: {
        title: t('menu.customer.detail'),
        icon: 'lucide:info',
        hideMenu: true,
      },
    },
  ],
};

export default customer;