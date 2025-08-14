import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'Home',
        path: '/home',
        component: () => import('#/views/dashboard/home/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:home',
          title: '首页',
        },
      },
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
    name: 'Workspace',
    path: '/workspace',
    component: () => import('#/views/dashboard/workspace/index.vue'),
    meta: {
      icon: 'carbon:workspace',
      title: $t('page.dashboard.workspace'),
    },
  },
  {
      name: 'Workplace',
      path: '/workplace',
      component: () => import('#/views/dashboard/workplace_new/index.vue'),
      meta: {
        icon: 'lucide:dashboard',
        title: $t('page.dashboard.workplace'),
      },
    },
    {
      name: 'StatementAnalysisBoard',
      path: '/statement-analysis/board',
      component: () => import('#/views/statementAnalysis/board.vue'),
      meta: {
        icon: 'lucide:bar-chart',
        title: $t('page.statementAnalysis.board'),
      },
    },
    {
      name: 'Page2',
      path: '/page2',
      component: () => import('#/views/dashboard/page2/index.vue'),
      meta: {
        icon: 'lucide:file',
        title: 'Page 2',
      },
    },
  ],
  },
];

export default routes;
