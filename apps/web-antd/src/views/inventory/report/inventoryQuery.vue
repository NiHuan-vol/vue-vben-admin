<template>
  <div class="inventory-query-container">
    <Card title="现存量查询">
      <div class="query-form-wrapper">
        <CollapseContainer title="查询条件">
          <Form
            ref="queryFormRef"
            :model="queryForm"
            :rules="queryFormRules"
            layout="inline"
            :labelCol="{ style: { width: '80px' } }"
            :wrapperCol="{ style: { width: '200px' } }"
          >
            <FormItem name="warehouseId" label="仓库">
              <Input
                v-model:value="queryForm.warehouseName"
                placeholder="请选择仓库"
                readonly
                @click="handleSearch('warehouseRef')"
              />
            </FormItem>

            <FormItem name="beginCode" label="物料编码">
              <Input
                v-model:value="queryForm.beginCode"
                placeholder="起始编码"
                @focus="handlInputArchives(1, 'beginCode')"
                @change="handleArchiveChange"
              />
              <span class="separate">-</span>
              <Input
                v-model:value="queryForm.endCode"
                placeholder="结束编码"
                @focus="handlInputArchives(2, 'endCode')"
                @change="handleArchiveChange"
              />
            </FormItem>

            <FormItem name="inventoryName" label="物料名称">
              <Input
                v-model:value="queryForm.inventoryName"
                placeholder="请输入物料名称"
                @focus="handlInputArchives(3, 'inventoryName')"
                @change="handleNameChange"
              />
            </FormItem>

            <FormItem name="inventoryTypeId" label="物料分类">
              <Input
                v-model:value="queryForm.inventoryTypeNameArray"
                placeholder="请选择物料分类"
                readonly
                @click="handlInputArchives(4, 'inventoryTypeId')"
              />
            </FormItem>

            <FormItem label="">
              <Button type="primary" @click="searchPlan">查询</Button>
              <Button class="ml-2" @click="resetForm">重置</Button>
              <Button class="ml-2" @click="exportOrder">导出</Button>
              <Button class="ml-2" @click="syncFun">刷新</Button>
            </FormItem>
          </Form>
        </CollapseContainer>
      </div>

      <BasicTable
        ref="tableRef"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :rowKey="(record) => record.key"
        :expandable="{ expandedRowKeys: tableExplandKey, onExpand: handleExpand }"
        :rowClassName="rowClassName"
        @change="handleTableChange"
      >
        <template #expandedRowRender="{ record }">
          <div v-if="record.children && record.children.length > 0">
            <BasicTable
              :columns="columns"
              :dataSource="record.children"
              :pagination="false"
              :showHeader="false"
              :rowKey="(item) => item.key"
            />
          </div>
        </template>
      </BasicTable>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from 'vue';
import { Card, Button, Input, Form, FormItem, CollapseContainer } from 'ant-design-vue';
import { BasicTable } from '/@/components/Table';
import { useGo } from '/@/hooks/web/usePage';
import { getAction } from '/@/api/sys/request';
import { exportToExcel } from '/@/utils/exportToExcel';
import { message } from 'ant-design-vue';

// 表格引用
const tableRef = ref<Nullable<InstanceType<typeof BasicTable>>>(null);
// 查询表单引用
const queryFormRef = ref<Nullable<InstanceType<typeof Form>>>(null);
// 路由跳转
const go = useGo();

// 表格数据
const dataSource = ref<any[]>([]);
// 展开行Keys
const tableExplandKey = ref<string[]>([]);
// 输入类型
const inputType = ref<number>(0);
// 物料分类ID数组
const inventoryTypeIdArray = ref<number[]>([]);

// 分页配置
const pagination = reactive<Partial<PaginationProps>>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100', '200'],
});

// 查询表单
const queryForm = reactive<{[key: string]: any}>({
  warehouseId: '',
  warehouseName: '',
  beginCode: '',
  endCode: '',
  inventoryName: '',
  inventoryTypeId: '',
  inventoryTypeNameArray: '',
});

// 查询表单验证规则
const queryFormRules = reactive<Record<string, any[]>>({
  // 可根据需要添加验证规则
});

// 表格列定义
const columns = [
  {
    title: '物料编码',
    dataIndex: 'inventoryCode',
    width: 120,
  },
  {
    title: '物料名称',
    dataIndex: 'inventoryName',
    width: 180,
  },
  {
    title: '规格型号',
    dataIndex: 'specification',
    width: 150,
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 80,
  },
  {
    title: '仓库名称',
    dataIndex: 'warehouseName',
    width: 120,
  },
  {
    title: '现存量',
    dataIndex: 'currentStock',
    width: 100,
    align: 'right',
  },
  {
    title: '可用量',
    dataIndex: 'availableStock',
    width: 100,
    align: 'right',
  },
  {
    title: '冻结量',
    dataIndex: 'frozenStock',
    width: 100,
    align: 'right',
  },
  {
    title: '在途量',
    dataIndex: 'inTransitStock',
    width: 100,
    align: 'right',
  },
  {
    title: '安全库存',
    dataIndex: 'safetyStock',
    width: 100,
    align: 'right',
  },
];

// 获取数据列表
const getList = async () => {
  try {
    // 构建请求参数
    const params = {
      ...queryForm,
      inventoryTypeIdList: inventoryTypeIdArray.value,
      page: {
        current: pagination.current,
        size: pagination.pageSize,
      },
    };

    const res = await getAction('/api/inventory/query', params);

    if (res.success) {
      // 处理树形数据
      const processedData = processTreeData(res.data.records);
      dataSource.value = processedData;
      pagination.total = res.data.total;
    } else {
      message.error(res.message || '获取数据失败');
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    message.error('获取数据失败');
  }
};

// 处理树形数据
const processTreeData = (data: any[]) => {
  const map = new Map();
  const returnData: any[] = [];

  // 构建Map
  data.forEach(item => {
    item.key = item.id;
    map.set(item.id, { ...item, children: [] });
  });

  // 构建树形结构
  data.forEach(item => {
    if (item.inventoryId) {
      // 子节点
      const parentItem = map.get(item.inventoryId);
      if (parentItem) {
        parentItem.children.push(map.get(item.id));
      } else {
        returnData.push(map.get(item.id));
      }
    } else {
      // 父节点
      returnData.push(map.get(item.id));
    }
  });

  return returnData;
};

// 处理表格展开/折叠
const handleExpand = (expanded: boolean, record: any) => {
  const id = record.key;
  if (expanded) {
    tableExplandKey.value.push(id);
  } else {
    tableExplandKey.value = tableExplandKey.value.filter(key => key !== id);
  }
};

// 行样式
const rowClassName = (record: any) => {
  return record.dataType === 2 ? 'changeColorClass' : '';
};

// 处理表格分页变更
const handleTableChange = (pagination: any) => {
  Object.assign(pagination, pagination);
  getList();
};

// 查询
const searchPlan = () => {
  pagination.current = 1;
  getList();
};

// 重置表单
const resetForm = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields();
    inventoryTypeIdArray.value = [];
  }
};

// 导出
const exportOrder = () => {
  // 实现导出逻辑
  message.info('导出功能待实现');
};

// 刷新
const syncFun = () => {
  getList();
};

// 处理搜索
const handleSearch = (refName: string) => {
  // 这里需要根据实际情况实现搜索弹窗
  message.info(`打开${refName}搜索弹窗`);
};

// 处理档案输入
const handlInputArchives = (type: number, ref: string) => {
  inputType.value = type;
  // 这里需要根据实际情况实现档案选择逻辑
  message.info(`打开类型${type}的档案选择器`);
};

// 物料名称搜索
const handleNameChange = () => {
  if (queryForm.inventoryName) {
    // 实现物料名称搜索逻辑
    message.info(`搜索物料名称: ${queryForm.inventoryName}`);
  }
};

// 物料编码搜索
const handleArchiveChange = () => {
  const inputVal = inputType.value === 1 ? queryForm.beginCode : queryForm.endCode;
  if (inputVal) {
    // 实现物料编码搜索逻辑
    message.info(`搜索物料编码: ${inputVal}`);
  }
};

// 页面挂载时
onMounted(() => {
  getList();
});

// 页面激活时
onActivated(() => {
  getList();
});
</script>

<style lang="less">
.inventory-query-container {
  padding: 16px;

  .query-form-wrapper {
    margin-bottom: 16px;
  }

  .separate {
    display: inline-block;
    margin: 0 8px;
    line-height: 32px;
  }

  .changeColorClass {
    font-weight: bold;
    background-color: #fffceb;
  }
}
</style>