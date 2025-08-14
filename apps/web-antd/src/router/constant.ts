import { defineAsyncComponent } from 'vue';

// 基础布局组件
export const LAYOUT = defineAsyncComponent(() => import('#/layouts/basic.vue'));