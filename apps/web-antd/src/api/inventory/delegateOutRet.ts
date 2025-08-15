import { defHttp } from '@/utils/http/axios';
import { BaseResp } from '@/api/model/baseModel';

enum Api {
  GetList = '/inventory/delegateOutRet/getList',
  Save = '/inventory/delegateOutRet/save',
  Delete = '/inventory/delegateOutRet/delete',
  Examine = '/inventory/delegateOutRet/examine',
  GetCode = '/inventory/delegateOutRet/getCode',
  Confirm = '/inventory/delegateOutRet/confirm',
  Submit = '/inventory/delegateOutRet/submit',
  Export = '/inventory/delegateOutRet/export',
  Import = '/inventory/delegateOutRet/import',
  DownloadTemplate = '/inventory/delegateOutRet/downloadTemplate',
  GetDetail = '/inventory/delegateOutRet/getDetail',
}

export function getDelegateOutRetList(params) {
  return defHttp.get<BaseResp>({
    url: Api.GetList,
    params,
  });
}

export function saveDelegateOutRet(params) {
  return defHttp.post<BaseResp>({
    url: Api.Save,
    params,
  });
}

export function deleteDelegateOutRet(params) {
  return defHttp.post<BaseResp>({
    url: Api.Delete,
    params,
  });
}

export function examineDelegateOutRet(params) {
  return defHttp.post<BaseResp>({
    url: Api.Examine,
    params,
  });
}

export function getDelegateOutRetCode(params) {
  return defHttp.get<BaseResp>({
    url: Api.GetCode,
    params,
  });
}

export function confirmDelegateOutRet(params) {
  return defHttp.post<BaseResp>({
    url: Api.Confirm,
    params,
  });
}

export function submitDelegateOutRet(params) {
  return defHttp.post<BaseResp>({
    url: Api.Submit,
    params,
  });
}

export function exportDelegateOutRetData(params) {
  return defHttp.get<BaseResp>({
    url: Api.Export,
    params,
    responseType: 'blob',
  });
}

export function importDelegateOutRet(params) {
  return defHttp.post<BaseResp>({
    url: Api.Import,
    params,
  });
}

export function downloadDelegateOutRetTemplate() {
  return defHttp.get<BaseResp>({
    url: Api.DownloadTemplate,
    responseType: 'blob',
  });
}

export function getDelegateOutRetDetail(params) {
  return defHttp.get<BaseResp>({
    url: Api.GetDetail,
    params,
  });
}