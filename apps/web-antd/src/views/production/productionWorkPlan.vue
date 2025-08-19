<template>
  <div class="production-work-plan">
    <BasicPageHeader :title="t('production.workPlan.title')" :showBack="false" />

    <!-- 按钮区域 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex space-x-2">
        <Button type="primary" @click="newPlan" v-if="hasPermission('productionWorkPlan:add')">
          {{ t('common.add') }}
        </Button>
        <Button @click="savePlan" v-if="hasPermission('productionWorkPlan:save')" :disabled="!planId || planId === 1">
          {{ t('common.save') }}
        </Button>
        <Button danger @click="deletePlan" v-if="hasPermission('productionWorkPlan:delete')" :disabled="!planId || planId === 1">
          {{ t('common.delete') }}
        </Button>
        <Button @click="refresh">
          {{ t('common.refresh') }}
        </Button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="grid grid-cols-12 gap-4">
      <!-- 左侧方案列表 -->
      <div class="col-span-3 bg-white rounded-md shadow-sm p-4 h-[calc(100vh-160px)] overflow-y-auto">
        <h5 class="text-lg font-medium mb-3">{{ t('production.workPlan.mrpPlan') }}</h5>
        <List
          bordered
          dataSource={planList}
          itemLayout="horizontal"
          renderItem={(item) => (
            <List.Item
              className={planId === item.id ? 'bg-primary/10 text-primary' : ''}
              onClick={() => planClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                title={<span>({item.code}){item.name}</span>}
              />
            </List.Item>
          )}
        />
      </div>

      <!-- 右侧表单内容 -->
      <div class="col-span-9 bg-white rounded-md shadow-sm p-4 h-[calc(100vh-160px)] overflow-y-auto">
        <Form ref="formRef" :model="formData" layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <FormItem label={t('production.workPlan.code')} name="code" required>
                <Input
                  v-model:value={formData.code}
                  placeholder={t('production.workPlan.enterCode')}
                  onKeyup={(e) => {
                    formData.code = e.target.value.replace(/[^\d.]/g, '');
                  }}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={t('production.workPlan.name')} name="name" required>
                <Input v-model:value={formData.name} placeholder={t('production.workPlan.enterName')} />
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label={t('production.workPlan.description')} name="remarks">
                <Input v-model:value={formData.remarks} placeholder={t('production.workPlan.enterDescription')} />
              </FormItem>
            </Col>
          </Row>
        </Form>

        <Divider orientation="left" class="my-4">
          {{ t('production.workPlan.calculationFormula') }}
        </Divider>

        <div class="mb-6 pl-4">
          <p class="mb-3">{{ t('production.workPlan.formulaDesc') }}</p>
          <CheckboxGroup
            v-model:value={checkedFields}
            :options={formulaOptions}
            class="grid grid-cols-2 gap-2"
            @change={handleFormulaChange}
          />
        </div>

        <Divider orientation="left" class="my-4">
          {{ t('production.workPlan.warehouses') }}
        </Divider>

        <div class="mb-6 pl-4">
          <Table
            :columns={warehouseColumns}
            :dataSource={warehouseData}
            :pagination={false}
            bordered
            rowKey="id"
            style={{ width: '60%' }}
          >
            <template #isMRP="{ record, index }">
              <Checkbox
                v-model:checked={record.isMRP}
                @change={(e) => handleWarehouseCheck(record, e.target.checked)}
              />
            </template>
          </Table>
        </div>

        <Divider orientation="left" class="my-4">
          {{ t('production.workPlan.mergeRules') }}
        </Divider>

        <div class="pl-4">
          <RadioGroup
            v-model:value={formData.mergeType}
            :options={mergeOptions}
            buttonStyle="solid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { Button, Form, Input, Checkbox, Radio, Table, Divider, List } from 'ant-design-vue';
import { BasicPageHeader } from '/@/components/Page';
import { usePermission } from '/@/hooks/web/usePermission';
import { useMessage } from '/@/hooks/web/useMessage';

// API
import {
  list as getPlanList,
  save as savePlan,
  remove as deletePlan,
  getWarehouseList,
} from '/@/api/production/productionWorkPlan';

// 类型定义
interface PlanItem {
  id: number;
  code: string;
  name: string;
  remarks: string;
  mergeType: number;
  warehouseIds: string;
  lossRate: boolean;
  isExistInventory: boolean;
  isFinishProductRate: boolean;
  isSafeInventory: boolean;
  isWarehouseDistributionQuantity: boolean;
  isOrderPolicyBatch: boolean;
  isSystem: number;
}

interface WarehouseItem {
  id: number;
  whCode: string;
  whName: string;
  isMRP: boolean;
}

// 国际化
const { t } = useI18n();
const store = useStore();
const { hasPermission } = usePermission();
const { createMessage } = useMessage();

// 响应式数据
const formRef = ref<any>(null);
const planList = ref<PlanItem[]>([]);
const planId = ref<number | null>(null);
const warehouseData = ref<WarehouseItem[]>([]);
const checkedFields = ref<string[]>([]);

// 表单数据
const formData = reactive<{
  code: string;
  name: string;
  remarks: string;
  mergeType: number;
  warehouseIds: string;
  lossRate: boolean;
  isExistInventory: boolean;
  isFinishProductRate: boolean;
  isSafeInventory: boolean;
  isWarehouseDistributionQuantity: boolean;
  isOrderPolicyBatch: boolean;
}>({
  code: '',
  name: '',
  remarks: '',
  mergeType: 1,
  warehouseIds: '',
  lossRate: false,
  isExistInventory: false,
  isFinishProductRate: false,
  isSafeInventory: false,
  isWarehouseDistributionQuantity: false,
  isOrderPolicyBatch: false,
});

// 选项配置
const formulaOptions = [
  { label: t('production.workPlan.considerLossRate'), value: 'lossRate' },
  { label: t('production.workPlan.considerInventory'), value: 'isExistInventory' },
  { label: t('production.workPlan.considerYield'), value: 'isFinishProductRate' },
  { label: t('production.workPlan.considerSafetyStock'), value: 'isSafeInventory' },
  { label: t('production.workPlan.considerInOutQuantity'), value: 'isWarehouseDistributionQuantity' },
  { label: t('production.workPlan.considerOrderPolicy'), value: 'isOrderPolicyBatch' },
];

const mergeOptions = [
  { label: t('production.workPlan.noMerge'), value: 1 },
  { label: t('production.workPlan.mergeByMaterial'), value: 2 },
  { label: t('production.workPlan.mergeByMaterialSource'), value: 3 },
  { label: t('production.workPlan.mergeByMaterialSourceLine'), value: 4 },
];

// 表格列配置
const warehouseColumns = [
  {
    title: t('common.serial'),
    dataIndex: '',
    width: 60,
    customRender: (_, __, index) => index + 1,
    align: 'center',
  },
  {
    title: t('production.workPlan.warehouseCode'),
    dataIndex: 'whCode',
  },
  {
    title: t('production.workPlan.warehouseName'),
    dataIndex: 'whName',
  },
  {
    title: t('production.workPlan.participateMrp'),
    dataIndex: 'isMRP',
    slots: { customRender: 'isMRP' },
    align: 'center',
  },
];

// 生命周期
onMounted(() => {
  fetchWarehouseList();
});

// 方法
const fetchWarehouseList = async () => {
  try {
    const response = await getWarehouseList({ current: 1, size: 20 });
    if (response.code === 200) {
      warehouseData.value = response.data.records.map((item: any) => ({
        ...item,
        isMRP: false,
      }));
      fetchPlanList();
    }
  } catch (error) {
    createMessage.error(t('common.fetchFailed'));
    console.error('Failed to fetch warehouse list:', error);
  }
};

const fetchPlanList = async () => {
  try {
    const response = await getPlanList({ current: 1, size: -1 });
    if (response.code === 200) {
      planList.value = response.data.records;
      if (planList.value.length > 0) {
        if (planId.value) {
          const currentPlan = planList.value.find(item => item.id === planId.value);
          if (currentPlan) {
            planClick(currentPlan);
          } else {
            planClick(planList.value[0]);
          }
        } else {
          planClick(planList.value[0]);
        }
      }
    }
  } catch (error) {
    createMessage.error(t('common.fetchFailed'));
    console.error('Failed to fetch plan list:', error);
  }
};

const planClick = (item: PlanItem) => {
  planId.value = item.id;
  formData.code = item.code;
  formData.name = item.name;
  formData.remarks = item.remarks || '';
  formData.mergeType = item.mergeType;
  formData.warehouseIds = item.warehouseIds || '';

  // 设置公式选项
  checkedFields.value = [];
  formulaOptions.forEach(option => {
    if (item[option.value as keyof PlanItem]) {
      checkedFields.value.push(option.value);
    }
    formData[option.value as keyof typeof formData] = !!item[option.value as keyof PlanItem];
  });

  // 设置仓库选项
  const warehouseIds = item.warehouseIds ? item.warehouseIds.split(',') : [];
  warehouseData.value.forEach(warehouse => {
    warehouse.isMRP = warehouseIds.includes(warehouse.id.toString());
  });

  // 系统默认方案全选仓库
  if (item.isSystem === 1) {
    warehouseData.value.forEach(warehouse => {
      warehouse.isMRP = true;
    });
  }
};

const newPlan = () => {
  planId.value = null;
  formData.code = '';
  formData.name = '';
  formData.remarks = '';
  formData.mergeType = 1;
  formData.warehouseIds = '';

  // 重置公式选项
  checkedFields.value = [
    'lossRate',
    'isExistInventory',
    'isFinishProductRate',
    'isSafeInventory',
    'isWarehouseDistributionQuantity',
    'isOrderPolicyBatch',
  ];
  handleFormulaChange(checkedFields.value);

  // 重置仓库选项
  warehouseData.value.forEach(warehouse => {
    warehouse.isMRP = false;
  });
};

const savePlan = async () => {
  try {
    await formRef.value.validateFields();

    // 验证编码格式
    if (!/^\d{3}$/.test(formData.code)) {
      createMessage.warning(t('production.workPlan.codeFormatError'));
      return;
    }

    // 验证名称
    if (!formData.name.trim()) {
      createMessage.warning(t('production.workPlan.nameRequired'));
      return;
    }

    // 收集仓库ID
    const selectedWarehouseIds = warehouseData.value
      .filter(warehouse => warehouse.isMRP)
      .map(warehouse => warehouse.id)
      .join(',');
    formData.warehouseIds = selectedWarehouseIds;

    // 保存数据
    const response = await savePlan({
      ...formData,
      id: planId.value,
    });

    if (response.code === 200) {
      createMessage.success(t('common.saveSuccess'));
      fetchPlanList();
    } else {
      createMessage.error(response.message || t('common.saveFailed'));
    }
  } catch (error: any) {
    if (error.errorFields && error.errorFields.length > 0) {
      createMessage.warning(t('common.formValidateFailed'));
    } else {
      createMessage.error(t('common.saveFailed'));
      console.error('Failed to save plan:', error);
    }
  }
};

const deletePlan = async () => {
  if (!planId.value) return;

  try {
    const response = await deletePlan({ id: planId.value });
    if (response.code === 200) {
      createMessage.success(t('common.deleteSuccess'));
      newPlan();
      fetchPlanList();
    } else {
      createMessage.error(response.message || t('common.deleteFailed'));
    }
  } catch (error) {
    createMessage.error(t('common.deleteFailed'));
    console.error('Failed to delete plan:', error);
  }
};

const refresh = () => {
  if (planId.value) {
    const currentPlan = planList.value.find(item => item.id === planId.value);
    if (currentPlan) {
      planClick(currentPlan);
    }
  } else {
    fetchPlanList();
  }
};

const handleFormulaChange = (values: string[]) => {
  formulaOptions.forEach(option => {
    formData[option.value as keyof typeof formData] = values.includes(option.value);
  });
};

const handleWarehouseCheck = (record: WarehouseItem, checked: boolean) => {
  record.isMRP = checked;
};
</script>

<style lang="less">
.production-work-plan {
  padding: 16px;
  font-size: 14px;

  .ant-list-item {
    transition: all 0.3s;
  }

  .ant-list-item:hover {
    background-color: #f5f7fa;
  }

  .ant-form-item {
    margin-bottom: 16px;
  }

  .ant-checkbox-group-item {
    margin-bottom: 8px;
  }
}
</style>