import { defHttp } from '/@/utils/http/axios';
import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

// 财务信息模型
export interface FinanceModel {
  id: string;
  crmId: string;
  crmName: string;
  financialType: 'receivable' | 'payable' | 'other';
  amount: number;
  remark: string;
  status: 'normal' | 'disabled';
  createTime: string;
  updateTime: string;
  ownerId: string;
  ownerName: string;
}

// 查询参数
export interface FinanceParams extends BasicPageParams {
  crmName?: string;
  financialType?: string;
  status?: string;
  createTime?: string[];
  ownerId?: string;
}

// 获取财务信息列表
export function getFinanceList(params: FinanceParams) {
  return defHttp.get<BasicFetchResult<FinanceModel>>(
    {
      url: '/crm/finance/list',
      params,
    },
    {
      errorMessageMode: 'message',
    }
  );
}

// 获取财务信息详情
export function getFinanceDetail(params: { id: string }) {
  return defHttp.get<FinanceModel>(
    {
      url: '/crm/finance/detail',
      params,
    },
    {
      errorMessageMode: 'message',
    }
  );
}

// 保存财务信息(新增/编辑)
export function saveFinance(params: Partial<FinanceModel>) {
  return defHttp.post<FinanceModel>(
    {
      url: params.id ? '/crm/finance/update' : '/crm/finance/add',
      params,
    },
    {
      errorMessageMode: 'message',
    }
  );
}

// 删除财务信息
export function deleteFinance(params: { ids: string[] }) {
  return defHttp.post<boolean>(
    {
      url: '/crm/finance/delete',
      params,
    },
    {
      errorMessageMode: 'message',
    }
  );
}