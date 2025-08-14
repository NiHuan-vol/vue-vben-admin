import { defHttp } from '/@/utils/http/axios';

// 文件API接口
enum Api {
  GET_FILE_LIST = '/crm/files/page',
  SAVE_FILE = '/crm/files/save',
  DELETE_FILE = '/crm/files/delete',
  DISABLE_FILE = '/crm/files/disable',
  ENABLE_FILE = '/crm/files/enable',
}

/**
 * 获取文件列表
 * @param params 查询参数
 * @returns 文件列表数据
 */
export function getFileList(params) {
  return defHttp.get({
    url: Api.GET_FILE_LIST,
    params,
  });
}

/**
 * 保存文件(新增或更新)
 * @param data 文件数据
 * @returns 保存结果
 */
export function saveFile(data) {
  return defHttp.post({
    url: Api.SAVE_FILE,
    data,
  });
}

/**
 * 删除文件
 * @param params 包含文件ID的参数
 * @returns 删除结果
 */
export function deleteFile(params) {
  return defHttp.delete({
    url: Api.DELETE_FILE,
    params,
  });
}

/**
 * 停用文件
 * @param data 包含文件ID的数据
 * @returns 停用结果
 */
export function disableFile(data) {
  return defHttp.post({
    url: Api.DISABLE_FILE,
    data,
  });
}

/**
 * 启用文件
 * @param data 包含文件ID的数据
 * @returns 启用结果
 */
export function enableFile(data) {
  return defHttp.post({
    url: Api.ENABLE_FILE,
    data,
  });
}