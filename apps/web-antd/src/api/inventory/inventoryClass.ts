import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 获取库存分类列表
export function getInventoryClassList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventoryClass/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存库存分类
export function saveInventoryClass(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/inventoryClass/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除库存分类
export function deleteInventoryClass(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: '/inventory/inventoryClass/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取库存分类树
export function getInventoryClassTree(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventoryClass/tree',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}