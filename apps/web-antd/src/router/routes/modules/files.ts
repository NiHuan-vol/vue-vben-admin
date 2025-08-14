import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const files: AppRouteModule = {
  path: '/crm/files',
  name: 'Files',
  component: LAYOUT,
  redirect: '/crm/files/list',
  meta: {
    icon: 'lucide:file-down',
    title: t('menu.crm.files'),
    orderNo: 80,
  },
  children: [
    {
      path: 'list',
      name: 'FilesList',
      component: () => import('#/views/crm/files/list.vue'),
      meta: {
        title: t('menu.files.list'),
        icon: 'lucide:list',
      },
    },
  ],
};

export default files;