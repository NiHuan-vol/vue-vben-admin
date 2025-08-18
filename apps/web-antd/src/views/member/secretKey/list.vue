<template>
    <nly-content-wrapper>
        <nly-content-header>
            <nly-row class="col-12">
                <nly-row class="col-12 ">
                    <nly-col xs="12" sm="12" md="12" lg="9" xl="9" class="form-inline" style="justify-content: left;">
                        <!-- <i :class="this.$route.meta.icon + ' text-info'" class="icon" ></nly-icon>
            <span>{{this.$route.name}}</span>-->
                    </nly-col>
                    <nly-col xs="12" sm="12" md="12" lg="3" xl="3" class="form-inline align-self-start" style="justify-content: right;">
                        <nly-button-group>
                            <nly-button variant="info" @click="PageList" button-class="mr-2">查询</nly-button>
                            <nly-button variant="info" button-class="mr-2" @click="reset">重置</nly-button>
                            <nly-button @click="showFunction" variant="info" button-class="mr-2">
                                <i :class="show ? 'fas fa-angle-down mr-1' : 'fas fa-angle-up mr-1'" />
                                {{ show ? "折叠" : "展开" }}
                            </nly-button>
                        </nly-button-group>
                    </nly-col>
                </nly-row>

                <nly-row class="ml-1 mb-2 lr mt-4" v-show="show">
                    <nly-col xs="12" sm="12" md="12" lg="12" xl="12" class="form-inline" style="justify-content: left;">
                        <form-input title="密钥" id="crmName" labelStyle rightStyle="width:120px;" class="ml-2" v-show="show" v-model="postData.secretKey"></form-input>
                        <form-select title="状态" class="ml-2" rightStyle="width:120px;" v-show="true" v-model="postData.status" :dataList="[
                { key: 0, title: '正常' },
                { key: 2, title: '停用' }
              ]"></form-select>
                    </nly-col>
                </nly-row>
            </nly-row>
            <nly-container fluid></nly-container>
        </nly-content-header>
        <div class="tabpanel_tab_spacer"></div>
        <div>
            <!-- <a-button type="primary" class="crm-btn" @click="EdiItem">编辑</a-button> -->
            <a-button type="primary" class="crm-btn" @click="AddItem">新增</a-button>
            <a-button type="primary" class="crm-btn" @click="Disable">停用</a-button>
            <a-button type="primary" class="crm-btn" @click="Enable">启用</a-button>
        </div>
        <nly-content>
            <!-- 列表 -->
            <a-table :columns="columns" :components="components" :data-source="data" :scroll="{ y: 500}" bordered :pagination="pagination" :row-selection="{selectedRowKeys: selectedKeys, onChange: selection}" @change="onTableChange"></a-table>
            <!-- modal 弹窗  -->
            <a-modal :visible="editModal" lg :footer="null" :title="editItem.id ? '编辑' : '新增'" size="xl" @cancel="hideModal">
                <div id="components-form-demo-advanced-search">
                    <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 24 }" @submit="handleSubmit">
                        <div class="line" style="color:#1980Ff;font-size:15px;">基本信息</div>
                        <a-row :gutter="24">
                            <a-col :span="10">
                                <a-form-item label="用户数">
                                    <a-input v-decorator="['users', { rules: [{ required: true, message: '用户数量不能为空' }] }]" placeholder="请输入用户数量" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" :push="2" :style="isShow">
                                <a-form-item label="使用年限">
                                    <a-input v-decorator="['years', { rules: [{ required: true, message: '使用年限不能为空' }] }]" placeholder="请输入使用年限" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="10">
                                <a-form-item label="限用次数">
                                    <a-input v-decorator="['times', { rules: [{ required: true, message: '限用次数不能为空' }] }]" placeholder="请输入限用次数" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" :push="2">
                                <a-form-item label="生成数量">
                                    <a-input v-decorator="['count', { rules: [{ required: true, message: '生成数量不能为空' }] }]" placeholder="请输入生成数量" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="22" :pull="3">
                                <a-form-item label="备注">
                                    <a-textarea placeholder="请输入密钥备注" :rows="5" v-model="editItem.remarks" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col :span="24" :style="{ textAlign: 'right' }">
                                <a-button type="primary" html-type="submit">保存</a-button>
                                <a-button :style="{ marginLeft: '8px' }" @click="handleReset">重置</a-button>
                                <a-button :style="{ marginLeft: '8px' }" @click="hideModal">关闭</a-button>
                            </a-col>
                        </a-row>
                    </a-form>
                </div>
            </a-modal>
        </nly-content>
    </nly-content-wrapper>
</template>

<script>
import { FormInput, FormSelect } from "@/components/Form";
import { save, pageList, disable, enable } from "@/api/member/secretKey";
import { listToMap } from "@/utils/tool/map";
import { components } from "@/utils/antTableComponents";
const basePostData = {
    "current": 1,
    "size": 20
};

export default {
    components: {
        FormInput,
        FormSelect
    },
    data () {
        const columns = [
            {
                title: "密钥",
                dataIndex: "secretKey",
                key: "secretKey",
                width: 120,
                align: "left"
            },
            {
                title: "用户数量",
                dataIndex: "users",
                key: "users",
                width: 120
            },
            {
                title: "使用年限",
                dataIndex: "years",
                key: "years",
                width: 120
            },
            {
                title: "限用次数",
                dataIndex: "times",
                key: "times",
                width: 120
            },
            {
                title: "已使用次数",
                dataIndex: "useTimes",
                key: "useTimes",
                width: 120
            },
            {
                title: "剩余次数",
                dataIndex: "surplusTimes",
                key: "surplusTimes",
                width: 120,
                customRender: (text, row, index) => {
                    return row.times - row.useTimes;
                }
            },
            {
                title: "类型",
                dataIndex: "type",
                key: "type",
                width: 120,
                customRender: (text, row, index) => {
                    return text == 0 ? "免费" : "付费";
                }
            },
            {
                title: "状态",
                dataIndex: "status",
                key: "status",
                width: 120,
                customRender: (text, row, index) => {
                    return text == 2 ? (
                        <nly-badge bg-variant="danger">停用</nly-badge>
                    ) : (
                        <nly-badge bg-variant="success">正常</nly-badge>
                    );
                }
            },
            {
                title: "备注",
                dataIndex: "remarks",
                key: "remarks",
                width: 120
            },
            {
                title: "创建日期",
                dataIndex: "createDate",
                key: "createDate",
                width: 120
            }
        ];

        //表格 头部 可伸缩
        this.components = components(columns);
        return {
            fileList: [],
            postData: { ...basePostData },
            data: [],
            count: 0,
            columns,
            validateStatus: "success",
            isShow: "display:block",
            form: this.$form.createForm(this, { name: "advanced_search" }),
            errorMsg: null,
            isDisabled: true,
            pagination: {
                defaultPageSize: 20,
                current: 1,
                pageSize: 20,
                total: 0,
                showTotal: total => {
                    return (
                        <div>
                            共 {total} 条数据，每页
                            <a-input-number
                                value={this.pagination.pageSize}
                                min={1}
                                max={500}
                                onPressEnter={e => this.changePageSize(e)}
                            />
                            条
                        </div>
                    );
                },
                showQuickJumper: true,
                showLessItems: true
            },
            show: false, //是否显示
            editItem: {}, //新增/编辑对象
            selectedKeys: [],
            crmId: 15384,
            crmName: "重庆纳德密封制品有限公司",
            selectIds: [],
            selectedData: [],
            editModal: false,
        };
    },
    mounted () {
        this.PageList();
    },
    methods: {
        //添加
        AddItem () {
            this.editItem = {};
            this.detailData = [];
            this.editModal = true;
        },
        //编辑
        EdiItem () {
            this.editItem = {};
            if (this.selectedData.length != 1) {
                this.$message.warn("请选择一条数据");
                return false;
            }
            this.editItem = this.selectedData[0];
            this.form = this.$form.createForm(this, {
                mapPropsToFields: () => {
                    return {
                        goodsName: this.$form.createFormField({
                            value: this.editItem.goodsName
                        }),
                        price: this.$form.createFormField({
                            value: this.editItem.price
                        }),
                        users: this.$form.createFormField({
                            value: this.editItem.users
                        }),
                        years: this.$form.createFormField({
                            value: this.editItem.years
                        }),
                        discountRate: this.$form.createFormField({
                            value: this.editItem.discountRate
                        })
                    };
                }
            });
            this.editModal = true;
        },
        // 获取列表
        PageList () {
            const { postData } = this;
            pageList(postData)
                .then(response => {
                    if (response.code === 200) {
                        const { data } = response;
                        const { records, total, current, size } = data;
                        this.data = records;
                        Object.assign(this.pagination, {
                            total
                        });
                    }
                })
                .catch(error => { });
        },
        Disable () {
            let _this = this;
            this.$confirm({
                title: '提示',
                content: '您确定要停用吗？',
                onOk () {
                    disable(_this.selectIds)
                        .then(response => {
                            if (response.code === 200) {
                                _this.$message.success("停用成功");
                                //刷新 列表
                                _this.PageList();
                                _this.selectedKeys = [];
                            }
                        });
                },
                onCancel () {
                },
            });
        },
        Enable (item) {
            let _this = this;
            this.$confirm({
                title: '提示',
                content: '您确定要启用吗？',
                onOk () {
                    enable(_this.selectIds)
                        .then(response => {
                            if (response.code === 200) {
                                _this.$message.success("启用成功");
                                //刷新 列表
                                _this.PageList();
                                _this.selectedKeys = [];
                            }
                        })
                },
                onCancel () {
                },
            });
        },
        //获取
        showFunction () {
            this.show = !this.show;
        },
        showModal (editItem) {
            console.log("editItem", editItem);
            this.editItem = { ...editItem };
            this.editModal = true;
        },
        hideModal () {
            this.editModal = false;
        },
        handleReset () {
            this.form.resetFields();
        },
        handleSubmit (e) {
            e.preventDefault();
            this.form.validateFields((err, values) => {
                let id = this.editItem.id;
                let remarks = this.editItem.remarks;
                this.editItem = { ...values };
                this.editItem.id = id;
                this.editItem.remarks = remarks;
                console.log("开始保存:", this.editItem);
                if (!err) {
                    save(this.editItem)
                        .then(response => {
                            if (response.code === 200) {
                                this.$message.success("保存成功");
                                //刷新 列表
                                this.PageList();
                                this.hideModal();
                            }
                        })

                }
            });
        },
        selection (keys, info) {
            console.log(info);
            const ids = new Array();
            info.forEach(function (val) {
                ids.push(val.id);
            });
            this.selectIds = ids;
            this.selectedKeys = keys;
            this.selectedData = info;
        },
        //分页
        changePageSize (e) {
            const value = e.target.value;
            const { pagination } = this;

            console.log(e, value);
            Object.assign(this.postData, {
                "current": pagination.current,
                "size": pagination.pageSize
            });
            Object.assign(this.postData, {
                "size": value
            });
            Object.assign(this.pagination, {
                pageSize: Number.parseInt(value)
            });
            this.PageList();
        },
        onTableChange (pagination, filters, sorter) {
            Object.assign(this.postData, {
                "current": pagination.current,
                "size": pagination.pageSize
            });
            Object.assign(this.pagination, {
                current: pagination.current,
                pageSize: pagination.pageSize
            });
            console.log("postData:" + this.postData, pagination);
            this.PageList();
        },
        reset () {
            this.postData = { ...basePostData };
        },
        onCellChange (key, dataIndex, value) {
            const dataSource = [...this.detailData];
            const target = dataSource.filter(item => key === item.key)[0];
            if (target) {
                target[dataIndex] = value;
                this.detailData = dataSource;
            }
        }
    },
    watch: {}
};
</script>
<style scoped>
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

    /* tile uploaded pictures */
    .upload-list-inline >>> .ant-upload-list-item {
        float: left;
        width: 200px;
        margin-right: 8px;
    }
    .upload-list-inline >>> .ant-upload-animate-enter {
        animation-name: uploadAnimateInlineIn;
    }
    .upload-list-inline >>> .ant-upload-animate-leave {
        animation-name: uploadAnimateInlineOut;
    }
    .ant-popover-inner {
        z-index: 2999;
    }
    /* .crm-btn {
              margin-left: 10px;
              margin-bottom: 10px;
            } */
</style>