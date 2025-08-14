import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const call: AppRouteModule = {
  path: '/crm/call',
  name: 'Call',
  component: LAYOUT,
  redirect: '/crm/call/callList',
  meta: {
    icon: 'lucide:phone',
    title: t('menu.crm.call'),
    orderNo: 60,
  },
  children: [
    {
      path: 'callList',
      name: 'CallList',
      component: () => import('#/views/crm/call/callList.vue'),
      meta: {
        title: t('menu.crm.call.callList'),
        icon: 'lucide:list',
      },
    },
    {
      path: 'settings',
      name: 'CallSettings',
      component: () => import('#/views/crm/call/settings.vue'),
      meta: {
        title: t('menu.crm.call.settings'),
        icon: 'lucide:settings',
      },
    },
    {
      path: 'simpleTask',
      name: 'SimpleTask',
      component: () => import('#/views/crm/call/simpleTask.vue'),
      meta: {
        title: t('menu.crm.call.simpleTask'),
        icon: 'lucide:task',
      },
    },
    {
      path: 'simpleTaskCalling',
      name: 'SimpleTaskCalling',
      component: () => import('#/views/crm/call/simpleTaskCalling.vue'),
      meta: {
        title: t('menu.crm.call.simpleTaskCalling'),
        icon: 'lucide:phone-call',
      },
    },
    {
      path: 'simpleTaskCallRecord',
      name: 'SimpleTaskCallRecord',
      component: () => import('#/views/crm/call/simpleTaskCallRecord.vue'),
      meta: {
        title: t('menu.crm.call.simpleTaskCallRecord'),
        icon: 'lucide:file-text',
      },
    },
  ],
};

export default call;