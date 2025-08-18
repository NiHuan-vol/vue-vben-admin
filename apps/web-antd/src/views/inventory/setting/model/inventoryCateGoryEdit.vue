<!-- 基础设置->物料设置->收发类别->弹出框修改和添加组建 -->
<template>
    <div>
        <drag-modal :visible="visible" :title="editData.id ? '修改存货分类' : '新增存货分类'" centered width="600px" @cancel="closeModel">
            <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">

                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="上级存货分类">
                            <a-input-search v-decorator="['parentName',{rules:[{required:false,message:'分类编码必填'}]}]" placeholder="请选择上级存货分类" read-only @click="() => {this.parentModal = true;}" @search="() => {this.parentModal = true;}" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="存货分类编码" class="header-xing">
                            <a-input autocomplete="off" v-decorator="['code',{rules:[{required:true,message:'分类编码必填'}]}]" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="存货分类名称" class="header-xing">
                            <a-input autocomplete="off" v-decorator="['name',{rules:[{required:true,message:'分类名称必填'}]}]" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <!-- <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="存货标志" class=" header-xing">
                            <a-radio-group v-decorator="['type',{ rules: [{ required: true, message: '存货分类必选' }] },{ initialValue: '1' }]" :options="selectOptions" @change="handleChange"></a-radio-group>
                        </a-form-item>
                    </a-col>
                </a-row> -->
                <a-row :gutter="24">
                    <a-col :span="14" :push="5">
                        <a-form-item label="编码规则：" class=" header-xing">
                            <span class="code-text">{{ ruleCode }}</span>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24" style="margin-top:20px;font-size:12px;">
                    存货分类一般按其财务成本核算的经济内容进行分类，如：原材料（下级还可分为：主要材料、辅助材料、燃料、
                    备品备件、包装材料、外购件等）、在产品、半成品、产成品、库存商品
                    包装物、低值易耗品、周转材料、委托加工物资等。
                </a-row>
            </a-form>
            <template slot="footer">
                <a-button type="primary" @click="save">保存</a-button>
                <!-- <a-button type="danger" v-if="editData.id" @click="removeData">删除</a-button> -->
                <a-button @click="closeModel">关闭</a-button>
            </template>
        </drag-modal>
        <a-modal :visible="parentModal" @cancel="()=>{parentModal = false;}" title="上级存货分类" centered width="360px">
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
    data () {
        return {
            visible: false,
            ruleCode: "", // 编码规则
            selectOptions: [
                {
                    value: "1",
                    label: "收"
                },
                {
                    value: "2",
                    label: "发"
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
    created () {
        this.getCodeDetail();
        this.getData();
    },
    computed: {},
    methods: {
        closeModel () {
            // 关闭此页面
            this.visible = false;
            this.parentId = '';
        },
        getCodeDetail () {
            //获取编码规则(物料分类编码级次)
            getCode('inventoryCategoryId').then(res => {
                this.ruleCode = res;
            })
        },
        add (data) {
            //新增
            this.visible = true;
            setTimeout(() => {
                this.editData.id = null;
                this.editData.code = null;
                this.parentId = '';
                this.form.setFieldsValue({
                    type: data.type,
                    code: '',
                    name: '',
                    parentName: '',
                });
            }, 100);
        },


        save () {
            // 保存
            this.form.validateFields((err, values) => {
                if (!err) {
                    const requestData = this.form.getFieldsValue();
                    this.editData.id ? requestData.id = this.editData.id : '';
                    requestData.parentId = this.parentId;
                    postAction("/in/inventoryCategory/save", requestData).then(res => {
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
        edit () {
            this.visible = true;
            setTimeout(() => {
                this.parentId = this.editData.parentId;
                this.form.setFieldsValue({
                    // type: this.editData.type.toString(),
                    code: this.editData.code,
                    name: this.editData.name,
                    parentName: keyMap.get(this.editData.parentId) ? keyMap.get(this.editData.parentId).name : ""
                });
            }, 100);
            console.log(this.editData);
        },
        removeData () {
            // 删除数据
            let that = this;
            let ids = [];
            ids.push(this.editData.id);
            this.$confirm({
                title: `是否确认删除 ${this.editData.name}`,
                content: "",
                onOk () {
                    getAction("/in/inventoryCategory/delete", { id: ids[0] }).then(res => {
                        if (res.code == 200) {
                            that.$emit("ok");
                            that.closeModel();
                            that.$message.success("删除成功");
                        } else {
                            that.$message.warning(res.message);
                        }
                    });
                },
                onCancel () { }
            });
        },
        handleChange (e) {
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
        onTreeSelect (keys, info) {

            console.log(keys, info);
            if (keys == '0-0') {
                this.parentData = {};
                return;
            }
            let params = [];
            let sun = '';
            // getAction("/in/inventoryCategory/getInventoryCategoryList", params).then(res => {
            // let data = res.data;
            // for (let i = 0; i < data.length; i++) {
            //     if (info.node.dataRef.id == data[i].parentId) {
            //         sun = data[i].code;
            //     }else {
            //         sun = info.node.dataRef.code;
            //     }
            // }
            this.parentData = {
                name: info.node.dataRef.name,
                id: info.node.dataRef.id,
                code: info.node.dataRef.code,
            };
            // })
            // this.parentData = {
            //     name: info.node.dataRef.name,
            //     id: info.node.dataRef.id,
            //     code: info.node.dataRef.code,
            // };
        },
        selectParentData () {
            this.parentId = this.parentData.id;
            this.editData.id = '';
            this.parentModal = false;
            this.form.setFieldsValue({
                code: this.parentData.code,
                parentName: this.parentData.name
            });
        },
        getData () {
            // 获取存货分类数据
            let params = {};
            getAction("/in/inventoryCategory/getInventoryCategoryList", params).then(res => {
                if (res.code == 200) {

                    let data = res.data;
                    const childrenNav = [];
                    classPageListToTree(data, childrenNav, 0);

                    for (let i = 0; i < data.length; i++) {
                        const node = data[i];
                        keyMap.set(node.id, node);
                    }


                    this.data = [
                        {
                            title: "存货分类",
                            showTitle: "存货分类",
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
        getTreeData (data) {
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