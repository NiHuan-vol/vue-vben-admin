import { defHttp } from '/@/utils/http/axios';
import { BaseResp } from '/@/api/model/baseModel';

// 委外领料单API

export interface DelegatePickingItem {
  id: string;
  voucherCode: string;
  sourceCode: string;
  businessType: number;
  status: number;
  createTime: string;
  createUserId: string;
  // 其他必要字段...
}

export interface DelegatePickingListReq {
  page?: number;
  pageSize?: number;
  sourceCode?: string;
  someBusinessType?: number;
  isMyWarehouse?: boolean;
  // 其他查询参数...
}

export interface DelegatePickingListResp {
  items: DelegatePickingItem[];
  total: number;
}

// 获取委外领料单列表
export const getDelegatePickingList = async (params: DelegatePickingListReq): Promise<BaseResp<DelegatePickingListResp>> => {
  return await defHttp.post<BaseResp<DelegatePickingListResp>>(
    {
      url: '/inventory/delegate-picking/list',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 保存委外领料单
export const saveDelegatePicking = async (params: any): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/save',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 删除委外领料单
export const deleteDelegatePicking = async (params: { id: string }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/delete',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 审核委外领料单
export const examineDelegatePicking = async (params: { id: string; status: number }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/examine',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 获取委外领料单编号
export const getDelegatePickingCode = async (params: { sourceCode: string }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/get-code',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 提交委外领料单
export const submitDelegatePicking = async (params: { id: string; status: number }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/submit',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 导出委外领料单
export const exportDelegatePickingData = async (params: any): Promise<BaseResp<void>> => {
  return await defHttp.post<BaseResp<void>>(
    {
      url: '/inventory/delegate-picking/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 获取委外领料单详情
export const getDelegatePickingDetail = async (params: { id: string }): Promise<BaseResp<DelegatePickingItem>> => {
  return await defHttp.post<BaseResp<DelegatePickingItem>>(
    {
      url: '/inventory/delegate-picking/detail',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 领料退单
export const returnDelegatePicking = async (params: { id: string; status: number }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/return',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 生成单据
export const generateDelegatePickingBills = async (params: { id: string; billType: string }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/generate-bills',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};

// 复制行
export const copyDelegatePickingRow = async (params: { id: string }): Promise<BaseResp<string>> => {
  return await defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegate-picking/copy-row',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
};