<!--
 * @Descripttion: 委外发票
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-07-05 15:54:23
 * @LastEditors: GW
 * @LastEditTime: 2021-12-21 10:31:49
-->
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
                                    <a-icon type="down" />                                </div>
                            </a>
                            <a-menu v-if="voucherState==1" slot="overlay">
                                <a-menu-item key="0">
                                    <a href="javascript:void(0)" @click="generateBills('PayableVoucher')">生成采购应付单</a>
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
                    <dynamicList ref="dyList" :basePostData="basePostData" :sourceCode="sourceCode" @switchList="switchList" @editClickOrder="editClickOrder" :businessType="businessType" :reportCode="reportCodeList"></dynamicList>
                </section>
                <section v-show="showModel=='order'">
                    <div><span class="audit-status" v-show="voucherState==0">待审核</span><span class="audit-status" v-show="voucherState==1 || voucherState==10">{{voucherState==1?'已审核':'关闭'}}</span></div>
                    <a-form-model :layout="formLayout">
                        <div class="header-box">
                            <order-dynamic-form :FormData="orderHeaderData" @changetime="onChangeTime" @clickItem="setValue" @downSelectChange="downSelectChange"></order-dynamic-form>
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
                    <dynamicListDetails ref="detailSearchRef" :reportCode="reportCodeDetail" :componentType="1" :basePostData="basePostData"></dynamicListDetails>
                </section>
                <section v-show="showModel=='statistical'">
                    <!--统计-->
                    <dynamicListDetails ref="statisticalSearchRef" :reportCode="reportCodeStatistical" :componentType="2" :basePostData="basePostData"></dynamicListDetails>
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
            <drawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder" :parentSourceCode="sourceCode"></drawerBox>
        </div>

        <!--加载中-->
        <div class="loading-wrapper" v-show="loading">
            <a-spin class="loading-content" tip="加载中..." />        </div>
        <!--用做横向打印-->
        <!-- <div v-html="stylePrint"></div> -->
        <print-modal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint"></print-modal>
    </div>
</template>
<script>


import { saveOrderForDelegate, examine, remove, getCodeForDelegate, submitOrder } from '@/api/purchase/purchaseInvoice';



import pro from '@/mixins/procurement/pro'

export default {
    mixins: [pro],
    data () {
        return {
            //基础 查询条件（列表 + 翻页）
            basePostData: {
                dataSource: 'DelegateInvoice',
                someBusinessType: null,
            },
            sourceCode: 'DelegateInvoice',
            reportCodeDetail: 'DelegateInvoice_Detail_Report',          //明细code
            reportCodeStatistical: 'DelegateInvoice_Statistic_Report',   //统计code
            reportCodeList: 'DelegateInvoice_List_Report',              //列表code
            checkType: 'is_made_request',//委外
        };
    },
    created () {
        //this.getIdByData();//获取最新一条数据
    },
    methods: {
        //新增
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
            saveOrderForDelegate(requestData).then(response => {
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
                    this.getIdByData();//获取最新一条数据
                } else {
                    this.$message.error(response.message);
                }
            })
        },
        //获取单据编号
        getCode () {
            getCodeForDelegate().then((res) => {
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
        //业务类型改变
        downSelectChange (value) {
            console.log('业务类型:', value)
            console.log('当前数据', this.dataSource)
            // if (value == 97) {
            //     //冲抵
            //     for (let i = 0; i < this.dataSource.length; i++) {
            //         if (this.dataSource[i].sourceVoucherType && this.dataSource[i].id == '') {
            //             this.dataSource[i].baseQuantity = this.dataSource[i].orgBaseQuantity - this.dataSource[i].cumExecuteQuantity;
            //         }
            //     }
            // }
            // if (value == 99) {
            //     for (let i = 0; i < this.dataSource.length; i++) {
            //         if (this.dataSource[i].sourceVoucherType && this.dataSource[i].id == '') {
            //             this.dataSource[i].baseQuantity = this.dataSource[i].orgBaseQuantity - this.dataSource[i].cumRetQuantity;
            //         }
            //     }
            // }
            // this.reload();
        }
    }
};
</script>
<style lang="less">
    @import '~@/style/purchase/voucher.less';
</style>