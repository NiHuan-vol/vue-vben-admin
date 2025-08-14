<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="hasPermission('productionLine:add')">
              <a-dropdown class="btns" key="new" style="display:block">
                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                  <Icon class="btns-icon" icon="file-add" />
                  <div class="btns-text">新增
                    <Icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
                  </div>
                </a>
                <a-menu slot="overlay">
                  <a-menu-item key="0">
                    <a href="javascript:void(0)" @click="addContract">新增</a>
                  </a-menu-item>
                  <a-menu-item key="1">
                    <a href="javascript:void(0)" @click="openTemplateModal">选择模版</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </a-col>
            <a-col :span="2" v-if="hasPermission('productionLine:edit')">
              <div class="btns" @click="editContract">
                <Icon class="btns-icon" icon="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('productionLine:delete')">
              <div class="btns" @click="deleteContract">
                <Icon class="btns-icon" icon="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 合同列表 -->
      <BasicTable
        ref="tableRef"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        @select="handleSelect"
      />
    </div>

    <!-- 选择模版模态框 -->
    <BasicModal
      v-model:visible="templateModalVisible"
      title="选择模版"
      :width="350"
      @ok="confirmTemplate"
      @cancel="templateModalVisible = false"
    >
      <BasicForm
        ref="templateFormRef"
        :model="templateFormData"
        :schemas="templateSchemas"
      />
    </BasicModal>

    <!-- 合同编辑模态框 -->
    <ContractModal
      ref="contractModalRef"
      @success="handleModalSuccess"
      @close="handleModalClose"
    />

    <!-- 部门选择模态框 -->
    <BasicModal
      v-model:visible="officeModalVisible"
      title="部门选择"
      :width="400"
      @ok="confirmOffice"
      @cancel="officeModalVisible = false"
    >
      <div style="height: 400px;overflow-y:scroll;">
        <a-input-search
          style="margin-bottom: 8px"
          placeholder="部门名称"
          @change="onOfficeSearchChange"
        />
        <a-tree
          :expanded-keys="expandedOfficeKeys"
          :selected-keys="selectedOfficeKeys"
          :tree-data="officeTreeData"
          @expand="onOfficeExpand"
          @select="onOfficeSelect"
          :show-line="true"
        />
      </div>
    </BasicModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { BasicTable, TableColumn, TablePagination } from '/@/components/Table';
import { BasicModal, BasicForm } from '/@/components/Modal';
import { FormSchema } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
import { usePermission } from '/@/hooks/web/usePermission';
import { getContractList, deleteContract } from '/@/api/crm/contract';
import { getContractTemplateList } from '/@/api/crm/contractTemplate';
import { getOfficeTree } from '/@/api/system/office';
// 引入合同编辑模态框组件
import ContractModal from './components/edit/ContractModal.vue';

// 表格引用
const tableRef = ref<InstanceType<typeof BasicTable>>();
// 表单引用
const templateFormRef = ref<InstanceType<typeof BasicForm>>();
// 模态框引用
const contractModalRef = ref<InstanceType<typeof ContractModal>>();

// 响应式数据
const loading = ref(false);
const dataSource = ref<any[]>([]);
const selectedRowKeys = ref<string[]>([]);
const templateModalVisible = ref(false);
const officeModalVisible = ref(false);
const expandedOfficeKeys = ref<string[]>([]);
const selectedOfficeKeys = ref<string[]>([]);
const officeTreeData = ref<any[]>([]);
const templateData = ref<any[]>([]);

// 分页数据
const pagination = reactive<TablePagination>({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 模板表单数据
const templateFormData = reactive<Record<string, any>>({
  templateId: '',
});

// 消息提示
const message = useMessage();
// 权限检查
const { hasPermission } = usePermission();

// 表格列定义
const columns: TableColumn[] = [
  {
    title: '合同编码',
    dataIndex: 'contractCode',
    width: 150,
  },
  {
    title: '合同名称',
    dataIndex: 'contractName',
    width: 200,
  },
  {
    title: '我方签约人',
    dataIndex: 'personCharge',
    width: 120,
  },
  {
    title: '客户方签约人',
    dataIndex: 'crmCharge',
    width: 120,
  },
  {
    title: '合同金额',
    dataIndex: 'contractPrice',
    width: 120,
    formatter: (value: number) => `¥ ${value.toFixed(2)}`,
  },
  {
    title: '签约时间',
    dataIndex: 'signingDate',
    width: 120,
  },
  {
    title: '生效时间',
    dataIndex: 'beginDate',
    width: 120,
  },
  {
    title: '结束时间',
    dataIndex: 'endDate',
    width: 120,
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    width: 120,
    formatter: (value: number) => {
      const types = {
        1: '产品销售',
        2: '服务',
        3: '业务合作',
        4: '代理分销',
        5: '其它',
      };
      return types[value] || '';
    },
  },
  {
    title: '执行状态',
    dataIndex: 'executionStatus',
    width: 120,
    formatter: (value: number) => {
      const status = {
        1: '执行中',
        2: '结束',
        3: '意外中止',
      };
      return status[value] || '';
    },
  },
  {
    title: '操作',
    width: 150,
    fixed: 'right',
    render: (_: any, record: any) => (
      <div class="action-buttons">
        <a-button
          type="primary"
          size="small"
          v-if="hasPermission('productionLine:edit')"
          @click={() => editContract(record.id)}
        >
          编辑
        </a-button>
        <a-button
          type="danger"
          size="small"
          v-if="hasPermission('productionLine:delete')"
          style={{ marginLeft: '8px' }}
          @click={() => deleteContract(record.id)}
        >
          删除
        </a-button>
      </div>
    ),
  },
];

// 模板表单结构
const templateSchemas: FormSchema[] = [
  {
    field: 'templateId',
    component: 'Select',
    label: '合同模板',
    required: true,
    componentProps: {
      placeholder: '请选择合同模板',
      options: templateData.value,
    },
  },
];

// 加载合同列表
const loadContractList = async () => {
  loading.value = true;
  try {
    const result = await getContractList({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    dataSource.value = result.list || [];
    pagination.total = result.total || 0;
  } catch (error) {
    message.error('获取合同列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载合同模板列表
const loadTemplateList = async () => {
  try {
    const result = await getContractTemplateList({
      page: 1,
      pageSize: 1000,
    });
    templateData.value = result.list?.map((item: any) => ({
      label: item.name,
      value: item.id,
    })) || [];
  } catch (error) {
    message.error('获取合同模板列表失败');
  }
};

// 加载部门树
const loadOfficeTree = async () => {
  try {
    const result = await getOfficeTree();
    officeTreeData.value = result || [];
  } catch (error) {
    message.error('获取部门树失败');
  }
};

// 处理表格变化
const handleTableChange = (pagination: TablePagination) => {
  Object.assign(pagination, pagination);
  loadContractList();
};

// 处理选择
const handleSelect = (selectedKeys: string[], selectedRows: any[]) => {
  selectedRowKeys.value = selectedKeys;
};

// 新增合同
const addContract = () => {
  contractModalRef.value?.open({});
};

// 编辑合同
const editContract = (id?: string) => {
  if (!id && selectedRowKeys.value.length === 0) {
    message.warning('请选择一条记录进行编辑');
    return;
  }

  const contractId = id || selectedRowKeys.value[0];
  contractModalRef.value?.open({ id: contractId });
};

// 删除合同
const deleteContract = async (id?: string) => {
  const contractIds = id ? [id] : selectedRowKeys.value;

  if (contractIds.length === 0) {
    message.warning('请选择一条记录进行删除');
    return;
  }

  try {
    await deleteContract(contractIds);
    message.success('删除成功');
    loadContractList();
    selectedRowKeys.value = [];
  } catch (error) {
    message.error('删除失败');
  }
};

// 打开模板模态框
const openTemplateModal = () => {
  loadTemplateList();
  templateModalVisible.value = true;
};

// 确认选择模板
const confirmTemplate = async () => {
  try {
    const valid = await templateFormRef.value?.validate();
    if (!valid) return;

    const templateId = templateFormData.templateId;
    // 根据模板ID创建合同
    contractModalRef.value?.open({ templateId });
    templateModalVisible.value = false;
  } catch (error) {
    message.error('选择模板失败');
  }
};

// 部门搜索变化
const onOfficeSearchChange = (value: string) => {
  // 实现部门搜索逻辑
};

// 部门展开
const onOfficeExpand = (expandedKeys: string[]) => {
  expandedOfficeKeys.value = expandedKeys;
};

// 部门选择
const onOfficeSelect = (selectedKeys: string[]) => {
  selectedOfficeKeys.value = selectedKeys;
};

// 确认选择部门
const confirmOffice = () => {
  if (selectedOfficeKeys.value.length === 0) {
    message.warning('请选择部门');
    return;
  }
  // 处理部门选择结果
  officeModalVisible.value = false;
};

// 处理模态框成功回调
const handleModalSuccess = () => {
  loadContractList();
};

// 处理模态框关闭回调
const handleModalClose = () => {
  // 可以添加关闭后的逻辑
};

// 初始化
onMounted(() => {
  loadContractList();
  loadOfficeTree();
});
</script>

<style scoped lang="scss">
// 自定义样式
.content-wrapper {
  padding: 20px;
}

.btn-wrapper {
  margin-bottom: 20px;
}

.btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
}

.btns-icon {
  font-size: 18px;
  color: #1890ff;
  margin-bottom: 4px;
}

.btns-text {
  font-size: 12px;
  color: #333;
}

.action-buttons {
  display: flex;
  justify-content: center;
}
</style>