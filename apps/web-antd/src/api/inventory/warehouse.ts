import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 获取仓库列表
export function getWarehouseList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/warehouse/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取仓库详情
export function getWarehouseDetail(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/warehouse/detail',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存仓库信息
export function saveWarehouse(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/warehouse/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除仓库
export function deleteWarehouse(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: '/inventory/warehouse/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取部门列表
export function getDepartmentList(params: any = {}, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/system/department/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取用户列表
export function getUserList(params: any = {}, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/system/user/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}