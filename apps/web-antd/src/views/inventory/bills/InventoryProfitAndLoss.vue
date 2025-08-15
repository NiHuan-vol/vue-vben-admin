<template>
  <div class="content-wrapper a-base-container">
    <div class="requisition-set-wrapper">
      <!-- 按钮区域 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div
                class="btns"
                @click="searchList('list')"
                v-if="showModel === 'order'"
              >
                <Icon class="btns-icon" icon="unordered-list" />
                <div class="btns-text">列表</div>
              </div>
              <div
                class="btns"
                @click="switchList('order')"
                v-else
              >
                <Icon class="btns-icon" icon="container" />
                <div class="btns-text">单据</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="newProcess">
                <Icon class="btns-icon" icon="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>

            <a-col
              :class="editMask ? 'btns-disable' : ''"
              :xs="btnGrid.xs"
              :sm="btnGrid.sm"
              :md="btnGrid.md"
              :lg="btnGrid.lg"
              :xl="btnGrid.xl"
            >
              <div
                class="btns"
                @click="editMask ? '' : submit()"
              >
                <Icon class="btns-icon" icon="save" />
                <div class="btns-text">保存</div>
              </div>
            </a-col>

            <a-col
              :class="editMask && voucherState !== 1 ? '' : 'btns-disable'"
              :xs="btnGrid.xs"
              :sm="btnGrid.sm"
              :md="btnGrid.md"
              :lg="btnGrid.lg"
              :xl="btnGrid.xl"
            >
              <div
                class="btns"
                @click="editMask && voucherState !== 1 ? editClick() : ''"
              >
                <Icon class="btns-icon" icon="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="removeData">
                <Icon class="btns-icon" icon="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>

            <a-col
              :class="orderId && voucherState === 2 ? '' : 'btns-disable'"
              v-if="hasPermission('InventoryProfitAndLoss:ratify')"
              :xs="btnGrid.xs"
              :sm="btnGrid.sm"
              :md="btnGrid.md"
              :lg="btnGrid.lg"
              :xl="btnGrid.xl"
            >
              <div
                class="btns"
                @click="orderId && voucherState === 2 ? thirdExamineApi(3) : ''"
              >
                <Icon class="btns-icon" icon="audit" />
                <div class="btns-text">批准</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="exportData">
                <Icon class="btns-icon" icon="export" />
                <div class="btns-text">导出</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="printData">
                <Icon class="btns-icon" icon="printer" />
                <div class="btns-text">打印</div>
              </div>
            </a-col>
          </a-col>

          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="getList(3)">)
                <Icon class="btns-icon" icon="vertical-right" />
                <div class="btns-text">首张</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="getList(1)">)
                <Icon class="btns-icon" icon="left" />
                <div class="btns-text">上张</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="getList(2)">)
                <Icon class="btns-icon" icon="right" />
                <div class="btns-text">下张</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="getList(4)">)
                <Icon class="btns-icon" icon="vertical-left" />
                <div class="btns-text">末张</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="handleAdd">
                <Icon class="btns-icon" icon="plus" />
                <div class="btns-text">新增行</div>
              </div>
            </a-col>

            <a-col :xs="btnGrid.xs" :sm="btnGrid.sm" :md="btnGrid.md" :lg="btnGrid.lg" :xl="btnGrid.xl">
              <div class="btns" @click="syncOrder">
                <Icon class="btns-icon" icon="file-sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>

      <!-- 文档内容 -->
      <div
        ref="print"
        class="credentials-bom-wrapper"
        id="documents-wrapper"
      >
        <h3 class="text-center">
          <span class="text-name">{{ voucherTitle }}</span><br />
        </h3>

        <a-row v-show="showModel === 'order'">
          <a-col :span="24">
            <div>
              <span
                class="audit-status"
                v-show="voucherState === 1"
              >已复核</span
              >
              <span
                class="audit-status"
                v-show="voucherState === 2"
              >已监盘</span
              >
              <span
                class="audit-status"
                v-show="voucherState === 3"
              >已批准</span
              >
            </div>

            <Form :layout="formLayout">
              <div class="header-box" style="position: relative">
                <!-- 遮罩层 -->
                <div class="edit-mask-route" v-show="editMask"></div>

                <a-row class="order-dynamic-form-wrapper">
                  <a-col
                    :xs="grid.xs"
                    :sm="grid.sm"
                    :md="grid.md"
                    :lg="grid.lg"
                    :xl="grid.xl"
                    :xxl="grid.xxl"
                  >
                    <Form.Item
                      :label-col="labelCol"
                      :wrapper-col="wrapperCol"
                      label="盘点方式"
                      :rules="[{ required: true, trigger: 'input' }]"
                    >
                      <Select v-model:value="dataJson.checkWay">
                        <Option value="1">全盘</Option>
                        <Option value="2">抽盘</Option>
                      </Select>
                    </Form.Item>
                  </a-col>

                  <a-col
                    :xs="grid.xs"
                    :sm="grid.sm"
                    :md="grid.md"
                    :lg="grid.lg"
                    :xl="grid.xl"
                    :xxl="grid.xxl"
                  >
                    <Form.Item
                      :label-col="labelCol"
                      :wrapper-col="wrapperCol"
                      label="仓库"
                      :rules="[{ required: true, trigger: 'input' }]"
                    >
                      <Input
                        v-model:value="dataJson.warehouseName"
                        @click="searchGroup('warehouseRef')"
                        :style="styleOffice"
                      />
                      <SearchGroupHeader
                        ref="warehouseRef"
                        :inputValue="dataJson.warehouseName"
                        componentName="warehouse"
                        @clickItem="searchBackData"
                      />
                    </Form.Item>
                  </a-col>

                  <a-col
                    :xs="grid.xs"
                    :sm="grid.sm"
                    :md="grid.md"
                    :lg="grid.lg"
                    :xl="grid.xl"
                    :xxl="grid.xxl"
                  >
                    <Form.Item
                      :label-col="labelCol"
                      :wrapper-col="wrapperCol"
                      label="盘点日期"
                      :rules="[{ required: true, trigger: 'input' }]"
                    >
                      <DatePicker
                        v-model:value="dataJson.checkDate"
                        style="width: 100%"
                      />
                    </Form.Item>
                  </a-col>
                </a-row>
              </div>

              <!-- 表格区域 -->
              <div class="table-box">
                <BasicTable
                  id="profitLoss_tb"
                  :columns="columns"
                  :dataSource="dataSource"
                  :scroll="{ x: 1200, y: 400 }"
                  :pagination="false"
                  bordered
                >
                  <template #expandedRowRender="{ record }">
                    <div style="padding: 16px">
                      <p>扩展信息: {{ record.remark }}</p>
                    </div>
                  </template>
                </BasicTable>
              </div>
            </Form>
          </a-col>
        </a-row>

        <!-- 列表视图 -->
        <div v-show="showModel === 'list'">
          <BasicTable
            id="profitLoss_list_tb"
            :columns="listColumns"
            :dataSource="listDataSource"
            :scroll="{ x: 1200 }"
            bordered
            @row-click="handleRowClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { Button, Form, Select, Input, DatePicker, message } from 'ant-design-vue';
import { BasicTable } from '@/components/Table';
import { Icon } from '@/components/Icon';
import { usePermission } from '@/hooks/web/usePermission';
import { saveInventoryProfitLoss, getInventoryProfitLossDetail, deleteInventoryProfitLoss, getCodeApi, pageApi, auditInventoryProfitLoss, exportInventoryProfitLoss } from '@/api/inventory/bills';

// 组件引入
const SearchGroupHeader = defineAsyncComponent(() => import('@/components/SearchGroupHeader/index.vue'));

// 权限检查
const { hasPermission } = usePermission();

// 状态管理
const showModel = ref('order'); // 'order' 表示单据视图，'list' 表示列表视图
const editMask = ref(false);
const voucherState = ref(-1); // -1: 草稿, 1: 已复核, 2: 已监盘, 3: 已批准
const orderId = ref('');
const voucherTitle = ref('盘存盈亏表');
const formLayout = ref('horizontal');
const dataJson = ref<any>({
  checkWay: '1',
  warehouseName: '',
  warehouseId: '',
  checkDate: new Date(),
});
const dataSource = ref<any[]>([]);
const listDataSource = ref<any[]>([]);
const loading = ref(false);

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', width: 50, customRender: ({ index }) => index + 1 },
  { title: '物料编码', dataIndex: 'materialCode' },
  { title: '物料名称', dataIndex: 'materialName' },
  { title: '规格', dataIndex: 'specification' },
  { title: '单位', dataIndex: 'unit' },
  { title: '系统数量', dataIndex: 'systemQuantity', editable: false },
  { 
    title: '实盘数量', 
    dataIndex: 'actualQuantity', 
    editable: true, 
    customRender: ({ record }) => (
      <Input
        value={record.actualQuantity}
        onChange={(e) => onCellChange(record, 'actualQuantity', Number(e.target.value))}
      />
    )
  },
  { title: '差异数量', dataIndex: 'diffQuantity', editable: false },
  { title: '成本价', dataIndex: 'costPrice', editable: false },
  { title: '差异金额', dataIndex: 'diffAmount', editable: false },
  { 
    title: '盈亏原因', 
    dataIndex: 'reason', 
    editable: true, 
    customRender: ({ record }) => (
      <Input
        value={record.reason}
        onChange={(e) => onCellChange(record, 'reason', e.target.value)}
      />
    )
  },
  { 
    title: '操作', 
    width: 80, 
    customRender: ({ record }) => (
      <div>
        <Icon
          icon="delete"
          onClick={() => handleDelete(record.id)}
          style={{ color: '#ff4d4f', cursor: 'pointer', marginRight: 8 }}
        />
      </div>
    )
  },
];

// 新增行
const handleAdd = () => {
  const newRow = {
    id: Date.now().toString(),
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '',
    systemQuantity: 0,
    actualQuantity: 0,
    diffQuantity: 0,
    costPrice: 0,
    diffAmount: 0,
    reason: '',
  };

  dataSource.value = [...dataSource.value, newRow];
};

// 删除行
const handleDelete = (id: string) => {
  dataSource.value = dataSource.value.filter(item => item.id !== id);
};

// 列表视图列配置
const listColumns = [
  { title: '序号', dataIndex: 'index', width: 50, customRender: ({ index }) => index + 1 },
  { title: '单据编号', dataIndex: 'code' },
  { title: '盘点日期', dataIndex: 'checkDate' },
  { title: '仓库', dataIndex: 'warehouseName' },
  { title: '盘点方式', dataIndex: 'checkWay', customRender: ({ text }) => text === '1' ? '全盘' : '抽盘' },
  { title: '状态', dataIndex: 'state', customRender: ({ text }) => {
    if (text === -1) return '草稿';
    if (text === 1) return '已复核';
    if (text === 2) return '已监盘';
    if (text === 3) return '已批准';
    return '未知';
  }},
  { title: '制单人', dataIndex: 'creatorName' },
  { title: '创建时间', dataIndex: 'createTime' },
];

// 网格配置
const grid = ref({
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
});

const btnGrid = ref({
  xs: 24 / 4,
  sm: 24 / 4,
  md: 24 / 8,
  lg: 24 / 8,
  xl: 24 / 8,
});

// 表单标签和内容列配置
const labelCol = ref({ xs: { span: 8 }, sm: { span: 8 } });
const wrapperCol = ref({ xs: { span: 16 }, sm: { span: 16 } });

// 样式
const styleOffice = ref({ cursor: 'pointer' });

// 生命周期
onMounted(() => {
  initData();
  getListData();
});

// 初始化数据
const initData = () => {
  dataJson.value = {
    checkWay: '1',
    warehouseName: '',
    warehouseId: '',
    checkDate: new Date(),
    remark: '',
  };

  dataSource.value = [];
  voucherState.value = -1;
  orderId.value = '';
};

// 获取列表数据
const getListData = async () => {
  try {
    loading.value = true;
    // 实际项目中应调用API获取数据
    // 这里模拟数据
    listDataSource.value = [
      { id: '1', code: 'PD20230001', checkDate: '2023-05-10', warehouseName: '主仓库', checkWay: '1', state: 3, creatorName: '张三', createTime: '2023-05-10 10:30:00' },
      { id: '2', code: 'PD20230002', checkDate: '2023-05-15', warehouseName: '辅料仓库', checkWay: '2', state: 2, creatorName: '李四', createTime: '2023-05-15 14:20:00' },
    ];
  } catch (error) {
    message.error('获取列表数据失败');
  } finally {
    loading.value = false;
  }
};

// 切换到列表视图
const searchList = (mode: string) => {
  showModel.value = mode;
};

// 切换到单据视图
const switchList = (mode: string) => {
  showModel.value = mode;
};

// 新增单据
const newProcess = () => {
  initData();
  editMask.value = false;
  showModel.value = 'order';
  getCode();
};

// 获取单据编码
const getCode = async () => {
  try {
    const res = await getCodeApi();
    if (res.success) {
      dataJson.value.voucherCode = res.data;
    }
  } catch (error) {
    message.error('获取单据编码失败');
  }
};

// 处理单元格变更
const onCellChange = (record: any, field: string, value: any) => {
  const newDataSource = [...dataSource.value];
  const index = newDataSource.findIndex(item => item.id === record.id);

  if (index !== -1) {
    newDataSource[index][field] = value;

    // 当实盘数量变更时，计算差异数量和差异金额
    if (field === 'actualQuantity') {
      const systemQuantity = newDataSource[index].systemQuantity || 0;
      const costPrice = newDataSource[index].costPrice || 0;
      newDataSource[index].diffQuantity = value - systemQuantity;
      newDataSource[index].diffAmount = newDataSource[index].diffQuantity * costPrice;
    }

    dataSource.value = newDataSource;
  }
};

// 保存单据
const submit = async () => {
  if (loading.value) return;

  // 表单验证
  if (!dataJson.value.checkWay) {
    message.warning('请选择盘点方式');
    return;
  }

  if (!dataJson.value.warehouseId) {
    message.warning('请选择仓库');
    return;
  }

  if (!dataJson.value.checkDate) {
    message.warning('请选择盘点日期');
    return;
  }

  if (dataSource.value.length === 0) {
    message.warning('请添加盘点明细');
    return;
  }

  // 检查是否有重复物料
  const materialIds = new Set();
  for (const item of dataSource.value) {
    if (item.materialId) {
      if (materialIds.has(item.materialId)) {
        message.warning('存在重复物料，请检查');
        return;
      }
      materialIds.add(item.materialId);
    }
  }

  try {
    loading.value = true;
    const params = {
      id: orderId.value,
      checkWay: dataJson.value.checkWay,
      warehouseId: dataJson.value.warehouseId,
      checkDate: dataJson.value.checkDate,
      remark: dataJson.value.remark,
      details: dataSource.value,
    };

    const res = await saveInventoryProfitLoss(params);
    if (res.success) {
      message.success('保存成功');
      orderId.value = res.data.id;
      voucherState.value = -1;
      editMask.value = true;
    }
  } catch (error) {
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
};

// 编辑单据
const editClick = () => {
  editMask.value = false;
};

// 删除单据
const removeData = async () => {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    loading.value = true;
    const res = await deleteInventoryProfitLoss(orderId.value);
    if (res.success) {
      message.success('删除成功');
      initData();
    }
  } catch (error) {
    message.error('删除失败');
  } finally {
    loading.value = false;
  }
};

// 批准单据
const thirdExamineApi = async (status: number) => {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    loading.value = true;
    const params = {
      id: orderId.value,
      status: status
    };

    const res = await auditInventoryProfitLoss(params);
    if (res.success) {
      message.success('批准成功');
      voucherState.value = status;
    }
  } catch (error) {
    message.error('批准失败');
  } finally {
    loading.value = false;
  }
};

// 导出数据
const exportData = async () => {
  if (!orderId.value) {
    message.warning('请先选择单据');
    return;
  }

  try {
    loading.value = true;
    const params = {
      id: orderId.value,
      warehouseId: dataJson.value.warehouseId,
      checkDate: dataJson.value.checkDate
    };

    const res = await exportInventoryProfitLoss(params);
    if (res) {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `盘存盈亏表_${formatDate(new Date())}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('导出成功');
    }
  } catch (error) {
    message.error('导出失败');
  } finally {
    loading.value = false;
  }
};

// 打印数据
const printData = () => {
  message.info('打印功能待实现');
};

// 获取单据列表（首张/上张/下张/末张）
const getList = async (type: number) => {
  editMask.value = true;
  loading.value = true;

  try {
    const params = {
      actionType: type,
      currentId: orderId.value,
      isLossOrGain: true, // 是否是盈亏表
    };

    const res = await pageApi(params);
    if (res.success) {
      if (!res.data) {
        if (type === 1 || type === 3) {
          message.warning('已经是首页了');
        } else if (type === 2) {
          message.warning('已经是尾页了');
        } else if (type === 4) {
          // 新建
          newProcess();
        }
      } else {
        const { orderDetailList } = res.data;

        orderDetailList.forEach(item => {
          item.key = item.id;
        });

        dataJson.value = res.data;
        orderId.value = res.data.id;
        voucherState.value = res.data.voucherState; // 状态
        dataSource.value = orderDetailList;
      }
    }
  } catch (error) {
    message.error('获取单据失败');
  }

  loading.value = false;
};

// 刷新单据
const syncOrder = () => {
  if (orderId.value) {
    // 实际项目中应重新获取单据数据
    message.info('刷新成功');
  } else {
    message.warning('请先选择单据');
  }
};

// 搜索分组
const searchGroup = (refName: string) => {
  const ref = getCurrentInstance()?.refs[refName];
  if (ref) {
    // @ts-ignore
    ref.show();
  } else {
    message.warning('未找到搜索组件');
  }
};

// 搜索回调数据
const searchBackData = (data: any) => {
  if (data.componentName === 'warehouse') {
    dataJson.value.warehouseName = data.name;
    dataJson.value.warehouseId = data.id;
    // 获取仓库物料数据
    getInventoryByWarehouse(data.id);
  }
};

// 根据仓库获取物料
const getInventoryByWarehouse = async (warehouseId: string) => {
  try {
    loading.value = true;
    // 实际项目中应调用API获取仓库物料数据
    // 这里模拟数据
    dataSource.value = [
      { id: '1', materialCode: 'MAT001', materialName: '物料1', specification: '规格1', unit: '个', systemQuantity: 100, actualQuantity: 100, diffQuantity: 0, costPrice: 10, diffAmount: 0 },
      { id: '2', materialCode: 'MAT002', materialName: '物料2', specification: '规格2', unit: 'kg', systemQuantity: 50, actualQuantity: 48, diffQuantity: -2, costPrice: 20, diffAmount: -40 },
    ];
  } catch (error) {
    message.error('获取仓库物料数据失败');
  } finally {
    loading.value = false;
  }
};

// 列表行点击
const handleRowClick = (record: any) => {
  orderId.value = record.id;
  voucherState.value = record.state;
  // 实际项目中应根据id获取单据详情
  dataJson.value = {
    checkWay: record.checkWay,
    warehouseName: record.warehouseName,
    warehouseId: record.warehouseId,
    checkDate: record.checkDate,
  };
  showModel.value = 'order';
  editMask.value = true;
};
</script>

<style scoped lang="less">
@import '~@/style/purchase/voucher.less';

.btn-wrapper {
  margin-bottom: 10px;
}

.btns {
  display: inline-block;
  padding: 8px 16px;
  cursor: pointer;
  text-align: center;
}

.btns-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.btns-text {
  font-size: 12px;
}

.btns-disable {
  opacity: 0.5;
  cursor: not-allowed;
}

.credentials-bom-wrapper {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.table-box {
  margin-top: 16px;
}

.edit-mask-route {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.01);
  z-index: 10;
}

audit-status {
  display: inline-block;
  padding: 2px 8px;
  background-color: #52c41a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

.text-name {
  font-size: 18px;
  font-weight: bold;
}
</style>