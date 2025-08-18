<!-- 基础设置->存货分类 -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="big-main-wrapper warehouse-type-wrapper" style="margin:2px 8px;">
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :span="2" v-if="permissions.includes('rdType:add')">
                            <div class="btns" @click="editDataFun">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('rdType:edit')">
                            <div class="btns" @click="dblclickFun">
                                <a-icon class="btns-icon" type="edit" />
                                <div class="btns-text">修改</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('rdType:delete')">
                            <div class="btns" @click="remove">
                                <a-icon class="btns-icon" type="delete" />
                                <div class="btns-text">删除</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div class="content-tree-wrapper">
                <div class="tree-box not-copy" style="height:calc(100% - 20px);padding-top:10px;">
                    <a-tree show-line default-expand-all :treeData="typsTreeData" v-if="typsTreeData.length>0" @dblclick="dblclickFun" @select="onSelect" :replaceFields="replaceFields">
                        <a-icon slot="switcherIcon" type="down" />
                    </a-tree>
                </div>

                <edit-model ref="editmodel" :editData="thisData" @ok="getData"></edit-model>
            </div>
        </div>
    </div>
</template>
<script>

import { mapState } from "vuex";
import { getAction, postAction } from "@/api/manage";
import editModel from "./model/inventoryCateGoryEdit";
import { classPageListToTree, searchInTreeData } from "@/utils/tree";

const columns = [
    {
        title: "出入库类别编码",
        dataIndex: "code",
        key: "code",
        width: 100
    },
    {
        title: "出入库类别名称",
        dataIndex: "name",
        key: "name",
        width: 100
    },
    {
        title: "类别",
        dataIndex: "type",
        key: "type",
        width: 100,
        scopedSlots: { customRender: "type" }
    }
];

export default {
    data() {
        return {
            data: [],
            columns, // 表格表头
            replaceFields: {
                // tree 别名
                title: "showname",
                key: "code"
            },
            typsTreeData: [], // 树形数据
            pageSize: -1, // 每页多少条数据
            current: 1, // 当前页
            thisData: [], // 当前选中的数据
            visible: false, // 弹出框默认隐藏
            putStorage: [], // 入库
            outbound: [], // 出库
            selectedKeys: [],
            selectedRows: [],
        };
    },
    created() {
        this.getData();
        // this.removeData();
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    methods: {
        dblclickFun() {
            if (this.selectedKeys.length < 1) {
                this.$message.warning('请选择一条数据');
                return;
            }
            this.$refs.editmodel.edit();
        },
        onSelect(keys, event) {
            this.selectedKeys = keys;
            // 点击树节点触发
            console.log("Trigger Select", keys, event);
            this.selectedRows = event;
            if (keys == "") {
                return;
            } else {
                //修改
                this.thisData = JSON.parse(JSON.stringify(event.node.dataRef, ['id', 'type', 'name', 'code', 'parentId']))
                console.log(this.thisData);
            }
        },
        editDataFun() {
            //新增
            this.$refs.editmodel.add({
                type: '1',
                id: null,
            })
        },
        treeFormate() {
            // tree 数据的组装
            // this.putStorage = [];
            // this.outbound = [];
            // let typsTreeData = [
            //     {
            //         showname: '出入库类别',
            //         name: "出入库类别",
            //         code: "0",
            //         children: [
            //             {
            //                 showname: "(1)入库",
            //                 name: "入库",
            //                 code: "1",
            //                 children: this.putStorage
            //             },
            //             {
            //                 showname: "(2)出库",
            //                 name: "出库",
            //                 code: "2",
            //                 children: this.outbound
            //             }
            //         ]
            //     }
            // ];

            // for (let i = 0; i < this.data.length; i++) {
            // let d = this.data[i];
            // if (d.type == 1) {
            //     this.$set(d, 'showname', `(${d.code})${d.name}`);
            //     this.putStorage.push(d);
            // } else {
            //     this.$set(d, 'showname', `(${d.code})${d.name}`)
            //     this.outbound.push(d);
            // }
            // }

            const childrenNav = [];
            classPageListToTree(this.data, childrenNav, 0);

            //添加showTitle处理后的data
            this.typsTreeData = [
                {
                    title: "存货分类",
                    showname: "存货分类",
                    key: "",
                    children: this.getTreeData(childrenNav)
                }
            ];
        },
        //递归添加显示的tree title
        getTreeData(data) {
            for (let i = 0; i < data.length; i++) {
                let element = data[i];
                this.$set(
                    element,
                    "showname",
                    `(${element.code}) ${element.name}`
                );
                if (element.children) {
                    this.getTreeData(element.children);
                }
            }
            return data;
        },
        getData() {
            // 获取收发类别数据
            const { pageSize, current } = this;
            let params = { size: pageSize, current: current };
            getAction("/in/inventoryCategory/getInventoryCategoryList", params).then(res => {
                if (res.code == 200) {
                    this.data = res.data;
                    this.treeFormate();
                } else {
                    // this.$message.warning(res.message);
                }
            });
        },
        remove() {
            if (this.selectedKeys.length != 1) {
                this.$message.warning("请选择一条数据");
                return;
            }
            console.log(this.selectedRows);
            let that = this;
            this.$confirm({
                title: `是否确认删除 ${this.selectedRows.node.dataRef.name}`,
                content: "",
                onOk() {
                    getAction("/in/inventoryCategory/delete", { id: that.selectedRows.node.dataRef.id }).then(res => {
                        if (res.code == 200) {
                            that.selectedKeys = [];
                            that.$message.success("删除成功");
                            that.getData();
                        } else {
                            that.$message.warning(res.message);
                        }
                    });
                },
                onCancel() { }
            });
        },
    },
    components: {
        editModel
    }
};
</script>
<style lang="less" scoped>
.content-box {
    height: 100%;
    // width: 240px;
    // display: flex;
    flex-flow: column;
    .tree-box {
        height: 100%;
        width: auto;
        margin-right: 10px;
        background: #efefef;
        padding: 10px;
        overflow-y: auto;
    }
    .table-box {
        text-align: right;
        .btn-clss {
            margin: 10px 0;
        }
    }
}
.big-main-wrapper .tree-box {
    width: 250px;
}
.btn-wrapper {
    // min-height: 52px;
    // border-bottom: 1px solid rgba(173, 173, 173, 0.5);
    margin-bottom: 5px;
    .btns {
        font-size: 14px;
        cursor: pointer;
        overflow: hidden;
    }
    .btns-text {
        margin-top: -2px;
        height: 20px;
        overflow: hidden;
    }
    .btns-icon {
        font-size: 22px;
        color: rgb(24, 144, 255);
    }
    .btns:hover {
        .btns-icon {
            color: rgb(45, 85, 216);
        }
        font-size: 14px;
        transition: all 0.2s;
    }
    .btns:active {
        animation: btns-transform 0.1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
}
@keyframes btns-transform {
    10%,
    90% {
        transform: (translate3d(-1px, 0px, 0));
    }
    20%,
    80% {
        transform: (translate3d(2px, 0px, 5px));
    }
    30%,
    50%,
    70% {
        transform: (translate3d(-4px, 0px, -8px));
    }
    40%,
    60% {
        transform: (translate3d(4px, 0px, 8px));
    }
}
</style>
<style lang="less">
@import "~@/style/setting/inventory.less";
.warehouse-type-wrapper {
    margin: 0px;
}
</style>