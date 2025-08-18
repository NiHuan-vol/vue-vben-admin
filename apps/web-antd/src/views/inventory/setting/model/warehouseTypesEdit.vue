<!-- 基础设置->物料设置->出入库类别->弹出框修改和添加组建 -->
<template>
    <div>
        <drag-modal :visible="visible" :title="editData.id ? '修改出入库类别' : '新增出入库类别'" centered width="600px" @cancel="closeModel">
            <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">

                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="上级出入库类别">
                            <a-input-search v-decorator="['parentName',{rules:[{required:false,message:'分类编码必填'}]}]" placeholder="请选择上级出入库类别" read-only @click="() => {this.parentModal = true;}" @search="() => {this.parentModal = true;}" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="出入库类别编码" class="header-xing">
                            <a-input autocomplete="off" v-decorator="['code',{rules:[{required:true,message:'分类编码必填'}]}]" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="出入库类别名称" class="header-xing">
                            <a-input autocomplete="off" v-decorator="['name',{rules:[{required:true,message:'分类名称必填'}]}]" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="出入库标志" class=" header-xing">
                            <a-radio-group v-decorator="['type',{ rules: [{ required: true, message: '出入库类别必选' }] },{ initialValue: '1' }]" :options="selectOptions" @change="handleChange"></a-radio-group>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="编码规则：" class=" header-xing">
                            <span class="code-text">{{ ruleCode }}</span>
                        </a-form-item>
                    </a-col>
                </a-row>

            </a-form>
            <template slot="footer">
                <a-button type="primary" @click="save">保存</a-button>
                <a-button type="danger" v-if="editData.id" @click="removeData">删除</a-button>
                <a-button @click="closeModel">关闭</a-button>
            </template>
        </drag-modal>
        <a-modal :visible="parentModal" @cancel="()=>{parentModal = false;}" title="上级出入库类别" centered width="360px">
            <div style="height: 350px;overflow-y:scroll;">
                <!-- <a-input-search style="margin-bottom: 8px" placeholder="物料分类名称" @change="onChange" /> -->
                <a-tree :tree-data="data" :show-line="true" @select="onTreeSelect" defaultExpandAll :replaceFields="replaceFields" />
            </div>
            <template slot="footer">
                <a-button type="primary" html-type="submit" @click="selectParentData">确定</a-button>
                <a-button :style="{ marginLeft: '8px' }" @click="
            () => {
              parentModal = false;
            }
          ">关闭</a-button>
            </template>
        </a-modal>
    </div>

</template>
<script>
import { getCode } from "@/utils/tool/get-code-rules";
import { getAction, postAction } from "@/api/manage";
import { getDetail } from "@/api/erp/erpGradeRule";
import { classPageListToTree, searchInTreeData } from "@/utils/tree";

let keyMap = new Map();

export default {
    props: {
        editData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            visible: false,
            ruleCode: "", // 编码规则
            selectOptions: [
                {
                    value: "1",
                    label: "入库"
                },
                {
                    value: "2",
                    label: "出库"
                }
            ],
            form: this.$form.createForm(this, { name: "warehouse" }),
            parentModal: false, //上级弹窗
            parentId: '',    //上级id
            parentName: '',//上级名称
            replaceFields: {
                // tree 别名
                title: "showTitle",
                key: "code"
            },
            parentData: [],//选中的上级分类
        };
    },
    created() {
        this.getCodeDetail();
        this.getData();
    },
    computed: {},
    methods: {
        closeModel() {
            // 关闭此页面
            this.visible = false;
            this.parentId = '';
        },
        getCodeDetail() {
            //获取编码规则(物料分类编码级次)
            getCode('rd_style').then(res => {
                this.ruleCode = res;
            })
        },
        add(data) {
            //新增
            this.visible = true;
            setTimeout(() => {
                this.parentId = '';
                this.form.setFieldsValue({
                    type: data.type,
                    code: '',
                    name: '',
                    parentName: '',
                });
            }, 100);
        },



        save() {
            // 保存
            this.form.validateFields((err, values) => {
                if (!err) {

                    const requestData = this.form.getFieldsValue();
                    this.editData.id ? requestData.id = this.editData.id : '';
                    requestData.parentId = this.parentId;
                    console.log(requestData);
                    // if (requestData.type == 1) {
                    //     if (requestData.code.substring(0, 1) != 1) {
                    //         this.$message.error("第一位只能是1");
                    //         return;
                    //     }
                    // } else if (requestData.type == 2) {
                    //     if (requestData.code.substring(0, 1) != 2) {
                    //         this.$message.error("第一位只能是2");
                    //         return;
                    //     }
                    // }

                    postAction("/in/rdStyle/save", requestData).then(res => {
                        if (res.code == 200) {
                            this.$message.success("添加成功");
                            this.$emit("ok");
                            this.getData();
                            this.closeModel();
                        } else {
                            // this.$message.warning(res.message);
                        }
                    });
                }
            });
        },
        edit() {
            this.visible = true;
            setTimeout(() => {
                this.parentId = this.editData.parentId;
                console.log(this.editData.type);
                this.form.setFieldsValue({
                    type: this.editData.type.toString(),
                    code: this.editData.code,
                    name: this.editData.name,
                    parentName: keyMap.get(this.editData.parentId) ? keyMap.get(this.editData.parentId).name : ""
                });
            }, 100);
            console.log(this.editData);
        },
        removeData() {
            // 删除数据
            let that = this;
            let ids = [];
            ids.push(this.editData.id);
            this.$confirm({
                title: `是否确认删除 ${this.editData.name}`,
                content: "",
                onOk() {
                    postAction("/in/rdStyle/delete", ids).then(res => {
                        if (res.code == 200) {
                            that.$emit("ok");
                            that.closeModel();
                            that.$message.success("删除成功");
                        } else {
                            that.$message.warning(res.message);
                        }
                    });
                },
                onCancel() { }
            });
        },
        handleChange(e) {
            //切换radio
            // if (e.target.value == 1) {
            //   this.form.setFieldsValue({
            //     code: "1"
            //   });
            // } else if (e.target.value == 2) {
            //   this.form.setFieldsValue({
            //     code: "2"
            //   });
            // }
        },
        //搜索上下级tree选择事件
        onTreeSelect(keys, info) {
            console.log(keys, info);
            if (keys == '0-0') {
                return;
            }
            let params = [];
            let sun = [];
            getAction("/in/rdStyle/pageStyleList", params).then(res => {
                let data = res.data.records;
                for (let i = 0; i < data.length; i++) {
                    if (info.node.dataRef.id == data[i].parentId) {
                        this.sun = data[i].code;
                    }
                    else {
                        this.sun = info.node.dataRef.code;
                    }
                }
                let ddd = [...this.sun];
                this.parentData = {
                    name: info.node.dataRef.name,
                    id: info.node.dataRef.id,
                    code: Number(this.sun) * 10 + 1,
                };
                if (ddd[0] == '0') {
                    this.parentData.code = '0' + this.parentData.code;
                }
            })
            // this.parentData = {
            //     name: info.node.dataRef.name,
            //     id: info.node.dataRef.id,
            //     code: info.node.dataRef.code,
            // };
        },
        selectParentData() {
            this.parentId = this.parentData.id;
            this.editData.id = '';
            this.parentModal = false;
            this.form.setFieldsValue({
                code: this.parentData.code,
                parentName: this.parentData.name
            });
        },
        getData() {
            // 获取出入库类别数据
            let params = {};
            getAction("/in/rdStyle/pageStyleList", params).then(res => {
                if (res.code == 200) {

                    let data = res.data.records;
                    const childrenNav = [];
                    classPageListToTree(data, childrenNav, 0);

                    for (let i = 0; i < data.length; i++) {
                        const node = data[i];
                        keyMap.set(node.id, node);
                    }


                    this.data = [
                        {
                            title: "出入库类别",
                            showTitle: "出入库类别",
                            key: "",
                            children: this.getTreeData(childrenNav)
                        }
                    ];

                } else {
                    // this.$message.warning(res.message);
                }
            });
        },
        //递归添加显示的tree title
        getTreeData(data) {
            for (let i = 0; i < data.length; i++) {
                let element = data[i];
                this.$set(
                    element,
                    "showTitle",
                    `(${element.code}) ${element.name}`
                );
                if (element.children) {
                    this.getTreeData(element.children);
                }
            }
            return data;
        },
    }
};
</script>
<style lang="less" scoped>
.ant-advanced-search-form .ant-form-item {
    margin-bottom: 0px;
}
</style>
<style>
.code-rules {
    display: inline-block;
    margin: 0 0 10px 19px;
    font-weight: bold;
}
.code-text {
    color: red;
    font-family: SimSun, sans-serif;
}
</style>