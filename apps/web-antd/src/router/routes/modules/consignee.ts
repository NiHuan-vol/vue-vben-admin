import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const consignee: AppRouteModule = {
  path: '/crm/consignee',
  name: 'Consignee',
  component: LAYOUT,
  redirect: '/crm/consignee/list',
  meta: {
    icon: 'lucide:truck',
    title: t('menu.consignee'),
    orderNo: 70,
  },
  children: [
    {
      path: 'list',
      name: 'ConsigneeList',
      component: () => import('#/views/crm/consignee/list.vue'),
      meta: {
        title: t('menu.consignee.list'),
        icon: 'lucide:list',
      },
    },
  ],
};

export default consignee;