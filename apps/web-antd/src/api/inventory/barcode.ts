import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 获取条码列表
export function getBarcodeList(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/barcode/list',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存条码
export function saveBarcode(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/barcode/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除条码
export function deleteBarcode(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: '/inventory/barcode/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 打印条码
export function printBarcode(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/barcode/print',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}