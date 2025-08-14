import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const business: AppRouteModule = {
  path: '/crm/business',
  name: 'Business',
  component: LAYOUT,
  redirect: '/crm/business/list',
  meta: {
    icon: 'lucide:briefcase',
    title: t('menu.business'),
    orderNo: 40,
  },
  children: [
    {
      path: 'list',
      name: 'BusinessList',
      component: () => import('#/views/crm/business/list.vue'),
      meta: {
        title: t('menu.business.list'),
        icon: 'lucide:list',
      },
    },
    {
      path: 'salefunnel',
      name: 'BusinessSaleFunnel',
      component: () => import('#/views/crm/business/salefunnel.vue'),
      meta: {
        title: t('menu.business.salefunnel'),
        icon: 'lucide:bar-chart',
      },
    },
  ],
};

export default business;