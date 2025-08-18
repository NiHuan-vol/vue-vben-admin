<!--
 * @Descripttion: 存货暂估入库
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-07-06 14:50:14
 * @LastEditors: GW
 * @LastEditTime: 2022-01-15 13:52:17
-->
<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper">
            <!-- 按钮 -->
            <div class="btn-wrapper clearfix">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventoryEvaluate:audit')">
                            <div class="btns" style="display:block;margin-left:10px" @click="handlerAudit">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="file-add" />
                                    <div class="btns-text">勾稽</div>
                                </a>
                            </div>
                        </a-col>
                        <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventoryEvaluate:accounting')">
                            <div class="btns" style="display:block;margin-left:10px" @click="handlerAccounting">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="edit" />
                                    <div class="btns-text">核算</div>
                                </a>
                            </div>
                        </a-col> -->
                        <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventoryEvaluate:save')">
                            <div class="btns" style="display:block;margin-left:10px" @click="save">
                                <a class="ant-dropdown-link">
                                    <a-icon class="btns-icon" type="save" />
                                    <div class="btns-text">保存</div>
                                </a>
                            </div>
                        </a-col>
                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventoryEvaluate:search')">
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

                        <!-- <a-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" v-if="permissions.includes('InventoryEvaluate:export')">
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
                <h3 class="text-center">存货暂估入库</h3>

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
                        </template> -->

                        <template slot="isAccounting" slot-scope="text">
                            {{text==1?'已核算':'未核算'}}
                        </template>
                        <template slot="isAudit" slot-scope="text">
                            {{text==1?'已勾稽':'未勾稽'}}
                        </template>
                        <template v-for="item in slotArray" :slot="item" slot-scope="text, record ,index">
                            <div>
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
    getProductReceiveListApi
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
    data () {
        return {
            columns: [],
            dataSource: [],
            showColumns: [],
            type: 2,//type:1 外购入库核算 type:2 存货暂估入库 type:3 产成品入库核算
            isRouterAlive: true,
            loading: false,
            numRegTemp: /^([-+])?\d+(\.[0-9]{1,4})?$/, //负数或者整数或者1-4位小数
            slotArray: [],//可编辑的字段
        }
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.info,
            permissions: state => state.user.permissions,
        }),
    },
    created () {
        this.getPeriod();

        //获取列表显示字段
        this.getField();
        //获取数据
        this.getList();
    },
    mounted () {
        // 判断table的滚动条是否到达底部
        let _this = this;
        this.tableBody = document.getElementsByClassName('ant-table-body');
        this.tableBody[0].onscroll = function () {
            // scrollTop + clientHeight == scrollHeight
            //  scrollTop为滚动条在Y轴上的滚动距离。
            // clientHeight为内容可视区域的高度。
            // scrollHeight为内容可视区域的高度加上溢出（滚动）的距离。
            if (_this.tableBody[0].scrollTop + _this.tableBody[0].clientHeight == _this.tableBody[0].scrollHeight) {
                console.log('我到底部了')
                // _this.pagination.current++;
                // _this.pageList();
            }
        }
    },
    methods: {
        reload () {
            //强制刷新表格
            this.isRouterAlive = false;
            this.$nextTick(function () {
                this.isRouterAlive = true;
            });
        },
        getPeriod () {
            //获取会计期间
            ListPeriod().then(response => {
                if (response.code === 200) {
                    // console.log(response.data);
                }
            }).catch(error => {
                this.$message.error(error.message);
            });
        },
        getList () {
            let request = {
                dataSource: 'PurchaseReceiveVoucher',
            }
            this.loading = true;
            getEvaluationListApi(request).then(res => {
                if (res.code === 200) {
                    this.dataSource = res.data;

                    this.dataSource.forEach(item => {
                        item.estimatedPrice = item.price;
                        item.estimatedAmount = item.amount;
                    });
                    this.reload();
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.$message.warning(err.message);
            })
        },
        initColumns () {
            //组装columns
            this.columns = [];
            if (this.showColumns.length > 0) {
                evaluateColumnsJson.forEach(item => {
                    this.showColumns.forEach(show => {
                        if (item.title == show) {
                            let data = {
                                dataIndex: item.code,
                                title: item.title,
                                scopedSlots: item.scopedSlots,
                                width: item.width,
                            }
                            if (item.code == 'estimatedAmount') {
                                data.title = <div><span style="color:red">*</span> 暂估金额</div>;
                            }
                            if (item.code == 'estimatedPrice') {
                                data.title = <div><span style="color:red">*</span> 暂估单价</div>;
                            }
                            this.columns.push(data);
                        }
                    });
                })
                console.log('有值', this.columns)
            } else {
                evaluateColumnsJson.forEach(item => {
                    let data = {
                        dataIndex: item.code,
                        title: item.title,
                        scopedSlots: item.scopedSlots,
                        width: item.width,
                    }
                    if (item.code == 'estimatedAmount') {
                        data.title = <div><span style="color:red">*</span> 暂估金额</div>;
                    }
                    if (item.code == 'estimatedPrice') {
                        data.title = <div><span style="color:red">*</span> 暂估单价</div>;
                    }
                    this.columns.push(data);
                })
                console.log('无值', this.columns)
            }
            evaluateColumnsJson.forEach(item => {
                if (item.scopedSlots) {
                    this.slotArray.push(item.scopedSlots.customRender)
                }


            })
            this.slotArray = this.slotArray.filter(res => { return res != 'isAccounting' && res != 'isAudit' })
            console.log(this.slotArray);
        },
        getField () {
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
        showDrawer () {
            //显示抽屉
            this.$refs.drawerRef.showDrawer();
        },
        save () {
            //保存
            saveEvaluationListApi(this.dataSource).then(res => {
                if (res.code === 200) {
                    this.$message.success('保存暂估入库成功');
                    this.getList();
                } else {
                    // this.$message.warning(res.message);
                }
            })
        },
        printClick () {
            this.$print(this.$refs.print);
        },
        onCellChange (indexTable, dataIndex, value) {
            const dataSource = [...this.dataSource];
            const target = dataSource.find((item, index) => index === indexTable);
            console.log(target, dataIndex, value, indexTable);

            this.$set(target, dataIndex, value);

            if (dataIndex == 'estimatedAmount') {
                target['estimatedPrice'] = (Number(target.estimatedAmount) / Number(target.baseQuantity)).toFixed(2);
            }
            if (dataIndex == 'estimatedPrice') {
                target['estimatedAmount'] = (Number(target.estimatedPrice) * Number(target.baseQuantity)).toFixed(2);
            }

            this.$nextTick(() => {
                this.dataSource = dataSource;
                this.reload();
            })
        },
        sync () {
            //获取列表显示字段
            this.getField();
            //获取数据
            this.getList();
        }
    }
};
</script>
<style lang="less">
    @import '~@/style/purchase/voucher.less';
    .hoverRowCard {
        background-color: rgba(24, 144, 255, 0.2);
        td {
            color: #222;
        }
    }
</style>