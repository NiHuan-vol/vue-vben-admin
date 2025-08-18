<!-- 基础设置->请购单 -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper">
            <!-- 按钮 -->
            <div class="btn-wrapper clearfix">
                <btns-wrapper @searchClick="searchClick" :showModel="showModel" :orderId="orderId" :voucherState="voucherState" :editMask="editMask" @printOrder="printOrder" @switchList="switchList" @submitServer="submitServer" @clickEdit="clickEdit" @deleteOrder="deleteOrder" @getIdByData="getIdByData" @auditClick="auditClick" @turnThePage="turnThePage" @syncOrder="syncOrder" @submitOrder="submitOrder" @exportDetail="exportDetail" :sourceCode="sourceCode">
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
                            </a-menu>
                        </a-dropdown>
                    </template>
                    <template slot="shengdan">
                        <a-dropdown class="btns" key="sheng" style="display:block">
                            <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                                <a-icon class="btns-icon" type="snippets" />
                                <div class="btns-text">生单
                                    <a-icon type="down" />
                                </div>
                            </a>
                            <a-menu v-if="voucherState==1" slot="overlay">
                                <a-menu-item key="0">
                                    <a href="javascript:void(0)" @click="generateBills('PurchaseOrder')">生成采购订单</a>
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
                    <!--列表-->
                    <dynamicList ref="dyList" :basePostData="basePostData" :sourceCode="sourceCode" @switchList="switchList" @dblclick="getIdByData" :reportCode="reportCodeList"></dynamicList>
                </section>
                <section v-show="showModel=='order'">
                    <div><span class="audit-status" v-show="voucherState==0">待审核</span><span class="audit-status" v-show="voucherState==1 || voucherState==10">{{voucherState==1?'已审核':'关闭'}}</span></div>
                    <a-form-model :layout="formLayout">
                        <div class="header-box">
                            <order-dynamic-form :FormData="orderHeaderData" @changetime="onChangeTime" @clickItem="setValue"></order-dynamic-form>
                            <div class="edit-mask-header" v-show="editMask">
                                <!-- 遮罩（点击修改关闭遮罩） -->
                            </div>
                        </div>
                        <div class="table-box">
                            <a-table id="bills_tb" :columns="columns" :data-source="dataSource" :customRow="customClick" :scroll="{ x: 1000, y: 347 }" :pagination="false" @change="onTableChange" :size="small" bordered>
                                <template v-if="isRouterAlive" slot="number" slot-scope="text, record, index">
                                    <div v-if="index == dataSource.length-1">
                                        合计
                                    </div>
                                    <div v-else>
                                        {{index+1}}
                                    </div>
                                </template>
                                <template v-for="col in slotArray" :slot="col" slot-scope="text, record,index">
                                    <div data-key="">
                                        <editable-cell v-if="isRouterAlive" :checkType="checkType" :text="text" :col="col" :index="index" :record="record" :dataSource="dataSource" :unitsDataDetails="unitsDataDetails" :unitsAssistSelect="unitsAssistSelect" :dynamicAllData="dynamicFormData" :dynamicFormDataMap="dynamicFormDataMap"  @choiceAddData="choiceAddData(index,col,$event)" @change="onCellChange(index, col, $event)" @newAddData="handleAdd" />
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
                    <dynamicListDetails ref="detailSearchRef" :reportCode="reportCodeDetail" :componentType="1"  :basePostData="basePostData"></dynamicListDetails>
                </section>
                <section v-show="showModel=='statistical'">
                    <!--统计-->
                    <dynamicListDetails ref="statisticalSearchRef" :reportCode="reportCodeStatistical" :componentType="2"  :basePostData="basePostData"></dynamicListDetails>
                </section>
            </div>
            <div class="contextmenu-box">
                <!-- 右键菜单 -->
                <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
                    <li @click="handleAdd()">新增行</li>
                    <li @click="handleDelete()">删除行</li>
                    <!-- <li @click="handleCopy()">复制行</li> -->
                </ul>
            </div>
            <drawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder"></drawerBox>
        </div>

        <!--加载中-->
        <div class="loading-wrapper" v-show="loading">
            <a-spin class="loading-content" tip="加载中..." />
        </div>
        <!--用做横向打印-->
        <!-- <div v-html="stylePrint"></div> -->
        <print-modal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint"></print-modal>

        <!--销售订单  分单 销售发货单-->
        <requisition-modal ref="purchaseOrderRef"></requisition-modal>
        
    </div>
</template>
<script>


import { save, examine, remove, getCode } from '@/api/purchase/requisitionOrder';//请购单接口


import pro from '@/mixins/procurement/pro';
import requisitionModal from '@/components/SeparateBill/requisitionModal.vue';

export default {
    mixins: [pro],
    components: {
        requisitionModal
    },
    data() {
        return {
            sourceCode: 'PurchaseRequisition',
            reportCodeDetail: 'PurchaseRequisition_Detail_Report',          //明细code
            reportCodeStatistical: 'PurchaseRequisition_Statistic_Report',   //统计code
            reportCodeList: 'PurchaseRequisition_List_Report',              //列表code

            checkType: 'is_purchasing',//采购
        };
    },
    created() {
        // this.getIdByData();//获取最新一条数据
    },
    methods: {
        //新增
        newForecast() {
            this.showModel = 'order';
            this.editMask = false;
            this.loading = false;
            this.voucherState = -1;
            this.sourceVoucherData = {};//清空来源数据
            this.initForm(1);
        },
        //保存
        submit(requestData) {
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
        //审核
        auditClick(type) {
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
        remove(postData) {
            remove(postData).then(response => {
                if (response.code === 200) {
                    this.$message.success('删除成功');
                    this.orderId = '';
                    this.getIdByData();//获取最新一条数据
                } else {
                    this.$message.error(response.message);
                }
            })
        },
        //获取单据编号
        getCode() {
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
    }
};
</script>
<style lang="less">
@import "~@/style/purchase/voucher.less";
</style>