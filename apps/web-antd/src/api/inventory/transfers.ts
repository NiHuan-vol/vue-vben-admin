import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '@/api/model/baseModel';

// 保存调拨单
export function saveTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 审核调拨单
export function examineTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/examine',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除调拨单
export function removeTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取单据编号
export function getTransferCode(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/getCode',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 批准调拨单
export function approvalTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/approval',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 确认调拨
export function allotTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/allot',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 退单
export function returnBackTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/returnBack',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 提交单据
export function submitTransfer(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inOut/allocationMain/submit',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}