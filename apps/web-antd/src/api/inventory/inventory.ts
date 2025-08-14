import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';

// 获取库存列表
export function getInventoryList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventory/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取库存详情
export function getInventoryDetail(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventory/detail',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 调整库存
export function adjustInventory(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/inventory/adjust',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 库存查询
export function queryInventory(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventory/query',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 导出单据
export function exportBills(params: any, mode: ErrorMessageMode = 'none') {
  return defHttp.get<BaseResp<Blob>>(
    {
      url: '/inventory/bills/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode: mode,
      isReturnNativeResponse: true,
    },
  );
}