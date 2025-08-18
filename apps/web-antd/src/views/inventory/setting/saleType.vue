<!-- 业务设置->销售类型设置 -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="business-big-box" style="margin:2px 8px;">
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :span="2" v-if="permissions.includes('SaleType:add')">
                            <div class="btns" @click="houseTable.onAdd">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('SaleType:edit')">
                            <div class="btns" @click="houseTable.onEdit">
                                <a-icon class="btns-icon" type="edit" />
                                <div class="btns-text">修改</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('SaleType:delete')">
                            <div class="btns" @click="houseTable.onRemove">
                                <a-icon class="btns-icon" type="delete" />
                                <div class="btns-text">删除</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div class="resize-table-container" style="width:800px">
                <a-table :row-selection="houseTable.rowSelection" :columns="houseTable.columns" :pagination="houseTable.page" :data-source="houseTable.data" @change="houseTable.tableChange" :loading="loading" bordered>
                </a-table>
            </div>
            <ag-modal-form :form="form" @ok="reload"></ag-modal-form>
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
                    { title: "销售类型编码", dataIndex: "code" },
                    { title: "销售类型名称", dataIndex: "name" },
                    {
                        title: "是否默认值",
                        dataIndex: "isDefaultValue",
                        customRender: (text) => {
                            return <span>{text == 1 ? "是" : "否"}</span>;
                        },
                    },
                    {
                        title: "参与需求计划运算",
                        dataIndex: "isDemandPlan",
                        customRender: (text) => {
                            return <span>{text == 1 ? "是" : "否"}</span>;
                        },
                    },
                ],
                formColumns: [
                    {
                        label: "销售类型编码",
                        prop: "code",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                        help: "",
                        on: {
                            blur: () => {
                                let el = /^[0-9]{2}$/;
                                let code = this.form.data.code
                                if (!el.test(code)) {
                                    this.$message.warning('销售类型编码必须是两位纯数字！');
                                    this.form.data.code = '';
                                    return;
                                }
                            }
                        }
                    },
                    {
                        label: "销售类型名称",
                        prop: "name",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                    },
                    {
                        label: "是否默认值",
                        prop: "isDefaultValue",
                        is: "a-select",
                        options: [
                            { label: "是", value: 1 },
                            { label: "否", value: 0 }
                        ],
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                    },
                    {
                        label: "参与需求计划运算",
                        prop: "isDemandPlan",
                        is: "a-select",
                        options: [
                            { label: "否", value: 0 },
                            { label: "是", value: 1 }
                        ],
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                    },
                ],
                onAdd: () => {
                    this.form.show = !this.form.show;
                    this.form.columns = this.houseTable.formColumns;
                    this.form.title = "销售类型新增";
                    this.form.data = {
                        isDefaultValue: 1,
                    };
                    this.form.url = "/erp/saleType/save";
                },
                onEdit: () => {
                    let tData = this.houseTable.selectedRows;
                    console.log(this.houseTable.selectedRows);
                    this.houseTable.edit(() => {
                        this.form.show = !this.form.show;
                        this.form.columns = this.houseTable.formColumns;
                        this.form.data = tData[0];
                        this.form.data.isDemandPlan = tData[0].isDemandPlan ? 1 : 0;
                        this.form.data.isDefaultValue = tData[0].isDefaultValue ? 1 : 0;
                        this.form.data.createDate = null;
                        this.form.data.updateDate = null;
                        this.form.title = "销售类型编辑";
                        this.form.url = "/erp/saleType/save";
                    });
                },
                onRemove: () => {
                    this.houseTable.remove(() => {
                        let ids = this.houseTable.selectedRows.map((item) => {
                            return item.id;
                        });
                        console.log(ids);
                        postAction("/erp/saleType/delete", ids).then((res) => {
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
        this.getHouseOptions();
        this.reload();
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    methods: {
        add () {
            this.form.show = !this.form.show;
            this.form.columns = this[this.tabKey].form.columns;
            this.form.title = this[this.tabKey].form.title + "新增";
        },
        reload () {
            this.loadHouseData();
        },
        loadHouseData (arg) {
            const { pageSize, current } = this.houseTable.page;
            let params = { size: pageSize, current: current };
            console.log(params);
            this.loading = true;
            getAction("/erp/saleType/pageList", params).then((res) => {
                console.log(res);
                if (res.code == 200) {
                    this.houseTable.data = res.data.records;
                    this.houseTable.page.total = res.data.total;
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;
            });
        },
        getHouseOptions () {
            let params = { pageSize: -1, type: 2 };
            getAction("/in/rdStyle/pageStyleList", params).then((res) => {
                if (res.code == 200) {
                    let data = res.data.records;
                    for (let i = 0; i < data.length; i++) {
                        options.push({
                            label: data[i].name,
                            value: data[i].id,
                        });
                    }
                }
            });
        },
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