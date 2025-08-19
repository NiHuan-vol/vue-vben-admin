<!--
 * @Descripttion: 委外管理->委外退库单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-04-25 12:11:56
 * @LastEditors: GW
 * @LastEditTime: 2022-01-03 14:13:54
-->
<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper">
            <!-- 按钮 -->
            <div class="btn-wrapper clearfix">
                <btns-wrapper @searchClick="searchClick" :showModel="showModel" :orderId="orderId" :voucherState="voucherState" :editMask="editMask" :createUserId="createUserId" :isSource="isSource" @printOrder="printOrder" @switchList="switchList" @submitServer="submitServer" @clickEdit="clickEdit" @deleteOrder="deleteOrder" @getIdByData="getIdByData" @auditClick="auditClick" @turnThePage="turnThePage" @syncOrder="syncOrder" @submitOrder="submitOrder" @exportDetail="exportDetail" @theGoods="theGoods">
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
                                    <a href="javascript:void(0)" @click="choiceDelegateInOrder">选委外入库单</a>
                                </a-menu-item>
                            </a-menu>
                        </a-dropdown>
                    </template>
                    <!-- <template slot="shengdan">
                            <a-dropdown class="btns" key="sheng" style="display:block">
                                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                                    <a-icon class="btns-icon" type="snippets" />
                                    <div class="btns-text">生单
                                        <a-icon type="down" />
                                    </div>
                                </a>
                                <a-menu v-if="voucherState==1 || voucherState== 2" slot="overlay">
                                    <a-menu-item key="0">
                                        <a href="javascript:void(0)" @click="generateBills('PurchaseInvoice')">生成采购发票</a>
                                    </a-menu-item>
                                </a-menu>
                            </a-dropdown>
                        </template> -->
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
                    <div>
                        <span class="audit-status" v-show="voucherState==0">待审核</span>
                        <span class="audit-status" v-show="(voucherState==1 || voucherState==10) && !isSource">{{voucherState==1?'已审核':'关闭'}}</span>
                        <span class="audit-status" v-show="(voucherState==1 || voucherState==10) && isSource">{{voucherState==1?'已审核':'关闭'}}</span>
                        <span class="audit-status" v-show="voucherState==2">{{voucherState==2?'已出库':''}}</span>
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
                </ul>
            </div>
            <drawerBox ref="searchList" :unitData="unitData" :unitsData="unitsData" :unitsDataDetails="unitsDataDetails" @editClickOrder="editClickOrder"></drawerBox>
        </div>

        <!--加载中-->
        <div class="loading-wrapper" v-show="loading">
            <a-spin class="loading-content" tip="加载中..." />
        </div>
        <print-modal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint"></print-modal>
    </div>
</template>
<script>
import { save, examine, remove, getCode, confirm, submitOrder } from '@/api/inventory/inout';
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import pro from '@/mixins/procurement/pro';

export default defineComponent({
    name: 'DelegateOutBack',
    mixins: [pro],
    setup() {
        const router = useRouter();
        const store = useStore();
        const isRouterAlive = ref(true);
        const loading = ref(false);
        const showModel = ref('list');
        const editMask = ref(false);
        const orderId = ref('');
        const voucherState = ref(0);
        const isSource = ref(false);
        const createUserId = ref('');
        const receiptNumber = ref('');
        const visible = ref(false);
        const left = ref(0);
        const top = ref(0);
        const printVisible = ref(false);
        const incomingPrintData = ref({});
        const formLayout = ref('horizontal');
        const voucherTitle = ref('委外退库单');
        const sourceVoucherData = reactive({});
        const isSaveRun = ref(false);
        const unitData = ref([]);
        const unitsData = ref([]);
        const unitsDataDetails = ref([]);
        const unitsAssistSelect = ref([]);
        const dynamicFormData = ref({});
        const dynamicFormDataMap = ref({});
        const slotArray = ref([]);
        const columns = ref([]);
        const dataSource = ref([]);
        const orderHeaderData = ref([]);
        const orderFooterData = ref([]);

        //基础 查询条件（列表 + 翻页）
        const basePostData = reactive({
            someBusinessType: 95,
            isMyWarehouse: false,    // 是否
            // startVoucherState: 0     // 开始状态
        });

        //选单 查询条件
        const choiceBillPostData = reactive({
            sourceCode: 'DelegateReceiveVoucher',      // 来源单
            title: '选委外入库单',
            businessType: 1, //1:退货业务 2：非退货业务 3: 退货 + 非退货 4: 发票
            someBusinessType: '0',    // 指定业务类型 默认 0
            startVoucherState: 1,
            endVoucherState: 10
        });

        const sourceCode = 'DelegateReceiveVoucher';
        const reportCodeDetail = 'DelegateReceiveVoucher_Detail_Report';          //明细code
        const reportCodeStatistical = 'DelegateReceiveVoucher_Statistic_Report';   //统计code
        const reportCodeList = 'DelegateReceiveVoucher_List_Report';              //列表code
        const receiveDeliverType = 2;//1入，2出
        const checkType = 'is_made_request';//委外

        // 新增
        const newForecast = () => {
            showModel.value = 'order';
            editMask.value = false;
            loading.value = false;
            voucherState.value = -1;
            sourceVoucherData.value = {};//清空来源数据
            initForm(1);
            isSource.value = false;
        };

        // 保存
        const submit = (requestData) => {
            requestData.businessType = 95;
            save(requestData).then(response => {
                if (response.code === 200) {
                    store.dispatch('app/showMessage', { message: '保存成功', type: 'success' });
                    editMask.value = true;
                    isSaveRun.value = true;
                    if (!orderId.value) {
                        getIdByData(); //获取最新一条数据
                    }
                } else {
                    store.dispatch('app/showMessage', { message: response.message, type: 'error' });
                    isSaveRun.value = true;
                }
            }).catch((e) => {
                isSaveRun.value = true;
            });
        };

        // 单据提交
        const submitOrderMethod = (type) => {
            let data = {
                id: orderId.value,
                status: type,//状态 -1:撤回提交,0:提交
            };
            console.log(orderId.value);
            if (!orderId.value) {
                store.dispatch('app/showMessage', { message: '该单据未保存不需要提交', type: 'warning' });
                return;
            }
            if (voucherState.value == -1 && type == -1) {
                store.dispatch('app/showMessage', { message: '该单据未提交无需撤回提交', type: 'warning' });
                return;
            }
            submitOrder(data).then(res => {
                if (res.code === 200) {
                    if (type == 0) {
                        store.dispatch('app/showMessage', { message: '提交成功', type: 'success' });
                    } else {
                        store.dispatch('app/showMessage', { message: '撤回提交成功', type: 'success' });
                    }
                    getIdByData();
                }
            });
        };

        // 审核
        const auditClick = (type) => {
            let requestData = {
                id: orderId.value,
                status: type
            };
            examine(requestData).then((response) => {
                if (response.code === 200) {
                    const backData = response.data;
                    if (type == 1) {
                        store.dispatch('app/showMessage', { message: '审核成功', type: 'success' });
                        getIdByData();
                    }
                    if (type == 0) {
                        if (isSource.value) {
                            store.dispatch('app/showMessage', { message: '退单成功', type: 'success' });
                        } else {
                            store.dispatch('app/showMessage', { message: '弃审成功', type: 'success' });
                        }
                        getIdByData();
                    }
                } else {
                    // store.dispatch('app/showMessage', { message: response.message, type: 'warning' });
                }
            });
        };

        // 删除
        const removeMethod = (postData) => {
            remove(postData).then(response => {
                if (response.code === 200) {
                    store.dispatch('app/showMessage', { message: '删除成功', type: 'success' });
                    orderId.value = '';
                    voucherState.value = 0;
                    getIdByData();//获取最新一条数据
                } else {
                    store.dispatch('app/showMessage', { message: response.message, type: 'error' });
                }
            });
        };

        // 获取单据编号
        const getCodeMethod = () => {
            let data = {
                sourceCode: sourceCode
            };
            getCode(data).then((res) => {
                if (res.code == 200) {
                    console.log(res);
                    receiptNumber.value = res.message;
                    console.log(orderHeaderData.value);
                    for (let i = 0; i < orderHeaderData.value.length; i++) {
                        if (orderHeaderData.value[i].code == 'voucherCode') {
                            orderHeaderData.value[i].onEdit = false;
                            orderHeaderData.value[i].value = receiptNumber.value;
                        }
                    }
                } else {
                    // store.dispatch('app/showMessage', { message: res.message, type: 'warning' });
                }
            });
        };

        // 出库
        const theGoods_delete = () => { //废弃方法
            store.dispatch('app/confirm', {
                title: '提示',
                content: (
                    <span style={{ color: 'red' }}>
                        出库后，此单据不能做任何修改，是否确认出库？
                    </span>
                ),
                onOk: () => {
                    let requestData = {
                        id: orderId.value
                    };
                    confirm(requestData).then((response) => {
                        if (response.code === 200) {
                            store.dispatch('app/showMessage', { message: '出库成功', type: 'success' });
                            getIdByData();
                        } else {
                            // store.dispatch('app/showMessage', { message: response.message, type: 'warning' });
                        }
                    });
                },
                onCancel: () => {}
            });
        };

        // 选 委外产品入库单
        const choiceDelegateInOrder = () => {
            let postData = choiceBillPostData;
            this.$refs.searchList.onOpenBox(postData);
        };

        // 初始化表单
        const initForm = (type) => {
            // 这里需要实现初始化表单的逻辑
            // 由于原代码中没有提供此方法的实现，这里保留空实现
        };

        // 获取最新一条数据
        const getIdByData = () => {
            // 这里需要实现获取最新数据的逻辑
            // 由于原代码中没有提供此方法的实现，这里保留空实现
        };

        onMounted(() => {
            // 初始化操作
            // getIdByData();//获取最新一条数据
        });

        return {
            basePostData,
            choiceBillPostData,
            sourceCode,
            reportCodeDetail,
            reportCodeStatistical,
            reportCodeList,
            receiveDeliverType,
            checkType,
            isRouterAlive,
            loading,
            showModel,
            editMask,
            orderId,
            voucherState,
            isSource,
            createUserId,
            receiptNumber,
            visible,
            left,
            top,
            printVisible,
            incomingPrintData,
            formLayout,
            voucherTitle,
            sourceVoucherData,
            isSaveRun,
            unitData,
            unitsData,
            unitsDataDetails,
            unitsAssistSelect,
            dynamicFormData,
            dynamicFormDataMap,
            slotArray,
            columns,
            dataSource,
            orderHeaderData,
            orderFooterData,
            newForecast,
            submit,
            submitOrder: submitOrderMethod,
            auditClick,
            remove: removeMethod,
            getCode: getCodeMethod,
            theGoods_delete,
            choiceDelegateInOrder,
            initForm,
            getIdByData
        };
    }
});
</script>
<style lang="less" scoped>
    @import '~@/style/purchase/voucher.less';
</style>