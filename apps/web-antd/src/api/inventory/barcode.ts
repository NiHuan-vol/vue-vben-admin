import { BaseResp } from '@/api/model/baseModel';
import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '#/axios';
import { BaseResp } from '#/axios';

// 条码规则相关API

export interface BarcodeRuleParams {
  id?: string;
  ruleName?: string;
  ruleCode?: string;
  ruleContent?: string;
  remark?: string;
  [key: string]: any;
}

// 条码模板相关API

export interface BarcodeTemplateParams {
  id?: string;
  code?: string;
  name?: string;
  applicableObject?: string;
  content?: string;
  remark?: string;
  [key: string]: any;
}

// 条码打印相关API

export interface BarcodePrintParams {
  id?: string;
  businessObject?: string;
  ruleId?: string;
  templateId?: string;
  remark?: string;
  details?: any[];
  [key: string]: any;
}

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

// 获取条码属性列表
export function listAttr(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/barcode/attribute/getList',
      params,
    },
    {
      errorMessageMode: mode,
      timeout: 500000,
    },
  );
}

// 新增/修改条码属性
export function saveAttr(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/barcode/attribute/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除条码属性
export function deleteAttr(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: '/barcode/attribute/delete',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取业务对象
export function getVoucherDesign(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/erp/voucherTable/listByDto',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取业务对象详情
export function getAttrObjectDetails(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/barcode/attribute/getDetail',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 条码规则保存
export function saveRule(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/erp/barcode/rule/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 条码规则列表
export function listRule(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/erp/barcode/rule/page',
      params,
    },
    {
      errorMessageMode: mode,
      timeout: 500000,
    },
  );
}

// 条码规则详情
export function getRuleDetails(params: any, mode: ErrorMessageMode = 'message') {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/erp/barcode/rule/detailById',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 查询条码规则列表
export function listBarcodeRules(params?: BarcodeRuleParams) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/barcodeRule/list',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
}

// 保存条码规则
export function saveBarcodeRule(params: BarcodeRuleParams, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/barcodeRule/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除条码规则
export function deleteBarcodeRule(id: string, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: `/inventory/barcodeRule/delete/${id}`,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 查询条码模板列表
export function listTemplate(params?: BarcodeTemplateParams) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/barcodeTemplate/list',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
}

// 保存条码模板
export function saveTemplate(params: BarcodeTemplateParams, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/barcodeTemplate/save',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 删除条码模板
export function deleteTemplate(params: { id: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.delete<BaseResp<any>>(
    {
      url: `/inventory/barcodeTemplate/delete/${params.id}`,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 查询打印记录
export function queryPrintRecords(params?: { page?: number; pageSize?: number; [key: string]: any }) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/barcodePrint/list',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
}

// 生成条码
export function generateBarcodes(params: { type: number; ruleId: string; templateId: string; details: any[] }, mode: ErrorMessageMode = 'message') {
  return defHttp.post<BaseResp<any>>(
    {
      url: '/inventory/barcodePrint/generate',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 下载打印插件
export function downLoadexe() {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/barcodePrint/downloadPlugIn',
      responseType: 'blob',
    },
    {
      errorMessageMode: 'message',
    },
  );
}

// 查询业务对象
export function queryBusinessObject(params?: any) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/common/businessObject',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
}

// 查询条码规则
export function queryBarcodeRules(params?: any) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/common/barcodeRules',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
}

// 查询条码模板
export function queryBarcodeTemplates(params?: any) {
  return defHttp.get<BaseResp<any>>(
    {
      url: '/inventory/common/barcodeTemplates',
      params,
    },
    {
      errorMessageMode: 'message',
    },
  );
}