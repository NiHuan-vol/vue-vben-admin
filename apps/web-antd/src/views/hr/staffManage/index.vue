<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2" v-if="hasPermission('productionLine:add')">
              <div class="btns" @click="addEmployee">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('productionLine:edit')">
              <div class="btns" @click="showModal">
                <a-icon class="btns-icon" type="edit" />
                <div class="btns-text">修改</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('productionLine:delete')">
              <div class="btns" @click="deleteTeam">
                <a-icon class="btns-icon" type="delete" />
                <div class="btns-text">删除</div>
              </div>
            </a-col>
            <a-col :span="2" v-if="hasPermission('productionLine:delete')">
              <div class="btns" @click="importDataFun">
                <a-icon class="btns-icon" type="import" />
                <div class="btns-text">导入</div>
              </div>
            </a-col>
            <a-col :span="3" v-if="hasPermission('productionLine:delete')">
              <div class="btns" @click="inviteToRegister">
                <a-icon class="btns-icon" type="import" />
                <div class="btns-text">邀请注册</div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <!-- user table列表 -->
      <div style="width:1000px">
        <a-table
          :columns="columns"
          :data-source="data"
          bordered
          :scroll="{ x: 0, y: 800 }"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedKeys, onChange: userSelection }"
          @change="onTableChange"
          style="height: calc(100vh - 12rem); margin-top: 2px; overflow-y: auto;"
        />
      </div>
    </div>
    <nly-content>
      <!-- modal员工编辑 弹窗  -->
      <a-modal
        v-model:visible="editModal"
        centered
        :title="editItem.id ? '编辑员工' : '新增员工'"
        width="600px"
      >
        <div id="components-form-demo-advanced-search">
          <a-form
            class="ant-advanced-search-form"
            :form="form"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            @submit.prevent="handleSubmit"
          >
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item label="员工工号">
                  <a-input
                    v-decorator="['empNo', { rules: [{ required: true, message: '员工工号不能为空' }] }]"
                    placeholder="请输入员工工号"
                    :disabled="isDisabled"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="员工名称">
                  <a-input
                    v-decorator="['empName', { rules: [{ required: true, message: '员工名称不能为空' }] }]"
                    placeholder="请输入员工名称"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="员工手机号">
                  <a-input
                    v-decorator="['userPhone', { rules: [{ required: true, message: '手机号不能为空' }] }]"
                    placeholder="请输入员工手机号"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item
                  label="*所属部门"
                  :validate-status="validateStatus"
                  :help="errorMsg"
                >
                  <a-input-search
                    :value="officeName"
                    placeholder="请选择所属部门"
                    @click="selectOffice"
                    @search="selectOffice"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="备注">
                  <a-textarea
                    placeholder="请输入备注"
                    :rows="5"
                    v-model="editItem.remarks"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <template #footer>
          <a-button
            type="primary"
            html-type="submit"
            @click="handleSubmit"
            v-if="hasPermission('productionLine:save')"
          >
            保存
          </a-button>
          <a-button :style="{ marginLeft: '8px' }" @click="hideModal">
            关闭
          </a-button>
        </template>
      </a-modal>
      <a-modal
        v-model:visible="officeModal"
        lg
        :footer="null"
        title="部门选择"
        size="sm"
        @cancel="hideOfficeModal"
      >
        <div style="height: 400px; overflow-y: scroll;">
          <a-input-search
            style="margin-bottom: 8px"
            placeholder="部门名称"
            @change="onChange"
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
        <a-row>
          <a-col :span="24" :style="{ textAlign: 'right' }
            <a-button type="primary" html-type="submit" @click="saveOffice">
              保存
            </a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="hideOfficeModal">
              关闭
            </a-button>
          </a-col>
        </a-row>
      </a-modal>
      <importAndExport ref="importRef" @syncFun="pageList" />
    </nly-content>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, defineComponent, computed } from 'vue';
import { Form, FormInstance, message, Modal } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '#/store/modules/user';
import { PageList, Save, DeleteById, inviteToRegister } from '@/api/hr/inductionManage';
import { PageList as PageOfficeList } from '@/api/office';
import importAndExport from '@/components/ImportAndExport/emploee';
import { FormInput, EditableCell } from '@/components/Form';

type Employee = {
  id?: string | number;
  empNo?: string;
  empName?: string;
  userPhone?: string;
  officeName?: string;
  officeId?: string | number;
  position?: string;
  entryDate?: string;
  education?: string;
  graduatedFrom?: string;
  remarks?: string;
  status?: number;
};

type Department = {
  id: string | number;
  parentId: string | number | null;
  officeName: string;
  key: string | number;
  title: string;
  children?: Department[];
};

const { t } = useI18n();
const userStore = useUserStore();
const form = Form.useForm()[0] as FormInstance;

// Props
const props = defineProps<{
  dataList?: Employee[];
}>();

// States
const isShow = ref('display:block');
const editModal = ref(false);
const isDisabled = ref(false);
const autoExpandParent = ref(true);
const expandedOfficeKeys = ref<string[] | number[]>([]);
const checkedOfficeKeys = ref<string[] | number[]>([]);
const selectedOfficeKeys = ref<string[] | number[]>([]);
const officeName = ref('');
const officeId = ref<string[] | number[]>([]);
const officeTreeData = ref<Department[]>([]);
const formLayout = ref('horizontal');
const expand = ref(false);
const postData = ref<{
  current: number;
  size: number;
}>({
  current: 1,
  size: 20,
});
const pagination = ref<{
  defaultPageSize: number;
  size: string;
  current: number;
  pageSize: number;
  total: number;
  showTotal: (total: number) => JSX.Element;
  showQuickJumper: boolean;
  showLessItems: boolean;
}>({
  defaultPageSize: 20,
  size: 'small',
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => (
    <div>
      共 {total} 条数据，每页
      <a-input-number
        value={pagination.value.pageSize}
        min={1}
        max={500}
        onPressEnter={(e) => changePageSize(e)}
      />
      条
    </div>
  ),
  showQuickJumper: true,
  showLessItems: true,
});
const numberReg = ref(/^[1-9]{1}[0-9]*$/);
const floatReg = ref(/^-?[0-9]*(\.[0-9]*)?$/);
const data = ref<Employee[]>([]);
const roleData = ref<any[]>([]);
const validateStatus = ref('success');
const errorMsg = ref<string | null>(null);
const show = ref(false);
const editItem = ref<Employee>({});
const TreeSortEditList = ref<Map<string | number, any>>(new Map());
const selectedKeys = ref<string[] | number[]>([]);
const selectedData = ref<Employee[]>([]);
const isRoleTableShow = ref(true);
const officeModal = ref(false);
const keyMap = ref<Map<string | number, string>>(new Map());

// Columns
const columns = ref<{
  align: string;
  title: string;
  dataIndex: string;
  width: string;
  customRender?: (text: any, row: Employee, index: number) => JSX.Element;
}[]>([
  {
    align: 'left',
    title: '员工编码',
    dataIndex: 'empNo',
    width: '40',
  },
  {
    align: 'left',
    title: '员工名称',
    dataIndex: 'empName',
    width: '80',
  },
  {
    align: 'left',
    title: '手机号',
    dataIndex: 'userPhone',
    width: '80',
  },
  {
    align: 'left',
    title: '所属部门',
    dataIndex: 'officeName',
    width: '80',
  },
  {
    align: 'left',
    title: '职位',
    dataIndex: 'position',
    width: '80',
  },
  {
    align: 'left',
    title: '入职时间',
    dataIndex: 'entryDate',
    width: '80',
  },
  {
    align: 'left',
    title: '最高学历',
    dataIndex: 'education',
    width: '80',
  },
  {
    align: 'left',
    title: '毕业院校',
    dataIndex: 'graduatedFrom',
    width: '180',
  },
  {
    align: 'left',
    title: '备注',
    dataIndex: 'remarks',
    width: '100',
  },
  {
    align: 'left',
    title: '状态',
    dataIndex: 'status',
    width: '40',
    customRender: (text) => {
      return text === 2 ? (
        <nly-badge bg-variant="danger">离职</nly-badge>
      ) : (
        <nly-badge bg-variant="success">在职</nly-badge>
      );
    },
  },
]);

// 检查权限
const hasPermission = (permission: string) => {
  return userStore.getPermissions.includes(permission);
};

// 部门数组转树形结构
const listToTree = (list: Department[], tree: Department[], parentId: string | number | null) => {
  list.forEach((item) => {
    if (item.parentId === parentId) {
      const child = {
        ...item,
        key: item.id,
        title: item.officeName,
        children: [],
      } as Department;
      listToTree(list, child.children, item.id);
      if (child.children.length <= 0) {
        delete child.children;
      }
      tree.push(child);
    }
  });
};

// 获取父级key
const getParentKey = (key: string | number, tree: Department[]) => {
  let parentKey: string | number | undefined;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

// 获取员工列表
const pageList = () => {
  const { current, size } = postData.value;
  PageList({ current, size })
    .then((response) => {
      if (response.code === 200) {
        const { data: resData } = response;
        const { records, total } = resData;
        data.value = records;
        pagination.value.total = total;
      }
    })
    .catch((error) => {
      console.error('获取员工列表失败:', error);
    });
};

// 获取部门树数据
const getOfficeTreeData = () => {
  PageOfficeList({})
    .then((response) => {
      if (response.code === 200) {
        const list = response.data.records || [];
        const treeData: Department[] = [];
        listToTree(list, treeData, null);
        officeTreeData.value = treeData;

        // 构建keyMap
        list.forEach((item) => {
          keyMap.value.set(item.id, item.officeName);
        });
      }
    })
    .catch((error) => {
      console.error('获取部门树数据失败:', error);
    });
};

// 改变页码大小
const changePageSize = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value;
  if (value) {
    postData.value.size = Number.parseInt(value);
    pagination.value.pageSize = Number.parseInt(value);
    pageList();
  }
};

// 用户选择
const userSelection = (keys: string[] | number[], info: Employee[]) => {
  selectedKeys.value = keys;
  selectedData.value = info;
};

// 隐藏弹窗
const hideModal = () => {
  editModal.value = false;
};

// 隐藏部门弹窗
const hideOfficeModal = () => {
  officeModal.value = false;
};

// 选择部门保存
const saveOffice = () => {
  officeModal.value = false;
  officeId.value = selectedOfficeKeys.value;
  if (officeId.value.length > 0) {
    officeName.value = keyMap.value.get(officeId.value[0]) || '';
    validateStatus.value = 'success';
    errorMsg.value = null;
  }
};

// 新增员工
const addEmployee = () => {
  editItem.value = {};
  editModal.value = true;
  officeId.value = [];
  officeName.value = '';
  form.resetFields();
};

// 编辑员工
const showModal = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }
  const editItemData = selectedData.value[0];
  editItem.value = { ...editItemData };
  officeId.value = [editItemData.officeId || ''];
  officeName.value = editItemData.officeName || '';

  form.setFieldsValue({
    empNo: editItemData.empNo,
    empName: editItemData.empName,
    userPhone: editItemData.userPhone,
  });

  editModal.value = true;
};

// 表格变化
const onTableChange = (pagination: any) => {
  postData.value.current = pagination.current;
  postData.value.size = pagination.pageSize;
  pagination.value.current = pagination.current;
  pagination.value.pageSize = pagination.pageSize;
  pageList();
};

// 处理提交
const handleSubmit = () => {
  form.validateFields()
    .then((values) => {
      const { empNo, empName, userPhone } = values;
      const submitData = {
        ...editItem.value,
        empNo,
        empName,
        userPhone,
        officeName: officeName.value,
        officeId: officeId.value[0],
      };

      if (!officeName.value || officeId.value.length < 1) {
        validateStatus.value = 'error';
        errorMsg.value = '部门不能为空';
        return;
      }

      Save(submitData)
        .then((response) => {
          if (response.code === 200) {
            message.success('保存成功');
            selectedKeys.value = [];
            selectedData.value = [];
            pageList();
            hideModal();
          } else {
            message.error('保存失败');
          }
        })
        .catch((error) => {
          console.error('保存员工失败:', error);
          message.error('保存失败');
        });
    })
    .catch((error) => {
      console.error('表单验证失败:', error);
    });
};

// 删除员工
const deleteTeam = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }

  Modal.confirm({
    title: '确认',
    content: <span>您确定要{<span style={{ color: 'red' }}>删除</span>}该记录吗？</span>,
    onOk: () => {
      const id = selectedData.value[0].id;
      DeleteById({ id })
        .then((response) => {
          if (response.code === 200) {
            message.success('删除成功');
            pageList();
            selectedKeys.value = [];
            selectedData.value = [];
          } else {
            message.error('删除失败');
          }
        })
        .catch((error) => {
          console.error('删除员工失败:', error);
          message.error('删除失败');
        });
    },
  });
};

// 导入数据
const importDataFun = () => {
  // 实现导入逻辑
};

// 邀请注册
const inviteToRegisterFun = () => {
  if (selectedKeys.value.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }

  const id = selectedData.value[0].id;
  inviteToRegister({ id })
    .then((response) => {
      if (response.code === 200) {
        message.success('邀请成功');
      } else {
        message.error('邀请失败');
      }
    })
    .catch((error) => {
      console.error('邀请注册失败:', error);
      message.error('邀请失败');
    });
};

// 选择部门
const selectOffice = () => {
  officeModal.value = true;
};

// 部门展开
const onOfficeExpand = (expandedKeys: string[] | number[]) => {
  expandedOfficeKeys.value = expandedKeys;
};

// 部门选择
const onOfficeSelect = (selectedKeys: string[] | number[]) => {
  selectedOfficeKeys.value = selectedKeys;
};

// 部门搜索
const onChange = (e: Event) => {
  // 实现搜索逻辑
};

// 组件挂载时
onMounted(() => {
  pageList();
  getOfficeTreeData();
});

// 导出组件
defineComponent({
  components: {
    FormInput,
    EditableCell,
    importAndExport,
  },
});
</script>

<style lang="less" scoped>
.content-wrapper {
  .btn-wrapper {
    margin-bottom: 16px;
    .btns {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
      cursor: pointer;
      .btns-icon {
        font-size: 20px;
        margin-bottom: 4px;
      }
      .btns-text {
        font-size: 12px;
      }
    }
  }
  .c-large-table {
    position: relative;
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 4px 10px;
    }
  }
}
</style>