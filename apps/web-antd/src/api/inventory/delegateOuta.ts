import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '@/types/common';
import { BaseResp } from '@/api/model/baseModel';

// 委外产品出库单API接口
const api = {
  getList: '/inventory/delegateOuta/list',
  save: '/inventory/delegateOuta/save',
  delete: '/inventory/delegateOuta/delete',
  examine: '/inventory/delegateOuta/examine',
  getCode: '/inventory/delegateOuta/getCode',
  confirm: '/inventory/delegateOuta/confirm',
  submit: '/inventory/delegateOuta/submit',
  export: '/inventory/delegateOuta/exportData',
  getDetail: '/inventory/delegateOuta/detail',
};

// 委外产品出库单参数接口
export interface DelegateOutaParams {
  id?: string;
  voucherCode?: string;
  warehouseId?: string;
  supplierId?: string;
  date?: string;
  contactPerson?: string;
  phone?: string;
  totalAmount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

// 获取委外产品出库单列表
export function getDelegateOutaList(params: any, mode: ErrorMessageMode = 'message') {
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

// 保存委外产品出库单
export function saveDelegateOuta(params: DelegateOutaParams, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<string>>(
    {
      url: api.save,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除委外产品出库单
export function deleteDelegateOuta(params: any, mode: ErrorMessageMode = 'message') {
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

// 审核委外产品出库单
export function auditDelegateOuta(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: api.examine,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取委外产品出库单编号
export function getDelegateOutaCode(params: any, mode: ErrorMessageMode = 'message') {
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

// 确认委外产品出库
export function confirmDelegateOuta(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: api.confirm,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 提交委外产品出库单
export function submitDelegateOutaOrder(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: api.submit,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 导出委外产品出库单数据
export function exportDelegateOuta(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<Blob>(
    {
      url: api.export,
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode: mode,
      isTransformResponse: false,
    },
  );
}

// 获取委外产品出库单详情
export function getDelegateOutaDetail(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<DelegateOutaParams>>(
    {
      url: api.getDetail,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}