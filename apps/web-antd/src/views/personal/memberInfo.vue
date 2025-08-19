<!--
 * @Descripttion: 个人中心 - 会员信息
 * @version: V1.0
 * @Author: System
 * @Date: 2023-01-01 00:00:00
-->
<template>
  <div class="personal-member-info-container">
    <Card :title="'会员信息管理'" class="mb-4">
      <!-- 标签页 -->
      <a-tabs v-model:activeKey="tabKey" @change="handleTabChange" size="large">
        <a-tab-pane key="3" tab="我的客户" />
        <a-tab-pane key="2" tab="推客" />
        <a-tab-pane key="4" tab="推客关系图" />
      </a-tabs>

      <!-- 内容区域 -->
      <div class="mt-4">
        <!-- 我的客户 -->
        <div v-if="tabKey === '3'">
          <ProForm
            :schema="crmSearchSchema"
            layout="inline"
            :submitButtonProps="{ hidden: true }"
            @valuesChange="handleCrmSearch"
          />
          <BasicTable @register="registerCrmTable" class="mt-4" />        
        </div>

        <!-- 推客 -->
        <div v-else-if="tabKey === '2'">
          <ProForm
            :schema="shareUserSearchSchema"
            layout="inline"
            :submitButtonProps="{ hidden: true }"
            @valuesChange="handleShareUserSearch"
          />
          <BasicTable
            @register="registerShareUserTable"
            class="mt-4"
            :columns="shareUserColumns"
            :expandable="{ expandedRowKeys, onExpand }"
          >
            <template #leave="{ record }">{{ record.shareUserIds?.split(',').length || '' }}</template>
          </BasicTable>
        </div>

        <!-- 推客关系图 -->
        <div v-else-if="tabKey === '4'" class="h-[600px]">
          <OrganizationChart
            :datasource="shareAllData"
            :toggleSiblingsResp="true"
            :pan="true"
            :zoom="true"
            @node-click="handleOrgClick"
          />
        </div>
      </div>
    </Card>

    <!-- 二维码弹窗 -->
    <Modal v-model:visible="qrCodeVisible" title="推广二维码" @cancel="handleCancelQrCode">
      <div class="qrcode-container" ref="qrCodeRef"></div>
      <template #footer>
        <a-button @click="handleCancelQrCode">关闭</a-button>
        <a-button type="primary" @click="handleDownloadQrCode">下载二维码</a-button>
      </template>
    </Modal>

    <!-- 加载中 -->
    <Loading v-if="loading" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { Card, Modal, message } from 'ant-design-vue';
import { BasicTable, useTable, TableAction } from '@/components/Table';
import { ProForm, ProFormText, ProFormInput } from '@/components/ProForm';
import { Icon } from '/@/components/Icon';
import { useI18n } from 'vue-i18n';
import { useModal } from '/@/components/Modal';
import { Loading } from '/@/components/Loading';
import { shareInfo, shareUserList, shareCrmList, getShareUserAll } from '@/api/personal/userInfo';
import { usePermission } from '/@/hooks/web/usePermission';
import QRCode from 'qrcodejs2';
import { userPageListToTree } from '@/utils/tree';
import { copyText } from '@/utils/clipboard';
import OrganizationChart from 'vue-organization-chart';
import 'vue-organization-chart/dist/orgchart.css';

const { t } = useI18n();
const { hasPermission } = usePermission();
const { createModal } = useModal();
const instance = getCurrentInstance();

// 状态管理
const tabKey = ref<string>('3');
const loading = ref<boolean>(false);
const qrCodeVisible = ref<boolean>(false);
const registerUrl = ref<string>('');
const shareRegisterUrl = ref<string>('');
const method = ref<string>('');
const rule = ref<string>('');
const shareTitle = ref<string>('');
const shareRemark = ref<string>('');
const haveExpandSet = ref<Set<string>>(new Set());
const dataKeySet = ref<Set<string>>(new Set());
const expandedRowKeys = ref<string[]>([]);
const qrCodeRef = ref<HTMLElement | null>(null);

// 搜索参数
const crmSearchParams = ref<{ companyName: string }>({ companyName: '' });
const shareUserSearchParams = ref<{ realName: string }>({ realName: '' });

// 表格数据
const shareUserData = ref<any[]>([]);
const crmData = ref<any[]>([]);
const shareAllData = ref<any[]>([]);

// 客户搜索表单schema
const crmSearchSchema = [
  {
    field: 'companyName',
    component: 'Input',
    label: '客户名称',
    componentProps: {
      placeholder: '请输入客户名称',
    },
  },
];

// 推客搜索表单schema
const shareUserSearchSchema = [
  {
    field: 'realName',
    component: 'Input',
    label: '用户名称',
    componentProps: {
      placeholder: '请输入用户名称',
    },
  },
];

// 客户表格列配置
const crmColumns = [
  { title: '客户信息', dataIndex: 'companyName', key: 'companyName', width: 120 },
  { title: '联系人', dataIndex: 'createBy', key: 'createBy', width: 120 },
  { title: '联系电话', dataIndex: 'mobile', key: 'mobile', width: 120 },
  { title: '推客信息', dataIndex: 'shareUserName', key: 'shareUserName', width: 120 },
  { title: '实付金额', dataIndex: 'salePrice', key: 'salePrice', width: 120, customRender: ({ text }) => text ? `${text}元` : '' },
  { title: '交易次数', dataIndex: 'payCount', key: 'payCount', width: 120 },
  { title: '最后交易时间', dataIndex: 'payDate', key: 'payDate', width: 120 },
  { title: '最后登录时间', dataIndex: 'loginDate', key: 'loginDate', width: 120 },
  { title: '注册时间', dataIndex: 'registDate', key: 'registDate', width: 120 },
];

// 推客表格列配置
const shareUserColumns = [
  { title: '推客姓名', dataIndex: 'realName', key: 'realName', width: 120 },
  { title: '级次', dataIndex: 'shareUserId', key: 'shareUserId', width: 40, slot: 'leave' },
  { title: '上级', dataIndex: 'shareUserName', key: 'shareUserName', width: 120, customRender: ({ text }) => text || '总部' },
  { title: '手机号', dataIndex: 'mobile', key: 'mobile', width: 120 },
  { title: '推客等级', dataIndex: 'levelName', key: 'levelName', width: 120 },
  { title: '客户数量', dataIndex: 'crmCount', key: 'crmCount', width: 120 },
  { title: '总佣金', dataIndex: 'totalCommission', key: 'totalCommission', width: 120 },
  { title: '加入时间', dataIndex: 'createDate', key: 'createDate', width: 120 },
];

// 注册客户表格
const { registerCrmTable } = useTable({
  columns: crmColumns,
  dataSource: crmData,
  bordered: true,
  pagination: true,
  rowKey: 'id',
  // 配置分页
  pagination: {
    pageSize: 20,
    showTotal: (total) => `共 ${total} 条数据`,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  // 加载时的回调
  onLoad: handleLoadCrmData,
});

// 注册推客表格
const { registerShareUserTable } = useTable({
  columns: shareUserColumns,
  dataSource: shareUserData,
  bordered: true,
  pagination: true,
  rowKey: 'id',
  // 配置分页
  pagination: {
    pageSize: 20,
    showTotal: (total) => `共 ${total} 条数据`,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  // 加载时的回调
  onLoad: handleLoadShareUserData,
});

// 处理标签页切换
const handleTabChange = (key: string) => {
  tabKey.value = key;
  if (key === '2') {
    handleLoadShareUserData();
  } else if (key === '3') {
    handleLoadCrmData();
  } else if (key === '4') {
    handleLoadShareAllData();
  }
};

// 处理客户搜索
const handleCrmSearch = (values: any) => {
  crmSearchParams.value = values;
  handleLoadCrmData();
};

// 处理推客搜索
const handleShareUserSearch = (values: any) => {
  shareUserSearchParams.value = values;
  handleLoadShareUserData();
};

// 加载客户数据
const handleLoadCrmData = async () => {
  loading.value = true;
  try {
    const response = await shareCrmList({
      current: 1,
      size: 20,
      ...crmSearchParams.value,
    });
    if (response.code === 200) {
      const { records } = response.data;
      crmData.value = records;
    }
  } catch (error) {
    message.error('获取客户数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载推客数据
const handleLoadShareUserData = async () => {
  loading.value = true;
  try {
    const response = await shareUserList({
      current: 1,
      size: 20,
      ...shareUserSearchParams.value,
    });
    if (response.code === 200) {
      const { records } = response.data;
      const childrenNav: any[] = [];
      userPageListToTree(records, childrenNav, 0);
      haveExpandSet.value.clear();
      dataKeySet.value.clear();
      records.forEach(item => dataKeySet.value.add(item.id));
      shareUserData.value = childrenNav;
    }
  } catch (error) {
    message.error('获取推客数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载所有推客数据（用于关系图）
const handleLoadShareAllData = async () => {
  loading.value = true;
  try {
    const response = await getShareUserAll();
    if (response.code === 200) {
      const data = response.data;
      data.forEach((item: any) => {
        item.name = `${item.realName} (${item.crmCount})`;
        item.title = item.userName;
      });
      shareAllData.value = treeClass(data);
    }
  } catch (error) {
    message.error('获取推客关系数据失败');
  } finally {
    loading.value = false;
  }
};

// 树形结构处理
const treeClass = (data: any[]) => {
  if (!Array.isArray(data)) {
    console.error('树形data集合错误');
    return [];
  }
  const map = new Map<string, any>();
  data.forEach(item => map.set(item.id, item));
  data.forEach(item => {
    const parentItem = map.get(item.shareUserId);
    if (parentItem) {
      if (!parentItem.children) {
        parentItem.children = [item];
      } else {
        parentItem.children.push(item);
      }
    }
  });
  // 找到根节点
  return data.filter(item => !item.shareUserId || item.shareUserId === '0');
};

// 处理表格展开
const onExpand = (expanded: boolean, record: any) => {
  if (!expanded || haveExpandSet.value.has(record.id)) return;
  expandedRowKeys.value = [...expandedRowKeys.value, record.id];
  haveExpandSet.value.add(record.id);

  // 加载子节点数据
  shareUserList({
    current: 1,
    size: -1,
    shareUserId: record.id
  }).then(response => {
    if (response.code === 200) {
      const { records } = response.data;
      records.forEach((item: any) => {
        if (!dataKeySet.value.has(item.id)) {
          if (!item.treeLeaf) {
            item.children = [];
          }
          // 找到父节点并添加子节点
          const findAndAddChild = (data: any[], parentId: string, child: any) => {
            for (let i = 0; i < data.length; i++) {
              if (data[i].id === parentId) {
                if (!data[i].children) {
                  data[i].children = [];
                }
                data[i].children.push(child);
                return true;
              } else if (data[i].children && data[i].children.length > 0) {
                if (findAndAddChild(data[i].children, parentId, child)) {
                  return true;
                }
              }
            }
            return false;
          };
          findAndAddChild(shareUserData.value, record.id, item);
          dataKeySet.value.add(item.id);
        }
      });
      // 触发重新渲染
      shareUserData.value = [...shareUserData.value];
    }
  }).catch(error => {
    console.error('加载子节点数据失败', error);
  });
};

// 处理组织图节点点击
const handleOrgClick = (e: any) => {
  console.log('组织图节点点击', e);
};

// 生成二维码
const createQrCode = () => {
  if (!qrCodeRef.value) return;
  // 清空容器
  qrCodeRef.value.innerHTML = '';
  // 创建二维码
  new QRCode(qrCodeRef.value, {
    text: registerUrl.value,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
};

// 下载二维码
const handleDownloadQrCode = () => {
  if (!qrCodeRef.value) return;
  const canvas = qrCodeRef.value.querySelector('canvas');
  if (!canvas) return;

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = '推广二维码.png';
  a.click();
  message.success('下载成功');
};

// 显示二维码弹窗
const showQrCodeModal = () => {
  qrCodeVisible.value = true;
  // 延迟创建二维码，确保DOM已经渲染
  setTimeout(() => {
    createQrCode();
  }, 100);
};

// 关闭二维码弹窗
const handleCancelQrCode = () => {
  qrCodeVisible.value = false;
};

// 复制链接
const handleCopyLink = () => {
  copyText(registerUrl.value).then(() => {
    message.success('复制成功');
  }).catch(() => {
    message.error('复制失败');
  });
};

// 初始化
onMounted(() => {
  // 加载客户数据
  handleLoadCrmData();
  // 加载分享信息
  shareInfo().then(response => {
    if (response.code === 200) {
      registerUrl.value = response.data.registerUrl;
      shareTitle.value = response.data.title;
      shareRemark.value = response.data.shareRemark;
      shareRegisterUrl.value = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(registerUrl.value)}&title=${shareTitle.value}&summary=${shareRemark.value}&pics=http%3A%2F%2Fbbs.sibanyun.com%2Flogo.png&site=QQ%E5%88%86%E4%BA%AB&style=102&width=163&height=124&showcount=`;
      method.value = response.data.extensionMethod;
      rule.value = response.data.commissionRules;
    }
  });
});
</script>

<style lang="less" scoped>
.personal-member-info-container {
  padding: 16px;

  .mt-4 {
    margin-top: 16px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .qrcode-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
}
</style>