<template>
  <div class="wh100 resize-table-container">
    <a-table class="a-base-table" :rowSelection="table.rowSelection" :columns="table.columns" :pagination="false" :data-source="table.data"
      :scroll="table.scroll" bordered>
    </a-table>
    <div class="a-button-bar" style="justify-content: space-around;">
      <span>审核人：xxx</span>
      <span>审核日期：xxx</span>
      <span>创建人：xxx</span>
      <span>日期：xxx</span>
    </div>
  </div>
</template>
<script>
const data = [];
for (let i = 0; i < 12; i++) {
  data.push({
    key: i,
    index: i + 1,
    beginTime: `Edrward ${i}`,
    endTime: 32
  });
}

import table from "@/mixins/table";
export default {
  mixins: [table],
  data() {
    return {
      table: this.tableInit({
        data,
        columns: [
          {
            title: "序号",
            width: 80,
            dataIndex: "index"
          },
          { title: "仓库", dataIndex: "beginTime" },
          { title: "仓库编码", dataIndex: "x2" },
          { title: "物料编码", dataIndex: "x3" },
          { title: "物料名称", dataIndex: "x4" },
          { title: "规格型号", dataIndex: "x5" },
          { title: "主计量单位", dataIndex: "x6" },
          { title: "数量", dataIndex: "x8" },
          { title: "单价", dataIndex: "x9" },
          { title: "金额", dataIndex: "x10" },
          { title: "入库类别", dataIndex: "x11" },
          { title: "部门", dataIndex: "x12" },
          { title: "制单人", dataIndex: "x13" },
          { title: "审核人", dataIndex: "x14" },
          { title: "审核日期", dataIndex: "x15" }
        ]
      })
    };
  },
  methods: {
    add() {
      this.form.title = "新增";
      this.form.show = !this.form.show;
    },
    edit() {
      this.table.edit(() => {
        this.form.title = "编辑";
        this.form.show = !this.form.show;
      });
    },
    remove() {
      this.table.remove(() => {});
    }
  }
};
</script>