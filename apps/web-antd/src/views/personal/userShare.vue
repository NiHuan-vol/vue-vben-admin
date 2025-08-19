<template>
  <div class="parent-content-wrapper">
    <Card title="分享管理">
      <!-- 分享信息区域 -->
      <div class="share-info-section mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">分享注册链接</h3>
          <Button type="primary" @click="showShare">生成分享</Button>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600">注册地址:</span>
            <div class="flex items-center gap-2">
              <Input :value="registerUrl" disabled style="width: 300px" />
              <Button type="text" @click="onCopy">复制</Button>
            </div>
          </div>
          <div class="flex items-center gap-4 mb-3">
            <span class="text-gray-600">分享标题:</span>
            <span>{{ shareTitle }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">分享描述:</span>
            <span>{{ shareRemark }}</span>
          </div>
        </div>
      </div>

      <!-- 分享统计区域 -->
      <div class="share-statistics mb-6">
        <h3 class="text-lg font-semibold mb-4">分享统计</h3>
        <Row :gutter="[16, 16]">
          <Col span="6">
            <Card bordered :body-style="{ padding: '16px' }">
              <div class="flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-primary mb-1">{{ totalTeamMembers }}</span>
                <span class="text-gray-600">团队成员</span>
              </div>
            </Card>
          </Col>
          <Col span="6">
            <Card bordered :body-style="{ padding: '16px' }">
              <div class="flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-primary mb-1">{{ totalCustomers }}</span>
                <span class="text-gray-600">客户数量</span>
              </div>
            </Card>
          </Col>
          <Col span="6">
            <Card bordered :body-style="{ padding: '16px' }">
              <div class="flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-primary mb-1">{{ formatMoney(totalReward) }}</span>
                <span class="text-gray-600">累计收益</span>
              </div>
            </Card>
          </Col>
          <Col span="6">
            <Card bordered :body-style="{ padding: '16px' }">
              <div class="flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-primary mb-1">{{ maxReward }}%</span>
                <span class="text-gray-600">最大奖励比例</span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <!-- 标签页区域 -->
      <Tabs v-model:activeKey="tabKey" @change="handleTabChange" type="card">
        <TabPane key="1" tab="分享设置">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="mb-4">
              <h4 class="font-semibold mb-2">推广奖励</h4>
              <p class="text-gray-600 mb-2">推广奖励方式: {{ method }}</p>
              <div v-if="commissionConfig.length > 0" class="reward">
                <div class="flex items-center mb-2">
                  <span class="reward-label">一级奖励:</span>
                  <span>{{ (commissionConfig.firstReward * 100).toFixed(0) }}%</span>
                </div>
                <div class="flex items-center mb-2">
                  <span class="reward-label">二级奖励:</span>
                  <span>{{ (commissionConfig.secondReward * 100).toFixed(0) }}%</span>
                </div>
                <div class="flex items-center mb-2">
                  <span class="reward-label">三级奖励:</span>
                  <span>{{ (commissionConfig.thirdReward * 100).toFixed(0) }}%</span>
                </div>
                <div class="flex items-center">
                  <span class="reward-label">四级奖励:</span>
                  <span>{{ (commissionConfig.fourthReward * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-2">佣金规则</h4>
              <p class="text-gray-600">{{ rule }}</p>
            </div>
          </div>
        </TabPane>
        <TabPane key="2" tab="我的团队">
          <BasicTable
            :columns="columns"
            :dataSource="teamData"
            :pagination="pagination"
            @change="handleTableChange"
            :expandable="{ expandedRowKeys, onExpand }"
            rowKey="id"
          />
        </TabPane>
        <TabPane key="3" tab="我的客户">
          <BasicTable
            :columns="crmColumns"
            :dataSource="customerData"
            :pagination="paginationCrm"
            @change="handleCustomerTableChange"
            rowKey="id"
          />
        </TabPane>
      </Tabs>
    </Card>

    <!-- 分享弹窗 -->
    <Modal v-model:visible="shareVisible" title="分享注册链接" width={600} @ok="shareVisible = false">
      <div class="flex flex-col items-center p-4">
        <div class="mb-4" ref="qrCodeContainer"></div>
        <div class="flex items-center gap-2 mb-4">
          <Input :value="registerUrl" disabled style={{ width: '300px' }} />
          <Button type="text" @click="onCopy">复制</Button>
        </div>
        <Button type="primary" @click="downloadQrCode">下载二维码</Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onActivated, computed } from 'vue';
import { Card, Tabs, TabPane, Button, Input, Row, Col, Modal } from 'ant-design-vue';
import { BasicTable } from '/@/components/Table';
import { getShareInfo, getShareUserList, getShareCrmList, getCommissionConfig, getUserInfo } from '/@/api/personal';
import { useMessage } from '/@/hooks/web/useMessage';
import QRCode from 'qrcode';

// 表格列配置
const columns = [
  {
    title: '用户信息',
    dataIndex: 'dictLabel',
    key: 'dictLabel',
    width: 200,
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180,
  },
  {
    title: '累计收益',
    dataIndex: 'totalReward',
    key: 'totalReward',
    width: 120,
    customRender: ({ text }) => `${text}元`,
  },
  {
    title: '最后登录时间',
    dataIndex: 'loginDate',
    key: 'loginDate',
    width: 120,
  },
  {
    title: '注册时间',
    dataIndex: 'registDate',
    key: 'registDate',
    width: 120,
  },
];

const crmColumns = [
  {
    title: '客户名称',
    dataIndex: 'companyName',
    key: 'companyName',
    width: 180,
  },
  {
    title: '联系人',
    dataIndex: 'realName',
    key: 'realName',
    width: 100,
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
  },
  {
    title: '成交金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    customRender: ({ text }) => `${text}元`,
  },
  {
    title: '成交时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
];

// 响应式数据
const tabKey = ref('1');
const registerUrl = ref('');
const shareTitle = ref('');
const shareRemark = ref('');
const method = ref('');
const rule = ref('');
const commissionConfig = ref<any>({});
const maxReward = ref(0);
const teamData = ref<any[]>([]);
const customerData = ref<any[]>([]);
const shareVisible = ref(false);
const userInfo = ref<any>({});
const totalTeamMembers = ref(0);
const totalCustomers = ref(0);
const totalReward = ref(0);
const haveExpandSet = ref<Set<string>>(new Set());
const dataKeySet = ref<Set<string>>(new Set());
const expandedRowKeys = ref<string[]>([]);
const message = useMessage();

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

const paginationCrm = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

// 查询参数
const postData = reactive({
  current: 1,
  size: 20,
  isReward: 1,
  companyName: '',
  realName: '',
});

// 格式化金额
const formatMoney = (value: number) => {
  return value.toFixed(2);
};

// 复制链接
const onCopy = () => {
  navigator.clipboard.writeText(registerUrl.value)
    .then(() => {
      message.success('复制成功！');
    })
    .catch(() => {
      message.error('复制失败！');
    });
};

// 生成二维码
const generateQrCode = () => {
  const container = document.querySelector('.qrCodeContainer');
  if (container) {
    container.innerHTML = '';
    QRCode.toCanvas(container, registerUrl.value, {
      width: 150,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }
};

// 下载二维码
const downloadQrCode = () => {
  const canvas = document.querySelector('.qrCodeContainer canvas') as HTMLCanvasElement;
  if (canvas) {
    const link = document.createElement('a');
    link.download = '推广二维码.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};

// 标签页切换
const handleTabChange = (key: string) => {
  tabKey.value = key;
  if (key === '2') {
    fetchTeamData();
  } else if (key === '3') {
    fetchCustomerData();
  }
};

// 展开行处理
const onExpand = (expanded: boolean, record: any) => {
  if (!expanded || haveExpandSet.value.has(record.id)) return;

  const params = {
    current: 1,
    size: -1,
    shareUserId: record.id,
  };

  getShareUserList(params)
    .then((response) => {
      if (response.code === 200) {
        const { data } = response;
        const { records } = data;

        records.forEach((item: any) => {
          if (!dataKeySet.value.has(item.id)) {
            if (!item.treeLeaf) {
              item.children = [];
            }
            record.children = [...(record.children || []), item];
            dataKeySet.value.add(item.id);
          }
        });

        teamData.value = [...teamData.value];
        haveExpandSet.value.add(record.id);

        if (expanded) {
          expandedRowKeys.value = [...expandedRowKeys.value, record.id];
        } else {
          expandedRowKeys.value = expandedRowKeys.value.filter((key) => key !== record.id);
        }
      }
    })
    .catch((error) => {
      console.error('获取子级数据失败:', error);
    });
};

// 获取团队数据
const fetchTeamData = () => {
  getShareUserList(postData)
    .then((response) => {
      if (response.code === 200) {
        const { data } = response;
        const { records, total } = data;

        // 构建树形结构
        const treeData = [];
        records.forEach((item: any) => {
          if (item.parentId === 0) {
            treeData.push({ ...item, children: [] });
          }
        });

        teamData.value = treeData;
        pagination.total = total;
        totalTeamMembers.value = total;
      }
    })
    .catch((error) => {
      console.error('获取团队数据失败:', error);
    });
};

// 获取客户数据
const fetchCustomerData = () => {
  getShareCrmList(postData)
    .then((response) => {
      if (response.code === 200) {
        const { data } = response;
        const { records, total } = data;

        customerData.value = records;
        paginationCrm.total = total;
        totalCustomers.value = total;
      }
    })
    .catch((error) => {
      console.error('获取客户数据失败:', error);
    });
};

// 团队表格分页变化
const handleTableChange = (pagination: any) => {
  Object.assign(postData, {
    current: pagination.current,
    size: pagination.pageSize,
  });
  Object.assign(pagination, {
    current: pagination.current,
    pageSize: pagination.pageSize,
  });
  fetchTeamData();
};

// 客户表格分页变化
const handleCustomerTableChange = (pagination: any) => {
  Object.assign(postData, {
    current: pagination.current,
    size: pagination.pageSize,
  });
  Object.assign(paginationCrm, {
    current: pagination.current,
    pageSize: pagination.pageSize,
  });
  fetchCustomerData();
};

// 显示分享弹窗
const showShare = () => {
  shareVisible.value = true;
  setTimeout(() => {
    generateQrCode();
  }, 100);
};

// 生命周期钩子
onMounted(() => {
  // 获取分享信息
  getShareInfo()
    .then((response) => {
      if (response.code === 200) {
        registerUrl.value = response.data.registerUrl;
        shareTitle.value = response.data.title;
        shareRemark.value = response.data.shareRemark;
        method.value = response.data.extensionMethod;
        rule.value = response.data.commissionRules;
      }
    })
    .catch((error) => {
      console.error('获取分享信息失败:', error);
    });

  // 获取佣金配置
  getCommissionConfig()
    .then((response) => {
      commissionConfig.value = response.data;
      const { firstReward, secondReward, thirdReward, fourthReward } = response.data;
      maxReward.value = Math.round(100 * (firstReward + secondReward + thirdReward + fourthReward));
    })
    .catch((error) => {
      console.error('获取佣金配置失败:', error);
    });

  // 获取用户信息
  getUserInfo()
    .then((response) => {
      if (response.code === 200) {
        userInfo.value = response.data;
      }
    })
    .catch((error) => {
      console.error('获取用户信息失败:', error);
    });

  fetchTeamData();
});

onActivated(() => {
  fetchTeamData();
  getCommissionConfig()
    .then((response) => {
      commissionConfig.value = response.data;
      const { firstReward, secondReward, thirdReward, fourthReward } = response.data;
      maxReward.value = Math.round(100 * (firstReward + secondReward + thirdReward + fourthReward));
    })
    .catch((error) => {
      console.error('获取佣金配置失败:', error);
    });
  getUserInfo()
    .then((response) => {
      if (response.code === 200) {
        userInfo.value = response.data;
      }
    })
    .catch((error) => {
      console.error('获取用户信息失败:', error);
    });
});
</script>

<style lang="less" scoped>
.parent-content-wrapper {
  .share-info-section {
    margin-bottom: 24px;
  }

  .share-statistics {
    margin-bottom: 24px;
  }

  .reward {
    .reward-label {
      display: inline-block;
      margin-left: 50px;
      font-weight: 700;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  .qrCodeContainer {
    width: 150px;
    height: 150px;
    margin: 0 auto 20px;
  }
}
</style>