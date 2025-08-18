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
                        <form-input title="订单号" id="crmName" labelStyle rightStyle="width:120px;" class="ml-2" v-show="show" v-model="postData.orderNo"></form-input>
                        <form-input title="商品名称" id="crmName" labelStyle rightStyle="width:120px;" class="ml-2" v-show="show" v-model="postData.crmName"></form-input>
                        <form-input title="租户名称" id="crmName" labelStyle rightStyle="width:120px;" class="ml-2" v-show="show" v-model="postData.companyName"></form-input>
                        <form-select title="支付状态" class="ml-2" rightStyle="width:120px;" v-show="true" v-model="postData.orderStatus" :dataList="[
                { key: 1, title: '已支付' },
                { key: 0, title: '未支付' }
              ]"></form-select>
                    </nly-col>
                </nly-row>
            </nly-row>
            <nly-container fluid></nly-container>
        </nly-content-header>
        <div class="tabpanel_tab_spacer"></div>
        <div>
            <!-- <a-button type="primary" class="crm-btn" @click="EdiItem">编辑</a-button>
      <a-button type="primary" class="crm-btn" @click="AddItem">新增</a-button>
      <a-button type="primary" class="crm-btn" @click="Disable">停用</a-button>
      <a-button type="primary" class="crm-btn" @click="Enable">启用</a-button> -->
        </div>
        <nly-content>
            <!-- 列表 -->
            <a-table :columns="columns" :components="components" :data-source="data" :scroll="{ y: 500}" bordered :pagination="pagination" :row-selection="{selectedRowKeys: selectedKeys, onChange: selection}" @change="onTableChange"></a-table>
        </nly-content>
    </nly-content-wrapper>
</template>

<script>
import { FormInput, FormSelect } from "@/components/Form";
import { orderPage } from "@/api/member/order";
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
                title: "订单号",
                dataIndex: "orderNo",
                key: "orderNo",
                width: 120
            },
            {
                title: "租户名称",
                dataIndex: "companyName",
                key: "companyName",
                width: 120
            },
            {
                title: "订单日期",
                dataIndex: "createDate",
                key: "createDate",
                width: 120
            },
            {
                title: "商品名称",
                dataIndex: "goodsName",
                key: "goodsName",
                width: 120
            },
            {
                title: "用户数量",
                dataIndex: "users",
                key: "users",
                width: 80
            },
            {
                title: "使用年限",
                dataIndex: "years",
                key: "years",
                width: 80
            },
            {
                title: "折扣",
                dataIndex: "discountRate",
                key: "discountRate",
                width: 80
            },
            {
                title: "付款金额",
                dataIndex: "salePrice",
                key: "salePrice",
                width: 80
            },
            {
                title: "付款状态",
                dataIndex: "orderStatus",
                key: "orderStatus",
                width: 80,
                customRender: (text, row, index) => {
                    return text ? "已付款" : "未付款";
                }
            },
            {
                title: "付款时间",
                dataIndex: "payDate",
                key: "payDate",
                width: 120,
                customRender: (text, row, index) => {
                    return text;
                }
            },
            {
                title: "密钥",
                dataIndex: "secretKey",
                key: "secretKey",
                width: 120,
                customRender: (text, row, index) => {
                    return text;
                }
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
            selectIds: [],
            selectedData: []
        };
    },
    mounted () {
        this.PageList();
    },
    methods: {
        // 获取列表
        PageList () {
            const { postData } = this;
            orderPage(postData)
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
        //获取
        showFunction () {
            this.show = !this.show;
        },
        handleReset () {
            this.form.resetFields();
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
        },
        //分页
        changePageSize (e) {
            const value = e.target.value;
            const { pagination } = this;

            console.log(e, value);
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
            this.PageList();
        }
    },
    watch: {}
};
</script>