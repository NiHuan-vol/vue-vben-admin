<template>
  <div class="content-wrapper a-base-container">
    <BasicPageHeader :title="'物料清单分组管理'" :showBack="false" />

    <div class="big-main-wrapper warehouse-type-wrapper" style="margin: 2px 8px;">
      <div class="btn-wrapper clearfix mb-4">
        <Row class="text-center clearfix">
          <Col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <Row gutter={16}>
              <Col :span="2" v-if="hasPermission('bomClass:add')">
                <div class="btns" @click="handleAdd">
                  <Icon class="btns-icon" type="file-add" />
                  <div class="btns-text">新增</div>
                </div>
              </Col>
              <Col :span="2" v-if="hasPermission('bomClass:edit')">
                <div class="btns" @click="handleEdit">
                  <Icon class="btns-icon" type="edit" />
                  <div class="btns-text">修改</div>
                </div>
              </Col>
              <Col :span="2" v-if="hasPermission('bomClass:delete')">
                <div class="btns" @click="handleDelete">
                  <Icon class="btns-icon" type="delete" />
                  <div class="btns-text">删除</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      <div class="content-tree-wrapper">
        <div class="tree-box not-copy" style="height: 99%">
          <Tree
            showLine
            defaultExpandAll
            :treeData="treeData"
            v-if="treeData.length > 0"
            @select="onSelect"
            :replaceFields="replaceFields"
          >
            <template #switcherIcon>
              <Icon type="down" />
            </template>
          </Tree>
        </div>
      </div>
    </div>

    <Modal v-model:visible="visible" :title="modalTitle" @cancel="handleCancel">
      <Form ref="groupForm" :model="formData" layout="horizontal" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
        <FormItem label="分组编码" name="code" :rules="[{ required: true, trigger: 'input', message: '请输入分组编码' }]">
          <Input
            placeholder="请输入两位数分组编码"
            maxLength="2"
            v-model:value="formData.code"
            onkeyup="value=value.toString().match(/^\d+(?:\.\d{0,5})?/)"
          />
        </FormItem>
        <FormItem label="分组名称" name="name" :rules="[{ required: true, trigger: 'input', message: '请输入分组名称' }]">
          <Input placeholder="请输入分组名称" v-model:value="formData.name" />
        </FormItem>
      </Form>
      <template #footer>
        <Button type="primary" @click="handleSubmit">确认</Button>
        <Button @click="handleCancel">取消</Button>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { Tree, Modal, Form, Input, Button, Row, Col, message } from 'ant-design-vue';
import { BasicPageHeader } from '/@/components/Page';
import { usePermission } from '/@/hooks/web/usePermission';
import { useMessage } from '/@/hooks/web/useMessage';
import { Icon } from '/@/components/Icon';

const { hasPermission } = usePermission();
const { createMessage } = useMessage();

// 响应式数据
const treeData = ref<any[]>([]);
const visible = ref(false);
const modalTitle = ref('');
const selectedKeys = ref<string[]>([]);
const selectedRow = ref<any>(null);
const groupForm = ref<any>(null);

const replaceFields = {
  title: 'showname',
  key: 'code'
};

const formData = reactive<{
  id: string | null;
  code: string;
  name: string;
}>({
  id: null,
  code: '',
  name: ''
});

// 生命周期
onMounted(() => {
  fetchGroupList();
});

// 方法
function fetchGroupList() {
  // 模拟API调用获取分组列表
  const mockData = [
    { id: '1', code: '01', name: '标准BOM', parentId: '0' },
    { id: '2', code: '02', name: '测试BOM', parentId: '0' },
    { id: '3', code: '03', name: '样品BOM', parentId: '0' }
  ];

  // 构建树形数据
  const formattedData = [
    {
      title: 'BOM分组',
      showname: 'BOM分组',
      key: '',
      children: formatTreeData(mockData)
    }
  ];

  treeData.value = formattedData;
}

function formatTreeData(data: any[]): any[] {
  // 格式化数据为树形结构
  return data.map(item => ({
    ...item,
    showname: `(${item.code}) ${item.name}`,
    key: item.code
  }));
}

function onSelect(keys: string[], event: any) {
  selectedKeys.value = keys;
  if (keys.length > 0) {
    selectedRow.value = event.node.dataRef;
  } else {
    selectedRow.value = null;
  }
}

function handleAdd() {
  visible.value = true;
  modalTitle.value = '新增物料清单分组';
  formData.id = null;
  formData.code = '';
  formData.name = '';

  if (groupForm.value) {
    groupForm.value.resetFields();
  }
}

function handleEdit() {
  if (!selectedRow.value) {
    createMessage.warning('请选择一条数据');
    return;
  }

  visible.value = true;
  modalTitle.value = '修改物料清单分组';
  formData.id = selectedRow.value.id;
  formData.code = selectedRow.value.code;
  formData.name = selectedRow.value.name;
}

function handleDelete() {
  if (!selectedRow.value) {
    createMessage.warning('请选择一条数据');
    return;
  }

  Modal.confirm({
    title: `是否确认删除 ${selectedRow.value.name}`,
    onOk: () => {
      // 模拟删除操作
      createMessage.success('删除成功');
      fetchGroupList();
      selectedKeys.value = [];
      selectedRow.value = null;
    }
  });
}

function handleSubmit() {
  groupForm.value.validate().then(() => {
    if (formData.code.length !== 2) {
      createMessage.warning('请输入两位数编码');
      return;
    }

    // 模拟保存操作
    createMessage.success('保存成功');
    visible.value = false;
    fetchGroupList();
    selectedKeys.value = [];
    selectedRow.value = null;
  }).catch(err => {
    console.error('表单验证失败:', err);
  });
}

function handleCancel() {
  visible.value = false;
}
</script>

<style lang="less" scoped>
.content-wrapper {
  padding: 12px 10px 0;
  height: auto;
  overflow-y: auto;
  font-size: 14px;
}

.btn-wrapper {
  margin-bottom: 10px;
  .btns {
    font-size: 14px;
    cursor: pointer;
    overflow: hidden;
    text-align: center;
    padding: 5px;
  }
  .btns-text {
    margin-top: -2px;
    height: 20px;
    overflow: hidden;
  }
  .btns-icon {
    font-size: 22px;
    color: rgb(24, 144, 255);
    display: block;
    margin: 0 auto;
  }
  .btns:hover {
    .btns-icon {
      color: rgb(45, 85, 216);
    }
    transition: all 0.2s;
  }
  .btns:active {
    animation: btns-transform 0.1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
}

@keyframes btns-transform {
  10%, 90% {
    transform: translate3d(-1px, 0px, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0px, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0px, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0px, 0);
  }
}

.content-tree-wrapper {
  .tree-box {
    height: calc(100vh - 180px);
    background: #f5f5f5;
    padding: 10px;
    overflow-y: auto;
    border-radius: 4px;
  }
}
</style>