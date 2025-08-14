<script lang="ts" setup>
import { ref } from 'vue';
import { Card } from 'ant-design-vue';
// 假设input组件在vue-vben-admin中有对应的实现
// 这里暂时先注释掉，后续可以根据实际情况调整
// import Input from '@/components/crm/activity/edit/input.vue';

defineOptions({ name: 'ModelingList' });

const X_Y_city = ref('');
const city_hide = ref(false);

const otder = (e: MouseEvent) => {
  X_Y_city.value = `top:${e.pageY}px;left:${e.pageX}px;position: absolute;`;
  city_hide.value = true;
  console.log(e);
};
</script>

<template>
  <div class="content-wrapper a-base-container" @contextmenu.prevent="otder($event)">
    <!-- 序号表头 -->
    <div class="conten-title conten-tz" style="border-bottom: 0;">
      <div>序号</div>
      <div>工程/客户名称</div>
      <div>产品名称</div>
      <div>规格(mm)</div>
      <div>颜色</div>
      <div>数量(件)</div>
      <div>出货日期</div>
    </div>
    <div :style="X_Y_city" v-if="city_hide">
      <div>单击案例</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.conten-button {
  display: flex;
  width: 80%;
  div {
    width: 30%;
  }
}
// 记录/ 研发
.conten-jl {
  border: 1px solid #cacaca;
  border-bottom: 0;
  border-top: 0;
  display: flex;
  .conten-jl-one {
    border: 1px solid #cacaca;
    border-bottom: 0;
    border-top: 0;
    width: 40%;
  }
  .conten-jl-tow {
    border: 1px solid #cacaca;
    border-bottom: 0;
    border-top: 0;
    width: 60%;
  }
}

// 备注
.conten-bz {
  height: 200px;
  width: 80%;
  display: flex;
  border: 1px solid #cacaca;
  border-bottom: 0;
  .conten-bz-one {
    width: 15%;
    border: 1px solid #cacaca;
    border-bottom: 0;
    height: 200px;
    line-height: 200px;
  }
  .conten-bz-tow {
    height: 200px;
    width: 85%;
    border: 1px solid #cacaca;
  }
}
// 复选
.conten-chec {
  display: flex;
  flex-wrap: wrap;
  width: 80%;
  border: 1px solid #cacaca;
  border-bottom: 0;
  div {
    padding: 0 0 0 15px;
    height: 50px;
    line-height: 50px;
  }
}
// 订单
.conten-order {
  display: flex;
  width: 80%;
  .conten-order-one {
    width: 65%;
  }
  .conten-order-tow {
    width: 14%;
  }
}

.content-app-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
}
.conten-top {
  display: flex;
  width: 80%;
  height: 100px;
  line-height: 100px;
}
.conten-title {
  display: flex;
  div {
    border: 1px solid #cacaca;
    border-bottom: 0;
    width: 15%;
    overflow: hidden;
  }
}
.conten-tz {
  width: 80%;
  border: 1px solid #cacaca;
  height: 50px;
  line-height: 40px;
  text-align: center;
  overflow: hidden;
}
.conten-img {
  width: 14%;
}
.conten-txt {
  height: 25px;
  line-height: 25px;
}
</style>