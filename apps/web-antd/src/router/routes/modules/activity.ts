import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const activity: AppRouteModule = {
  path: '/crm/activity',
  name: 'Activity',
  component: LAYOUT,
  redirect: '/crm/activity/list',
  meta: {
    icon: 'lucide:calendar',
    title: t('menu.activity'),
    orderNo: 60,
  },
  children: [
    {
      path: 'list',
      name: 'ActivityList',
      component: () => import('#/views/crm/activity/list.vue'),
      meta: {
        title: t('menu.activity.list'),
        icon: 'lucide:list',
      },
    },
    {
      path: 'invite',
      name: 'ActivityInvite',
      component: () => import('#/views/crm/activity/invite.vue'),
      meta: {
        title: t('menu.activity.invite'),
        icon: 'lucide:mail',
      },
    },
    {
      path: 'inviteList',
      name: 'ActivityInviteList',
      component: () => import('#/views/crm/activity/inviteList.vue'),
      meta: {
        title: t('menu.activity.inviteList'),
        icon: 'lucide:list-checks',
      },
    },
  ],
};

export default activity;