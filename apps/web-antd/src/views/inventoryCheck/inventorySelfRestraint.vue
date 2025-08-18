<!--
 * @Descripttion: 产成品入库核算
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-07-06 14:50:14
 * @LastEditors: GW
 * @LastEditTime: 2021-09-27 16:54:16
-->
<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper">
            <!-- 按钮 -->
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventorySelfRestraint:audit')">
                            <div class="btns" style="display:block;margin-left:10px" @click="handlerAudit">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="file-add" />
                                    <div class="btns-text">勾稽</div>
                                </a>
                            </div>
                        </a-col> -->
                        <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventorySelfRestraint:accounting')">
                            <div class="btns" style="display:block;margin-left:10px" @click="handlerAccounting">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="edit" />
                                    <div class="btns-text">核算</div>
                                </a>
                            </div>
                        </a-col>
                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventorySelfRestraint:search')">
                            <div class="btns" style="display:block;margin-left:10px">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="file-search" />
                                    <div class="btns-text">查询</div>
                                </a>
                            </div>
                        </a-col> -->

                        <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2">
                            <div class="btns" style="display:block;margin-left:10px" @click="sync">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="sync" />
                                    <div class="btns-text">刷新</div>
                                </a>
                            </div>
                        </a-col>

                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventorySelfRestraint:export')">
                            <div class="btns" style="display:block;margin-left:10px">
                                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                                    <a-icon class="btns-icon" type="export" />
                                    <div class="btns-text">导出</div>
                                </a>
                            </div>
                        </a-col> -->

                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2">
                            <div class="btns" style="display:block;margin-left:10px">
                                <a class="ant-dropdown-link" @click="printClick">
                                    <a-icon class="btns-icon" type="printer" />
                                    <div class="btns-text">打印</div>
                                </a>
                            </div>
                        </a-col> -->
                        <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2">
                            <div class="btns" style="display:block;margin-left:10px" @click="showDrawer">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="setting" />
                                    <div class="btns-text">字段设置</div>
                                </a>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>
            <div ref="print" class="documents-wrapper" id="documents-wrapper">
                <h3 class="text-center">自制入库核算</h3>

                <section>
                    <a-table :data-source="dataSource" :columns="columns" :pagination="false" :scroll="{x:800,y:600}" bordered>
                        <!-- <template slot="voucherCode" slot-scope="text,record,index">
                            {{index!=0?text==dataSource[index-1].voucherCode?'':text :text}}
                        </template>
                        <template slot="invoiceCode" slot-scope="text,record,index">
                            {{index!=0?text==dataSource[index-1].invoiceCode?'':text :text}}
                        </template>
                        <template slot="voucherDate" slot-scope="text,record,index">
                            {{index!=0?text==dataSource[index-1].voucherDate?'':text :text}}
                        </template>
                        <template slot="amount" slot-scope="text">
                            {{text | NumFormat}}
                        </template> -->

                        <template slot="isAccounting" slot-scope="text">
                            {{text==1?'已核算':'未核算'}}
                        </template>
                        <template slot="isAudit" slot-scope="text">
                            {{text==1?'已勾稽':'未勾稽'}}
                        </template>
                        <template v-for="item in ['price']" :slot="item" slot-scope="text, record ,index">
                            <div :key="item">
                                <editable-cell v-if="isRouterAlive" :record="record" :col="item" :text="text" @change="onCellChange(index, item, $event)" />
                            </div>
                        </template>
                    </a-table>
                </section>
            </div>
        </div>

        <!--加载中-->
        <div class="loading-wrapper" v-show="loading">
            <a-spin class="loading-content" tip="加载中..." />
        </div>
        <!--用做横向打印-->
        <div v-html="stylePrint"></div>

        <!--右侧显示字段设置  抽屉-->
        <drawer ref="drawerRef" :data="showColumns" :type="type" @getField="getField"></drawer>
    </div>
</template>
<script>


import {
    auditApi,
    getEvaluationListApi,
    getInvoiceListApi,
    gwtWarehousingListApi,
    accountApi,
    saveEvaluationListApi,
    saveAccountingFieldtApi,
    getAccountingFieldApi,
    getProductReceiveListApi,
    productReceiveApi
} from '@/api/inventoryCheck/inventoryCheckOut'

import { list as ListPeriod } from "@/api/erp/period";//获取会计期间
import editableCell from "./components/EditableCell";

import drawer from "./components/drawer"
import { mapState } from "vuex";
import { checkOutColumnsJson, evaluateColumnsJson, selfRestraintColumnsJson } from './columnsJson/checkOut'
export default {
    components: {
        editableCell,
        drawer
    },
    data() {
        return {
            columns: [],
            dataSource: [],
            showColumns: [],
            type: 3,//type:1 外购入库核算 type:2 存货暂估入库 type:3 产成品入库核算
            isRouterAlive: true,
            loading: false,
        }
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    created() {
        this.getPeriod();

        //获取列表显示字段
        this.getField();
        //获取数据
        this.getList();
    },
    methods: {
        reload() {
            //强制刷新表格
            this.isRouterAlive = false;
            this.$nextTick(function () {
                this.isRouterAlive = true;
            });
        },
        getPeriod() {
            //获取会计期间
            ListPeriod().then(response => {
                if (response.code === 200) {
                    // console.log(response.data);
                }
            }).catch(error => {
                this.$message.error(error.message);
            });
        },
        getList() {
            let request = {
                dataSource: 'ProductReceiveVoucher',
            }
            this.loading = true;
            getProductReceiveListApi(request).then(res => {
                if (res.code === 200) {
                    this.dataSource = res.data;
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.$message.warning(err.message);
            })
        },
        initColumns() {
            //组装columns
            this.columns = [];
            if (this.showColumns.length > 0) {
                selfRestraintColumnsJson.forEach(item => {
                    this.showColumns.forEach(show => {
                        if (item.title == show) {
                            let data = {
                                dataIndex: item.code,
                                title: item.title,
                                scopedSlots: item.scopedSlots,
                                width: item.width,
                                align: item.align,
                            }
                            if (item.title == '单价') {
                                data.title = <div><span style="color:red">*</span>单价</div>
                            }
                            this.columns.push(data);
                        }
                    });
                })
                console.log('有值', this.columns)
            } else {
                selfRestraintColumnsJson.forEach(item => {
                    let data = {
                        dataIndex: item.code,
                        title: item.title,
                        scopedSlots: item.scopedSlots,
                        width: item.width,
                        align: item.align,
                    }
                    this.columns.push(data);
                })
                console.log('无值', this.columns)
            }
        },
        getField() {
            //获取columns显示字段
            getAccountingFieldApi({ type: this.type }).then(res => {
                if (res.code === 200) {
                    if (res.data == null) {
                        this.showColumns = [];
                    } else if (res.data && (res.data.field == null || res.data.field == '[]' || res.data.field == '')) {
                        this.showColumns = [];
                    } else {
                        this.showColumns = res.data.field.split(',');
                    }
                    this.initColumns();
                }
            }).catch(reeor => {

            })
        },
        showDrawer() {
            //显示抽屉
            this.$refs.drawerRef.showDrawer();
        },
        handlerAudit() {
            //勾稽
            auditApi().then(res => {
                if (res.code === 200) {
                    this.$message.success('勾稽成功');
                    this.getList();
                } else {
                    // this.$message.warning(res.message);
                }
            })
        },
        handlerAccounting() {
            //核算
            let request = {
                dataSource: 'ProductReceiveVoucher'
            };
            productReceiveApi(this.dataSource).then(res => {
                if (res.code === 200) {
                    this.$message.success('核算成功');
                    this.getList();
                } else {
                    // this.$message.warning(res.message);
                }
            })
        },
        //导出
        exportDetail() {
            this.$message.warning('正在开发中...');
        },
        printClick() {
            this.$print(this.$refs.print);
        },
        onCellChange(indexTable, dataIndex, value) {
            const dataSource = [...this.dataSource];
            const target = dataSource.find((item, index) => index === indexTable);
            console.log(target, dataIndex, value, indexTable);

            this.$set(target, dataIndex, value)
            if (dataIndex == 'price') {
                if (value) {
                    target['amount'] = (value * target['baseQuantity']).toFixed(2);
                }
            }
            this.$nextTick(() => {
                this.dataSource = dataSource;
                this.reload();
            })
        },
        sync() {
            //获取列表显示字段
            this.getField();
            //获取数据
            this.getList();
        },
    }
};
</script>
<style lang="less">
@import "~@/style/purchase/voucher.less";
.hoverRowCard {
    background-color: rgba(24, 144, 255, 0.2);
    td {
        color: #222;
    }
}
</style>