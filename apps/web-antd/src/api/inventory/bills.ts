import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '@/types/common';
import { BaseResp } from '@/api/model/baseModel';

// 库存期初结存相关接口
export interface InitialInventoryParams {
  id?: string;
  code?: string;
  warehouseId?: string;
  date?: string;
  remark?: string;
  header?: any;
  details?: any[];
  [key: string]: any;
}

export interface InventoryProfitLossParams {
  id?: string;
  code?: string;
  warehouseId?: string;
  date?: string;
  reason?: string;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

export interface PurchaseInParams {
  id?: string;
  code?: string;
  supplierId?: string;
  warehouseId?: string;
  date?: string;
  amount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

export interface PurchaseReturnParams {
  id?: string;
  code?: string;
  supplierId?: string;
  warehouseId?: string;
  date?: string;
  amount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

export interface SaleOutParams {
  id?: string;
  code?: string;
  customerId?: string;
  warehouseId?: string;
  date?: string;
  amount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

export interface SaleOutRetParams {
  id?: string;
  code?: string;
  customerId?: string;
  warehouseId?: string;
  date?: string;
  amount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

export interface MaterialOutParams {
  id?: string;
  code?: string;
  departmentId?: string;
  warehouseId?: string;
  date?: string;
  amount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

/**
 * 导出材料出库单明细
 * @param params 参数对象，包含id、warehouseId、date
 * @param errorMessageMode 错误信息模式
 * @returns Blob数据
 */
export function exportMaterialOut(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/materialOut/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
      isTransformResponse: false,
    }
  );
}

export interface MaterialOutRetParams {
  id?: string;
  code?: string;
  departmentId?: string;
  warehouseId?: string;
  date?: string;
  amount?: number;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

// 保存库存期初结存
export function saveInitialInventory(
  params: InitialInventoryParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/initial/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取库存期初结存详情
export function getInitialInventoryDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<InitialInventoryParams>>(
    {
      url: `/inventory/initial/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除库存期初结存
export function deleteInitialInventory(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/initial/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核库存期初结存
export function auditInitialInventory(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/initial/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交库存期初结存订单
export function submitInitialInventoryOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/initial/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取库存期初结存单单据编号
export function getInitialInventoryCode(
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/initial/getCode',
    },
    {
      errorMessageMode,
    }
  );
}

// 导入库存期初结存
export function importInitialInventory(
  params: { file: File; warehouseId: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.upload<BaseResp<string>>(
    {
      url: '/inventory/initial/import',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 导出库存期初结存
/**
 * 导出库存期初结存明细
 * @param params 参数对象，包含id、warehouseId、date
 * @param errorMessageMode 错误信息模式
 * @returns Blob数据
 */
export function exportInitialInventory(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/initial/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
      isTransformResponse: false,
    }
  );
}

// 分页获取库存期初结存列表

export function getInitialInventoryPage(
  params: { warehouseId?: string; current: number; size: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/initial/page',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取库存报表数据
  export function getInventoryInfoPageList(
   params: { warehouseId?: string; materialId?: string; current: number; size: number },
   errorMessageMode: ErrorMessageMode = 'message'
 ) {
   return defHttp.get<BaseResp<any>>(
     {
       url: '/in/inventoryInfo/pageList',
       params,
     },
     {
       errorMessageMode,
     }
   );
 }

 // 导出库存报表
 export function exportInventoryReport(
   params: { warehouseId?: string; materialId?: string },
   errorMessageMode: ErrorMessageMode = 'message'
 ) {
   return defHttp.get<Blob>(
     {
       url: '/in/inventoryInfo/export',
       params,
       responseType: 'blob',
     },
     {
       errorMessageMode,
     }
   );
 }

// 获取单据编码
 export function getCodeApi(errorMessageMode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/common/getCode',
    },
    {
      errorMessageMode,
    }
  );

}

// 分页获取单据
 export function pageApi(params: { actionType: number; currentId?: string; isLossOrGain: boolean }, errorMessageMode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/profitLoss/page',
      params,
    },
    {
      errorMessageMode,
    }
  );

}

// 获取库存损益单详情
 export function getInventoryProfitLossDetail(
   id: string,
   errorMessageMode: ErrorMessageMode = 'message'
 ) {
   return defHttp.get<BaseResp<InventoryProfitLossParams>>(
     {
       url: `/inventory/profitLoss/detail/${id}`,
     },
     {
       errorMessageMode,
     }
   );
 }

 // 删除库存损益单
 export function deleteInventoryProfitLoss(
   id: string,
   errorMessageMode: ErrorMessageMode = 'message'
 ) {
   return defHttp.delete<BaseResp<string>>(
     {
       url: `/inventory/profitLoss/delete/${id}`,
     },
     {
       errorMessageMode,
     }
   );
 }

 // 审核库存损益单
 export function auditInventoryProfitLoss(
   params: { id: string; status: number },
   errorMessageMode: ErrorMessageMode = 'message'
 ) {
   return defHttp.post<BaseResp<string>>(
     {
       url: '/inventory/profitLoss/audit',
       params,
     },
     {
       errorMessageMode,
     }
   );
 }

 // 导出库存损益单
 export function exportInventoryProfitLoss(
   params: { id?: string; warehouseId?: string; checkDate?: string },
   errorMessageMode: ErrorMessageMode = 'message'
 ) {
   return defHttp.get<Blob>(
     {
       url: '/inventory/profitLoss/export',
       params,
       responseType: 'blob',
     },
     {
       errorMessageMode,
     }
   );
 }

 // 保存库存损益单
export function saveInventoryProfitLoss(
  params: InventoryProfitLossParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/profitLoss/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存采购入库单
export function savePurchaseIn(
  params: PurchaseInParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/purchaseIn/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存采购退货单
export function savePurchaseReturn(
  params: PurchaseReturnParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/purchaseReturn/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取采购退货单详情
export function getPurchaseReturnDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<PurchaseReturnParams>>(
    {
      url: `/inventory/purchaseReturn/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除采购退货单
export function deletePurchaseReturn(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/purchaseReturn/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核采购退货单
export function auditPurchaseReturn(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/purchaseReturn/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交采购退货单
export function submitPurchaseReturnOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/purchaseReturn/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 生成关联单据
export function generateBills(
  params: { sourceId: string; billType: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/bills/generate',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存销售出库单
export function saveSaleOut(
  params: SaleOutParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/saleOut/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取销售出库单详情
export function getSaleOutDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<SaleOutParams>>(
    {
      url: `/inventory/saleOut/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除销售出库单
export function deleteSaleOut(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/saleOut/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核销售出库单
export function auditSaleOut(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/saleOut/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 导出销售出库单
export function exportSaleOut(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/saleOut/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
    }
  );
}

// 提交销售出库单
export function submitSaleOutOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/saleOut/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存销售退货单
export function saveSaleOutRet(
  params: SaleOutRetParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/saleOutRet/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取销售退货单详情
export function getSaleOutRetDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<SaleOutRetParams>>(
    {
      url: `/inventory/saleOutRet/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除销售退货单
export function deleteSaleOutRet(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/saleOutRet/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核销售退货单
export function auditSaleOutRet(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/saleOutRet/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 导出销售退货单
export function exportSaleOutRet(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/saleOutRet/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
    }
  );
}

// 提交销售退货单
export function submitSaleOutRetOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/saleOutRet/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存领料单
export function saveMaterialOut(
  params: MaterialOutParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/materialOut/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 保存退料单
export function saveMaterialOutRet(
  params: MaterialOutRetParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/materialOutRet/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取材料出库单详情
export function getMaterialOutDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<MaterialOutParams>>(
    {
      url: `/inventory/materialOut/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取库存损益单详情
export function getInventoryProfitLossDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<InventoryProfitLossParams>>(
    {
      url: `/inventory/profitLoss/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除库存损益单
export function deleteInventoryProfitLoss(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/profitLoss/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核库存损益单
export function auditInventoryProfitLoss(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/profitLoss/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交库存损益单订单
export function submitInventoryProfitLossOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/profitLoss/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取库存损益单单据编号
export function getInventoryProfitLossCode(
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/profitLoss/getCode',
    },
    {
      errorMessageMode,
    }
  );
}

// 委外入库单相关接口
export interface DelegateInParams {
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

// 保存委外入库单
export function saveDelegateIn(
  params: DelegateInParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateIn/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外入库单详情
export function getDelegateInDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<DelegateInParams>>(
    {
      url: `/inventory/delegateIn/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除委外入库单
export function deleteDelegateIn(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/delegateIn/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核委外入库单
export function auditDelegateIn(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateIn/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交委外入库单订单
export function submitDelegateInOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateIn/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外入库单单据编号
export function getDelegateInCode(
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/delegateIn/getCode',
    },
    {
      errorMessageMode,
    }
  );
}

// 确认委外入库
export function confirmDelegateIn(
  params: { id: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateIn/confirm',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 导出委外入库单
export function exportDelegateIn(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/delegateIn/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
    }
  );
}

// 委外出库单相关接口
/**
 * 导出委外出库单明细
 * @param params 参数对象，包含id、warehouseId、date
 * @returns Blob数据
 */
export function exportDelegateOut(params: {
  id?: string;
  warehouseId?: string;
  date?: string;
}) {
  return defHttp.get<Blob>({
    url: '/inventory/delegateOut/export',
    params,
    responseType: 'blob',
  }, {
    isTransformResponse: false,
  });
}

export interface DelegateOutParams {
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

// 保存委外出库单
export function saveDelegateOut(
  params: DelegateOutParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOut/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外出库单详情
export function getDelegateOutDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<DelegateOutParams>>(
    {
      url: `/inventory/delegateOut/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除委外出库单
export function deleteDelegateOut(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/delegateOut/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核委外出库单
export function auditDelegateOut(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOut/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交委外出库单订单
export function submitDelegateOutOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOut/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外出库单单据编号
export function getDelegateOutCode(
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/delegateOut/getCode',
    },
    {
      errorMessageMode,
    }
  );
}

// 确认委外出库
export function confirmDelegateOut(
  params: { id: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOut/confirm',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 委外产品出库单相关接口
/**
 * 导出委外产品出库单明细
 * @param params 参数对象，包含id、warehouseId、date
 * @returns Blob数据
 */
export function exportDelegateOuta(params: {
  id?: string;
  warehouseId?: string;
  date?: string;
}) {
  return defHttp.get<Blob>({
    url: '/inventory/delegateOuta/export',
    params,
    responseType: 'blob',
  }, {
    isTransformResponse: false,
  });
}

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

// 保存委外产品出库单
export function saveDelegateOuta(
  params: DelegateOutaParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOuta/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外产品出库单详情
export function getDelegateOutaDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<DelegateOutaParams>>(
    {
      url: `/inventory/delegateOuta/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除委外产品出库单
export function deleteDelegateOuta(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/delegateOuta/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核委外产品出库单
export function auditDelegateOuta(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOuta/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交委外产品出库单订单
export function submitDelegateOutaOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOuta/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外产品出库单单据编号
export function getDelegateOutaCode(
  params: { sourceCode: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/delegateOuta/getCode',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 确认委外产品出库
export function confirmDelegateOuta(
  params: { id: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOuta/confirm',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 委外退料单相关接口
/**
 * 导出委外退料单明细
 * @param params 参数对象，包含id、warehouseId、date
 * @returns Blob数据
 */
export function exportDelegateOutRet(params: {
  id?: string;
  warehouseId?: string;
  date?: string;
}) {
  return defHttp.get<Blob>({
    url: '/inventory/delegateOutRet/export',
    params,
    responseType: 'blob',
  }, {
    isTransformResponse: false,
  });
}

export interface DelegateOutRetParams {
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

// 保存委外退料单
export function saveDelegateOutRet(
  params: DelegateOutRetParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOutRet/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外退料单详情
export function getDelegateOutRetDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<DelegateOutRetParams>>(
    {
      url: `/inventory/delegateOutRet/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除委外退料单
export function deleteDelegateOutRet(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/delegateOutRet/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核委外退料单
export function auditDelegateOutRet(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOutRet/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交委外退料单订单
export function submitDelegateOutRetOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOutRet/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外退料单单据编号
export function getDelegateOutRetCode(
  params: { sourceCode: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/delegateOutRet/getCode',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 确认委外退料入库
export function confirmDelegateOutRet(
  params: { id: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegateOutRet/confirm',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 委外领料单相关接口
/**
 * 导出委外领料单明细
 * @param params 参数对象，包含id、warehouseId、date
 * @param errorMessageMode 错误信息模式
 * @returns Blob数据
 */
export function exportDelegatePicking(
  params: { id?: string; warehouseId?: string; date?: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<Blob>(
    {
      url: '/inventory/delegatePicking/export',
      params,
      responseType: 'blob',
    },
    {
      errorMessageMode,
      isTransformResponse: false,
    }
  );
}

export interface DelegatePickingParams {
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

// 保存委外领料单
export function saveDelegatePicking(
  params: DelegatePickingParams,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegatePicking/save',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外领料单详情
export function getDelegatePickingDetail(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<DelegatePickingParams>>(
    {
      url: `/inventory/delegatePicking/detail/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除委外领料单
export function deleteDelegatePicking(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/delegatePicking/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核委外领料单
export function auditDelegatePicking(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegatePicking/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交委外领料单订单
export function submitDelegatePickingOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegatePicking/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取委外领料单单据编号
export function getDelegatePickingCode(
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/delegatePicking/getCode',
    },
    {
      errorMessageMode,
    }
  );
}

// 确认委外领料
export function confirmDelegatePicking(
  params: { id: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/delegatePicking/confirm',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 删除材料出库单
export function deleteMaterialOut(
  id: string,
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.delete<BaseResp<string>>(
    {
      url: `/inventory/materialOut/delete/${id}`,
    },
    {
      errorMessageMode,
    }
  );
}

// 审核材料出库单
export function auditMaterialOut(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/materialOut/audit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 提交材料出库单
export function submitMaterialOutOrder(
  params: { id: string; status: number },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/materialOut/submit',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 获取材料出库单编号
export function getMaterialOutCode(
  params: { sourceCode: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.get<BaseResp<string>>(
    {
      url: '/inventory/materialOut/getCode',
      params,
    },
    {
      errorMessageMode,
    }
  );
}

// 确认出库
export function confirmMaterialOut(
  params: { id: string },
  errorMessageMode: ErrorMessageMode = 'message'
) {
  return defHttp.post<BaseResp<string>>(
    {
      url: '/inventory/materialOut/confirm',
      params,
    },
    {
      errorMessageMode,
    }
  );
}