import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 获取计量单位列表
export function getUnitList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/unit/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存计量单位
export function saveUnit(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/unit/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除计量单位
export function deleteUnit(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/unit/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}