<!--
 * @Descripttion: 委外超料领料单
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-06-28 16:56:43
 * @LastEditors: GW
 * @LastEditTime: 2021-12-31 10:11:59
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
                    <!-- <template slot="shengdan">
                        <a-dropdown class="btns" key="sheng" style="display:block">
                            <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                                <a-icon class="btns-icon" type="snippets" />
                                <div class="btns-text">生单
                                    <a-icon type="down" />
                                </div>
                            </a>
                            <a-menu v-if="voucherState==1" slot="overlay">
                                <a-menu-item key="0">
                                    <a href="javascript:void(0)" @click="generateBills('MaterialDispatchVoucher')">生成材料出库单</a>
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
            <a-spin class="loading-content" tip="加载中..." />
        </div>
        <print-modal ref="printDom" v-if="printVisible" :incomingPrintData="incomingPrintData" @cancelPrint="cancelPrint"></print-modal>

        <!--选派工单-->
        <a-modal v-model:visible="visibleTips" @cancel="cancel" @ok="ok" :title="'选委外订单'" :width="1100" destroyOnClose>
            <section>
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
import { save, submitApi, examine, remove, getCode, choiceDispatch, submitOrder } from '@/api/outsource/outPicking';
import { defineComponent, ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import pro from '@/mixins/procurement/pro';
import FormSearchGroup from '@/components/Form/FormSearchGroup';
import getDate from "@/utils/tool/date";

export default defineComponent({
    name: 'OutFillup',
    mixins: [pro],
    components: {
        FormSearchGroup,
    },
    setup() {
        const router = useRouter();
        const store = useStore();
        const isRouterAlive = ref(true);
        const loading = ref(false);
        const showModel = ref('list');
        const editMask = ref(false);
        const orderId = ref('');
        const voucherState = ref(0);
        const voucherTitle = ref('委外超料领料单');
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
        const visible = ref(false);
        const left = ref(0);
        const top = ref(0);
        const printVisible = ref(false);
        const incomingPrintData = ref({});
        const visibleTips = ref(false);
        const workOrderMain = ref([]);
        const workOrderDetail = ref([]);
        const workOrderDetailShow = ref([]);
        const selectedRowKeysMain = ref([]);
        const selectedRowsMain = ref([]);
        const selectedRowKeysDetails = ref([]);
        const selectedRowsDetails = ref([]);

        //基础 查询条件（列表 + 翻页）
        const basePostData = reactive({
            dataSource: "DelegateRRS",
            someBusinessType: "6",
        });

        const sourceCode = 'DelegateRRS';
        const reportCodeDetail = 'DelegateRRS_Detail_Report';          //明细code
        const reportCodeStatistical = 'DelegateRRS_Statistic_Report';   //统计code
        const reportCodeList = 'DelegateRRS_List_Report';              //列表code
        const dataSourceCode = 'DelegateRRS';//是否是委外
        const businessType = 6;
        const isPRF = true;
        const checkType = 'is_material';//生产耗用
        const productCheckType = 'is_made_request';     //产品属性：委外加工产品

        //样式
        const grid = reactive({
            xs: 24,
            sm: 24,
            md: 12,
            lg: 8,
            xl: 8,
            xxl: 8
        });

        const formLayout = "inline";
        const fromStyle = { paddingTop: "8px" };
        const labelCol = { span: 8 };
        const wrapperCol = { span: 14 };
        const editFalse = { borderBottom: '1px solid #ded7d7' };

        //搜索条件
        const searchData = reactive({
            dataSource: 'DelegateProductionWork',
            businessType: 6,
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
        });

        // 列配置
        const columnsChoiceHeader = [{
            title: '序号',
            dataIndex: '',
            width: 40,
            customRender: (text, record, index) => {
                return <span>{index + 1}</span>;
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
        }];

        const columnsChoiceDetails = [{
            title: '序号',
            dataIndex: '',
            width: 40,
            customRender: (text, record, index) => {
                return <span>{index + 1}</span>;
            },
            align: 'center'
        }, {
            title: '加工单号',
            dataIndex: 'voucherCode',
            width: 130,
        },
        {
            title: '预出仓库',
            dataIndex: 'warehouseName'
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
            title: '累积领用数量',
            dataIndex: 'cumPickQuantity',
        }, {
            title: '累积退货数量',
            dataIndex: 'cumRetQuantity',
        },
        {
            title: '累积补货数量',
            dataIndex: 'cumRepairQuantity',
        }, {
            title: '产品编码',
            dataIndex: 'productionInventoryCode'
        }, {
            title: '产品名称',
            dataIndex: 'productionInventoryName'
        }, {
            title: '产品规格型号',
            dataIndex: 'productionInventorySpecification'
        }];

        // 计算属性
        const rowSelectionMain = computed(() => ({
            columnWidth: 40,
            selectedRowKeys: selectedRowKeysMain.value,
            onChange: onSelectChangeMain,
        }));

        const rowSelectionDetails = computed(() => ({
            columnWidth: 40,
            selectedRowKeys: selectedRowKeysDetails.value,
            onChange: onSelectChangeDetails
        }));

        // 监听搜索数据变化
        watch(searchData, (data) => {
            if (data.officeName == '') {
                data.officeId = '';
            }
            if (data.inventoryName == '') {
                data.inventoryId = '';
            }
        }, { deep: true });

        // 新增预测单
        const newForecast = () => {
            showModel.value = 'order';
            editMask.value = false;
            loading.value = false;
            voucherState.value = -1;
            sourceVoucherData.value = {};//清空来源数据
            initForm(1);
        };

        // 保存
        const submit = (requestData) => {
            if (selectedRowsMain.value.length > 0) {
                requestData.sourceDelegateProductionWorkId = selectedRowsMain.value[0].key;//来源委外加工单id
            }
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
                    if (type == 1) {
                        store.dispatch('app/showMessage', { message: '审核成功', type: 'success' });
                        getIdByData();
                    }
                    if (type == 0) {
                        store.dispatch('app/showMessage', { message: '弃审成功', type: 'success' });
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
            getCode().then((res) => {
                if (res.code == 200) {
                    console.log(res);
                    const receiptNumber = res.message;
                    console.log(orderHeaderData.value);
                    for (let i = 0; i < orderHeaderData.value.length; i++) {
                        if (orderHeaderData.value[i].code == 'voucherCode') {
                            orderHeaderData.value[i].onEdit = false;
                            orderHeaderData.value[i].value = receiptNumber;
                        }
                    }
                } else {
                    // store.dispatch('app/showMessage', { message: res.message, type: 'warning' });
                }
            });
        };

        // 选委外订单
        const choiceBillsWork = () => {
            selectedRowKeysMain.value = [];
            selectedRowsMain.value = [];
            selectedRowKeysDetails.value = [];
            selectedRowsDetails.value = [];
            workOrderDetailShow.value = [];
            visibleTips.value = true;
            searchBillsWork();
        };

        // 搜索委外加工单
        const searchBillsWork = () => {
            choiceDispatch(searchData).then((res) => {
                if (res.code == 200) {
                    console.log(res);
                    workOrderMain.value = res.data.unFinishDelegateProductionWorkVoList.map(v => ({
                        ...v, key: v.productionWorkDetailId
                    }));

                    workOrderDetail.value = res.data.unFinishDelegateInventoryDetailVoList.map(v => ({
                        ...v, key: v.sourceWorkInventoryDetailId
                    }));
                } else {
                    // store.dispatch('app/showMessage', { message: res.message, type: 'warning' });
                }
            });
        };

        const onSelectChangeMain = (keys, rows) => {
            console.log(keys, rows);
            selectedRowKeysMain.value = keys;
            selectedRowsMain.value = rows;

            let detailsKeys = [];
            workOrderDetailShow.value = [];

            workOrderDetail.value.forEach(d => {
                rows.forEach(r => {
                    if (d.productionWorkDetailId == r.productionWorkDetailId) {
                        workOrderDetailShow.value.push(d);
                        detailsKeys.push(d.sourceWorkInventoryDetailId);
                    }
                });
            });
            detailsKeys = [...new Set(detailsKeys)];
            selectedRowKeysDetails.value = detailsKeys;
        };

        const onSelectChangeDetails = (keys, rows) => {
            console.log(keys, rows);
            selectedRowKeysDetails.value = keys;
            selectedRowsDetails.value = rows;

            //选中明细同时表头也要选中
            let mainKeys = [];
            rows.forEach(r => {
                mainKeys.push(r.productionWorkDetailId);
            });
            mainKeys = [...new Set(mainKeys)];
            selectedRowKeysMain.value = mainKeys;

            selectedRowsMain.value = [];
            workOrderMain.value.forEach(d => {
                rows.forEach(r => {
                    if (d.productionWorkDetailId == r.productionWorkDetailId) {
                        selectedRowsMain.value.push(d);
                    }
                });
            });
        };

        // 下拉搜索赋值
        const setValueTips = (data) => {
            if (data.codesName == 'office') {
                searchData.officeId = data.id;
                searchData.officeName = data.name;
            } else if (data.codesName == 'inventory') {
                searchData.inventoryId = data.id;
                searchData.inventoryName = data.name;
            } else if (data.codesName == 'supplie') {
                searchData.vendorId = data.id;
                searchData.vendorName = data.name;
            } else if (data.codesName == 'employees') {
                searchData.salesmanId = data.id;
                searchData.salesmanName = data.name;
            }
        };

        const onChangeDate = (e, v, type) => {
            if (type == 1) {
                searchData.voucherDateEnd = v[0];
                searchData.voucherDateStart = v[1];
            } else {
                searchData.expectStartDateEnd = v[0];
                searchData.expectStartDateStart = v[1];
            }
        };

        const handleSearch = (n) => {
            this.$refs[`${n}`].showModal();
        };

        const cancel = () => {
            visibleTips.value = false;
        };

        const ok = () => {
            selectedRowsDetails.value = [];

            console.log(workOrderDetail.value, selectedRowKeysDetails.value);

            workOrderDetail.value.forEach(item => {
                selectedRowKeysDetails.value.forEach(details => {
                    if (item.sourceWorkInventoryDetailId == details) {
                        item.baseQuantity = 1;   //默认最小值 1
                        selectedRowsDetails.value.push(item);
                    }
                });
            });

            //保存选中需要计算的明细
            if (selectedRowsDetails.value.length < 1) {
                store.dispatch('app/showMessage', { message: '请选择物料明细', type: 'warning' });
                return;
            } else {
                //判断生产车间必须一致
                let off = selectedRowsMain.value;

                console.log(selectedRowsMain.value);
                for (let i = 0; i < off.length; i++) {
                    if (off[i + 1]) {
                        if (off[i].officeId != off[i + 1].officeId) {
                            store.dispatch('app/showMessage', { message: '生产车间必须一致', type: 'warning' });
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
                    businessType: businessType,
                    sourceVoucherType: 'DelegateProductionWork',
                    detailList: selectedRowsDetails.value
                };
                record.detailList.forEach(item => {
                    item.productName = item.productionInventoryName;
                    item.productId = item.productionInventoryId;
                    item.productCode = item.productionInventoryCode;
                    item.productSpecification = item.productionInventorySpecification;
                    item.sourceVoucherType = 'DelegateProductionWork';
                });
                this.editClickOrder(record, 'ischoose');
                visibleTips.value = false;
            }
        };

        //操作员 领料
        const submitClick = () => {
            let request = {
                id: orderId.value,
                status: 2,//状态 1:退单,2:提交申请
            };
            submitApi(request).then((res) => {
                if (res.code == 200) {
                    store.dispatch('app/showMessage', { message: '领料申请成功', type: 'success' });
                    syncOrder();
                } else {
                    // store.dispatch('app/showMessage', { message: res.message, type: 'warning' });
                }
            });
        };

        // 初始化表单
        const initForm = (type) => {
            // 初始化表单数据
            orderId.value = '';
            voucherState.value = -1;
            sourceVoucherData.value = {};
            dynamicFormData.value = [];
            dynamicFormDataMap.value = {};
            slotArray.value = [];
            dataSource.value = [];
            orderHeaderData.value = [];
            orderFooterData.value = [];
            visible.value = false;
            printVisible.value = false;
            incomingPrintData.value = {};
            isSaveRun.value = true;
            loading.value = false;

            // 类型为1时初始化表头数据
            if (type === 1) {
                getCodeMethod(); // 获取单据编号
            }
        };

        // 获取最新一条数据
        const getIdByData = () => {
            // 模拟获取最新数据的API调用
            // 实际应替换为真实的API调用
            setTimeout(() => {
                // 假设获取到最新数据后的处理
                orderId.value = 'NEW_ORDER_ID';
                voucherState.value = 0;
                // 刷新表单数据
                initForm(0);
                // 显示成功消息
                store.dispatch('app/showMessage', {
                    message: '获取最新数据成功',
                    type: 'success'
                });
            }, 500);
        };

        // 同步订单
        const syncOrder = () => {
            // 同步订单状态到其他系统
            // 模拟API调用
            setTimeout(() => {
                // 同步成功后刷新数据
                getIdByData();
                // 显示成功消息
                store.dispatch('app/showMessage', {
                    message: '订单同步成功',
                    type: 'success'
                });
            }, 800);
        };

        onMounted(() => {
            // 初始化操作
            getIdByData();//获取最新一条数据
        };});

        return {
            basePostData,
            sourceCode,
            reportCodeDetail,
            reportCodeStatistical,
            reportCodeList,
            dataSourceCode,
            businessType,
            isPRF,
            checkType,
            productCheckType,
            grid,
            formLayout,
            fromStyle,
            labelCol,
            wrapperCol,
            editFalse,
            searchData,
            workOrderMain,
            workOrderDetail,
            workOrderDetailShow,
            selectedRowKeysMain,
            selectedRowsMain,
            selectedRowKeysDetails,
            selectedRowsDetails,
            visibleTips,
            columnsChoiceHeader,
            columnsChoiceDetails,
            rowSelectionMain,
            rowSelectionDetails,
            isRouterAlive,
            loading,
            showModel,
            editMask,
            orderId,
            voucherState,
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
            visible,
            left,
            top,
            printVisible,
            incomingPrintData,
            newForecast,
            submit,
            submitOrder: submitOrderMethod,
            auditClick,
            remove: removeMethod,
            getCode: getCodeMethod,
            choiceBillsWork,
            searchBillsWork,
            onSelectChangeMain,
            onSelectChangeDetails,
            setValueTips,
            onChangeDate,
            handleSearch,
            cancel,
            ok,
            submitClick,
            initForm,
            getIdByData,
            syncOrder
        };
    }
});
</script>
<style lang="less" scoped>
    @import '~@/style/purchase/voucher.less';
</style>