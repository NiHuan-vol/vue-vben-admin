<!--物料设置（物料分类）-->
<template>
    <div class="content-wrapper a-base-container">
        <div class="big-main-wrapper">
            <!-- <div class="btn-wrapper">
            <a-button class="btn" type="primary" @click="add">新建</a-button>
        </div> -->
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :span="2" v-if="permissions.includes('classification:add')">
                            <div class="btns" @click="add">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('classification:edit')">
                            <div class="btns" @click="edit">
                                <a-icon class="btns-icon" type="edit" />
                                <div class="btns-text">修改</div>
                            </div>
                        </a-col>
                        <a-col :span="2" v-if="permissions.includes('classification:delete')">
                            <div class="btns" @click="deleteClass">
                                <a-icon class="btns-icon" type="delete" />
                                <div class="btns-text">删除</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div class="content-tree-wrapper">
                <div class="tree-box" style="width:auto;padding-top:10px;">
                    <a-tree v-if="data.length > 0" show-line :tree-data="data" :replaceFields="replaceFields" defaultExpandAll @select="clickTreeSelect" @rightClick="rightClick">
                        <a-icon slot="switcherIcon" type="down" />
                    </a-tree>
                </div>
            </div>
            <a-modal title="title" :visible="visible" @ok="handleOk" @cancel="handleCancel" :width="800">
                <houserModal></houserModal>
            </a-modal>
            <div class="a-button-bar" v-show="false">
                <div>
                    <!-- <a-button type="primary" @click="edit">设置</a-button>
        <a-button type="primary" @click="add">打印</a-button>
        <a-button type="primary" @click="edit">删除</a-button> -->
                    <!-- <a-button type="primary" @click="edit">编辑</a-button> -->
                    <a-button type="primary" @click="add">新建</a-button>
                </div>
            </div>
            <a-table v-show="false" :columns="columns" :data-source="data" bordered :pagination="false" :scroll="{ x: 150 }" :expandedRowKeys="tableExplandKey">
            </a-table>
            <drag-modal :visible="parentModal" @cancel="()=>{parentModal = false;}" title="上级物料分类" centered width="360px">
                <div style="height: 350px;overflow-y:scroll;">
                    <a-input-search style="margin-bottom: 8px" placeholder="物料分类名称" @change="onChange" />
                    <a-tree :tree-data="data" :show-line="true" @select="onTreeSelect" defaultExpandAll />
                </div>
                <template slot="footer">
                    <a-button type="primary" html-type="submit" @click="selectParentData">确定</a-button>
                    <a-button :style="{ marginLeft: '8px' }" @click="
            () => {
              parentModal = false;
            }
          ">关闭</a-button>
                </template>
            </drag-modal>

            <drag-modal v-model="editModal" @cancel="()=>{editModal = false;}" :title="editItem.id ? '编辑物料分类' : '新增物料分类'" centered width="600px">
                <div id="components-form-demo-advanced-search">
                    <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }" @submit="handleSubmit">
                        <!-- <div class="line" style="color:#1980Ff;font-size:15px;">基本信息</div> -->
                        <a-row :gutter="24">
                            <a-col :span="14" :push="3">
                                <label for="" class="code-rules">编码规则：
                                    <span class="code-text">{{ ruleCode }}</span>
                                </label>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="20" :push="1">
                                <a-form-item label="上级分类">
                                    <a-input-search v-model="editItem.parentName" placeholder="请选择上级分类" read-only @click="
                    () => {
                      this.parentModal = true;
                    }
                  " @search="
                    () => {
                      this.parentModal = true;
                    }
                  " />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="20" :push="1">
                                <a-form-item label="分类编码">
                                    <a-input v-decorator="[
                    'classCode',
                    { rules: [{ required: true, message: '分类编码不能为空' }] }
                  ]" placeholder="请输入分类编码" :disabled="isDisabled" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="20" :push="1">
                                <a-form-item label="分类名称">
                                    <a-input v-decorator="[
                    'className',
                    { rules: [{ required: true, message: '分类名称不能为空' }] }
                  ]" placeholder="请输入分类名称" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="24" style="margin-top:20px;font-size:12px;">
                                一般按照物料本身的属性进行分类，如：钢材、五金机电、电线电缆、电器。
                            </a-col>
                        </a-row>
                    </a-form>
                </div>
                <template slot="footer">
                    <a-button type="primary" html-type="submit" @click="handleSubmit" v-if="permissions.includes('classification:save')">保存</a-button>
                    <!-- <a-button type="danger" v-show="oldTreeData.classEnd == true" @click="deleteTree">删除</a-button> -->
                    <a-button :style="{ marginLeft: '8px' }" @click="() => { editModal = false; }">关闭</a-button>
                </template>
            </drag-modal>
        </div>
    </div>
</template>
<script>
import { mapState } from "vuex";
import { classPageListToTree, searchInTreeData } from "@/utils/tree";
import { save, list, deleteInventoryClass } from "@/api/inventory/inventoryClass";
import { getDetail } from "@/api/erp/erpGradeRule";
let treeAreaData = [];
let keyMap = new Map();

export default {
    data () {
        const columns = [
            {
                title: "分类名称",
                dataIndex: "className",
                align: "left",
                customRender: (text, row, index) => {
                    return <span title={row.treeNames}>{text}</span>;
                }
            },
            {
                title: "分类编码",
                align: "left",
                dataIndex: "classCode"
            },
            {
                title: "级次",
                dataIndex: "classGrade"
            },
            {
                title: "备注",
                dataIndex: "remarks"
            },
            {
                title: "操作",
                dataIndex: "o",
                key: "o",
                customRender: (text, row, index) => {
                    return (
                        <div class="row justify-content-md-center">
                            <span class="col"></span>
                            <span class="col-sm-auto col-md-auto col-lg-auto col-xl-auto">
                                <a
                                    href="javascript:;"
                                    title="编辑分类"
                                    class="mr-1 col-1"
                                    onClick={() => this.edit(row)}
                                >
                                    <i class="fa fa-edit" style="color: #69aa46;"></i>
                                </a>
                                {!row.classEnd == 0 ? (
                                    <a
                                        href="javascript:;"
                                        title="删除分类"
                                        class="mr-1 "
                                        onClick={() => this.deleteClass(row)}
                                    >
                                        <i class="fa fa-trash-alt" style="color: #dd5a43;"></i>
                                    </a>
                                ) : null}
                            </span>
                            <span class="col"></span>
                        </div>
                    );
                }
            }
        ];
        return {
            form: this.$form.createForm(this, { name: "advanced_search" }),
            checkedKeys: [],
            checkedData: {},//当前选中的数据
            columns,
            data: [],
            editItem: {
                remarks: "",
                parentId: null, //上级id
                parentName: "" //上级名称
            },
            editModal: false, //form弹窗
            parentModal: false, //上级弹窗
            parentData: {},
            ruleCode: "", //规则编码
            tableExplandKey: [],

            showLine: true,
            oldTreeData: {},
            replaceFields: {
                children: "children",
                title: "showTitle"
            },
            clientX: "",
            clientY: ""
        };
    },
    mounted () {
        this.PageList();
        this.getCodeDetail();
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    methods: {
        PageList () {
            console.log("============");
            this.data = [];
            const { postData } = this;
            list(postData)
                .then(response => {
                    if (response.code == 200) {
                        const { data } = response;
                        for (let i = 0; i < response.data.length; i++) {
                            const node = response.data[i];
                            keyMap.set(node.id, node);
                            this.tableExplandKey.push(node.id);
                        }

                        const childrenNav = [];
                        classPageListToTree(response.data, childrenNav, 0);

                        //添加showTitle处理后的data
                        // this.data = this.getTreeData(childrenNav);
                        this.data = [
                            {
                                title: "物料分类",
                                showTitle: "物料分类",
                                key: "",
                                children: this.getTreeData(childrenNav)
                            }
                        ];
                    }
                })
                .catch(error => { });
        },
        rightClick (event) {
            // console.log(event)
            // console.log(event.node.dataRef)
            // this.clientX = event.event.clientX + 'px';
            // this.clientY = event.event.clientY + 'px';
            // console.log( this.clientX,this.clientY)
        },
        //递归添加显示的tree title
        getTreeData (data) {
            for (let i = 0; i < data.length; i++) {
                let element = data[i];
                this.$set(
                    element,
                    "showTitle",
                    `(${element.classCode}) ${element.title}`
                );
                if (element.children) {
                    this.getTreeData(element.children);
                }
            }
            return data;
        },
        add () {
            this.editModal = true;
            let item = this.checkedData;
            console.log(this.checkedData);
            if (this.checkedKeys.length > 0) {
                this.editItem = {
                    remarks: "",
                    parentId: item.id, //本级id
                    parentName: keyMap.get(item.id)
                        ? keyMap.get(item.id).className
                        : "" //上级名称
                };
            } else {
                this.editItem = {
                    remarks: "",
                    parentId: null, //上级id
                    parentName: "" //上级名称
                };
            }

            this.form = this.$form.createForm(this, {
                mapPropsToFields: () => {
                    return {
                        className: this.$form.createFormField({
                            value: ""
                        }),
                        classCode: this.$form.createFormField({
                            value: item.classCode
                        })
                    };
                }
            });
        },
        edit () {
            console.log(this.checkedKeys);
            if (this.checkedKeys.length == 0) {
                this.$message.warning('请选中一条数据');
                return;
            }
            let item = this.checkedData;
            this.editModal = true;
            this.editItem = {
                id: item.id,
                remarks: item.remarks,
                parentId: item.parentId, //上级id
                parentName: keyMap.get(item.parentId)
                    ? keyMap.get(item.parentId).className
                    : "" //上级名称
            };
            this.form = this.$form.createForm(this, {
                mapPropsToFields: () => {
                    return {
                        className: this.$form.createFormField({
                            value: item.className
                        }),
                        classCode: this.$form.createFormField({
                            value: item.classCode
                        })
                    };
                }
            });
        },
        handleSubmit (e) {
            e.preventDefault();
            this.form.validateFields((err, values) => {
                this.editItem.className = values.className;
                this.editItem.classCode = values.classCode;
                if (!err) {
                    save(this.editItem).then(response => {
                        if (response.code === 200) {
                            this.$message.success("保存成功");
                            //刷新 列表
                            this.editModal = false;
                            this.PageList();
                            this.selectedKeys = [];
                            this.selectedData = [];
                        }
                    });
                }
            });
        },
        deleteClass () {
            let item = this.checkedData;
            if (this.checkedKeys.length == 0) {
                this.$message.warning('请选中一条数据');
                return;
            }
            let _this = this;
            this.$confirm({
                title: '提示',
                content: '您确定要删除该物料分类吗？',
                onOk () {
                    deleteInventoryClass({ id: item.id, parentId: item.parentId }).then(
                        res => {
                            if (res.code == 200) {
                                _this.PageList();
                                _this.editModal = false;
                                _this.$message.success("删除成功");
                                _this.checkedKeys = [];
                                _this.checkedData = {};
                            }
                        }
                    );
                },
                onCancel () {
                },
            });
        },
        //查询table 子集数据
        onTableExpand (expanded, record) { },
        onCellChange (item, dataIndex, editValue) {
            if (item[dataIndex] != editValue) {
                const edit = { id: item.id, [dataIndex]: editValue };
                this.TreeSortEditList.set(item.id, edit);
            } else {
                this.TreeSortEditList.delete(item.id);
            }
        },
        //搜索上下级tree选择事件
        onTreeSelect (keys, info) {
            if (keys == '') {
                this.parentData = {}
                return;
            } else {
                this.parentData = {
                    name: info.selectedNodes[0].data.class,
                    id: info.selectedNodes[0].data.key
                };
            }

        },
        //tree选择事件
        clickTreeSelect (keys, info) {
            console.log(keys, info);
            //先保存旧数据
            this.checkedKeys = keys;

            this.checkedData = info.node.dataRef;
            if (keys != '') {
                this.oldTreeData = info.selectedNodes[0].data.props;
                //新数据
                let data = info.selectedNodes[0].data.props;
                if (this.oldTreeData != data) {
                    this.$set(
                        this.oldTreeData,
                        "className",
                        info.selectedNodes[0].data.class
                    );
                } else {
                    this.$set(data, "className", info.selectedNodes[0].data.class);
                }
            }
        },
        selectParentData () {
            if (this.parentData.id) {
                this.editItem.parentId = this.parentData.id;
                this.editItem.parentName = this.parentData.name;

                this.form.setFieldsValue({
                    classCode: keyMap.get(this.editItem.parentId).classCode
                });
            } else {
                this.editItem.parentId = null;
                this.editItem.parentName = null;
                this.form.setFieldsValue({
                    classCode: null
                });
            }
            this.parentModal = false;
        },
        //获取编码规则(物料分类编码级次)
        getCodeDetail () {
            getDetail({ code: "inventoryclass" }).then(res => {
                if (res.code == 200) {
                    let code = res.data.codingRule;
                    console.log("code", code);
                    // for(let i=0; i<code.length; i++) {
                    //   this.ruleCode += code.substring(i, i+1);
                    //   if(i + 1 < code.length) {
                    //     this.ruleCode += "-";
                    //   }
                    // }
                    this.ruleCode = this.codeStyle(code);
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
        }
    }
};
</script>
<style lang="less" scoped>
    /deep/.ant-tree-title {
        max-width: none !important;
    }
    .a-button-bar {
        justify-content: space-between;
    }
    .tree {
        background: #efefef;
        padding: 10px 0px;
    }
    .form-inline label {
        justify-content: left !important;
    }
    .form-inline > .col {
        margin-bottom: 1.5rem !important;
    }

    .ant-advanced-search-form {
        padding: 24px;
        background: #fbfbfb;
    }

    .ant-advanced-search-form .ant-form-item {
        display: flex;
        margin-bottom: 0px !important;
    }

    .ant-advanced-search-form .ant-form-item-control-wrapper {
        flex: 1;
    }

    #components-form-demo-advanced-search .ant-form {
        max-width: none;
    }
    #components-form-demo-advanced-search .search-result-list {
        margin-top: 16px;
        background-color: #fafafa;
        min-height: 200px;
        text-align: center;
        padding-top: 80px;
    }
    .ant-modal-body {
        padding: 0 !important;
    }
    .ant-tree {
        -moz-user-select: none;
        -o-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
</style>
<style lang="less">
    @import '~@/style/setting/inventory.less';
    #components-form-demo-advanced-search .code-rules {
        display: inline-block;
        margin: 0 0 10px 10px;
        font-weight: normal !important;
        .code-text {
            color: red;
        }
    }
</style>