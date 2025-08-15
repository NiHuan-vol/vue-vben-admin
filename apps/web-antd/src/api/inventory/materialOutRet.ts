import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';

// 材料退料单API接口
const api = {
  getList: '/inventory/materialOutRet/list',
  save: '/inventory/materialOutRet/save',
  delete: '/inventory/materialOutRet/delete',
  examine: '/inventory/materialOutRet/examine',
  getCode: '/inventory/materialOutRet/getCode',
  confirm: '/inventory/materialOutRet/confirm',
  submit: '/inventory/materialOutRet/submit',
  export: '/inventory/materialOutRet/exportData',
  import: '/inventory/materialOutRet/importData',
  downloadTemplate: '/inventory/materialOutRet/downloadImportTemplate',
  getNowQuantity: '/inventory/materialOutRet/getExistQuantityByWarehouseId',
};

// 获取材料退料单列表
export function getMaterialOutRetList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.getList,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存材料退料单
export function saveMaterialOutRet(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: api.save,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除材料退料单
export function deleteMaterialOutRet(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: api.delete,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 审核材料退料单
export function examineMaterialOutRet(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.examine,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取材料退料单编号
export function getMaterialOutRetCode(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.getCode,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 确认材料退料单
export function confirmMaterialOutRet(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.confirm,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 提交材料退料单
export function submitMaterialOutRet(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.submit,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 导出材料退料单数据
export function exportMaterialOutRetData(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.export,
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 导入材料退料单数据
export function importMaterialOutRetData(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: api.import,
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 5000000,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 下载材料退料单导入模板
export function downloadMaterialOutRetTemplate(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.downloadTemplate,
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 根据物料ID和仓库ID获取现存量
export function getMaterialOutRetNowQuantity(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: api.getNowQuantity,
      params,
      timeout: 5000000,
    },
    {
      errorMessageMode: mode,
    },
  );
}