<!-- 业务设置->发运设置 -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="business-big-box" style="margin:2px 8px;">
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :span="2" v-if="permissions.includes('despatchType:add')">
                            <div class="btns" @click="houseTable.onAdd">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('despatchType:edit')">
                            <div class="btns" @click="houseTable.onEdit">
                                <a-icon class="btns-icon" type="edit" />
                                <div class="btns-text">修改</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('despatchType:delete')">
                            <div class="btns" @click="houseTable.onRemove">
                                <a-icon class="btns-icon" type="delete" />
                                <div class="btns-text">删除</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div class="resize-table-container" style="width:500px">
                <a-table :row-selection="houseTable.rowSelection" :columns="houseTable.columns" :pagination="houseTable.page" :data-source="houseTable.data" @change="houseTable.tableChange" :loading="loading" bordered>
                </a-table>
                <ag-modal-form :form="form" @ok="reload"></ag-modal-form>
            </div>
        </div>
    </div>
</template>
<script>
const data = [];

import { mapState } from "vuex";
import { getAction, postAction } from "@/api/manage";
import table from "@/mixins/table";
let options = [];
export default {
    mixins: [table],
    data () {
        return {
            tabKey: "houseTable",
            loading: false,
            form: {
                show: false,
                data: {},
                title: "",
                columns: [],
            },
            houseTable: this.tableInit({
                data,
                columns: [
                    { title: "发运方式编码", dataIndex: "code" },
                    { title: "发运方式名称", dataIndex: "name" }
                ],
                formColumns: [
                    {
                        label: "发运方式编码",
                        prop: "code",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                        help: "",
                    },
                    {
                        label: "发运方式名称",
                        prop: "name",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                        help: "",
                    }
                ],
                onAdd: () => {
                    this.form.show = !this.form.show;
                    this.form.columns = this.houseTable.formColumns;
                    this.form.title = "新增";
                    this.form.data = {};
                    this.form.url = "/erp/despatchType/save";
                },
                onEdit: () => {
                    let tData = this.houseTable.selectedRows;
                    console.log(this.houseTable.selectedRows);
                    this.houseTable.edit(() => {
                        this.form.show = !this.form.show;
                        this.form.columns = this.houseTable.formColumns;
                        this.form.data = tData[0];
                        this.form.data.createDate = null;
                        this.form.data.updateDate = null;
                        this.form.title = "编辑";
                        this.form.url = "/erp/despatchType/save";
                    });
                },
                onRemove: () => {
                    this.houseTable.remove(() => {
                        let ids = this.houseTable.selectedRows.map((item) => {
                            return item.id;
                        });
                        console.log(ids);
                        postAction("/erp/despatchType/delete", ids).then((res) => {
                            if (res.code == 200) {
                                this.loadHouseData();
                                this.houseTable.selectedRows = [];
                                this.houseTable.rowSelection.selectedRowKeys = [];
                                this.$message.success("删除成功");
                            } else {
                                // this.$message.warning(res.message);
                            }
                            this.loading = false;
                        });
                    });
                },
                onTablechage: () => {
                    this.loadHouseData();
                },
            }),
        };
    },
    created () {
        this.reload();
    },
     computed:{
      ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    methods: {

        reload () {
            this.loadHouseData();
        },
        loadHouseData (arg) {
            const { pageSize, current } = this.houseTable.page;
            let params = { size: pageSize, current: current };
            console.log(params);
            this.loading = true;
            getAction("/erp/despatchType/pageList", params).then((res) => {
                console.log(res);
                if (res.code == 200) {
                    this.houseTable.data = res.data.records;
                    this.houseTable.page.total = res.data.total;
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;
            });
        }
    },
};
</script>
<style lang="scss" scoped>
    ::v-deep {
        .ant-tabs,
        .ant-tabs-content,
        .ant-tabs-tabpane {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            height: 100%;
        }
        .houseTablex td {
            cursor: pointer;
        }
    }
    .goods {
        display: flex;
        justify-content: space-between;
    }
    .goodsTable {
        display: flex;
        flex-grow: 1;
        flex-wrap: wrap;
    }

    .table-box {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        height: calc(100% - 60px);
        border: 1px solid #cacaca;
    }
    .ant-modal {
        width: 500px;
    }
</style>
<style lang="less">
    @import '~@/style/setting/business.less';
</style>