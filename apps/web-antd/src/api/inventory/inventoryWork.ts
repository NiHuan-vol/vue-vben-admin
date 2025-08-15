import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';

// 盘点作业相关参数接口
export interface InventoryWorkParams {
  id?: string;
  voucherCode?: string;
  warehouseId?: string;
  checkerId?: string;
  checkDate?: string;
  status?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

// 获取盘点作业列表
export function getInventoryWorkList(
  params: any,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventoryWork/list',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取盘点作业详情
export function getInventoryWorkDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<InventoryWorkParams>>(
    {
      url: `/inventory/inventoryWork/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存盘点作业
export function saveInventoryWork(
  params: InventoryWorkParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/inventoryWork/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除盘点作业
export function deleteInventoryWork(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/inventoryWork/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核盘点作业
export function auditInventoryWork(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/inventoryWork/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交盘点作业订单
export function submitInventoryWorkOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/inventoryWork/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取盘点作业单据编号
export function getInventoryWorkCode(
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/inventoryWork/getCode',
    },
    {
      errorMessageMode,
    }
  );
}

// 导出盘点作业明细
export function exportInventoryWork(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/inventoryWork/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
      isTransformResponse: false,
    }
  );
}

// 监盘盘点作业
export function secondExamineInventoryWork(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/inventoryWork/secondExamine',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 复核盘点作业
export function firstExamineInventoryWork(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/inventoryWork/firstExamine',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取盘存数据
export function getInventory(
  params: any,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventoryWork/getInventory',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 分页获取数据
export function pageInventoryWork(
  params: any,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventoryWork/page',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 列表搜索
export function listSearchInventoryWork(
  params: any,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/inventoryWork/listSearch',
      params,
    },
    {
      errorMessageMode,
    }
  );
}