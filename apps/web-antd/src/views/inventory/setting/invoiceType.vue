<!-- 业务设置->发票类型设置 -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="business-big-box" style="margin:2px 8px;">
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :span="2" v-if="permissions.includes('invoiceType:add')">
                            <div class="btns" @click="add">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('invoiceType:edit')">
                            <div class="btns" @click="edit">
                                <a-icon class="btns-icon" type="edit" />
                                <div class="btns-text">修改</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('invoiceType:delete')">
                            <div class="btns" @click="remove">
                                <a-icon class="btns-icon" type="delete" />
                                <div class="btns-text">删除</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div class="resize-table-container" style="width:800px">
                <a-table :row-selection="{selectedRowKeys: selectedKeys, onChange: mergeSelection}" :columns="houseTable.columns" :pagination="houseTable.page" :data-source="houseTable.data" :loading="loading" bordered>
                </a-table>
            </div>
            <!-- <ag-modal-form :form="form" @ok="reload"></ag-modal-form> -->

            <a-modal v-model="editModal" :title="thisId ? '发票类型修改' : '发票类型新增'" width="600px" :dialog-style="{ top: '20px' }">
                <a-form :form="form" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }" @submit="handleSubmit">
                    <a-row :gutter="[8,0]">
                        <a-col :span="12">
                            <a-form-item label="发票类型编码">
                                <a-input autocomplete="off" v-model="code" placeholder="两位纯数字" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="发票类型名称">
                                <a-input autocomplete="off" v-model="name" placeholder="请输入发票类型名称" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="方向">
                                <a-radio-group style="display:flex" @change="handleChange" v-model="type">
                                    <a-radio style="flex:0 0 50%;margin-right:0px;margin-top:10px;" :value="1">
                                        正发票
                                    </a-radio>
                                    <a-radio style="flex:0 0 50%;margin-right:0px;margin-top:10px;" :value="0">
                                        负发票
                                    </a-radio>
                                </a-radio-group>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="税率(%)">
                                <a-input autocomplete="off" v-model="taxRate" placeholder="请输入税率" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
                <template slot="footer">
                    <a-button type="primary" html-type="submit" @click="handleSubmit" v-if="permissions.includes('currency:save')">保存</a-button>
                    <a-button :style="{ marginLeft: '8px' }" @click="hideModal">关闭</a-button>
                </template>
            </a-modal>
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
            editModal: false,
            selectedRows: [],
            selectedKeys: [],

            code: null,//发票类型编码
            name: null,//发票类型名称
            type: 1,//正发票 1  负发票 0
            taxRate: null,//税率
            thisId: null,
            houseTable: this.tableInit({
                data,
                columns: [
                    { title: "发票类型编码", dataIndex: "code" },
                    { title: "发票类型名称", dataIndex: "name" },
                    {
                        title: "方向",
                        dataIndex: "type",
                        customRender: (text) => {
                            return <span>{text == 1 ? "正发票" : "负发票"}</span>;
                        },
                    },
                    {
                        title: "税率", dataIndex: "taxRate",
                        customRender: (text) => {
                            return text + "%";
                        },
                    }
                ],
                formColumns: [
                    {
                        label: "发票类型编码",
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
                                    this.$message.warning('发票类型编码必须是两位纯数字！');
                                    this.form.data.code = '';
                                    return;
                                }
                            }
                        }
                    },
                    {
                        label: "发票类型名称",
                        prop: "name",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                    },

                    {
                        label: "方向",
                        prop: "type",
                        is: "a-radio-group",
                        options: [
                            { label: "正发票", value: 1 },
                            { label: "负发票", value: 0 }
                        ],
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                    },
                    {
                        label: "税率",
                        prop: "taxRate",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                        help: "",
                        on: {
                            blur: () => {
                                let el = /^[0-9]/;
                                let taxRate = this.form.data.taxRate
                                if (!el.test(taxRate)) {
                                    this.$message.warning('税率必须是数字！');
                                    this.form.data.taxRate = '';
                                    return;
                                }
                            }
                        }
                    },

                ],
                onAdd: () => {
                    this.form.show = !this.form.show;
                    this.form.columns = this.houseTable.formColumns;
                    this.form.title = "发票类型新增";
                    this.form.data = {};
                    this.form.url = "/erp/invoiceType/save";
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
                        this.form.title = "发票类型编辑";
                        this.form.url = "/erp/invoiceType/save";
                    });
                },
                onRemove: () => {
                    this.houseTable.remove(() => {
                        let ids = this.houseTable.selectedRows.map((item) => {
                            return item.id;
                        });
                        console.log(ids);
                        postAction("/erp/invoiceType/delete", ids).then((res) => {
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
        this.getList();
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        })
    },
    methods: {
        mergeSelection (key, row) {
            console.log(row, key);
            this.selectedRows = row;
            this.selectedKeys = key;
        },
        add () {
            this.editModal = true;


            this.selectedRows = [];
            this.selectedKeys = [];
            this.thisId = null;
            this.code = null;//发票类型编码
            this.name = null;//发票类型名称
            this.type = 1;//正发票 1  负发票 0
            this.taxRate = null;//税率
        },
        edit () {
            console.log(this.selectedRow);
            if (this.selectedRows.length != 1) {
                this.$message.warning('请选择一条数据');
                return;
            }
            let data = this.selectedRows[0];
            this.thisId = data.id;
            this.code = data.code;//发票类型编码
            this.name = data.name;//发票类型名称
            this.type = data.type;//正发票 1  负发票 0
            this.taxRate = data.taxRate;//税率

            this.editModal = true;
        },
        hideModal () {
            this.editModal = false;
        },
        handleChange (e) {
            this.type = e.target.value;
        },
        remove () {
            let ids = this.houseTable.selectedRows.map((item) => {
                return item.id;
            });
            console.log(ids);
            postAction("/erp/invoiceType/delete", ids).then((res) => {
                if (res.code == 200) {
                    this.selectedRows = [];
                    this.selectedKeys = [];
                    this.$message.success("删除成功");
                    this.getList();
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;
            });
        },
        handleSubmit () {
            let requestData = {
                id: this.thisId,
                code: this.code,//发票类型编码
                name: this.name,//发票类型名称
                type: this.type,//正发票 1  负发票 0
                taxRate: this.taxRate,//税率
            }
            postAction("/erp/invoiceType/save", requestData).then((res) => {
                if (res.code == 200) {
                    this.selectedRows = [];
                    this.selectedKeys = [];
                    this.$message.success("保存成功");
                    this.editModal = false;
                    this.getList();
                } else {
                    // this.$message.warning(res.message);
                }
            });
        },
        getList () {
            const { pageSize, current } = this.houseTable.page;
            let params = { size: pageSize, current: current };
            console.log(params);
            this.loading = true;
            getAction("/erp/invoiceType/pageList", params).then((res) => {
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