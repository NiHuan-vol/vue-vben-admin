import { defHttp } from '/@/utils/http/axios';

// 合同模板API接口
enum Api {
  GET_TEMPLATE_LIST = '/crm/contract/getTemplateList',
  GET_TEMPLATE_DETAIL = '/crm/contract/getTemplateDetail',
  SAVE_TEMPLATE = '/crm/contract/saveContractTemplate',
  DELETE_TEMPLATE = '/crm/contract/deleteContractTemplate',
}

/**
 * 获取合同模板列表
 * @param params 查询参数
 * @returns 模板列表数据
 */
export function getTemplateList(params) {
  return defHttp.get({
    url: Api.GET_TEMPLATE_LIST,
    params,
  });
}

/**
 * 获取合同模板详情
 * @param params 包含模板ID的参数
 * @returns 模板详情数据
 */
export function getTemplateDetail(params) {
  return defHttp.get({
    url: Api.GET_TEMPLATE_DETAIL,
    params,
  });
}

/**
 * 保存合同模板(新增或更新)
 * @param data 模板数据
 * @returns 保存结果
 */
export function saveTemplate(data) {
  return defHttp.post({
    url: Api.SAVE_TEMPLATE,
    data,
  });
}

/**
 * 删除合同模板
 * @param params 包含模板ID的参数
 * @returns 删除结果
 */
export function deleteTemplate(params) {
  return defHttp.delete({
    url: Api.DELETE_TEMPLATE,
    params,
  });
}