import type { AppRouteModule } from '#/router/types';
import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const analysis: AppRouteModule = {
  path: '/analysis',
  name: 'Analysis',
  component: LAYOUT,
  redirect: '/analysis/modeling/modelinglist',
  meta: {
    icon: 'lucide:chart-line',
    title: t('menu.analysis'),
    orderNo: 30,
  },
  children: [
    {
      path: 'modeling',
      name: 'Modeling',
      component: () => import('#/views/analysis/modeling/index.vue'),
      meta: {
        title: t('menu.analysis.modeling'),
        icon: 'lucide:database',
      },
      children: [
        {
          path: 'modelinglist',
          name: 'ModelingList',
          component: () => import('#/views/analysis/modeling/modelinglist.vue'),
          meta: {
            title: t('menu.analysis.modeling.modelinglist'),
          },
        },
      ],
    },
    {
      path: 'warehouse',
      name: 'Warehouse',
      component: () => import('#/views/analysis/warehouse/index.vue'),
      meta: {
        title: t('menu.analysis.warehouse'),
        icon: 'lucide:warehouse',
      },
    },
  ],
};

export default analysis;