import type { AppRouteModule } from '#/router/types';
import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const app: AppRouteModule = {
  path: '/app',
  name: 'App',
  component: LAYOUT,
  redirect: '/app/management',
  meta: {
    icon: 'lucide:app-store',
    title: t('menu.app'),
    orderNo: 40,
  },
  children: [
    {
      path: 'management',
      name: 'AppManagement',
      component: () => import('#/views/app/management/index.vue'),
      meta: {
        title: t('menu.app.management'),
        icon: 'lucide:settings',
      },
    },
  ],
};

export default app;