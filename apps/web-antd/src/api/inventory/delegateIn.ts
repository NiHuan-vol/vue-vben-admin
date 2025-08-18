import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';

// 委外入库单API接口
const api = {
  getList: '/inventory/delegateIn/list',
  save: '/inventory/delegateIn/save',
  delete: '/inventory/delegateIn/delete',
  examine: '/inventory/delegateIn/examine',
  getCode: '/inventory/delegateIn/getCode',
  confirm: '/inventory/delegateIn/confirm',
  submit: '/inventory/delegateIn/submit',
  export: '/inventory/delegateIn/exportData',
  import: '/inventory/delegateIn/importData',
  downloadTemplate: '/inventory/delegateIn/downloadImportTemplate',
  getDetail: '/inventory/delegateIn/detail',
};

// 获取委外入库单列表
export function getDelegateInList(params: any, mode: ErrorMessageMode = 'message') {
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

// 保存委外入库单
export function saveDelegateIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 删除委外入库单
export function deleteDelegateIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 审核委外入库单
export function examineDelegateIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 获取委外入库单编号
export function getDelegateInCode(params: any, mode: ErrorMessageMode = 'message') {
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

// 确认委外入库单
export function confirmDelegateIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 提交委外入库单
export function submitDelegateIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 导出委外入库单数据
export function exportDelegateInData(params: any, mode: ErrorMessageMode = 'message') {
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

// 导入委外入库单数据
export function importDelegateInData(params: any, mode: ErrorMessageMode = 'message') {
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

// 下载委外入库单导入模板
export function downloadDelegateInTemplate(params: any, mode: ErrorMessageMode = 'message') {
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

// 获取委外入库单详情
export function getDelegateInDetail(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: api.getDetail,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}