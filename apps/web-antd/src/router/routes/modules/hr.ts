import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const hr: AppRouteModule = {
  path: '/hr',
  name: 'Hr',
  component: LAYOUT,
  redirect: '/hr/staffManage',
  meta: {
    icon: 'lucide:users',
    title: t('menu.hr'),
    orderNo: 40,
  },
  children: [
    {
      path: 'staffManage',
      name: 'StaffManage',
      component: () => import('#/views/hr/staffManage/index.vue'),
      meta: {
        title: t('menu.hr.staffManage'),
        icon: 'lucide:user',
      },
    },
  ],
};

export default hr;