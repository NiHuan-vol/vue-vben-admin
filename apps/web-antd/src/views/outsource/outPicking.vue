<!--
 * @Descripttion: 委外领料单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-06-28 16:48:23
 * @LastEditors: GW
 * @LastEditTime: 2021-12-21 10:25:47
-->
<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper">
            <!-- 按钮 -->
            <div class="btn-wrapper clearfix">
                <btns-wrapper @submitClick="submitClick" @searchClick="searchClick" :showModel="showModel" :orderId="orderId" :voucherState="voucherState" :editMask="editMask" @printOrder="printOrder" @switchList="switchList" @submitServer="submitServer" @clickEdit="clickEdit" @deleteOrder="deleteOrder" @getIdByData="getIdByData" @auditClick="auditClick" @turnThePage="turnThePage" @syncOrder="syncOrder" @submitOrder="submitOrder" @exportDetail="exportDetail" :sourceCode="sourceCode">
                    <template slot="neworder">
                        <a-dropdown class="btns" key="new" style="display:block">
                            <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                                <a-icon class="btns-icon" type="file-add" />
                                <div class="btns-text">新增
                                    <a-icon type="down" style="color:rgb(24,144,255);vertical-align:middle;" />
                                </div>
                            </a>
                            <a-menu slot="overlay">
                                <a-menu-item key="0">
                                    <a href="javascript:void(0)" @click="newForecast">新增</a>
                                </a-menu-item>
                                <a-menu-item key="1">
                                    <a href="javascript:void(0)" @click="choiceBillsWork()">选委外订单</a>
                                </a-menu-item>
                            </a-menu>
                        </a-dropdown>
                    </template>
                </btns-wrapper>
            </div>
            <div ref="print" class="documents-wrapper" id="documents-wrapper">
                <h3 class="text-center">
                    {{voucherTitle}}
                </h3>
                <section v-show="showModel=='list'">
                    <dynamicList ref="dyList" :basePostData="basePostData" :sourceCode="sourceCode" :dataSourceCode="dataSourceCode" @switchList="switchList" @editClickOrder="editClickOrder" :businessType="businessType" :reportCode="reportCodeList"></dynamicList>
                </section>
                <section v-show="showModel=='order'">
                    <div>
                        <span class="audit-status" v-show="voucherState==0">待审核</span><span class="audit-status" v-show="voucherState==1 || voucherState==10">{{voucherState==1?'已审核':'关闭'}}</span>
                        <span class="audit-status" v-show="voucherState==2">{{voucherState==2?'已确认':''}}</span>
                    </div>
                    <a-form-model :layout="formLayout">
                        <div class="header-box">
                            <order-dynamic-form :FormData="orderHeaderData" @changetime="onChangeTime" @clickItem="setValue"></order-dynamic-form>
                            <div class="edit-mask-header" v-show="editMask">
                                <!-- 遮罩（点击修改关闭遮罩） -->
                            </div>
                        </div>
                        <div class="table-box">
                            <a-table id="bills_tb" :columns="columns" :data-source="dataSource" :customRow="customClick" :scroll="{ x: 1000, y: 347 }" :pagination="false" @change="onTableChange" :size="small" bordered>
                                <template slot="number" v-if="isRouterAlive" slot-scope="text, record, index">
                                    <div v-if="index == dataSource.length-1">
                                        合计
                                    </div>
                                    <div v-else>
                                        {{index+1}}
                                    </div>
                                </template>
                                <template v-for="col in slotArray" :slot="col" slot-scope="text, record,index">
                                    <div data-key="">
                                        <editable-cell v-if="isRouterAlive" :checkType="checkType" :productCheckType="productCheckType" :text="text" :col="col" :index="index" :record="record" :dataSource="dataSource" :unitsDataDetails="unitsDataDetails" :unitsAssistSelect="unitsAssistSelect" :dynamicAllData="dynamicFormData" :dynamicFormDataMap="dynamicFormDataMap"  @choiceAddData="choiceAddData(index,col,$event)" @change="onCellChange(index, col, $event)" @newAddData="handleAdd" />
                                    </div>
                                </template>
                            </a-table>
                            <div class="edit-mask" v-show="editMask">
                                <!-- 遮罩（点击修改关闭遮罩） -->
                            </div>
                        </div>
                        <div class="footer-box">
                            <order-dynamic-form :FormData="orderFooterData"  @changetime="onChangeTime" @clickItem="setValue"></order-dynamic-form>
                            <div class="edit-mask-footer" v-show="editMask">
                                <!-- 遮罩（点击修改关闭遮罩） -->
                            </div>
                        </div>
                    </a-form-model>
                </section>
                <section v-show="showModel=='detail'">
                    <!--明细-->
                    <dynamicListDetails ref="detailSearchRef" :reportCode="reportCodeDetail" :dataSourceCode="dataSourceCode" :componentType="1" :businessType="businessType" :basePostData="basePostData"></dynamicListDetails>
                </section>
                <section v-show="showModel=='statistical'">
                    <!--统计-->
                    <dynamicListDetails ref="statisticalSearchRef" :reportCode="reportCodeStatistical" :dataSourceCode="dataSourceCode" :componentType="2" :businessType="businessType" :basePostData="basePostData"></dynamicListDetails>
                </section>
            </div>
            <div class="contextmenu-box">
                <!-- 右键菜单 -->
                <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
                    <li @click="handleAdd()">新增行</li>
                    <li @click="handleDelete()">删除行</li>
                </ul>
            </div>
            <drawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder"></drawerBox>
        </div>

        <!--加载中-->
        <div class="loading-wrapper" v-show="loading">
            <a-spin class="loading-content" tip="加载中..." />        </div>
        <print-modal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint"></print-modal>

        <!--选委外订单-->
        <a-modal v-model:visible="visibleTips" @cancel="cancel" @ok="ok" :title="'选委外订单'" :width="1100" destroyOnClose>
            <section>
                <!--搜索条件-->
                <a-form-model :layout="formLayout">
                    <a-row class="order-dynamic-form-wrapper">
                        <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                            <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="单据日期">
                                <a-range-picker style="width:220px;" @change="(date,dateString)=>{onChangeDate(date,dateString,1)}" />                            </a-form-model-item>
                        </a-col>
                        <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                            <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="加工单号">
                                <a-input v-model="searchData.productionWorkCode"></a-input>                            </a-form-model-item>
                        </a-col>
                        <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                            <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="预计开工日期">
                                <a-range-picker style="width:220px;" @change="(date,dateString)=>{onChangeDate(date,dateString,2)}" />                            </a-form-model-item>
                        </a-col>
                        <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                            <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="委外供应商">
                                <a-input-search v-model="searchData.vendorName" placeholder="请选择委外供应商" size="small" @search="handleSearch('choiceSupplieRef')" />                                <form-search-group ref="choiceSupplieRef" :dynamicData="{code:'supplie',name:'委外供应商',val:'supplie',value:searchData.vendorName}" @clickItem="setValueTips"></form-search-group>                            </a-form-model-item>
                        </a-col>
                        <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                            <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="生产车间">
                                <a-input-search v-model="searchData.officeName" placeholder="请选择生产车间" size="small" @search="handleSearch('choiceOfficeRef')" />                                <form-search-group ref="choiceOfficeRef" :dynamicData="{code:'office',name:'生产车间',val:'office',value:searchData.officeName}" @clickItem="setValueTips"></form-search-group>                            </a-form-model-item>
                        </a-col>
                        <a-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl" :xxl="grid.xxl">
                            <a-form-model-item :label-col="labelCol" :wrapper-col="wrapperCol" label="产品名称">
                                <a-input-search v-model="searchData.inventoryName" placeholder="请选择产品" size="small" @search="handleSearch('choiceInventoryRef')" />                                <form-search-group ref="choiceInventoryRef" :dynamicData="{code:'inventory',name:'产品名称',val:'inventory',value:searchData.inventoryName}" @clickItem="setValueTips"></form-search-group>                            </a-form-model-item>
                        </a-col>
                    </a-row>
                </a-form-model>
                <div style="text-align:right">
                    <a-button type="primary" icon="search" @click="searchBillsWork">搜索</a-button>                </div>
            </section>
            <section>
                <!--列表-->
                <p>产成品明细</p>
                <div style="min-height:230px">
                    <a-table :columns="columnsChoiceHeader" :data-source="workOrderMain" bordered :pagination="false" :row-selection="rowSelectionMain" :scroll="{x:1000,y:260}">
                    </a-table>
                </div>

                <p class="margin-top-10">物料明细</p>
                <div style="min-height:230px">
                    <a-table :columns="columnsChoiceDetails" :data-source="workOrderDetail" bordered :pagination="false" :row-selection="rowSelectionDetails" :scroll="{x:1000,y:260}">
                    </a-table>
                </div>
            </section>
            <template #footer>
                <div>
                    <a-button type="primary" @click="ok">确认</a-button>
                    <a-button @click="cancel" class="margin-left-10">关闭</a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>
<script>


import { save, submitApi, examine, remove, getCode, choiceDispatch, submitOrder } from '@/api/outsource/outPicking'
import pro from '@/mixins/procurement/pro';
import FormSearchGroup from '@/components/Form/FormSearchGroup';
import getDate from "@/utils/tool/date";

export default {
    name: 'OutPicking',
    mixins: [pro],
    data () {
        return {
            //基础 查询条件（列表 + 翻页）
            basePostData: {
                dataSource: "DelegateRRS",
                someBusinessType: "4",
            },
            sourceCode: 'DelegateRRS',
            reportCodeDetail: 'DelegateRRS_Detail_Report',          //明细code
            reportCodeStatistical: 'DelegateRRS_Statistic_Report',   //统计code
            reportCodeList: 'DelegateRRS_List_Report',               //列表code
            dataSourceCode: 'DelegateRRS',//是否是委外
            businessType: 4,
            isPRF: true,

            checkType: 'is_material',//生产耗用
            productCheckType: 'is_made_request',     //产品属性：委外加工产品

            //----------↓样式----------
            grid: {
                xs: 24,
                sm: 24,
                md: 12,
                lg: 8,
                xl: 8,
                xxl: 8
            },
            formLayout: "inline",
            fromStyle: { paddingTop: "8px" },
            labelCol: { span: 8 },
            wrapperCol: { span: 14 },
            editFalse: {
                borderBottom: '1px solid #ded7d7'
            },
            //-----------↑样式----------


            //-----------↓搜索条件--------
            searchData: {
                dataSource: 'DelegateProductionWork',
                businessType: 4,
                officeId: null,                     //生产车间ID
                officeName: null,
                inventoryId: null,
                inventoryName: null,
                expectStartDateEnd: null,           //预计开工开始时间
                expectStartDateStart: null,         //预计开工结束时间
                saleOrderCode: null,                //销售单号
                productionWorkCode: null,           //加工单号
                voucherCode: null,                  //单据编号（派工单号）
                voucherDateEnd: null,               //单据日期开始时间
                voucherDateStart: null,             //单据日期结束时间
                vendorName: null,                   //委外供应商
                vendorId: null,
                salesmanName: null,                 //业务员
                salesmanId: null,
            },
            //-----------↑搜索条件----------
            workOrderMain: [],
            workOrderDetail: [],
            workOrderDetailShow: [],//展示单个物料明细

            selectedRowKeysMain: [],
            selectedRowsMain: [],
            selectedRowKeysDetails: [],
            selectedRowsDetails: [],//选中的明细



            visibleTips: false,
            columnsChoiceHeader: [{
                title: '序号',
                dataIndex: '',
                width: 40,
                customRender: (text, record, index) => {
                    return <span>{index + 1}</span>
                },
                align: 'center'
            }, {
                title: '加工单号',
                dataIndex: 'voucherCode',
                width: 130,
            }, {
                title: '单据日期',
                dataIndex: 'voucherDate'
            }, {
                title: '生产车间名称',
                dataIndex: 'officeName'
            }, {
                title: '产品编码',
                dataIndex: 'inventoryCode'
            }, {
                title: '产品名称',
                dataIndex: 'inventoryName'
            }, {
                title: '规格型号',
                dataIndex: 'inventorySpecification'
            }, {
                title: '主计量',
                dataIndex: 'baseUnitName',
            }, {
                title: '加工数量',
                dataIndex: 'baseQuantity'
            }, {
                title: '到货数量',
                dataIndex: 'cumExecuteQuantity',
            }],
            columnsChoiceDetails: [{
                title: '序号',
                dataIndex: '',
                width: 40,
                customRender: (text, record, index) => {
                    return <span>{index + 1}</span>
                },
                align: 'center'
            }, {
                title: '加工单号',
                dataIndex: 'voucherCode',
                width: 130,
            }, {
                title: '材料编码',
                dataIndex: 'inventoryCode'
            }, {
                title: '材料名称',
                dataIndex: 'inventoryName'
            }, {
                title: '材料规格型号',
                dataIndex: 'inventorySpecification'
            }, {
                title: '主计量',
                dataIndex: 'baseUnitName'
            }, {
                title: '计划数量',
                dataIndex: 'plannedQuantity',
            }, {
                title: '可领用数量',
                dataIndex: 'availablePickQuantity',
            }, {
                title: '累积领用数量',
                dataIndex: 'cumPickQuantity',
            }, {
                title: '产品编码',
                dataIndex: 'productionInventoryCode'
            }, {
                title: '产品名称',
                dataIndex: 'productionInventoryName'
            }, {
                title: '产品规格型号',
                dataIndex: 'productionInventorySpecification'
            }],
        };
    },
    created () {
        //this.getIdByData();//获取最新一条数据
    },
    components: {
        FormSearchGroup,
    },
    computed: {
        rowSelectionMain () {
            return {
                columnWidth: 40,
                selectedRowKeys: this.selectedRowKeysMain,
                onChange: this.onSelectChangeMain,
            }
        },
        rowSelectionDetails () {
            return {
                columnWidth: 40,
                selectedRowKeys: this.selectedRowKeysDetails,
                onChange: this.onSelectChangeDetails
            }
        },
    },
    watch: {
        searchData: {
            handler (data) {
                if (data.officeName == '') {
                    data.officeId = '';
                }
                if (data.inventoryName == '') {
                    data.inventoryId = '';
                }
            },
            deep: true,
        }
    },
    methods: {
        //新增预测单
        newForecast () {
            this.showModel = 'order';
            this.editMask = false;
            this.loading = false;
            this.voucherState = -1;
            this.sourceVoucherData = {};//清空来源数据
            this.initForm(1);
        },
        //保存
        submit (requestData) {
            if (this.selectedRowsMain.length > 0) {
                requestData.sourceDelegateProductionWorkId = this.selectedRowsMain[0].key;//来源委外加工单id
            }
            save(requestData).then(response => {
                if (response.code === 200) {
                    this.$message.success('保存成功');
                    this.editMask = true;
                    this.isSaveRun = true;
                    if (!this.orderId) {
                        this.getIdByData(); //获取最新一条数据
                    }
                } else {
                    this.$message.error(response.message);
                    this.isSaveRun = true;
                }
            }).catch((e) => {
                this.isSaveRun = true;
            })
        },
        //单据提交
        submitOrder (type) {
            let data = {
                id: this.orderId,
                status: type,//状态 -1:撤回提交,0:提交
            }
            console.log(this.orderId);
            if (!this.orderId) {
                this.$message.warning('该单据未保存不需要提交');
                return;
            }
            if (this.voucherState == -1 && type == -1) {
                this.$message.warning('该单据未提交无需撤回提交');
                return;
            }
            submitOrder(data).then(res => {
                if (res.code === 200) {
                    if (type == 0) {
                        this.$message.success('提交成功');
                    } else {
                        this.$message.success('撤回提交成功');
                    }
                    this.getIdByData();
                }
            })
        },
        //审核
        auditClick (type) {
            let requestData = {
                id: this.orderId,
                status: type
            }
            examine(requestData).then((response) => {
                if (response.code === 200) {
                    const backData = response.data;
                    if (type == 1) {
                        this.$message.success('审核成功');
                        this.getIdByData();
                    }
                    if (type == 0) {
                        this.$message.success('弃审成功');
                        this.getIdByData();
                    }
                } else {
                    // this.$message.warning(response.message);
                }
            })
        },
        //删除
        remove (postData) {
            remove(postData).then(response => {
                if (response.code === 200) {
                    this.$message.success('删除成功');
                    this.orderId = '';
                    this.voucherState = 0;
                    this.getIdByData();//获取最新一条数据
                } else {
                    this.$message.error(response.message);
                }
            })
        },
        //获取单据编号
        getCode () {
            getCode().then((res) => {
                if (res.code == 200) {
                    console.log(res);
                    this.receiptNumber = res.message;
                    console.log(this.orderHeaderData)
                    for (let i = 0; i < this.orderHeaderData.length; i++) {
                        if (this.orderHeaderData[i].code == 'voucherCode') {
                            this.$set(this.orderHeaderData[i], 'onEdit', false)
                            this.$set(this.orderHeaderData[i], 'value', this.receiptNumber)
                        }
                    }
                } else {
                    // this.$message.warning(res.message);
                }
            });
        },
        //选委外订单
        choiceBillsWork () {
            this.selectedRowKeysMain = [];
            this.selectedRowsMain = [];
            this.selectedRowKeysDetails = [];
            this.selectedRowsDetails = [];//选中的明细
            this.workOrderDetailShow = [];//清空选中的物料明细
            this.visibleTips = true;
            this.searchBillsWork();
        },
        //搜索委外加工单
        searchBillsWork () {
            const { searchData } = this;
            choiceDispatch(searchData).then((res) => {
                if (res.code == 200) {
                    console.log(res);
                    this.workOrderMain = res.data.unFinishDelegateProductionWorkVoList.map(v => {
                        return { ...v, key: v.productionWorkDetailId }
                    })

                    this.workOrderDetail = res.data.unFinishDelegateInventoryDetailVoList.map(v => {
                        return { ...v, key: v.sourceWorkInventoryDetailId }
                    });
                } else {
                    // this.$message.warning(res.message);
                }
            })
        },
        onSelectChangeMain (keys, rows) {
            console.log(keys, rows)
            //选单表头table
            this.selectedRowKeysMain = keys;
            this.selectedRowsMain = rows;

            let detailsKeys = [];
            this.workOrderDetailShow = [];

            this.workOrderDetail.forEach(d => {
                rows.forEach(r => {
                    if (d.productionWorkDetailId == r.productionWorkDetailId) {
                        this.workOrderDetailShow.push(d);//用于展示明细表的数据
                        detailsKeys.push(d.sourceWorkInventoryDetailId);
                    }
                });
            });
            detailsKeys = [...new Set(detailsKeys)]
            this.selectedRowKeysDetails = detailsKeys;
        },
        onSelectChangeDetails (keys, rows) {
            //选单明细table
            console.log(keys, rows)
            this.selectedRowKeysDetails = keys;

            this.selectedRowsDetails = rows;

            //选中明细同时表头也要选中
            let mainKeys = [];
            rows.forEach(r => {
                mainKeys.push(r.productionWorkDetailId)
            });
            mainKeys = [...new Set(mainKeys)]
            this.selectedRowKeysMain = mainKeys;


            this.selectedRowsMain = [];
            this.workOrderMain.forEach(d => {
                rows.forEach(r => {
                    if (d.productionWorkDetailId == r.productionWorkDetailId) {
                        this.selectedRowsMain.push(d);
                    }
                });
            });
        },
        //下拉搜索赋值=-----------------------------------
        setValueTips (data) {
            if (data.codesName == 'office') {
                this.searchData.officeId = data.id;
                this.searchData.officeName = data.name;
            } else if (data.codesName == 'inventory') {
                this.searchData.inventoryId = data.id;
                this.searchData.inventoryName = data.name;
            } else if (data.codesName == 'supplie') {
                this.searchData.vendorId = data.id;
                this.searchData.vendorName = data.name;
            } else if (data.codesName == 'employees') {
                this.searchData.salesmanId = data.id;
                this.searchData.salesmanName = data.name;
            }
        },
        onChangeDate (e, v, type) {
            if (type == 1) {
                this.searchData.voucherDateEnd = v[0];
                this.searchData.voucherDateStart = v[1];
            } else {
                this.searchData.expectStartDateEnd = v[0];
                this.searchData.expectStartDateStart = v[1];
            }
        },
        handleSearch (n) {
            this.$refs[`${n}`].showModal();
        },
        //下拉搜索赋值=-----------------------------------
        cancel () {
            this.visibleTips = false;
        },
        ok () {
            this.selectedRowsDetails = [];

            console.log(this.workOrderDetail, this.selectedRowKeysDetails);

            this.workOrderDetail.forEach(item => {
                this.selectedRowKeysDetails.forEach(details => {
                    if (item.sourceWorkInventoryDetailId == details) {
                        item.baseQuantity = item.availablePickQuantity;
                        this.selectedRowsDetails.push(item);
                    }
                });
            });

            //保存选中需要计算的明细
            if (this.selectedRowsDetails.length < 1) {
                this.$message.warning('请选择物料明细');
                return
            } else {

                //判断生产车间必须一致
                let off = this.selectedRowsMain;

                console.log(this.selectedRowsMain);
                for (let i = 0; i < off.length; i++) {
                    if (off[i + 1]) {
                        if (off[i].officeId != off[i + 1].officeId) {
                            this.$message.warning('生产车间必须一致');
                            return;
                        }
                    }
                }
                //选派工单
                let record = {
                    officeId: off[0].officeId,
                    officeName: off[0].officeName,//生产车间
                    vendorId: off[0].vendorId,
                    vendorName: off[0].vendorName,//供应商

                    productName: off[0].inventoryName,//加工产品名,
                    productId: off[0].inventoryId,
                    productCode: off[0].inventoryCode,


                    voucherType: 1,//单据类型
                    voucherDate: getDate.getCurrentMoment().format('YYYY-MM-DD'),
                    voucherCode: 'asdfasdfasdfsd',
                    businessType: this.businessType,
                    sourceVoucherType: 'DelegateProductionWork',
                    detailList: this.selectedRowsDetails
                }
                record.detailList.forEach(item => {
                    item.productName = item.productionInventoryName;
                    item.productId = item.productionInventoryId;
                    item.productCode = item.productionInventoryCode;
                    item.productSpecification = item.productionInventorySpecification;
                    item.sourceVoucherType = 'DelegateProductionWork';
                });
                this.editClickOrder(record, 'ischoose')
                this.visibleTips = false;
            }
        },
        //操作员 领料
        submitClick () {
            let request = {
                id: this.orderId,
                status: 2,//状态 1:退单,2:提交申请
            }
            submitApi(request).then((res) => {
                if (res.code == 200) {
                    this.$message.success('领料申请成功');
                    this.syncOrder();
                } else {
                    // this.$message.warning(res.message);
                }
            });
        }
    }
};
</script>
<style lang="less" scoped>
    @import '~@/style/purchase/voucher.less';
</style>