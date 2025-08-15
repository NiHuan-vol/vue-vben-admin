import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';

// 其他入库单API接口
const api = {
  getList: '/inventory/otherIn/list',
  save: '/inventory/otherIn/save',
  delete: '/inventory/otherIn/delete',
  examine: '/inventory/otherIn/examine',
  getCode: '/inventory/otherIn/getCode',
  confirm: '/inventory/otherIn/confirm',
  submit: '/inventory/otherIn/submit',
  export: '/inventory/otherIn/exportData',
  import: '/inventory/otherIn/importData',
  downloadTemplate: '/inventory/otherIn/downloadImportTemplate',
};

// 获取其他入库单列表
export function getOtherInList(params: any, mode: ErrorMessageMode = 'message') {
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

// 保存其他入库单
export function saveOtherIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 删除其他入库单
export function deleteOtherIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 审核其他入库单
export function examineOtherIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 获取其他入库单编号
export function getOtherInCode(params: any, mode: ErrorMessageMode = 'message') {
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

// 确认其他入库单
export function confirmOtherIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 提交其他入库单
export function submitOtherIn(params: any, mode: ErrorMessageMode = 'message') {
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

// 导出其他入库单数据
export function exportOtherInData(params: any, mode: ErrorMessageMode = 'message') {
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

// 导入其他入库单数据
export function importOtherInData(params: any, mode: ErrorMessageMode = 'message') {
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

// 下载其他入库单导入模板
export function downloadOtherInTemplate(params: any, mode: ErrorMessageMode = 'message') {
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