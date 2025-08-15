<template>
  <div class="editable-cell-process">
    <div v-if="editable" class="editable-cell-input-wrapper">
      <div v-if="col === 'inventoryCode' || col === 'inventoryName'
        <searchGroupDetail ref="searchComponents" :record="record" :inputValue="text" :componentName="'inventory'" @clickItem="searchBackData" />
      </div>
      <div v-else-if="col === 'checkQuantity' || col === 'realQuantity' || col === 'diffQuantity'
        <Input onkeyup="value=value.toString().match(/^-?\d+(?:\.\d{0,4})?/g)?.[0] || ''" :value="value" ref="focusid" @change="handleChange" @pressEnter="check" @blur="checkClose" />
      </div>
      <Input v-else :value="value" ref="focusid" @change="handleChange" @pressEnter="check" @blur="checkClose" />
    </div>
    <div v-else class="editable-cell-text-wrapper" @click="edit" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
      <div style="text-align: right; padding-right: 2px;" v-if="value && (col === 'checkQuantity' || col === 'realQuantity' || col === 'diffQuantity')
        {{ value }}
      </div>
      <div v-else>{{ value || '&nbsp;' }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { Input, message } from 'ant-design-vue';
import searchGroupDetail from '@/components/PopUpLayer/searchGroupDetail';

// 定义props
const props = defineProps({
  text: String,
  record: {
    type: Object,
    default: () => {},
  },
  col: {
    type: String,
    required: true,
  },
});

// 定义emits
const emit = defineEmits(['change', 'choiceAddData']);

// 状态管理
const value = ref(props.text);
const editable = ref(false);

// 生命周期
onMounted(() => {
  // 初始化逻辑
});

// 处理输入框变化
const handleChange = (e) => {
  const inputValue = e.target.value;
  let numReg = /^-?\d+(?:\.\d{0,4})?/; // 整数或者0-4位小数，允许负数

  if (['checkQuantity', 'realQuantity', 'diffQuantity'].includes(props.col)) {
    if (inputValue && !numReg.test(inputValue)) {
      message.warning('输入有误，请输入有效的数字');
      value.value = '0';
      return;
    } else if (inputValue) {
      if (inputValue.split('.')[1] && inputValue.split('.')[1].length > 4) {
        value.value = inputValue.split('.')[0] + '.' + inputValue.split('.')[1].slice(0, 4);
      } else {
        value.value = inputValue;
      }
    } else {
      value.value = inputValue;
    }
  } else {
    value.value = inputValue;
  }
};

// 检查并关闭编辑
const checkClose = () => {
  editable.value = false;
  emit('change', value.value);
};

// 检查并提交
const check = () => {
  editable.value = false;
  emit('change', value.value);
};

// 编辑
const edit = () => {
  if (
    props.col === 'workFlag' ||
    props.col === 'specification' ||
    props.col === 'unitName' ||
    props.col === 'processMethod'
  ) {
    // 不可修改的列
    return;
  }

  editable.value = true;

  if (props.col !== 'inventoryCode' && props.col !== 'inventoryName') {
    // 聚焦到输入框
    setTimeout(() => {
      const input = document.querySelector(`[ref="focusid"]`);
      if (input) {
        input.focus();
      }
    }, 100);
  }
};

// 搜索回调数据
const searchBackData = (record) => {
  editable.value = false;
  if (record && typeof record === 'object') {
    value.value = record.name;
    emit('change', record);
  } else {
    emit('change');
  }
};
</script>

<style scoped lang="less">
.editable-cell-process {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding: 4px 0;
}

.editable-cell-text-wrapper:hover {
  cursor: pointer;
  background-color: #f5f5f5;
}
</style>