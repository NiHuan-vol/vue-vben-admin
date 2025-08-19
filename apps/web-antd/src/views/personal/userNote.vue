<template>
  <div class="user-note-container">
    <Card :title="'记事本'" class="mb-4">
      <div class="note-warpper">
        <Row :span="24" :gutter="[16, 16]">
          <Col :xs="12" :sm="8" :md="8" :lg="6" :xl="6">
            <div class="note-add" @click="addItem">
              <Icon icon="ant-design:plus-outlined" />
            </div>
          </Col>
          <Col v-for="item in data" :key="item.id" :xs="12" :sm="8" :md="8" :lg="6" :xl="6">
            <div class="note-item" @dblclick="editItem(item)">
              <div class="note-title-box">
                <span class="note-title">{{ item.title || '无主题' }}</span>
                <span class="note-option" @click.stop="deleteNote(item.id)">
                  <Icon icon="ant-design:close-outlined" />
                </span>
              </div>
              <div class="note-content">
                <TextArea
                  v-if="item.content"
                  :value="item.content"
                  :auto-size="{ minRows: 5, maxRows: 5 }"
                  readonly
                  bordered={false}
                  style={{ resize: 'none' }}
                />
                <span v-else>无内容</span>
              </div>
              <div class="note-time">
                {{ item.createDate }}
                <Tag color="blue" style={{ float: 'right', marginTop: '3px' }}>{{ item.contentType }}</Tag>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>

    <!-- 编辑/新增弹窗 -->
    <Modal
      v-model:visible="editModalShow"
      :title="editItem.id ? '编辑' : '新增'"
      width={600}
      @ok="handleSubmit"
      @cancel="() => (editModalShow = false)"
    >
      <ProForm
        :model="formData"
        layout="horizontal"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <ProFormText
          name="title"
          label="主题"
          placeholder="请输入主题"
        />
        <ProFormSelect
          name="contentType"
          label="分类"
          v-model:value="selectVal"
          :options="selectData.map(item => ({ label: item.type, value: item.type }))"
          @change="selectChange"
          fieldProps={{ allowClear: true }}
        />
        <Space style={{ marginLeft: '100px' }}>
          <Button
            type="text"
            icon={<Icon icon="ant-design:edit-outlined" />}
            @click="addShowType"
          >
            添加分类
          </Button>
        </Space>
        <ProFormTextArea
          name="content"
          label="内容"
          placeholder="请填写记事本内容"
          v-model:value="editorContent"
          :auto-size="{ minRows: 5, maxRows: 8 }"
        />
      </ProForm>
    </Modal>

    <!-- 添加分类弹窗 -->
    <Modal
      v-model:visible="typeVisible"
      title="添加分类"
      @ok="saveTypeHandler"
      @cancel="() => (typeVisible = false)"
      width={400}
    >
      <Row :span="24">
        <Col :span="24">
          <Input
            v-model:value="typeName"
            placeholder="请填写分类名称(8个字符)"
            :maxLength="8"
          />
        </Col>
      </Row>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { Card, Row, Col, Modal, ProForm, ProFormText, ProFormSelect, ProFormTextArea, Button, Tag, TextArea, Space } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';
import { message } from 'ant-design-vue';
import { pageList, save, deleteNote as deleteNoteApi, deleteType, getType, saveType } from '@/api/personal/userNote';

// 数据定义
const data = ref<Array<Record<string, any>>>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const editModalShow = ref(false);
const editItem = ref<Record<string, any>>({});
const formData = reactive<Record<string, any>>({ title: '', content: '' });
const editorContent = ref('');
const typeVisible = ref(false);
const typeName = ref('');
const selectData = ref<Array<Record<string, any>>>([]);
const selectVal = ref<string | null>(null);

// 分页配置
const pagination = reactive({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showTotal: (total: number) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
});

// 生命周期钩子
onMounted(() => {
  fetchData();
  getSelectData();
});

// 获取笔记列表
const fetchData = async () => {
  try {
    const response = await pageList({
      current: currentPage.value,
      size: pageSize.value,
      type: 2,
    });
    if (response.code === 200) {
      data.value = response.data.records;
      total.value = response.data.total;
      pagination.total = total.value;
    }
  } catch (error) {
    message.error('获取笔记列表失败');
  }
};

// 获取分类数据
const getSelectData = async () => {
  try {
    const response = await getType();
    if (response.code === 200) {
      selectData.value = response.data;
    }
  } catch (error) {
    message.error('获取分类数据失败');
  }
};

// 切换分类
const selectChange = (value: string) => {
  selectVal.value = value;
};

// 添加笔记
const addItem = () => {
  editItem.value = {};
  formData.title = '';
  editorContent.value = '';
  selectVal.value = null;
  editModalShow.value = true;
};

// 编辑笔记
const editItem = (row: Record<string, any>) => {
  editItem.value = { ...row };
  formData.title = row.title || '';
  editorContent.value = row.content || '';
  selectVal.value = row.contentType || null;
  editModalShow.value = true;
};

// 删除笔记
const deleteNote = async (id: number) => {
  try {
    Modal.confirm({
      title: '提示',
      content: '您确定要删除该便签吗？',
      onOk: async () => {
        const response = await deleteNoteApi([id]);
        if (response.code === 200) {
          message.success('删除成功');
          fetchData();
        } else {
          message.error(response.message);
        }
      },
    });
  } catch (error) {
    message.error('删除失败');
  }
};

// 显示添加分类弹窗
const addShowType = () => {
  typeVisible.value = true;
};

// 删除分类
const handleRemove = async (data: Record<string, any>) => {
  try {
    Modal.confirm({
      title: '提示',
      content: '您确定要删除该分类吗？',
      onOk: async () => {
        const response = await deleteType({ id: data.id });
        if (response.code === 200) {
          message.success('删除成功');
          getSelectData();
        }
      },
    });
  } catch (error) {
    message.error('删除分类失败');
  }
};

// 保存分类
const saveTypeHandler = async () => {
  if (!typeName.value) {
    message.error('请输入分类名称');
    return;
  }

  try {
    const response = await saveType({
      type: typeName.value,
    });
    if (response.code === 200) {
      message.success('保存分类成功');
      typeName.value = '';
      typeVisible.value = false;
      getSelectData();
    }
  } catch (error) {
    message.error('保存分类失败');
  }
};

// 保存笔记
const handleSubmit = async () => {
  if (!formData.title && !editorContent.value) {
    message.warning('主题和内容必须填写一项');
    return;
  }

  const saveData = {
    ...formData,
    id: editItem.value.id,
    content: editorContent.value,
    contentType: selectVal.value,
    createDate: null,
    type: 2,
  };

  try {
    const response = await save(saveData);
    if (response.code === 200) {
      message.success('保存成功');
      fetchData();
      editModalShow.value = false;
    }
  } catch (error) {
    message.error('保存失败');
  }
};

// 分页变更
const onTableChange = (pagination: any) => {
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
  fetchData();
};
</script>

<style lang="less" scoped>
.user-note-container {
  .note-warpper {
    padding: 10px;

    .note-add {
      width: 100%;
      height: 210px;
      line-height: 210px;
      font-size: 60px;
      color: #888;
      box-shadow: 0 0 5px #ccc;
      text-align: center;
      cursor: pointer;
    }

    .note-item {
      box-shadow: 0 0 5px #ccc;
      height: 210px;
      border-radius: 4px;

      .note-title-box {
        height: 40px;
        line-height: 40px;
        padding-left: 10px;
        overflow: hidden;
        border-bottom: 1px solid #eee;
        display: flex;

        .note-title {
          flex: 0 0 90%;
          font-weight: bold;
          font-size: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .note-option {
          flex: 0 0 10%;
          overflow: hidden;
          text-align: right;
          padding-right: 5px;
          cursor: pointer;
        }
      }

      .note-content {
        height: 140px;
        padding: 10px;
        overflow-y: auto;
      }

      .note-time {
        height: 30px;
        line-height: 30px;
        padding-right: 5px;
        text-align: center;
        border-top: 1px solid #eee;
      }
    }

    .note-item:hover {
      box-shadow: 0 0 5px #1890ff;
    }
  }
}
</style>