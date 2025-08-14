import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 获取计量单位组列表
export function getUnitGroupList(mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/unitGroup/list',
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存计量单位组
export function saveUnitGroup(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/unitGroup/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除计量单位组
export function deleteUnitGroup(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/unitGroup/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}