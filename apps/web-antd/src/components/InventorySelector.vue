<template>
  <div class="inventory-selector">
    <Input
      v-model:value="inputValue"
      placeholder="搜索商品..."
      :suffixIcon="searchIcon"
      @change="handleSearch"
      @focus="showDropdown"
    />

    <div v-if="visible" class="dropdown-container">
      <div class="search-result">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="inventoryList.length === 0" class="no-result">无匹配结果</div>
        <ul class="inventory-list">
          <li
            v-for="item in inventoryList"
            :key="item.id"
            :class="{ 'active': selectedItem?.id === item.id }"
            @click="handleSelect(item)"
          >
            <div class="inventory-code">{{ item.code }}</div>
            <div class="inventory-name">{{ item.name }}</div>
            <div class="inventory-spec">{{ item.specification }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Input } from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { getInventoryList } from '@/api/inventory';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => null,
  },
  placeholder: {
    type: String,
    default: '搜索商品...',
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

// 组件状态
const inputValue = ref('');
const visible = ref(false);
const loading = ref(false);
const inventoryList = ref<any[]>([]);
const selectedItem = ref<any>(props.modelValue);
const searchIcon = <SearchOutlined />;

// 监听模型值变化
watch(
  () => props.modelValue,
  (newValue) => {
    selectedItem.value = newValue;
    if (newValue) {
      inputValue.value = `${newValue.code} ${newValue.name}`;
    } else {
      inputValue.value = '';
    }
  },
  { immediate: true }
);

// 搜索商品
const handleSearch = async (e: any) => {
  const keyword = e.target.value;
  inputValue.value = keyword;

  if (keyword.length < 2) {
    return;
  }

  loading.value = true;
  try {
    const res = await getInventoryList({ keyword, pageSize: 10 });
    if (res.success) {
      inventoryList.value = res.data.items;
    }
  } catch (error) {
    console.error('搜索商品失败:', error);
  } finally {
    loading.value = false;
  }
};

// 显示下拉框
const showDropdown = () => {
  visible.value = true;
  // 如果有输入值，执行搜索
  if (inputValue.value.length >= 2) {
    handleSearch({ target: { value: inputValue.value } });
  }
};

// 选择商品
const handleSelect = (item: any) => {
  selectedItem.value = item;
  inputValue.value = `${item.code} ${item.name}`;
  emit('update:modelValue', item);
  emit('select', item);
  visible.value = false;
};

// 点击外部关闭下拉框
const handleClickOutside = (e: MouseEvent) => {
  const container = document.querySelector('.inventory-selector');
  if (container && !container.contains(e.target as Node)) {
    visible.value = false;
  }
};

// 挂载时添加点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 卸载时移除点击事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="less">
.inventory-selector {
  position: relative;
  width: 100%;
}

.dropdown-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.search-result {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.loading,
.no-result {
  padding: 12px;
  text-align: center;
  color: #999;
}

.inventory-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.inventory-list li {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f5f5f5;
  }
  &.active {
    background-color: #e6f7ff;
  }
}

.inventory-code {
  font-weight: bold;
  margin-bottom: 4px;
}

.inventory-name {
  margin-bottom: 4px;
}

.inventory-spec {
  color: #999;
  font-size: 12px;
}
</style>