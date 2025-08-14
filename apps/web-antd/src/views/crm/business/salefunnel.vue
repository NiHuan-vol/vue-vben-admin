<template>
  <ContentWrap class="funnel-content-wrapper">
    <PageTitle title="销售漏斗" sub-title="展示各阶段商机分布情况" />

    <!-- 查询条件 -->
    <div class="search-container mb-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex flex-wrap gap-4 items-center">
        <FormItem label="部门" field="officeId">
          <Select
            v-model:value="officeId"
            placeholder="请选择部门"
            :showSearch="true"
            @search="handleOfficeSearch"
          >
            <Option v-for="item in officeList" :key="item.id" :value="item.id">
              {{ item.name }}
            </Option>
          </Select>
        </FormItem>

        <FormItem label="人员" field="userId">
          <Select
            v-model:value="userId"
            placeholder="请选择人员"
            :showSearch="true"
            @search="handleUserSearch"
          >
            <Option v-for="item in userList" :key="item.id" :value="item.id">
              {{ item.name }}
            </Option>
          </Select>
        </FormItem>

        <FormItem label="创建时间" field="dateRange">
          <DatePicker
            v-model:value="dateRange"
            type="range"
            format="YYYY-MM-DD"
            placeholder="请选择日期范围"
          />
        </FormItem>

        <Button type="primary" @click="handleQuery" class="ml-2">
          查询
        </Button>
      </div>
    </div>

    <!-- 漏斗图 -->
    <div class="chart-container bg-white p-4 rounded-lg shadow-sm">
      <BasicChart
        type="funnel"
        :options="chartOptions"
        style="height: 400px; width: 100%"
      />
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage } from 'naive-ui';
import { useForm } from '@/components/Form';
import { getOfficeList, getUserList, getSaleFunnelData } from '@/api/crm/business';
import { ContentWrap, PageTitle, Button, FormItem, Select, Option, DatePicker, BasicChart } from '@/components';

// 国际化
const { t } = useI18n();
// 消息提示
const message = useMessage();

// 部门和用户数据
const officeId = ref<string>('');
const userId = ref<string>('');
const dateRange = ref<[string, string]>(['', '']);
const officeList = ref<any[]>([]);
const userList = ref<any[]>([]);

// 图表数据
const funnelData = ref<any[]>([]);
const legendData = ref<string[]>([]);

// 表单注册
const [registerForm] = useForm({
  schemas: [
    { field: 'officeId', component: 'Select' },
    { field: 'userId', component: 'Select' },
    { field: 'dateRange', component: 'DatePicker' },
  ],
});

// 获取部门列表
const loadOfficeList = async () => {
  try {
    const res = await getOfficeList();
    officeList.value = res.data || [];
  } catch (error) {
    message.error('获取部门列表失败');
    console.error('Failed to load office list:', error);
  }
};

// 获取用户列表
const loadUserList = async () => {
  try {
    const res = await getUserList();
    userList.value = res.data || [];
  } catch (error) {
    message.error('获取用户列表失败');
    console.error('Failed to load user list:', error);
  }
};

// 处理部门搜索
const handleOfficeSearch = async (keyword: string) => {
  // 实际项目中可能需要根据关键词过滤部门
  if (!keyword) {
    await loadOfficeList();
  } else {
    officeList.value = officeList.value.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
};

// 处理用户搜索
const handleUserSearch = async (keyword: string) => {
  // 实际项目中可能需要根据关键词过滤用户
  if (!keyword) {
    await loadUserList();
  } else {
    userList.value = userList.value.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
};

// 处理查询
const handleQuery = async () => {
  try {
    const params = {
      officeId: officeId.value,
      userId: userId.value,
      startTime: dateRange.value[0],
      endTime: dateRange.value[1],
    };

    const res = await getSaleFunnelData(params);
    funnelData.value = res.data || [];

    // 提取图例数据
    legendData.value = funnelData.value.map(item => item.name);
  } catch (error) {
    message.error('获取销售漏斗数据失败');
    console.error('Failed to load sale funnel data:', error);
  }
};

// 图表配置
const chartOptions = ref<any>({
  tooltip: {
    trigger: 'item',
    formatter: function (params: any) {
      const { name, value, number, money, percentage } = params.data;
      return `销售漏斗<br/>${name}：${percentage}%<br/>数量：${number}<br/>预计收入：${money}`;
    },
  },
  legend: {
    bottom: '0%',
    align: 'center',
    data: legendData.value,
  },
  series: [
    {
      name: '漏斗图',
      type: 'funnel',
      left: '15%',
      top: 60,
      bottom: 60,
      width: '70%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        color: '#000',
        formatter: function (params: any) {
          const { name, percentage, number, money } = params.data;
          return `${name}：${percentage}%\n商机数量：${number}\n预计收入：${money}`;
        },
      },
      labelLine: {
        show: true,
        lineStyle: {
          color: '#000',
        },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
      },
      data: funnelData.value,
    },
  ],
});

// 初始化
onMounted(() => {
  loadOfficeList();
  loadUserList();
  handleQuery();
});
</script>

<style lang="less">
.funnel-content-wrapper {
  .search-container {
    margin-bottom: 16px;
  }

  .chart-container {
    height: 450px;
  }
}
</style>