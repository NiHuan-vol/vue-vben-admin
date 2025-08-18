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
                                <i :class="show ? 'fas fa-angle-down mr-1' : 'fas fa-angle-up mr-1'"></i>
                                {{ show ? "折叠" : "展开" }}
                            </nly-button>
                        </nly-button-group>
                    </nly-col>
                </nly-row>

                <nly-row class="ml-1 mb-2 lr mt-4" v-show="show">
                    <nly-col xs="12" sm="12" md="12" lg="12" xl="12" class="form-inline" style="justify-content: left;">
                        <form-input title="商品名称" id="crmName" labelStyle rightStyle="width:120px;" class="ml-2" v-show="show" v-model="postData.crmName"></form-input>
                        <form-select title="状态" class="ml-2" rightStyle="width:120px;" v-show="false" v-model="postData.status" :dataList="[
                { key: 0, title: '正常' },
                { key: 2, title: '停用' }
              ]"></form-select>
                    </nly-col>
                </nly-row>
            </nly-row>
            <nly-container fluid></nly-container>
        </nly-content-header>
        <div class="tabpanel_tab_spacer"></div> 
        <div style="margin-bottom:10px;">
            <a-button type="primary" class="crm-btn" @click="EdiItem">编辑</a-button>
            <a-button type="primary" class="crm-btn" @click="AddItem">新增</a-button>
            <a-button type="primary" class="crm-btn" @click="Disable">停用</a-button>
            <a-button type="primary" class="crm-btn" @click="Enable">启用</a-button>
            <a-button type="primary" class="crm-btn" @click="saveSort">保存排序</a-button>
        </div>
        <nly-content class="goods-customize">
            <!-- 列表 -->
            <a-table :columns="columns" :components="components" :data-source="data" :scroll="{ y: 500}" bordered :pagination="false" :row-selection="{selectedRowKeys: selectedKeys, onChange: selection,columnWidth:20}">
                <div title="上下拖动排序" slot="sort" slot-scope="text" style="cursor: move;">{{text}}</div>
                <div slot="goodsLogoUrl" slot-scope="text">
                    <div style="width:50px;height:50px;margin:10px auto;">
                        <img :src="text" alt="商品图片" style="width:50px;height:50px;">
                    </div>
                </div>
                <div slot="moneySet" slot-scope="text,record,index">
                    <a-icon style="font-size:20px;" type="setting" @click="moneySet(record)" />
                </div>
            </a-table>

            <!-- modal 弹窗  -->
            <drag-modal v-model="visibleModal" lg hide-footer :title="editItem.id ? '编辑' : '新增'" @cancel="hideModal" :width="800">
                <div id="components-form-demo-advanced-search">
                    <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 22 }" @submit="handleSubmit">
                        <a-row :gutter="24">
                            <a-col :span="10" class="ml-2">
                                <a-form-item label="商品类型" >
                                    <a-radio-group style="margin-top:8px" v-model="editItem.goodsType" default-value="software">
                                        <a-radio value="software">
                                            软件
                                        </a-radio>
                                        <a-radio value="telCharges">
                                            话费套餐
                                        </a-radio>
                                    </a-radio-group>
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <!-- <div class="line" style="color:#1980Ff;font-size:15px;">基本信息</div> -->
                        <a-row :gutter="24">
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'telCharges'
                                <a-form-item label="是否套餐">
                                    <a-radio-group style="margin-top:8px" v-model="editItem.isSetting" :default-value="true">
                                        <a-radio :value="true">
                                            是
                                        </a-radio>
                                        <a-radio :value="false">
                                            否
                                        </a-radio>
                                    </a-radio-group>
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2">
                                <a-form-item label="商品名称">
                                    <a-input v-decorator="['goodsName', { rules: [{ required: true, message: '商品名称不能为空' }] }]" placeholder="请输入商品名称" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'software'
                                <a-form-item label="用户数量">
                                    <a-input v-decorator="['users', { rules: [{ required: true, message: '用户数量不能为空' }] }]" placeholder="请输入用户数量" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'telCharges' && !editItem.isSetting">
                                <a-form-item label="单价">
                                    <a-input @keyup="calculate('minutePrice')" v-decorator="['minutePrice', { rules: [{ required: true, message: '分钟数单价不能为空' }] }]" placeholder="请输入分钟数单价" suffix="元/分钟"/>
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'telCharges'
                                <a-form-item label="语音时长">
                                    <a-input @keyup="calculate('baseMinutes')" v-decorator="['baseMinutes', { rules: [{ required: true, message: '分钟数不能为空' }] }]" placeholder="请输入分钟数" suffix="分钟" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'telCharges' && editItem.isSetting">
                                <a-form-item label="月费">
                                    <a-input @keyup="calculate('price')" v-decorator="['price', { rules: [{ required: true, message: '话费金额不能为空' }] }]" placeholder="请输入话费金额" prefix="￥" suffix="元" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'telCharges' && !editItem.isSetting">
                                <a-form-item label="话费金额">
                                    <a-input @keyup="calculate('price')" v-decorator="['price', { rules: [{ required: true, message: '话费金额不能为空' }] }]" placeholder="请输入话费金额" prefix="￥" suffix="元" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'software'
                                <a-form-item label="基础单价">
                                    <a-input v-decorator="['price', { rules: [{ required: true, message: '基础单价不能为空' }] }]" placeholder="请输入基础单价" prefix="￥" suffix="元" />
                                </a-form-item>
                            </a-col>

                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'software'
                                <a-form-item label="使用年限">
                                    <a-input v-decorator="['years', { rules: [{ required: true, message: '使用年限不能为空' }] }]" placeholder="请输入使用年限" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'software'
                                <a-form-item label="关联角色">
                                    <!-- <a-input v-decorator="['roleName', { rules: [{ required: true, message: '关联角色不能为空' }] }]" placeholder="请选择关联角色" /> -->
                                    <div style="background:rgba(0,0,0,0);width:100%;height:28px;z-index:2;position:absolute;top:-4px;left:0;" @click="handleSearch('roleRef')"></div>
                                    <a-input-search read-only placeholder="请选择关联角色" v-decorator="['roleName', { rules: [{ required: true, message: '关联角色不能为空' }] }]" size="small" @search="handleSearch('roleRef')" />

                                    <form-search-group ref="roleRef" :dynamicData="{name:'角色',val:'role',code:'roleId',value:roleName}" @clickItem="setValue"></form-search-group>
                                </a-form-item>
                            </a-col>
                            <a-col :span="10" class="ml-2" v-show="editItem.goodsType == 'software'
                                <a-form-item label="版权信息">
                                    <a-input v-decorator="['copyright', { rules: [{ required: false, message: '版权信息不能为空' }] }]" placeholder="请输入版权信息" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="10">
                                <a-form-item label="商品图片">
                                    <div>
                                        <span class="margin-right-20">高:100px 宽:100px</span>
                                        <a-upload :action="this.$Global.ApiBaseUrl + '/uploadFile'" :headers="headersData" list-type="picture-card" :file-list="fileList" @preview="handlePreview" @change="handleChange">
                                            <div>
                                                <a-icon type="plus" />
                                                <div class="ant-upload-text">
                                                    上传图片
                                                </div>
                                            </div>
                                        </a-upload>
                                        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancelImg">
                                            <img alt="example" style="width: 100%" :src="previewImage" />
                                        </a-modal>
                                    </div>
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="24">
                            <a-col :span="24">
                                <!-- <a-form-item label="产品简介">
                                    <a-textarea placeholder="请输入产品简介" :rows="5" v-model="editItem.remarks" /> -->
                                <div class="from-title-text">产品简介：</div>
                                <ueditor :content.sync="editItem.remarks"></ueditor>
                            </a-col>
                        </a-row>
                    </a-form>
                </div>
                <template slot="footer">
                    <a-button type="primary" @click="handleSubmit">保存</a-button>
                    <a-button :style="{ marginLeft: '8px' }" @click="handleReset">重置</a-button>
                    <a-button :style="{ marginLeft: '8px' }" @click="hideModal">关闭</a-button>
                </template>
            </drag-modal>

            <a-modal title="佣金设置" @ok="moneySetSubmit" :visible="moneyVisible" @cancel="()=>{moneyVisible = false;}" :width="1000">
                <div class="money-set-wrapper clearfix">
                    <div class="goods-img">
                        <img :src="configInfo.goodsLogoUrl" alt="商品logo">
                    </div>
                    <div class="goods-explain">
                        <p> {{configInfo.goodsName}}</p>
                        <p>￥{{configInfo.price?configInfo.price.toFixed(2):'0.00'}}</p>
                        <div class="clearfix">
                            <div style="float:left">
                                是否开启推广奖励：
                            </div>
                            <div style="float:left">
                                <a-radio-group name="radioGroup" :default-value="true" v-model="configInfo.isReward">
                                    <a-radio :value="true">开启</a-radio>
                                    <a-radio :value="false">关闭</a-radio>
                                </a-radio-group>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="money-set-input">
                    <div class="item m-s-border">
                        <div>
                            <a-icon type="user" />自销提成
                        </div>
                        <a-input v-model="configInfo.firstReward" oninput="value=value.toString().match(/^\d+/)" suffix="%" />
                        <div class="item-explain">推荐给客户购买后能拿到的提成比例。</div>
                    </div>
                    <div class="item item-next">
                        <div>购买</div>
                        <div>
                            <a-icon type="arrow-right" />
                        </div>
                    </div>
                    <div class="tiem m-s-border">
                        <div>一级推客</div>
                        <a-input v-model="configInfo.secondReward" oninput="value=value.toString().match(/^\d+/)" suffix="%" />
                        <div class="item-explain">好友推荐客户购买后，好友的上级能拿到的佣金比例</div>
                    </div>
                    <div class="item item-next">
                        <div>推荐人</div>
                        <div>
                            <a-icon type="arrow-right" />
                        </div>
                    </div>
                    <div class="item m-s-border">
                        <div>二级推客</div>
                        <a-input v-model="configInfo.thirdReward" oninput="value=value.toString().match(/^\d+/)" suffix="%" />
                        <div class="item-explain">好友推荐客户购买后，好友的上级的上级能拿到的佣金比例</div>
                    </div>
                    <div class="item item-next">
                        <div>推荐人</div>
                        <div>
                            <a-icon type="arrow-right" />
                        </div>
                    </div>
                    <div class="item m-s-border">
                        <div>三级推客</div>
                        <a-input v-model="configInfo.fourthReward" oninput="value=value.toString().match(/^\d+/)" suffix="%" />
                        <div class="item-explain">好友推荐客户购买后，好友的上级的上级的上级能拿到的佣金比例</div>
                    </div>
                </div>

                <a-form :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }" class="user-class">
                    <a-form-item label="提现额度">
                        <a-input v-model="configInfo.withdrawalLimit" maxlength="6" oninput="value=value.toString().match(/^\d+/)" suffix="￥" />
                    </a-form-item>
                    <a-form-item label="推广方法">
                        <a-textarea placeholder="请输入推广方法" :rows="5" style="resize:none" v-model="configInfo.extensionMethod" />
                    </a-form-item>
                    <a-form-item label="佣金规则">
                        <a-textarea placeholder="请输入佣金规则" :rows="5" style="resize:none" v-model="configInfo.commissionRules" />
                    </a-form-item>
                </a-form>
            </a-modal>
        </nly-content>
    </nly-content-wrapper>
</template>

<script>
import ueditor from '@/components/Ueditor/index';
import Vue from "vue";
import { ACCESS_TOKEN } from "@/store/mutation-types";
import { FormInput, FormSelect } from "@/components/Form";
import { save, pageList, disable, enable, sortFun, getByGoodsId } from "@/api/member/goods";
import { listToMap } from "@/utils/tool/map";
import { components } from "@/utils/antTableComponents";
import FormSearchGroup from '@/components/Form/FormSearchGroup'

import Sortable from 'sortablejs';

const basePostData = {
    "page.current": 1,
    "page.size": 20
};
function getBase64 (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
export default {
    components: {
        FormInput,
        FormSelect,
        FormSearchGroup,
        ueditor
    },
    data () {
        const columns = [
            {
                title: "商品图片",
                dataIndex: "goodsLogoUrl",
                key: "goodsLogoUrl",
                width: 80,
                align: "center",
                scopedSlots: { customRender: 'goodsLogoUrl' },
            },
            {
                title: "商品名称",
                dataIndex: "goodsName",
                key: "goodsName",
                width: 80,
                align: "left",
                scopedSlots: { customRender: 'sort' },
            },
            {
                title: "商品类型",
                dataIndex: "goodsType",
                key: "goodsType",
                width: 80,
                align: "left",
                customRender: (text) => {
                    return text == 'software' ? '软件' : text == 'telCharges' ? '话费' : '';
                },
            },
            {
                title: "是否推广",
                dataIndex: "isReward",
                key: "isReward",
                width: 80,
                align: "left",
                customRender: (text) => {
                    return text ? '是' : '否';
                },
            },
            {
                title: "用户数量",
                dataIndex: "users",
                key: "users",
                width: 60
            },
            {
                title: "单价",
                dataIndex: "price",
                key: "price",
                width: 60
            },
            {
                title: "使用年限",
                dataIndex: "years",
                key: "years",
                width: 60
            },
            {
                title: "版权信息",
                dataIndex: 'copyright',
                key: "copyright",
                width: 80
            },
            {
                title: "关联角色",
                dataIndex: "roleName",
                key: "roleName",
                width: 60
            },
            {
                title: "拥金设置",
                dataIndex: "moneySet",
                key: "moneySet",
                width: 30,
                align: "center",
                scopedSlots: { customRender: "moneySet" }
            },
            {
                title: "状态",
                dataIndex: "status",
                key: "status",
                align: 'center',
                width: 60,
                customRender: (text, row, index) => {
                    return text == 2 ? (
                        <nly-badge bg-variant="danger">停用</nly-badge>
                    ) : (
                        <nly-badge bg-variant="success">正常</nly-badge>
                    );
                }
            },
        ];

        //表格 头部 可伸缩
        this.components = components(columns);
        return {
            visibleModal: false,
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
                defaultPageSize: 10,
                current: 1,
                pageSize: 20,
                total: 0,
                showTotal: total => `共 ${total} 条数据`,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "30", "40", "50"]
            },
            show: false, //是否显示
            editItem: {}, //新增/编辑对象
            selectedKeys: [],
            crmId: 15384,
            crmName: "重庆纳德密封制品有限公司",
            selectIds: [],
            selectedData: [],
            roleName: null,
            roleId: null,

            // 图片上传参数
            headersData: {
                "Access-Token": Vue.ls.get(ACCESS_TOKEN),
            },
            previewVisible: false,
            previewImage: "",
            fileList: [],
            moneyVisible: false,
            configInfo: {}, //基本信息
        };
    },
    mounted () {
        this.PageList();
    },
    methods: {
        moneySet (record) {
            //佣金设置
            console.log(record)
            this.moneyVisible = true;
            this.configInfo = record;
            if (this.configInfo.isReward == null) {
                this.configInfo.isReward = false;
            }
        },
        handleChange ({ fileList }) {
            console.log(fileList);
            if (fileList.length > 1) {
                this.$message.warning('只能上传一张LOGO图片');
                return;
            }
            this.fileList = fileList;
        },
        async handlePreview (file) {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj);
            }
            this.previewImage = file.url || file.preview;
            this.previewVisible = true;
        },
        handleCancelImg () {
            this.previewVisible = false;
        },

        handleSearch (n) {
            this.$refs[`${n}`].showModal();
        },
        setValue (data) {
            console.log(data);
            this.roleName = data.name;
            this.roleId = data.id;

            this.form.setFieldsValue({
                roleName: data.name
            });
        },
        onGoodsTypeChange (val) {
            console.log("切换商品类型", val)
        },
        calculate (column) {
            if (this.editItem.isSetting) return;
            let goodsPrice = this.form.getFieldValue("price");
            let baseMinutes = this.form.getFieldValue("baseMinutes");
            let minutePrice = this.form.getFieldValue("minutePrice");
            console.log("column:", column, "goodsPrice:", goodsPrice, "baseMinutes:", baseMinutes, "minutePrice", minutePrice)
            switch (column) {
                case "minutePrice":
                    if (baseMinutes) {
                        goodsPrice = (Number(baseMinutes) * Number(minutePrice)).toFixed(2);
                        this.form.setFieldsValue({
                            price: goodsPrice
                        });
                    }
                    break;
                case "baseMinutes":
                    if (minutePrice) {
                        goodsPrice = (Number(baseMinutes) * Number(minutePrice)).toFixed(2);
                        this.form.setFieldsValue({
                            price: goodsPrice
                        });
                    }
                    break;
                case "price":
                    if (baseMinutes) {
                        minutePrice = (Number(goodsPrice) / Number(baseMinutes)).toFixed(4);
                        this.form.setFieldsValue({
                            minutePrice: minutePrice
                        });
                    }
                    break;
            }

        },
        //获取话费商品详情
        getByGoodsId (goodsId) {
            getByGoodsId({ goodsId }).then(response => {
                if (response.code === 200) {
                    let { baseMinutes, minutePrice, isSetting } = response.data;
                    this.$set(this.editItem, "isSetting", isSetting);
                    this.form.setFieldsValue({
                        baseMinutes,
                        minutePrice
                    });
                }
            }).catch(error => { });
        },
        //新增
        AddItem () {
            this.editItem = {
                goodsType: "software",
                isSetting: true
            };
            this.detailData = [];
            this.visibleModal = true;
            this.fileList = [];
            this.form = this.$form.createForm(this, {
                mapPropsToFields: () => {
                    return {
                        goodsName: this.$form.createFormField({
                            value: null
                        }),
                        price: this.$form.createFormField({
                            value: null
                        }),
                        users: this.$form.createFormField({
                            value: null
                        }),
                        years: this.$form.createFormField({
                            value: null
                        }),
                        copyright: this.$form.createFormField({
                            value: null
                        }),
                        roleName: this.$form.createFormField({
                            value: null
                        }),
                        baseMinutes: this.$form.createFormField({
                            value: null
                        }),
                        minutePrice: this.$form.createFormField({
                            value: null
                        }),
                    };
                }
            });
        },
        //编辑
        EdiItem () {
            this.editItem = {};
            if (this.selectedData.length != 1) {
                this.$message.warn("请选择一条数据");
                return false;
            }
            this.editItem = this.selectedData[0];

            console.log(this.editItem)
            this.roleId = this.editItem.roleId;
            this.roleName = this.editItem.roleName;
            if (this.editItem.goodsLogoUrl) {
                this.fileList = [
                    {
                        uid: '-1',
                        name: 'logo.png',
                        status: 'done',
                        url: this.editItem.goodsLogoUrl,
                    }];
            } else {
                this.fileList = [];
            }

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
                        copyright: this.$form.createFormField({
                            value: this.editItem.copyright
                        }),
                        roleName: this.$form.createFormField({
                            value: this.editItem.roleName
                        }),
                        baseMinutes: this.$form.createFormField({
                            value: this.editItem.baseMinutes
                        }),
                        minutePrice: this.$form.createFormField({
                            value: this.editItem.minutePrice
                        }),
                    };
                }
            });
            if (this.editItem.goodsType == "telCharges") {
                this.getByGoodsId(this.editItem.id);
            }
            this.visibleModal = true;
        },
        // 获取列表
        PageList () {
            pageList().then(response => {
                if (response.code === 200) {
                    this.data = response.data;
                    if (this.data && this.data.length > 0) {
                        this.drag();
                    }
                }
            }).catch(error => { });
        },
        Disable () {
            let _this = this;
            this.$confirm({
                title: '提示',
                content: '您确定要停用吗？',
                onOk () {
                    disable(_this.selectIds).then(response => {
                        if (response.code === 200) {
                            _this.$message.success("停用成功");
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
        Enable (item) {
            let _this = this;
            this.$confirm({
                title: '提示',
                content: '您确定要启用吗？',
                onOk () {
                    enable(_this.selectIds).then(response => {
                        if (response.code === 200) {
                            _this.$message.success("启用成功");
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
        // 拖动
        drag () {
            // 首先获取需要拖拽的dom节点
            const el1 = document.querySelectorAll('.goods-customize .ant-table-tbody')[0];
            if (!el1) return false;
            this.isDrag = true;
            Sortable.create(el1, {
                disabled: false, // 是否开启拖拽
                ghostClass: 'sortable-ghost', //拖拽样式
                animation: 150, // 拖拽延时，效果更好看
                group: { // 是否开启跨表拖拽
                    pull: false,
                    put: false
                },
                onEnd: (e) => { // 这里主要进行数据的处理，拖拽实际并不会改变绑定数据的顺序，这里需要自己做数据的顺序更改
                    let arr = this.data; // 获取表数据

                    let removeItem = arr.splice(e.oldIndex, 1)[0];
                    console.log(removeItem)
                    console.log(e)

                    arr.splice(e.newIndex, 0, removeItem); // 数据处理
                    //提前 赋值一个带值的数组（BUG 修复）
                    this.data = [{}];
                    this.$nextTick(function () {
                        this.data = [...arr];
                        this.data.map((item, index) => {
                            item.sort = index + 1;
                            item.isEdit = true;
                        });
                    });
                }
            });
        },
        saveSort () {
            //保存排序
            console.log(this.data);
            let requestData = [];
            this.data.forEach((item, index) => {
                requestData.push({ id: item.id, sort: index + 1 })
            });

            sortFun(requestData).then(res => {
                if (res.code === 200) {
                    this.$message.success('排序保存成功');
                    this.PageList();
                }
            })
        },
        //获取
        showFunction () {
            this.show = !this.show;
        },
        showModal (editItem) {
            console.log("editItem", editItem);
            this.editItem = { ...editItem };
            this.visibleModal = true;
        },
        hideModal () {
            this.visibleModal = false;
        },
        handleReset () {
            this.form.resetFields();
        },
        handleSubmit (e) {
            e.preventDefault();
            let goodsType = this.editItem.goodsType;
            let isSetting = this.editItem.isSetting;
            let fieldNames = ["goodsName", "users", "price", "years", "roleName", "copyright"];
            if (goodsType == "telCharges") {
                if (isSetting) {
                    fieldNames = ["goodsName", "price", "baseMinutes"];
                } else {
                    fieldNames = ["goodsName", "minutePrice", "price", "baseMinutes"];
                }

            }
            this.form.validateFields(fieldNames, (err, values) => {
                if (err) return;
                console.log("校验成功values:", values);
                let id = this.editItem.id;
                let remarks = this.editItem.remarks;
                this.editItem = { ...values };
                this.editItem.goodsType = goodsType;
                this.editItem.id = id;
                this.editItem.roleId = this.roleId;
                this.editItem.roleName = this.roleName;
                this.editItem.remarks = remarks;
                this.editItem.isSetting = isSetting;
                if (this.fileList.length == 1) {
                    if (this.fileList[0].url) {
                        this.editItem.goodsLogoUrl = this.fileList[0].url.toString();
                    } else {
                        this.editItem.goodsLogoUrl = this.fileList[0].response.url.toString();
                    }
                } else {
                    this.editItem.goodsLogoUrl = null;
                }
                console.log("开始保存:", this.editItem);
                save(this.editItem).then(response => {
                    if (response.code === 200) {
                        this.$message.success("保存成功");
                        //刷新 列表
                        this.PageList();
                        this.hideModal();
                        this.selectedData = [];
                        this.selectedKeys = [];
                    }
                })
            });
        },
        moneySetSubmit () {
            this.configInfo.createDate = null;
            save(this.configInfo).then(response => {
                if (response.code === 200) {
                    this.$message.success("保存成功");
                    //刷新 列表
                    this.PageList();
                    this.moneyVisible = false;
                    this.selectedData = [];
                    this.selectedKeys = [];
                }
            })
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
        onTableChange (pagination, filters, sorter) {
            Object.assign(this.postData, {
                "page.current": pagination.current,
                "page.size": pagination.pageSize
            });
            Object.assign(this.pagination, {
                current: pagination.current,
                pageSize: pagination.pageSize
            });
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
<style lang="less" scoped>
    .form-inline label {
        justify-content: left !important;
    }
    .form-inline > .col {
        margin-bottom: 1.5rem !important;
    }
    /deep/ .icons-list .anticon {
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
    /deep/ .upload-list-inline .ant-upload-list-item {
        float: left;
        width: 200px;
        margin-right: 8px;
    }
    /deep/ .upload-list-inline .ant-upload-animate-enter {
        animation-name: uploadAnimateInlineIn;
    }
    /deep/ .upload-list-inline .ant-upload-animate-leave {
        animation-name: uploadAnimateInlineOut;
    }
    .ant-popover-inner {
        z-index: 2999;
    }

    .from-title-text {
        font-weight: 700;
        line-height: 40px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
    }
    .goods-customize {
        margin-bottom: 20px;
    }

    .money-set-wrapper {
        border-radius: 4px;
        height: 120px;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        .goods-img {
            width: 100px;
            height: 100px;
            float: left;
            img {
                width: 100px;
                height: 100px;
                border-radius: 4px;
            }
        }
        .goods-explain {
            float: left;
            width: 80%;
            margin-left: 10px;
        }
    }
    .money-set-input {
        margin-top: 20px;
        display: flex;
        text-align: center;
        .item {
            flex: 1;
        }
        .item-explain {
            color: #888;
            margin-top: 10px;
        }
        .item-next {
            padding-top: 60px;
        }
        .m-s-border {
            width: 15%;
            height: 180px;
            padding: 10px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
            .ant-input-affix-wrapper {
                margin-top: 10px;
            }
        }
    }
    .user-class {
        margin-top: 20px;
    }
    /deep/ .ant-upload-list-picture-card .ant-upload-list-item {
        width: 100px;
        height: 100px;
    }
</style>