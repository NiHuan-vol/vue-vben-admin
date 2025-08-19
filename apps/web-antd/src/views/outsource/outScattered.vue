<!--
 * @Descripttion: 委外零星领料单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-06-28 16:56:56
 * @LastEditors: GaoWei
 * @LastEditTime: 2021-06-30 09:52:29
-->
<template>
  <div class="out-scattered-container">
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleAdd">
          <Icon icon="ic:outline-plus" /> 新增
        </a-button>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { BasicTable, useTable } from '@/components/Table';
import { Button, message } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 表格数据
const tableData = ref<any[]>([]);

// 表格配置
const columns = [
  { title: '序号', dataIndex: 'index', width: 60, customRender: ({ index }) => index + 1 },
  { title: '物料编码', dataIndex: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', width: 150 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
  { title: '用途', dataIndex: 'purpose', width: 150 },
  { title: '操作', width: 120, fixed: 'right', customRender: ({ record }) => (
    <div class="flex space-x-2">
      <a-button type="primary" size="small" @click="handleEdit(record)">编辑</a-button>
      <a-button danger size="small" @click="handleDelete(record.id)">删除</a-button>
    </div>
  )},
];

const { registerTable, tableContext } = useTable({
  columns,
  dataSource: tableData,
  bordered: true,
  pagination: true,
});

// 处理新增
const handleAdd = () => {
  message.info('新增功能待实现');
};

// 处理编辑
const handleEdit = (record: any) => {
  message.info(`编辑ID: ${record.id}`);
};

// 处理删除
const handleDelete = (id: number) => {
  message.info(`删除ID: ${id}`);
};
</script>

<style lang="less" scoped>
.out-scattered-container {
  padding: 16px;
  .flex {
    display: flex;
  }
  .space-x-2 > * {
    margin-right: 8px;
  }
}
</style>