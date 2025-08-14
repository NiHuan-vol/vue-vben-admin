import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const customize: AppRouteModule = {
  path: '/crm/customize',
  name: 'Customize',
  component: LAYOUT,
  redirect: '/crm/customize/manager',
  meta: {
    icon: 'lucide:settings',
    title: t('menu.crm.customize'),
    orderNo: 90,
  },
  children: [
    {
      path: 'manager',
      name: 'CustomizeManager',
      component: () => import('#/views/crm/customize/manager.vue'),
      meta: {
        title: t('menu.crm.customize.manager'),
        icon: 'lucide:settings',
      },
    },
    {
      path: 'businessSet',
      name: 'BusinessSet',
      component: () => import('#/views/crm/customize/businessSet.vue'),
      meta: {
        title: t('menu.crm.customize.businessSet'),
        icon: 'lucide:briefcase',
      },
    },
    {
      path: 'codeSet',
      name: 'CodeSet',
      component: () => import('#/views/crm/customize/codeSet.vue'),
      meta: {
        title: t('menu.crm.customize.codeSet'),
        icon: 'lucide:code',
      },
    },
    {
      path: 'contractSet',
      name: 'ContractSet',
      component: () => import('#/views/crm/customize/contractSet.vue'),
      meta: {
        title: t('menu.crm.customize.contractSet'),
        icon: 'lucide:file-text',
      },
    },
    {
      path: 'customerSet',
      name: 'CustomerSet',
      component: () => import('#/views/crm/customize/customerSet.vue'),
      meta: {
        title: t('menu.crm.customize.customerSet'),
        icon: 'lucide:user',
      },
    },
  ],
};

export default customize;