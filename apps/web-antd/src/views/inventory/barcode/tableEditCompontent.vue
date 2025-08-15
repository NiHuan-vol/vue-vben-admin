<template>
  <div class="table-box">
    <BasicTable
      v-if="isRouterAlive"
      id="process_edit_tb"
      class="atable-edit"
      :columns="columnsAdd"
      :dataSource="dataSource"
      :pagination="false"
      bordered
      :scroll="{ x: 1000, y: 384 }"
    >
      <template #voucherTypeName="{ record, index }">
        <EditableCell
          :record="record"
          col="voucherTypeName"
          :text="record.voucherTypeName"
          @change="onCellChange(index, 'voucherTypeName', $event)"
        />
      </template>
      <template #voucherFieldName="{ record, index }">
        <EditableCell
          :record="record"
          col="voucherFieldName"
          :text="record.voucherFieldName"
          @change="onCellChange(index, 'voucherFieldName', $event)"
        />
      </template>
      <template #remark="{ record, index }">
        <EditableCell
          :record="record"
          col="remark"
          :text="record.remark"
          @change="onCellChange(index, 'remark', $event)"
        />
      </template>
    </BasicTable>
    <div class="edit-mask-route" v-show="editMask"></div>
    <div class="contextmenu-box">
      <ul
        v-show="visible"
        :style="{ left: left + 'px', top: top + 'px' }"
        class="contextmenu"
      >
        <li @click="handleAdd">新增行</li>
        <li @click="handleDelete">删除行</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, defineProps, defineEmits } from 'vue';
import { message } from 'ant-design-vue';
import EditableCell from './editTable/EditableCell.vue';
import { BasicTable } from '@/components/Table/index';

defineProps({
  dataSource: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['updateObj']);

const visible = ref(false);
const editMask = ref(false);
const isRouterAlive = ref(true);
const top = ref(0);
const left = ref(0);
const dataSourceNumber = ref(12);
const thisClickId = ref<number | null>(null);

const columnsAdd = [
  {
    title: '序号',
    dataIndex: 'number',
    width: 40,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '业务对象',
    dataIndex: 'voucherTypeName',
    slots: { customRender: 'voucherTypeName' },
  },
  {
    title: '业务对象字段',
    dataIndex: 'voucherFieldName',
    slots: { customRender: 'voucherFieldName' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    slots: { customRender: 'remark' },
  },
];

// 初始化表格
tableInit();

function tableInit() {
  const dataSource = props.dataSource;
  if (dataSource.length < dataSourceNumber.value) {
    for (let i = dataSource.length; i < dataSourceNumber.value; i++) {
      dataSource.push({
        number: i + 1,
      });
    }
  }
  reload();
}

function reload() {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
}

function openMenu(e: MouseEvent) {
  e.preventDefault();
  const x = e.pageX - 250;
  const y = e.pageY - 40;
  top.value = y;
  left.value = x;
  visible.value = true;
}

function closeMenu() {
  visible.value = false;
}

function handleAdd() {
  const dataSource = props.dataSource;
  const newData = {};
  nextTick(() => {
    dataSource.push(newData);
    emit('updateObj', dataSource);
    reload();
  });
}

function handleDelete() {
  const dataSource = props.dataSource;
  if (thisClickId.value !== null) {
    message
      .confirm('您确定要删除该记录吗？', {
        okText: '确认',
        cancelText: '取消',
      })
      .then(() => {
        if (dataSource.length > 1) {
          dataSource.splice(thisClickId.value, 1);
          emit('updateObj', dataSource);
          reload();
        } else {
          message.warning('至少保留一行数据');
        }
      })
      .catch(() => {});
  }
}

function onCellChange(index: number, key: string, value: any) {
  const dataSource = props.dataSource;
  if (dataSource[index]) {
    dataSource[index][key] = value;
    emit('updateObj', dataSource);
  }
}

// 监听visible状态，添加/移除点击事件
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu);
  } else {
    document.body.removeEventListener('click', closeMenu);
  }
});

// 监听dataSource变化
watch(
  () => props.dataSource,
  (value) => {
    if (value.length < dataSourceNumber.value) {
      for (let i = value.length; i < dataSourceNumber.value; i++) {
        value.push({
          number: i + 1,
        });
      }
    }
    emit('updateObj', value);
    reload();
  },
  { deep: true }
);

// 右键点击事件
const customRow = (record: any, index: number) => {
  return {
    on: {
      contextmenu: (e: MouseEvent) => {
        e.preventDefault();
        if (index < props.dataSource.length) {
          openMenu(e);
          thisClickId.value = index;
        }
      },
    },
  };
};
</script>

<style scoped>
.table-box {
  position: relative;
}

.edit-mask-route {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.01);
  z-index: 10;
}

.contextmenu-box {
  position: fixed;
  z-index: 100;
}

.contextmenu {
  width: 100px;
  margin: 0;
  padding: 5px 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  list-style: none;
}

.contextmenu li {
  padding: 6px 12px;
  cursor: pointer;
}

.contextmenu li:hover {
  background-color: #f5f5f5;
}
</style>