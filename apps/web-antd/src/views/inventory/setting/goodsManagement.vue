<!-- 物料设置（货位管理） -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="business-big-box" style="margin:2px 8px;">
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :span="2" v-if="permissions.includes('goods:add')">
                            <div class="btns" @click="goodsTable.onAdd">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('goods:edit')">
                            <div class="btns" @click="goodsTable.onEdit">
                                <a-icon class="btns-icon" type="edit" />
                                <div class="btns-text">修改</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('goods:delete')">
                            <div class="btns" @click="goodsTable.onRemove">
                                <a-icon class="btns-icon" type="delete" />
                                <div class="btns-text">删除</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div class="resize-table-container clearfix" style="width:800px">
                <a-row :gutter="[0,16]" style="margin-bottom:0px;">
                    <a-col :span="3" style="line-height:32px;text-align:right">仓库名称：</a-col>
                    <a-col :span="21">
                        <a-select :default-value="0" style="width: 150px" @change="handleProvinceChange">
                            <a-select-option v-for="province in warehouseOptions" :key="province.key">
                                {{ province.label }}
                            </a-select-option>
                        </a-select>
                    </a-col>
                </a-row>

                <div class="table-box">
                    <a-table :rowSelection="goodsTable.rowSelection" :columns="goodsTable.columns" :pagination="goodsTable.page" :data-source="goodsTable.data" @change="goodsTable.tableChange" bordered />
                </div>
            </div>
            <ag-modal-form :form="form" @ok="reload" :ruleCode="ruleCode">
                <template slot="hwname">
                    123
                </template>
            </ag-modal-form>
        </div>
    </div>
</template>
<script>
const data = [];
import { mapState } from "vuex";
import { getAction, postAction } from "@/api/manage";
import { getDetail } from "@/api/erp/erpGradeRule"; // 编码规则
import { getPhonetic } from "@/api/common/py";
import table from "@/mixins/table";
//获取汉子首字母
import PY from "@/utils/pinyinUtil/pinyin"

let warehouseOptions = [];
export default {
    mixins: [table],
    data () {
        return {
            warehouseOptions:[],
            ruleCode: 0,//货位编码
            tabKey: "goodsTable",
            loading: false,
            form: {
                show: false,
                data: {},
                title: "",
                columns: []
            },
            houseTable: this.tableInit({
                data,
                columns: [
                    {
                        title: "仓库编码",
                        width: 100,
                        dataIndex: "whCode"
                    },
                    { title: "仓库名称", dataIndex: "whName" },
                    {
                        title: "仓库类型",
                        dataIndex: "whClass",
                        customRender: text => {
                            return (
                                <a-tag>
                                    {text == 1 ? "普通仓" : text == 2 ? "现场仓" : "委外仓"}
                                </a-tag>
                            );
                        }
                    },
                    {
                        title: "货位管理",
                        dataIndex: "storageBin",
                        customRender: text => {
                            return (
                                <a-tag color={text == 1 ? "green" : "red"}>
                                    {text == 1 ? "是" : "否"}
                                </a-tag>
                            );
                        }
                    },
                    { title: "负责人", dataIndex: "whPerson" },
                    { title: "电话", dataIndex: "whTelephone" },
                    { title: "手机", dataIndex: "whMobile" },
                    { title: "地址", width: 200, dataIndex: "whAddress" },
                    { title: "备注", dataIndex: "remarks" },
                    {
                        title: "状态",
                        dataIndex: "status",
                        customRender: text => {
                            return (
                                <a-tag
                                    color={text == 0 ? "green" : text == 1 ? "red" : "yellow"}
                                >
                                    {text == 0 ? "正常" : text == 1 ? "删除" : "停用"}
                                </a-tag>
                            );
                        }
                    }
                ],
                formColumns: [
                    {
                        label: "仓库编码",
                        prop: "whCode",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "仓库名称",
                        prop: "whName",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "仓库类型",
                        prop: "whClass",
                        is: "a-select",
                        options: [
                            { label: "普通仓", value: 1 },
                            { label: "现场仓", value: 2 },
                            { label: "委外仓", value: 3 }
                        ],
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "负责部门",// 所属营销机构
                        prop: "agencies",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "负 责 人",
                        prop: "whPerson",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "电　　话",
                        prop: "whTelephone",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "手　　机",
                        prop: "whMobile",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "货位管理",
                        prop: "storageBin",
                        is: "a-radio-group",
                        options: [
                            { label: "是", value: 1 },
                            { label: "否", value: 0 }
                        ],
                        defaultValue: 1,
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "仓库地址",
                        prop: "whAddress",
                        col: { span: 24 },
                        labelCol: { span: 4 },
                        wrapperCol: { span: 19 }
                    }, {
                        label: "备　　注",
                        prop: "remarks",
                        type: "textarea",
                        labelCol: { span: 4 },
                        wrapperCol: { span: 19 },
                        col: { span: 24 }
                    }
                ],
                onAdd: () => {
                    this.getHouseOptions();//数据刷新 获取仓库
                    this.form.show = !this.form.show;
                    this.form.columns = this.houseTable.formColumns;
                    this.form.title = "仓库新增";
                    this.form.data = {};
                    this.form.url = "/in/warehouse/save";
                },
                onEdit: () => {
                    this.getHouseOptions();//数据刷新 获取仓库
                    let tData = this.houseTable.selectedRows;
                    console.log(this.houseTable.selectedRows);
                    this.houseTable.edit(() => {
                        this.form.show = !this.form.show;
                        this.form.columns = this.houseTable.formColumns;
                        this.form.data = tData[0];
                        this.form.data.createDate = null;
                        this.form.data.updateDate = null;
                        this.form.title = "仓库编辑";
                        this.form.url = "/in/warehouse/save";
                    });
                },
                onRemove: () => {
                    this.houseTable.remove(() => {
                        let ids = this.houseTable.selectedRows.map(item => {
                            return item.id;
                        });
                        console.log(ids);
                        postAction("/in/warehouse/delete", ids).then(res => {
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
                }
            }),
            goodsTable: this.tableInit({
                data,
                columns: [
                    { title: "仓库名称", dataIndex: "warehouseName" },
                    { title: "货位编码", width: 100, dataIndex: "code" },
                    { title: "货位名称", dataIndex: "name" },
                    { title: "备注", dataIndex: "remarks" },
                    {
                        title: "状态",
                        dataIndex: "status",
                        customRender: text => {
                            return (
                                <a-tag
                                    color={text == 1 ? "green" : text == 2 ? "red" : "yellow"}
                                >
                                    {text == 1 ? "正常" : text == 2 ? "删除" : "停用"}
                                </a-tag>
                            );
                        }
                    }
                ],
                formColumns: [
                    {
                        label: "编码规则",
                        prop: "rules",
                        col: { span: 24 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                        slotCol: true
                    },
                    {
                        label: "仓库",
                        prop: "warehouseId",
                        is: "a-select",
                        options: warehouseOptions,
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "货位编码",
                        prop: "code",
                        col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                    },
                    {
                        label: "货位名称", prop: "name", col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 },
                        on: {
                            change: this.getPhonetic
                        },
                    },
                    {
                        label: "首拼码", prop: "shorthand", col: { span: 12 },
                        labelCol: { span: 8 },
                        wrapperCol: { span: 14 }
                    },
                    {
                        label: "备注",
                        prop: "remarks",
                        type: "textarea",
                        labelCol: { span: 4 },
                        wrapperCol: { span: 19 },
                        col: { span: 24 }
                    }
                ],
                onAdd: () => {
                    this.form.show = !this.form.show;
                    this.form.columns = this.goodsTable.formColumns;
                    this.form.title = "货位新增";
                    this.form.url = "/in/inventoryLocation/save";
                    this.form.data = {};
                },
                onEdit: () => {
                    let tData = this.goodsTable.selectedRows;
                    this.goodsTable.edit(() => {
                        this.form.show = !this.form.show;
                        this.form.columns = this.goodsTable.formColumns;
                        this.form.title = "货位编辑";
                        this.form.data = tData[0];
                        this.form.data.createDate = null;
                        this.form.data.updateDate = null;
                        this.form.url = "/in/inventoryLocation/save";
                    });
                },
                onRemove: () => {
                    this.goodsTable.remove(() => {
                        let ids = this.goodsTable.selectedRows.map(item => {
                            return item.id;
                        });
                        console.log(ids);
                        postAction("/in/inventoryLocation/delete", ids).then(res => {
                            if (res.code == 200) {
                                this.loadGoodsData();
                                this.goodsTable.selectedRows = [];
                                this.goodsTable.rowSelection.selectedRowKeys = [];
                                this.$message.success("删除成功");
                            } else {
                                // this.$message.warning(res.message);
                            }
                            this.loading = false;
                        });
                    });
                },
                onTablechage: () => {
                    this.loadGoodsData();
                }
            }),
            goodsName: '',
            options: [
                {
                    label: '全部',
                    key: 0
                }
            ],
            
        };
    },
    activated () {
        this.getHouseOptions();
        this.reload();
        this.getCodeDetail();
    },
    watch: {
        goodsName (val) {
            console.log(val);
        }
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    methods: {
        getPhonetic () {
            // getPhonetic({ keyword: this.form.data.name }).then(response => {
            //     if (response.code === 200) {
            //         this.$nextTick(() => {
            //             this.form.data.shorthand = response.message;
            //             this.goodsName = this.form.data.shorthand;
            //         })
            //     }
            // })
            this.form.data.shorthand = PY.firstPY(this.form.data.name);
        },
        //获取编码规则(仓库编码)
        getCodeDetail () {
            getDetail({ code: "inventoryLocation" }).then(res => {
                if (res.code == 200) {
                    let code = res.data.codingRule;
                    console.log("code", code);
                    this.ruleCode = this.codeStyle(code);
                    this.goodsTable.formColumns[0].help = `编码规则：${this.ruleCode}`;
                }
            });
        },
        //处理编码规则样式
        codeStyle (code) {
            let codeText = "";
            for (let i = 0; i < code.length; i++) {
                let codeNum = code.substring(i, i + 1);
                for (let index = 0; index < codeNum; index++) {
                    codeText += "*";
                }
                codeText += " ";
            }
            return codeText;
        },
        add () {
            this.form.show = !this.form.show;
            this.form.columns = this[this.tabKey].form.columns;
            this.form.title = this[this.tabKey].form.title + "新增";
        },
        removeGoods () {
            this.goodsTable.remove(() => {
                console.log(this.goodsTable.selectedRows);
                let ids = [];
                for (let i = 0; i < this.goodsTable.selectedRows.length; i++) {
                    ids.push(this.goodsTable.selectedRows[i].id);
                }
                postAction("/in/inventoryLocation/delete", ids).then(res => {
                    console.log(res);
                    if (res.code == 200) {
                        this.loadGoodsData();
                        this.goodsTable.selectedRows = [];
                        this.$message.success("删除成功");
                    } else {
                        // this.$message.warning(res.message);
                    }
                    this.loading = false;
                });
            });
        },
        reload () {
            // this.loadHouseData();
            this.loadGoodsData();
        },
        loadHouseData (arg) {
            const { pageSize, current } = this.houseTable.page;
            let params = { size: pageSize, current: current, storageBin: 1 };
            console.log(params);
            this.loading = true;
            getAction("/in/warehouse/pageList", params).then(res => {
                console.log("查询需要货位管理的仓库：",res);
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
            let params = {
                size: 500,
                storageBin: 1 
            };
            getAction("/in/warehouse/pageList", params).then(res => {
                if (res.code == 200) {
                    let data = res.data.records;
                    warehouseOptions.length = 0;
                    this.warehouseOptions.length = 0;
                    this.warehouseOptions.push(
                        {
                            label: '全部',
                            key: 0
                        }
                    );
                    for (let i = 0; i < data.length; i++) {
                        warehouseOptions.push({
                            label: data[i].whName,
                            value: data[i].id
                        })
                        this.warehouseOptions.push({
                            label: data[i].whName,
                            key: data[i].id
                        });
                    }
                }
            });
        },
        loadGoodsData (id) {
            const { pageSize, current } = this.goodsTable.page;
            //== const pageSize = this.goodsTable.page.pageSize

            let params = { size: pageSize, current: current, warehouseId: id == 0 ? '' : id };
            this.loading = true;
            getAction("/in/inventoryLocation/pageList", params).then(res => {
                console.log(res);
                if (res.code == 200) {
                    this.goodsTable.data = res.data.records;
                    this.goodsTable.page.total = res.data.total;
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;
            });
        },
        handleProvinceChange (val) {
            this.loadGoodsData(val)
        }
    }
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
    }
    .ant-modal {
        width: 500px;
    }
</style>
<style lang="less">
    @import '~@/style/setting/business.less';
</style>