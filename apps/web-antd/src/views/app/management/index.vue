<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { Card, Table, Button, Form, Input, Radio, Upload, Modal, message } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue';

defineOptions({ name: 'AppManagement' });

// 表格数据
const dataSource = ref<any[]>([]);
// 选中的行
const selectedRowKeys = ref<string[]>([]);
// 分页配置
const pagination = reactive<any>({
  current: 1,
  pageSize: 10,
  total: 0,
});
// 模态框可见性
const visible = ref(false);
// 模态框标题
const dragAddTitle = ref('新增APP');
// 表单数据
const form = reactive<any>({
  appName: '',
  appVersion: '',
  type: 1,
  isForcedUpdate: 0,
  status: 1,
  downloadUrl: '',
  remarks: '',
});
// 文件列表
const fileList = ref<any[]>([]);
// 请求数据
const requestData = reactive<any>({
  appName: '',
  appVersion: '',
  type: 1,
  isForcedUpdate: 0,
  status: 1,
  downloadUrl: '',
  remarks: '',
});
// 按钮网格配置
const btnGrid = reactive<any>({
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
  xl: 6,
});
// 表格列配置
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 80,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  {
    title: 'app名称',
    dataIndex: 'appName',
    key: 'appName',
    width: 150,
    align: 'left',
  },
  {
    title: '版本号',
    dataIndex: 'appVersion',
    key: 'appVersion',
    width: 100,
    align: 'left',
  },
  {
    title: '下载地址',
    dataIndex: 'downloadUrl',
    key: 'downloadUrl',
    width: 300,
    align: 'left',
    customRender: ({ text }) => (
      <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
    ),
  },
  {
    title: '下载次数',
    dataIndex: 'downloadCount',
    key: 'downloadCount',
    width: 100,
    align: 'left',
  },
  {
    title: '是否强制更新',
    dataIndex: 'isForcedUpdate',
    key: 'isForcedUpdate',
    width: 120,
    align: 'center',
    customRender: ({ text }) => (text === 1 ? '是' : '否'),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    customRender: ({ text }) => (text === 1 ? '启用' : '停用'),
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    align: 'center',
    customRender: ({ text }) => (text === 1 ? '安卓' : 'iOS'),
  },
];
// 上传文件
const uploadFile = (info: any) => {
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 上传成功`);
    requestData.downloadUrl = info.file.response.data.url;
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 上传失败`);
  }
};
// 处理选择变化
const onSelectChange = (newSelectedRowKeys: string[]) => {
  selectedRowKeys.value = newSelectedRowKeys;
};
// 打开编辑框
const filedEdit = (type: number) => {
  if (type === 2 && selectedRowKeys.value.length === 0) {
    message.warning('请选择一条数据进行修改');
    return;
  }
  dragAddTitle.value = type === 1 ? '新增APP' : '修改APP';
  visible.value = true;
  // 如果是修改，填充表单数据
  if (type === 2) {
    const selectedRow = dataSource.value.find(
      (item) => item.id === selectedRowKeys.value[0]
    );
    if (selectedRow) {
      Object.assign(requestData, selectedRow);
    }
  } else {
    // 新增时重置表单
    Object.keys(requestData).forEach((key) => {
      requestData[key] = '';
    });
    requestData.type = 1;
    requestData.isForcedUpdate = 0;
    requestData.status = 1;
  }
};
// 删除数据
const deleteData = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择一条数据进行删除');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除选中的数据吗？',
    onOk: () => {
      // 模拟删除操作
      dataSource.value = dataSource.value.filter(
        (item) => !selectedRowKeys.value.includes(item.id)
      );
      selectedRowKeys.value = [];
      message.success('删除成功');
    },
  });
};
// 取消添加
const cancelAdd = () => {
  visible.value = false;
};
// 处理提交
const handleSubmitText = () => {
  // 模拟表单提交
  if (!requestData.appName || !requestData.appVersion) {
    message.warning('请填写必填项');
    return;
  }
  handleSave();
};
// 保存数据
const handleSave = () => {
  if (dragAddTitle.value === '新增APP') {
    // 模拟新增
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      ...requestData,
      downloadCount: 0,
    };
    dataSource.value.unshift(newItem);
    message.success('新增成功');
  } else {
    // 模拟修改
    const index = dataSource.value.findIndex(
      (item) => item.id === selectedRowKeys.value[0]
    );
    if (index !== -1) {
      dataSource.value[index] = {
        ...dataSource.value[index],
        ...requestData,
      };
      message.success('修改成功');
    }
  }
  visible.value = false;
};
// 初始化数据
const initData = () => {
  // 模拟API请求获取数据
  dataSource.value = [
    {
      id: '1',
      appName: '测试APP',
      appVersion: '1.0.0',
      downloadUrl: 'https://example.com/download/app',
      downloadCount: 100,
      isForcedUpdate: 0,
      status: 1,
      type: 1,
    },
    {
      id: '2',
      appName: '演示APP',
      appVersion: '2.1.3',
      downloadUrl: 'https://example.com/download/demo',
      downloadCount: 200,
      isForcedUpdate: 1,
      status: 1,
      type: 0,
    },
  ];
  pagination.total = dataSource.value.length;
};
// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<template>
  <div class="content-wrapper a-base-container">
    <Card :bordered="false">
      <div class="requisition-set-wrapper">
        <!-- 按钮 -->
        <div class="btn-wrapper clearfix">
          <div class="text-center">
            <div class="flex flex-wrap justify-center gap-4">
              <div
                class="btns"
                @click="filedEdit(1)"
                :class="{
                  'btns-primary': true,
                }"
              >
                <PlusOutlined class="btns-icon" />
                <div class="btns-text">新增</div>
              </div>
              <div
                class="btns"
                @click="filedEdit(2)"
                :class="{
                  'btns-secondary': true,
                }"
              >
                <EditOutlined class="btns-icon" />
                <div class="btns-text">修改</div>
              </div>
              <div
                class="btns"
                @click="deleteData"
                :class="{
                  'btns-danger': true,
                }"
              >
                <DeleteOutlined class="btns-icon" />
                <div class="btns-text">删除</div>
              </div>
            </div>
          </div>
        </div>
        <section class="content-app-wrapper">
          <Table
            :columns="columns"
            :data-source="dataSource"
            :row-selection="{
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange,
              columnWidth: 10,
            }"
            :scroll="{ x: 800, y: 500 }"
            :pagination="pagination"
            bordered
          />
        </section>
      </div>
    </Card>

    <Modal
      v-model:visible="visible"
      :title="dragAddTitle"
      @cancel="cancelAdd"
      width="800px"
    >
      <Form
        class="demand-modal"
        :model="requestData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 14 }"
        @submit="handleSubmitText"
      >
        <div class="grid grid-cols-2 gap-4">
          <Form.Item
            label="名称"
            name="appName"
            :rules="[{ required: true, message: '请输入名称', trigger: 'input' }]"
          >
            <Input
              placeholder="请输入名称"
              v-model="requestData.appName"
            />
          </Form.Item>
          <Form.Item
            label="版本号"
            name="appVersion"
            :rules="[{ required: true, message: '请输入版本号', trigger: 'input' }]"
          >
            <Input
              placeholder="请输入版本号"
              v-model="requestData.appVersion"
            />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Radio.Group v-model="requestData.type">
              <Radio :value="1">安卓</Radio>
              <Radio :value="0">iOS</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="是否强制更新" name="isForcedUpdate">
            <Radio.Group v-model="requestData.isForcedUpdate">
              <Radio :value="1">是</Radio>
              <Radio :value="0">否</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Radio.Group v-model="requestData.status">
              <Radio :value="1">可用</Radio>
              <Radio :value="0">停用</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="下载地址" name="downloadUrl">
            <Upload
              action="/api/uploadFile"
              list-type="text"
              :file-list="fileList"
              class="upload-list-inline"
              @change="uploadFile"
            >
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>
          </Form.Item>
        </div>
        <Form.Item label="描述" name="remarks">
          <Input
            placeholder="请输入描述"
            type="textarea"
            v-model="requestData.remarks"
          />
        </Form.Item>
      </Form>
      <template #footer>
        <Button type="primary" @click="handleSave">保存</Button>
        <Button @click="cancelAdd" class="ml-2">关闭</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="less">
.content-wrapper {
  padding: 24px;
  min-height: 100%;
}

.requisition-set-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.btn-wrapper {
  margin-bottom: 24px;
}

.btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.btns-primary {
  background: #1890ff;
  color: #fff;
}

.btns-secondary {
  background: #f0f2f5;
  color: #1f2329;
}

.btns-danger {
  background: #ff4d4f;
  color: #fff;
}

.btns-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.btns-text {
  font-size: 14px;
}

.content-app-wrapper {
  overflow: hidden;
}

.demand-modal {
  padding: 24px 0;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.justify-center {
  justify-content: center;
}

.gap-4 {
  gap: 16px;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style>