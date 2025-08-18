<template>
    <div class="customizeSet" style="margin-top:30px;">
        <!-- <div class="a-button-bar">
      <a-button type="primary" @click="add">新增</a-button>
    </div> -->
        <!-- 列表 -->
        <a-table :columns="columns" :components="components" :data-source="data" :scroll="{ x: 500, y: 600 }" bordered :pagination="false"></a-table>
        <!-- modal 弹窗  -->
        <a-modal ref="edit-modal" :visible="editModal" lg :footer="null" title="编辑编码" size="xl" @cancel="hideModal">
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
                                <a-input v-decorator="['currentCode', { rules: [{ required: true, message: '当前前缀不能为空' }] }]" placeholder="最多三个字母" style="text-transform:uppercase;" :maxLength="3" @change="checkCode" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :push="2" :span="10">
                            <a-form-item label="中间位">
                                <a-select v-model="editItem.median">
                                    <a-select-option :value="1">年月日</a-select-option>
                                    <a-select-option :value="2">年月</a-select-option>
                                    <a-select-option :value="3">年</a-select-option>
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
                            <a-form-item v-model="editItem.startValue" label="起始值">
                                <a-input />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="10" :push="2">
                            <a-form-item v-model="editItem.splitMark" label="分割符">
                                <a-input />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="24" :style="{ textAlign: 'right' }">
                            <a-button type="primary" html-type="submit">保存</a-button>
                            <a-button :style="{ marginLeft: '8px' }" @click="hideModal">关闭</a-button>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script>
import { components } from "@/utils/antTableComponents";
import { pageList, save } from "@/api/erp/mumberSet";

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
                    return row.currentCode + "202006170001";
                }
            },
            {
                title: "操作",
                dataIndex: "o",
                key: "o",
                width: 80,
                customRender: (text, row, index) => {
                    return (
                        <div class="row justify-content-md-center">
                            <span class="col"></span>
                            <span class="col-sm-auto col-md-auto col-lg-auto col-xl-auto">
                                <a
                                    href="javascript:;"
                                    title="编辑"
                                    class="mr-1 col-1"
                                    onClick={() => this.showModal(row)}
                                >
                                    <i class="fa fa-edit" style="color: #69aa46;"></i>
                                </a>
                            </span>
                            <span class="col"></span>
                        </div>
                    );
                }
            }
        ];

        //表格 头部 可伸缩
        this.components = components(columns);
        return {
            data: [],
            columns,
            editItem: {},
            isUpdateAll: false,
            form: this.$form.createForm(this, { name: "advanced_search" })
        };
    },
    mounted () {
        //为了防止火狐浏览器拖拽的时候以新标签打开，此代码真实有效
        document.body.ondrop = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };
        this.getCodeList();
    },
    watch: {
        $route: function (newVal, oldVal) {
            if (newVal.path.indexOf("/invoice/set/serialNumberSet") != -1) {
                this.getCodeList();
            }
        }
    },
    methods: {
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
        getCodeList () {
            let urlParams = this.$route.path.split("/");
            pageList({ moduleCode: urlParams[urlParams.length - 1] }).then(response => {
                this.data = response.data.records;
            });
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
                    save(this.editItem).then(response => {
                        if (response.code == 200) {
                            this.$message.success("保存成功");
                            this.getCodeList();
                            this.hideModal();
                        }
                    });
                }
            });
        },
        onChange (e) {
            this.isUpdateAll = e.target.checked;
            console.log(`checked = ${this.isUpdateAll}`);
        },
        checkCode (e) {
            console.log(e);
            // this.form = this.$form.createForm(this, {
            //   mapPropsToFields: () => {
            //     return {
            //       currentCode: this.$form.createFormField({
            //         value: e.data.replace(/[^a-zA-Z]/g,'');
            //       })
            //     };
            //   }
            // });
        }
    }
};
</script>
<style scoped>
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
    .form-inline label {
        justify-content: left !important;
    }
    .form-inline > .col {
        margin-bottom: 1.5rem !important;
    }
    .icons-list >>> .anticon {
        margin-right: 8px;
        font-size: 16px;
    }
    .ant-advanced-search-form {
        padding: 24px;
        background: #fbfbfb;
    }

    .ant-advanced-search-form .ant-form-item {
        display: flex;
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
</style>