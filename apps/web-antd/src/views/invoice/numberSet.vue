<template>
    <nly-content-wrapper class="a-base-container" v-if="queryData" :style="queryData[0] == 'CRM'?{'padding-top':'0px'}:''">
        <div class="flex number-set" style="margin:10px;border:1px solid #ccc;height:100%;">
            <!-- 树形菜单 -->
            <div class="tree-box">
                <span style="font-size:14px">所有单据</span>
                <a-tree class="tree" show-line :tree-data="numberSetTree" @select="treeSelect" @expand="treeExpand" :expandedKeys="expandedNumberSetKeys" :selected-keys="selectedNumberSetKeys">
                    <a-icon slot="switcherIcon" type="down" />
                    <template slot="title" slot-scope="{ title }">
                        <span>{{ title }}</span>
                    </template>
                </a-tree>
            </div>
            <div class="resize-table-container ">
                <!-- <div v-show="isCM" style="width:200px;margin-bottom:10px;">
                    <a-button type="primary">新增</a-button>
                </div> -->
                <div class="btn-wrapper" style="border-bottom:none;">
                    <a-row v-show="isCM" style="width:60px;" :span="8" class="text-center clearfix btn-box">
                        <a-col class="btn-item">
                            <div class="btns" @click="addCode">
                                <a-icon class="btns-icon" type="save" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                    </a-row>
                </div>
                <a-table :columns="columns" :components="components" :data-source="data" :scroll="{ x: 500, y: 600 }" bordered :pagination="false">
                    <template slot="operation" slot-scope="text,record,index">
                        <div class="row justify-content-md-center">
                            <span class="col"></span>
                            <span class="col-sm-auto col-md-auto col-lg-auto col-xl-auto">
                                <a href="javascript:;" title="编辑" class="mr-1 col-1" @click="showModal(record)">
                                    <i class="fa fa-edit" style="color: #69aa46;"></i>
                                </a>
                            </span>
                            <span v-if="record.moduleCode == 'CM' && index > 2" class="col-sm-auto col-md-auto col-lg-auto col-xl-auto">
                                <a href="javascript:;" title="删除" class="mr-1 col-1" @click="removeCode(record)">
                                    <i class="fa fa-trash" style="color: rgb(221, 90, 67);"></i>
                                </a>
                            </span>
                            <span class="col"></span>
                        </div>
                    </template>
                </a-table>
            </div>
        </div>
        <!-- modal 弹窗  -->
        <a-modal v-model="editModal" centered title="编辑编码" width="900px">
            <div id="components-form-demo-advanced-search">
                <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 24 }" @submit="handleSubmit">
                    <a-row :gutter="24">
                        <a-col :span="10" :push="2">
                            <a-form-item label="模块名称">
                                <a-input v-decorator="['name', { rules: [{ required: true, message: '模块名称不能为空' }] }]" placeholder="请输入模块名称" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="10" :push="2">
                            <a-form-item label="默认前缀">
                                <a-input v-decorator="['defaultCode', { rules: [{ required: true, message: '默认前缀不能为空' }] }]" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="10" :push="2">
                            <a-form-item label="当前前缀">
                                <a-input v-decorator="['currentCode', { rules: [{ required: true, message: '当前前缀不能为空' }] }]" placeholder="最多三个字母" style="text-transform:uppercase;" :maxLength="3" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :push="2" :span="10">
                            <a-form-item label="中间位">
                                <a-select v-model="editItem.median">
                                    <a-select-option :value="1">年月日</a-select-option>
                                    <a-select-option :value="2">年月</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="10" :push="2">
                            <a-form-item label="流水位">
                                <a-input v-model="editItem.streamNumber" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="10" :push="2">
                            <a-form-item label="起始值">
                                <a-input v-model="editItem.startValue" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="11" :push="2">
                            <a-form-item label="启用分割符(-)">
                                <a-checkbox :value="1" v-model="editItem.isSplitMark" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <template slot="footer">
                <a-button type="primary" html-type="submit" @click="handleSubmit">保存</a-button>
                <a-button :style="{ marginLeft: '8px' }" @click="hideModal">关闭</a-button>
            </template>
        </a-modal>
    </nly-content-wrapper>
</template>
<script>

import { mapState } from "vuex";
import { DisAbleFirfoxDrag } from "@/utils/browser";
import { components } from "@/utils/antTableComponents";
import { parentList as listNumberSet, pageList, save, remove } from "@/api/erp/mumberSet";
import { classPageListToTree, searchInTreeData } from "@/utils/tree";
import Sortable from "sortablejs";

export default {
    data () {
        const columns = [
            {
                title: "模块编码",
                dataIndex: "moduleCode",
                key: "moduleCode",
                width: 80
            },
            {
                title: "单据名称",
                dataIndex: "name",
                align: "left",
                key: "name",
                width: 80,
                customRender: (text, row, index) => {
                    return (
                        <span>
                            <i class={row.menuIcon || ""} style="margin-right:5px;"></i>
                            <a href="javascript:;" onClick={() => this.showModal(row)}>
                                {text}
                            </a>
                        </span>
                    );
                }
            },
            {
                title: "默认前缀",
                dataIndex: "defaultCode",
                key: "defaultCode",
                width: 80
            },
            {
                title: "当前前缀",
                dataIndex: "currentCode",
                key: "currentCode",
                width: 80
            },
            {
                title: "中间位",
                dataIndex: "median",
                key: "median",
                width: 80,
                customRender: (text) => {
                    const median = ["年月日", "年月", "年"];
                    return median[text - 1];
                }
            },
            {
                title: "流水位数",
                dataIndex: "streamNumber",
                key: "streamNumber",
                width: 80
            },
            {
                title: "预览",
                dataIndex: "yl",
                key: "yl",
                width: 180,
                customRender: (text, row, index) => {
                    return row.currentCode + "202101010001";
                }
            },
            {
                title: "操作",
                dataIndex: "o",
                key: "o",
                width: 80,
                scopedSlots: { customRender: 'operation' },
            }
        ];

        //表格 头部 可伸缩
        this.components = components(columns);
        return {
            data: [],
            columns,
            moduleCode: 'ARAP',
            numberSetTree: [],
            expandedNumberSetKeys: [],
            selectedNumberSetKeys: [],
            editModal: false,
            editItem: {
                median: 1
            },
            form: this.$form.createForm(this, { name: "advanced_search" }),
            isCM: false,
            queryData: null,
        };
    },
    activated () {
        this.listNumberSet();
    },
    created () {

    },
    computed: {
        //选择单据的名称
        selectedInvoiceName: function () {
            // console.log("AntMenu_this.$route",this.$route);
            return [this.$route.meta.title || "未选择单据"];
        },
        //选择单据的id（目前是页面的id）
        selectedInvoiceId: function () {
            // console.log("AntMenu_this.$route",this.$route);
            return [this.$route.meta.id || ""];
        },
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    watch: {
        $route: {
            handler: function (to, from) {
                // console.log('路由发生变化');
                //from 对象中包含当前地址
                //to 对象中包含目标地址
                //其实还有一个next参数的，这个参数是控制路由是否跳转的，如果没写，可以不用写next()来代表允许路由跳转，如果写了就必须写next(),否则路由是不会生效的。
                DisAbleFirfoxDrag();
                this.listNumberSet();
            }
        }
    },
    methods: {
        //重新加载 单据数据
        reloadData () {
            this.list();
            this.listProperty();
        },
        //选择树
        treeSelect (selectedKeys, info) {
            console.log(selectedKeys[0]);
            this.selectedNumberSetKeys = [selectedKeys[0]]
            this.moduleCode = selectedKeys[0];
            this.codeList();
        },
        //新增编码规则
        addCode () {
            this.form.resetFields();
            this.editItem = {};
            this.editModal = true;
        },
        //删除编码规则
        removeCode (record) {
            let _this = this;
            this.$confirm({
                title: "提示",
                content: (
                    <span>
                        是否确认删除 <span style="color:red">{record.name}</span>?
                    </span>
                ),
                onOk () {
                    remove({ id: record.id }).then((response) => {
                        if (response.code === 200) {
                            _this.$message.success('删除成功');
                            _this.codeList();

                        } else {
                            // _this.$message.warning(response.message);
                        }
                    }).catch((e) => {
                        // _this.$message.error('请求出错', 1)
                    })
                },
                onCancel () { },
            });
        },
        codeList () {
            pageList({ moduleCode: this.moduleCode }).then(response => {
                this.data = response.data.records;
                if (this.moduleCode == 'CM') {
                    this.isCM = true;
                } else {
                    this.isCM = false;
                }
                this.queryData = this.$route.path.split('/')[3].split(',');
                let pageCheck = this.queryData;
                // this.numberSetTree = [...map.values()];


                if (pageCheck.length > 0) {
                    this.data = this.data.filter((res) => {
                        return res.moduleCode == pageCheck[0] || res.moduleCode == pageCheck[1] || res.moduleCode == pageCheck[2];
                    });
                } else {
                    this.data = this.data.filter((res) => {
                        return res.moduleCode == pageCheck;
                    });
                }

            });
        },
        treeExpand (expandedKeys) {
            console.log("展开的节点1：", this.expandedNumberSetKeys);
            this.expandedNumberSetKeys = expandedKeys;
            console.log("展开的节点：", expandedKeys);
        },
        //加载 单据编码
        listNumberSet () {
            let type = this.$route.path.split('/')[3];
            if (type) {
                this.moduleCode = this.$route.path.split('/')[3].split(',')[0];
            } else {
                this.moduleCode = null;
            }
            listNumberSet({ moduleCode: this.moduleCode }).then(response => {
                if (response.code === 200) {
                    const { data } = response;
                    let map = new Map();
                    data.forEach(item => {
                        let { moduleName, moduleCode, name } = item;
                        let firstLevel = map.get(moduleName);
                        if (!firstLevel) {
                            firstLevel = new Object();
                            firstLevel.title = moduleName;
                            firstLevel.key = moduleCode;
                            firstLevel.children = [];
                            map.set(moduleName, firstLevel);
                        }
                    });
                    let pageCheck = this.$route.path.split('/')[3].split(',');
                    // this.numberSetTree = [...map.values()];


                    if (pageCheck.length > 0) {
                        this.numberSetTree = [...map.values()].filter((res) => {
                            return res.key == pageCheck[0] || res.key == pageCheck[1] || res.key == pageCheck[2];
                        });
                    } else {
                        this.numberSetTree = [...map.values()].filter((res) => {
                            return res.key == pageCheck;
                        });
                    }

                    this.selectedNumberSetKeys = [this.numberSetTree[0].key];
                    this.moduleCode = this.numberSetTree[0].key;
                    this.codeList();
                }
            }).catch(error => { });
        },
        showModal (editItem) {
            console.log("editItem", editItem);
            this.editItem = { ...editItem };
            this.editModal = true;
            this.form = this.$form.createForm(this, {
                mapPropsToFields: () => {
                    return {
                        name: this.$form.createFormField({
                            value: this.editItem.name
                        }),
                        defaultCode: this.$form.createFormField({
                            value: this.editItem.defaultCode
                        }),
                        currentCode: this.$form.createFormField({
                            value: this.editItem.currentCode
                        })
                    };
                }
            });
        },
        add () {
            this.editModal = true;
        },
        hideModal () {
            this.editModal = false;
        },
        handleSubmit (e) {
            e.preventDefault();
            this.form.validateFields((err, values) => {
                if (!err) {
                    this.editItem.name = values.name;
                    this.editItem.defaultCode = values.defaultCode;
                    this.editItem.currentCode = values.currentCode;
                    this.editItem.createDate = null;
                    this.editItem.updateDate = null;

                    if (this.isCM) {
                        this.editItem.moduleName = '合同管理';
                        this.editItem.moduleCode = 'CM';
                    }
                    save(this.editItem).then(response => {
                        if (response.code == 200) {
                            this.$message.success("保存成功");
                            this.codeList();
                            this.hideModal();
                        }
                    });
                }
            });
        },
    }
};
</script>
<style lang="less" >
    @import '~@/style/setting/btn.less';
    .number-set {
        .tree-box {
            width: 240px;
            border-right: 1px solid #ccc;
            height: 100%;
            overflow-y: auto;
            padding: 10px;
            .tree {
                margin-left: 10px;
            }
            .flex {
                align-items: center;
                margin: 5px 0px 10px;
            }
            .title {
                text-align: center;
                font-size: 18px;
            }
            button {
                margin-left: 10px;
            }
        }
    }

    .resize-table-container {
        width: calc(100% - 250px);
        padding: 10px;
    }
    .menu-style {
        padding: 5px;
        width: 200px;
    }
    .ant-menu-item:hover {
        background-color: rgb(236, 236, 236) !important;
    }
    .ant-checkbox-group,
    .ant-radio-group {
        display: flex;
        flex-wrap: wrap;
    }
    .ant-checkbox-wrapper,
    .ant-radio-wrapper {
        margin-left: 0px;
        margin-right: 8px;
        font-size: 13px;
    }
    .w100pencent {
        width: 100%;
    }
    .w100pencent-30 {
        width: calc(100% - 30px);
    }
    .test {
        border: 1px solid #ccc;
    }
    .drag-item {
        width: 200px;
        height: 50px;
        line-height: 50px;
        margin: auto;
        position: relative;
        background: #ddd;
        margin-top: 20px;
    }
    .ghostClass {
        opacity: 1;
    }
    .bottom {
        width: 200px;
        height: 50px;
        position: relative;
        background: blue;
        top: 2px;
        left: 2px;
        transition: all 0.5s linear;
    }

    .ant-advanced-search-form {
        padding: 24px;
        background: #fbfbfb;
        .form-inline label {
    }
</style>