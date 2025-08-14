import { defHttp } from '#/utils/http/axios';

// 合同API接口
enum Api {
  GET_CONTRACT_LIST = '/crm/contract/page',
  SAVE_CONTRACT = '/crm/contract/save',
  DELETE_CONTRACT = '/crm/contract/delete',
  GET_CONTRACT_DETAIL = '/crm/contract/detail',
}

/**
 * 获取合同列表
 * @param params 查询参数
 * @returns 合同列表数据
 */
export function getContractList(params) {
  return defHttp.get({
    url: Api.GET_CONTRACT_LIST,
    params,
  });
}

/**
 * 保存合同(新增或更新)
 * @param data 合同数据
 * @returns 保存结果
 */
export function saveContract(data) {
  return defHttp.post({
    url: Api.SAVE_CONTRACT,
    data,
  });
}

/**
 * 删除合同
 * @param params 包含合同ID的参数
 * @returns 删除结果
 */
export function deleteContract(params) {
  return defHttp.delete({
    url: Api.DELETE_CONTRACT,
    params,
  });
}

/**
 * 获取合同详情
 * @param params 包含合同ID的参数
 * @returns 合同详情数据
 */
export function getContractDetail(params) {
  return defHttp.get({
    url: Api.GET_CONTRACT_DETAIL,
    params,
  });
}