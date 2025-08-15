<!--
 * @Descripttion: 库存管理->委外领料单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-04-25 12:11:56
 * @LastEditors: GW
 * @LastEditTime: 2022-01-03 11:26:17
-->

<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper" style="display:block">
            <!-- 按钮 -->
            <div class="btn-wrapper clearfix">
                <btns-wrapper @submitClick="submitClick" @searchClick="searchClick" :showModel="showModel" :orderId="orderId" :voucherState="voucherState" :editMask="editMask" :createUserId="createUserId" :isSource="isSource" @printOrder="printOrder" @switchList="switchList" @submitServer="submitServer" @clickEdit="clickEdit" @deleteOrder="deleteOrder" @getIdByData="getIdByData" @auditClick="auditClick" @turnThePage="turnThePage" @syncOrder="syncOrder" @submitOrder="submitOrder" @exportDetail="exportDetail" :sourceCode="sourceCode">
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
                        <div :class="voucherState==1?'':'btns-disable'">{{voucherState}}
                            <a-dropdown class="btns" key="sheng" style="display:block">
                                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                                    <a-icon class="btns-icon" type="snippets" />
                                    <div class="btns-text">生单
                                        <a-icon type="down" />
                                    </div>
                                </a>
                                <a-menu v-if="voucherState==1 && orderData.businessType != 5" slot="overlay">
                                    <a-menu-item key="0">
                                        <a href="javascript:void(0)" @click="generateDelegatePickingBills('DelegateDispatchVoucher')">生成委外领料</a>
                                    </a-menu-item>
                                </a-menu>
                                <a-menu v-else-if="voucherState==1 && orderData.businessType == 5" slot="overlay">
                                    <a-menu-item key="0">
                                        <a href="javascript:void(0)" @click="generateDelegatePickingBills('DelegateDispatchVoucherBack')">生成委外退料</a>
                                    </a-menu-item>
                                </a-menu>
                            </a-dropdown>
                        </div>
                    </template>
                </btns-wrapper>
            </div>
            <div ref="print" class="documents-wrapper" id="documents-wrapper">
                <h3 class="text-center">
                    {{voucherTitle}}
                </h3>
                <section v-show="showModel=='list'">
                    <dynamicList ref="dyList" :basePostData="basePostData" :sourceCode="sourceCode" :dataSourceCode="dataSourceCode" @switchList="switchList" @dblclick="getIdByData" :reportCode="reportCodeList"></dynamicList>
                </section>
                <section v-show="showModel=='order'">
                    <div>
                        <span class="audit-status" v-show="voucherState==0">待审核</span><span class="audit-status" v-show="voucherState==1 || voucherState==10">{{voucherState==1?'已审核':'关闭'}}</span>
                        <!-- <span class="audit-status" v-show="voucherState==2">{{voucherState==2?'已确认':''}}</span> -->
                        <!--领料申请-->
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
                    <dynamicListDetails ref="detailSearchRef" :reportCode="reportCodeDetail" :dataSourceCode="dataSourceCode" :componentType="1" :basePostData="basePostData"></dynamicListDetails>
                </section>
                <section v-show="showModel=='statistical'">
                    <!--统计-->
                    <dynamicListDetails ref="statisticalSearchRef" :reportCode="reportCodeStatistical" :dataSourceCode="dataSourceCode" :componentType="2" :basePostData="basePostData"></dynamicListDetails>
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
        <!--材料出库分单-->
        <material-out-modal ref="meterialOutRef"></material-out-modal>
    </div>
</template>
<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useMessage } from 'ant-design-vue';
import { saveDelegatePicking, submitDelegatePicking, auditDelegatePicking, deleteDelegatePicking, getDelegatePickingCode, getDelegatePickingDetail, exportDelegatePickingData, generateDelegatePickingBills } from '@/api/inventory/delegatePicking';
import pro from '@/mixins/procurement/pro';
import materialOutModal from '@/components/SeparateBill/materialOutModal.vue';

export default {
    components: { materialOutModal },
    mixins: [pro],
    setup() {
        const message = useMessage();
        const loading = ref(false);
        const showModel = ref('list');
        const editMask = ref(true);
        const voucherState = ref(0);
        const orderId = ref('');
        const createUserId = ref('');
        const isSource = ref(false);
        const sourceCode = ref('DelegateRRS');
        const reportCodeDetail = ref('DelegateRRS_Detail_Report');
        const reportCodeStatistical = ref('DelegateRRS_Statistic_Report');
        const reportCodeList = ref('DelegateRRS_List_Report');
        const dataSourceCode = ref('DelegateRRS');
        const receiveDeliverType = ref(2);
        const checkType = ref('is_material');
        const productCheckType = ref('is_made_request');
        const isSaveRun = ref(false);
        const receiptNumber = ref('');
        const sourceVoucherData = reactive({});
        const orderHeaderData = reactive([]);
        const orderFooterData = reactive([]);
        const columns = reactive([]);
        const dataSource = reactive([]);
        const slotArray = reactive([]);
        const orderData = reactive({});
        const isRouterAlive = ref(true);
        const visible = ref(false);
        const left = ref(0);
        const top = ref(0);
        const printVisible = ref(false);
        const incomingPrintData = reactive({});
        const voucherTitle = computed(() => '委外领料单');
        const formLayout = 'horizontal';
        const basePostData = reactive({
            dataSource: "DelegateRRS",
            someBusinessType: null,
            isMyWarehouse: true,
        });
        const unitsDataDetails = reactive({});
        const unitsAssistSelect = reactive({});
        const dynamicFormData = reactive({});
        const dynamicFormDataMap = reactive({});
        const unitData = reactive({});
        const unitsData = reactive({});

        // 初始化表单
        const initForm = (type) => {
            loading.value = true;
            if (type === 1) {
                // 新增
                orderHeaderData.length = 0;
                orderFooterData.length = 0;
                dataSource.length = 0;
                columns.length = 0;
                slotArray.length = 0;
                getDelegatePickingCode({ sourceCode: sourceCode.value }).then((res) => {
                    if (res.code === 0) {
                        receiptNumber.value = res.message;
                        // 初始化表头数据
                        orderHeaderData.push({
                            code: 'voucherCode',
                            value: receiptNumber.value,
                            onEdit: false
                        });
                        // 其他表头字段...
                    }
                    loading.value = false;
                });
            } else if (type === 2) {
                // 编辑
                if (orderId.value) {
                    getDelegatePickingDetail({ id: orderId.value }).then((res) => {
                        if (res.code === 0) {
                            const data = res.data;
                            // 填充表头数据
                            orderHeaderData.length = 0;
                            orderHeaderData.push({
                                code: 'voucherCode',
                                value: data.voucherCode,
                                onEdit: false
                            });
                            // 填充表体数据
                            dataSource.length = 0;
                            if (data.details && data.details.length) {
                                data.details.forEach(item => {
                                    dataSource.push(item);
                                });
                            }
                            // 填充表尾数据
                            orderFooterData.length = 0;
                            // ...
                        }
                        loading.value = false;
                    });
                } else {
                    loading.value = false;
                }
            }
        };

        // 保存
        const submit = (requestData) => {
            isSaveRun.value = false;
            saveDelegatePicking(requestData).then(response => {
                if (response.code === 0) {
                    message.success('保存成功');
                    editMask.value = true;
                    isSaveRun.value = true;
                    if (!orderId.value) {
                        getIdByData();
                    }
                } else {
                    message.error(response.message || '保存失败');
                    isSaveRun.value = true;
                }
            }).catch((e) => {
                message.error('保存失败');
                isSaveRun.value = true;
            });
        };

        // 单据提交
        const submitOrder = (type) => {
            let data = {
                id: orderId.value,
                status: type
            };
            if (!orderId.value) {
                message.warning('该单据未保存不需要提交');
                return;
            }
            if (voucherState.value == -1 && type == -1) {
                message.warning('该单据未提交无需撤回提交');
                return;
            }
            submitDelegatePicking(data).then(res => {
                if (res.code === 0) {
                    if (type == 0) {
                        message.success('提交成功');
                    } else {
                        message.success('撤回提交成功');
                    }
                    getIdByData();
                } else {
                    message.error(res.message || '操作失败');
                }
            }).catch((error) => {
                message.error('操作失败');
            });
        };

        // 审核
        const auditClick = (type) => {
            let requestData = {
                id: orderId.value,
                status: type
            };
            auditDelegatePicking(requestData).then((response) => {
                if (response.code === 0) {
                    if (type == 1) {
                        message.success('审核成功');
                        getIdByData();
                    }
                    if (type == 0) {
                        message.success('弃审成功');
                        getIdByData();
                    }
                } else {
                    message.error(response.message || '操作失败');
                }
            }).catch((error) => {
                message.error('操作失败');
            });
        };

        // 删除
        const remove = (postData) => {
            deleteDelegatePicking({ id: postData.id }).then(response => {
                if (response.code === 0) {
                    message.success('删除成功');
                    orderId.value = '';
                    voucherState.value = 0;
                    getIdByData();
                } else {
                    message.error(response.message || '删除失败');
                }
            }).catch((error) => {
                message.error('删除失败');
            });
        };

        // 获取单据编号
        const getCode = () => {
            getDelegatePickingCode({ sourceCode: sourceCode.value }).then((res) => {
                if (res.code === 0) {
                    receiptNumber.value = res.message;
                    for (let i = 0; i < orderHeaderData.length; i++) {
                        if (orderHeaderData[i].code == 'voucherCode') {
                            orderHeaderData[i].onEdit = false;
                            orderHeaderData[i].value = receiptNumber.value;
                        }
                    }
                } else {
                    message.error(res.message || '获取单据编号失败');
                }
            }).catch((error) => {
                message.error('获取单据编号失败');
            });
        };

        // 导出明细
        const exportDetail = () => {
            if (!orderId.value) {
                message.warning('请先选择单据');
                return;
            }
            let warehouseId = '';
            let date = '';
            // 从orderHeaderData中获取warehouseId和date
            for (let i = 0; i < orderHeaderData.length; i++) {
                if (orderHeaderData[i].code === 'warehouseId') {
                    warehouseId = orderHeaderData[i].value;
                }
                if (orderHeaderData[i].code === 'date') {
                    date = orderHeaderData[i].value;
                }
            }
            if (!warehouseId) {
                message.warning('请选择仓库');
                return;
            }
            loading.value = true;
            exportDelegatePickingData({
                id: orderId.value,
                warehouseId: warehouseId,
                date: date
            }).then((res) => {
                loading.value = false;
                if (res.code === 0) {
                    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const fileName = `委外领料单_${receiptNumber.value || orderId.value}_${formatDate(new Date())}.xlsx`;
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                    message.success('导出成功');
                }
            }).catch((e) => {
                loading.value = false;
                message.error(e.message || '导出失败');
            });
        };

        // 日期格式化
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}${month}${day}`;
        };

        // 生成关联单据
        const generateDelegatePickingBills = (billType) => {
            if (!orderId.value) {
                message.warning('请先选择单据');
                return;
            }
            loading.value = true;
            generateDelegatePickingBills({
                sourceId: orderId.value,
                billType: billType
            }).then((res) => {
                loading.value = false;
                if (res.code === 0) {
                    message.success('生成成功');
                    getIdByData();
                } else {
                    message.error(res.message || '生成单据失败');
                }
            }).catch((error) => {
                message.error('生成单据失败');
            });
        };

        // 获取最新一条数据
        const getIdByData = () => {
            loading.value = true;
            // 这里应该调用获取最新单据的API
            // 为简化示例，这里假设我们通过订单ID获取详情
            if (orderId.value) {
                getDelegatePickingDetail({ id: orderId.value }).then((res) => {
                    loading.value = false;
                    if (res.code === 0) {
                        const data = res.data || {};
                        orderData.value = data;
                        voucherState.value = data.status || 0;
                        createUserId.value = data.createUserId || '';
                        initForm(2);
                    } else {
                        message.error(res.message || '获取单据详情失败');
                    }
                }).catch((error) => {
                    loading.value = false;
                    message.error('获取单据详情失败');
                });
            } else {
                // 如果没有订单ID，可以实现获取最新一条数据的逻辑
                loading.value = false;
                message.warning('请先选择单据');
            }
        };

        // 新增预测单
        const newForecast = () => {
            showModel.value = 'order';
            editMask.value = false;
            loading.value = false;
            voucherState.value = -1;
            Object.keys(sourceVoucherData).forEach(key => delete sourceVoucherData[key]);
            initForm(1);
        };

        // 其他方法...
        const submitClick = () => {
            // 实现提交点击逻辑
        };

        const searchClick = () => {
            // 实现搜索点击逻辑
        };

        const switchList = () => {
            // 实现切换列表逻辑
        };

        const submitServer = () => {
            // 实现提交服务器逻辑
        };

        const clickEdit = () => {
            // 实现编辑点击逻辑
        };

        const deleteOrder = () => {
            // 实现删除订单逻辑
        };

        const turnThePage = () => {
            // 实现翻页逻辑
        };

        const syncOrder = () => {
            // 实现同步订单逻辑
        };

        const printOrder = () => {
            // 实现打印订单逻辑
        };

        const cancelPrint = () => {
            // 实现取消打印逻辑
        };

        const onChangeTime = () => {
            // 实现时间变更逻辑
        };

        const setValue = () => {
            // 实现设置值逻辑
        };

        const onTableChange = () => {
            // 实现表格变更逻辑
        };

        const customClick = () => {
            // 实现自定义行点击逻辑
        };

        const choiceAddData = () => {
            // 实现选择添加数据逻辑
        };

        const onCellChange = () => {
            // 实现单元格变更逻辑
        };

        const handleAdd = () => {
            // 实现添加行逻辑
        };

        const handleDelete = () => {
            // 实现删除行逻辑
        };

        const editClickOrder = () => {
            // 实现编辑点击订单逻辑
        };

        onMounted(() => {
            // 初始化操作
            // getIdByData();
        });

        return {
            showModel,
            editMask,
            voucherState,
            orderId,
            createUserId,
            isSource,
            sourceCode,
            reportCodeDetail,
            reportCodeStatistical,
            reportCodeList,
            dataSourceCode,
            receiveDeliverType,
            checkType,
            productCheckType,
            loading,
            isSaveRun,
            receiptNumber,
            sourceVoucherData,
            orderHeaderData,
            orderFooterData,
            columns,
            dataSource,
            slotArray,
            orderData,
            isRouterAlive,
            visible,
            left,
            top,
            printVisible,
            incomingPrintData,
            voucherTitle,
            formLayout,
            basePostData,
            unitsDataDetails,
            unitsAssistSelect,
            dynamicFormData,
            dynamicFormDataMap,
            unitData,
            unitsData,
            initForm,
            submit,
            submitOrder,
            auditClick,
            remove,
            getCode,
            exportDetail,
            formatDate,
            generateBills,
            getIdByData,
            newForecast,
            submitClick,
            searchClick,
            switchList,
            submitServer,
            clickEdit,
            deleteOrder,
            turnThePage,
            syncOrder,
            printOrder,
            cancelPrint,
            onChangeTime,
            setValue,
            onTableChange,
            customClick,
            choiceAddData,
            onCellChange,
            handleAdd,
            handleDelete,
            editClickOrder
        };
    }
};
</script>
<style lang="less">
    @import '~@/style/purchase/voucher.less';
</style>