import { useI18n as useVbenI18n } from '@vben/locales';

/**
 * 国际化钩子函数
 * @returns 包含t函数的对象
 */
export function useI18n() {
  return useVbenI18n();
}