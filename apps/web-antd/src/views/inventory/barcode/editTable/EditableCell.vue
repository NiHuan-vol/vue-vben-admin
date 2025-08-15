<template>
  <div class="editable-cell-process">
    <div v-if="editable" class="editable-cell-input-wrapper">
      <div v-if="col === 'voucherTypeCode' || col === 'voucherTypeName' || col === 'voucherField' || col === 'voucherFieldName' || col === 'barcodeAttributeCode'
        <searchGroupDetail ref="searchComponents" :record="record" :inputValue="text" :componentName="componentName" @clickItem="searchBackData" />
      </div>
      <div v-else-if="col === 'isCode'
        <Select style="width: 100%" @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model:value="isCode" ref="focusid">
          <SelectOption :value="true">是</SelectOption>
          <SelectOption :value="false">否</SelectOption>
        </Select>
      </div>
      <div v-else-if="col === 'quantity' || col === 'expectedPrintQuantity' || col === 'minPackageQuantity'
        <Input onkeyup="value=value.toString().match(/^\d+(?:\.\d{0,4})?/)" :value="value" ref="focusid" @change="handleChange" @pressEnter="check" @blur="checkClose" />
      </div>
      <Input v-else :value="value" ref="focusid" @change="handleChange" @pressEnter="check" @blur="checkClose" />
    </div>
    <div v-else class="editable-cell-text-wrapper" @click="edit" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
      <div style="text-align: right; padding-right: 2px;" v-if="value && (col === 'quantity' || col === 'expectedPrintQuantity' || col === 'minPackageQuantity')
        {{ value }}
      </div>
      <div v-else-if="col === 'isCode'">{{ value ? '是' : value === false ? '否' : '' }}</div>
      <div v-else>{{ value || '&nbsp;' }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { Input, Select, message } from 'ant-design-vue';
import { SelectOption } from 'ant-design-vue/es/select';
import { useRoute } from 'vue-router';
import { useStorage } from '@vueuse/core';

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
const componentName = ref('');
const isCode = ref(null);
const route = useRoute();
const accessToken = useStorage('ACCESS_TOKEN', '');

// 生命周期
onMounted(() => {
  // 初始化逻辑
});

// 处理输入框变化
const handleChange = (e) => {
  const inputValue = e.target.value;
  let numReg = /^\d+(?:\.\d{0,4})?/; // 整数或者0-4位小数

  let numberColArray = ['checkQuantity']; // 数字类型数组
  if (numberColArray.includes(props.col)) {
    if (!numReg.test(inputValue)) {
      message.warning('盘点数量输入有误！');
      value.value = '0.0';
      return;
    } else {
      value.value = inputValue;
    }
  } else if (['quantity', 'expectedPrintQuantity', 'minPackageQuantity'].includes(props.col)) {
    if (inputValue && !numReg.test(inputValue)) {
      message.warning('输入有误');
      value.value = '0.0';
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

// 处理选择变化
const handleSelectChange = (selectedValue) => {
  editable.value = false;
  emit('change', selectedValue);
};

// 处理选择失焦
const handleSelectBlur = () => {
  editable.value = false;
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

  if (props.col === 'voucherField' || props.col === 'voucherFieldName') {
    if (!props.record.voucherTypeCode) {
      message.warning('请先选择业务对象');
      return;
    }
  }

  editable.value = true;
  if (props.col === 'voucherTypeCode' || props.col === 'voucherTypeName') {
    // 业务对象编码
    componentName.value = 'voucherCode';
    // 这里需要实现searchComponents的逻辑
  } else if (props.col === 'voucherField' || props.col === 'voucherFieldName') {
    // 业务对象字段
    componentName.value = 'voucherField';
    // 这里需要实现searchComponents的逻辑
  } else if (props.col === 'barcodeAttributeCode') {
    // 条码属性编码
    componentName.value = 'barcodeAttrCode';
    // 这里需要实现searchComponents的逻辑
  } else {
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