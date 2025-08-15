import { defHttp } from '@/utils/http/axios';
import { BaseResp } from '@/api/model/baseModel';

enum Api {
  GetList = '/inventory/delegateOut/getList',
  Save = '/inventory/delegateOut/save',
  Delete = '/inventory/delegateOut/delete',
  Examine = '/inventory/delegateOut/examine',
  GetCode = '/inventory/delegateOut/getCode',
  Confirm = '/inventory/delegateOut/confirm',
  Submit = '/inventory/delegateOut/submit',
  Export = '/inventory/delegateOut/export',
  Import = '/inventory/delegateOut/import',
  DownloadTemplate = '/inventory/delegateOut/downloadTemplate',
  GetDetail = '/inventory/delegateOut/getDetail',
}

export function getDelegateOutList(params) {
  return defHttp.get<BaseResp>({
    url: Api.GetList,
    params,
  });
}

export function saveDelegateOut(params) {
  return defHttp.post<BaseResp>({
    url: Api.Save,
    params,
  });
}

export function deleteDelegateOut(params) {
  return defHttp.post<BaseResp>({
    url: Api.Delete,
    params,
  });
}

export function examineDelegateOut(params) {
  return defHttp.post<BaseResp>({
    url: Api.Examine,
    params,
  });
}

export function getDelegateOutCode(params) {
  return defHttp.get<BaseResp>({
    url: Api.GetCode,
    params,
  });
}

export function confirmDelegateOut(params) {
  return defHttp.post<BaseResp>({
    url: Api.Confirm,
    params,
  });
}

export function submitDelegateOut(params) {
  return defHttp.post<BaseResp>({
    url: Api.Submit,
    params,
  });
}

export function exportDelegateOutData(params) {
  return defHttp.get<BaseResp>({
    url: Api.Export,
    params,
    responseType: 'blob',
  });
}

export function importDelegateOut(params) {
  return defHttp.post<BaseResp>({
    url: Api.Import,
    params,
  });
}

export function downloadDelegateOutTemplate() {
  return defHttp.get<BaseResp>({
    url: Api.DownloadTemplate,
    responseType: 'blob',
  });
}

export function getDelegateOutDetail(params) {
  return defHttp.get<BaseResp>({
    url: Api.GetDetail,
    params,
  });
}