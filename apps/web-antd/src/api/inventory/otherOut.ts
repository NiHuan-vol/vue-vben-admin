import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';

// 其他出库单API接口
const api = {
  getList: '/inventory/otherOut/list',
  save: '/inventory/otherOut/save',
  delete: '/inventory/otherOut/delete',
  examine: '/inventory/otherOut/examine',
  getCode: '/inventory/otherOut/getCode',
  confirm: '/inventory/otherOut/confirm',
  submit: '/inventory/otherOut/submit',
  export: '/inventory/otherOut/exportData',
  import: '/inventory/otherOut/importData',
  downloadTemplate: '/inventory/otherOut/downloadImportTemplate',
};

// 获取其他出库单列表
export function getOtherOutList(params: any, mode: ErrorMessageMode = 'message') {
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

// 保存其他出库单
export function saveOtherOut(params: any, mode: ErrorMessageMode = 'message') {
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

// 删除其他出库单
export function deleteOtherOut(params: any, mode: ErrorMessageMode = 'message') {
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

// 审核其他出库单
export function examineOtherOut(params: any, mode: ErrorMessageMode = 'message') {
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

// 获取其他出库单编号
export function getOtherOutCode(params: any, mode: ErrorMessageMode = 'message') {
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

// 确认其他出库单
export function confirmOtherOut(params: any, mode: ErrorMessageMode = 'message') {
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

// 提交其他出库单
export function submitOtherOut(params: any, mode: ErrorMessageMode = 'message') {
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

// 导出其他出库单数据
export function exportOtherOutData(params: any, mode: ErrorMessageMode = 'message') {
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

// 导入其他出库单数据
export function importOtherOutData(params: any, mode: ErrorMessageMode = 'message') {
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

// 下载其他出库单导入模板
export function downloadOtherOutTemplate(params: any, mode: ErrorMessageMode = 'message') {
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