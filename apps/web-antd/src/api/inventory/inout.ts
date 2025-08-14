import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 获取出入库列表
export function getInoutList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inout/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存出入库单
export function saveInout(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/inout/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除出入库单
export function deleteInout(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: '/inventory/inout/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 审核出入库单
export function examineInout(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inout/examine',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}