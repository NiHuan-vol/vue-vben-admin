import { LAYOUT } from '#/router/constant';
import { t } from '#/hooks/web/useI18n';

const contract: AppRouteModule = {
  path: '/crm/contract',
  name: 'Contract',
  component: LAYOUT,
  redirect: '/crm/contract/list',
  meta: {
    icon: 'lucide:file-text',
    title: t('menu.contract'),
    orderNo: 50,
  },
  children: [
    {
      path: 'list',
      name: 'ContractList',
      component: () => import('#/views/crm/contract/list.vue'),
      meta: {
        title: t('menu.contract.list'),
        icon: 'lucide:list',
      },
    },
    {
      path: 'templateList',
      name: 'ContractTemplateList',
      component: () => import('#/views/crm/contract/templateList.vue'),
      meta: {
        title: t('menu.contract.templateList'),
        icon: 'lucide:file-code',
      },
    },
  ],
};

export default contract;