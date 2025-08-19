<!-- 可编辑单元格组件 -->
<template>
    <div class="editable-cell-process">
        <div v-if="editable" class="editable-cell-input-wrapper">
            <div v-if="col=='processMethod'">
                <!--加工方式-->
                <a-select @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model="processMethod" ref="focusid">
                    <a-select-option value="1" label="">
                        自制加工
                    </a-select-option>
                    <a-select-option value="2" label="">
                        委外加工
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="col=='workFlag'">
                <!--工序标识-->
                <a-select @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model="workFlag" ref="focusid">
                    <a-select-option value="1" label="">
                        首工序
                    </a-select-option>
                    <a-select-option value="3" label="">
                        中间工序
                    </a-select-option>
                    <a-select-option value="2" label="">
                        尾工序
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="col=='inspectMethod'">
                <!--检验方式-->
                <a-select @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model="inspectMethod" ref="focusid">
                    <a-select-option value="1" label="">
                        免检
                    </a-select-option>
                    <a-select-option value="2" label="">
                        过程检验
                    </a-select-option>
                    <a-select-option value="3" label="">
                        完工检验
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="col=='paymentType'">
                <!--检验方式-->
                <a-select @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model="paymentType" ref="focusid">
                    <a-select-option value="1" label="">
                        收款
                    </a-select-option>
                    <a-select-option value="2" label="">
                        付款
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="col=='deliveryMethod'">
                <!--发料方式-->
                <a-select @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model="deliveryMethod" ref="focusid">
                    <a-select-option value="1" label="">
                        直接领料
                    </a-select-option>
                    <a-select-option value="2" label="">
                        调拨领料
                    </a-select-option>
                    <a-select-option value="3" label="">
                        直接倒冲
                    </a-select-option>
                    <a-select-option value="4" label="">
                        调拨倒冲
                    </a-select-option>
                    <a-select-option value="5" label="">
                        不发料
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="col=='planDate'">
                <!--收付款日期-->
                <div style="position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:10;background:rgba(0,0,0,0);" @click="closePicker"></div>
                <a-date-picker ref="focusid" :autoFocus="true" :style="{'position':'absolute','z-index':'120'}" v-model="value" @change="((date,dateString)=>{onChangeTime(date,dateString)})" />
            </div>
            <div v-else-if="col=='fileUrl'">
                <!--文件上传-->
                <!-- <a-input type="file" style="width:0px;height:0px;" ref="focusid" id="file"></a-input> -->
                <a-upload :action="this.$Global.ApiBaseUrl + '/uploadFile'" ref="focusid" :headers="headersData" id="file" :file-list="fileList" @change="importFile">
                    <div class="ant-upload-text">
                        <a-button size="small">上传附件</a-button>
                    </div>
                </a-upload>
            </div>
            <div v-else-if="col=='subUnitName'">
                <a-select :value="value" placeholder="请选择辅助计量" @change=" value => unitsChange(value)" @focus="unitsFocus" @blur="unitsBlur" ref="focusid">
                    <a-select-option v-for="(key,index) in unitsAssistSelect" :key="index" :value="key.id">
                        {{key.name}}
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="col=='supplyType'">
                <!--供应类型-->
                <a-select @change="handleSelectChange" @blur="handleSelectBlur" :defaultOpen="true" v-model="supplyType" ref="focusid">
                    <a-select-option value="1" label="">
                        采购
                    </a-select-option>
                    <a-select-option value="2" label="">
                        自制
                    </a-select-option>
                    <a-select-option value="3" label="">
                        委外
                    </a-select-option>
                </a-select>
            </div>
            <div v-else-if="routePath == '/contract/setting/contractPhaseGroup' && (col == 'name' || col == 'code')">
                <!--合同阶段分组-->
                <searchGroupDetail ref="searchComponents" :record="record" :inputValue="text" :componentName="componentName" @clickItem="searchBackData"></searchGroupDetail>
            </div>
            <div v-else-if="col=='teamName'|| col=='workName' || col=='workCode' || col=='bomVersion' || col=='workerName'  || col =='warehouseName' || col == 'inventoryLocationName' || col == 'codeTerms' || col == 'nameTerms'">
                <!--班组 / 工序名称 / 子件bom / 工人 / 仓库 / 货位  /条款编码 /条款名称-->
                <searchGroupDetail ref="searchComponents" :record="record" :inputValue="text" :componentName="componentName" @clickItem="searchBackData"></searchGroupDetail>
            </div>
            <div v-else-if="(col=='inventoryCode'|| col=='inventoryName') && $route.path != '/inventory/bills/inventoryWork'">
                <!--子件编码、子件名称-->
                <div id="archiveBox">
                    <div id="closesModel"></div>
                    <a-input :value="value" ref="focusid" @keyup="archivesData" @pressEnter="archivesEnter" style="position:relative;z-index:83" />
                    <searchCheckBoxArchives ref="searchRef" :checkType="checkType" :inputVal="value" @check="archivesCheck"></searchCheckBoxArchives>
                </div>
            </div>
            <div v-else-if="col=='requireQuantity'|| col=='lossRate' || col=='operationQuantity'|| col=='adjustNumber' || 
                col=='adjustProportion'|| col=='plannedQuantity' || col=='lossQuantity' || col=='lossRate' || col == 'checkQuantity' || col == 'checkAmount' ||
                col == 'unitExchangeRate'|| col=='amount'|| col=='proportion'">
                <!--标准用量，子件损耗率,运算数量，调整数量，调整比例-->
                <a-input onkeyup="value=value.toString().match(/^\d+(?:\.\d{0,4})?/)" :value="value" ref="focusid" @change="((e,num)=>{handleChange(e,'num')})" @pressEnter="check" @blur="checkClose" />
            </div>
            <a-input v-else :value="value" ref="focusid" @change="handleChange" @pressEnter="check" @blur="checkClose" />
        </div>
        <div v-else class="editable-cell-text-wrapper" @click="edit" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
            <!--加工方式-->
            <div v-if="col=='processMethod'">{{ value == 1?'自制加工':value == 2?'委外加工':'' }}</div>
            <!--工序标识-->
            <div v-else-if="col=='workFlag' || col == 'processSort'">{{ value == 1?'首工序':value == 2?'尾工序':value==3?'中间工序':'' }}</div>
            <!--检验方式-->
            <div v-else-if="col=='inspectMethod'">{{ value == 1?'免检':value == 2?'过程检验':value==3?'完工检验':'' }}</div>
            <!--结算类型-->
            <div v-else-if="col=='paymentType'">{{ value == 1?'收款':value == 2?'付款':'' }}</div>
            <!--发料方式-->
            <div v-else-if="col=='deliveryMethod'">{{ value == 1?'直接领料':value == 2?'调拨领料':value==3?'直接倒冲':value==4?'调拨倒冲':value==5?'不发料':'' }}</div>
            <!--供应类型-->
            <div v-else-if="col=='supplyType'">{{ value == 1?'采购':value == 2?'自制':value==3?'委外':'' }}</div>
            <!-- 文件地址 -->
            <div v-else-if="col=='fileUrl' && value">
                <a-icon type="file-image" />{{value}}
            </div>
            <div v-else>
                <div style="text-align:right;padding-right:2px;" v-if="value && (col == 'adjustProportion' || col== 'proportion')">{{value}}%</div>
                <div style="text-align:right;padding-right:2px;" v-else-if="value && (col=='adjustNumber'||col=='operationQuantity'||col=='adjustProportion'|| col=='plannedQuantity' || col=='lossQuantity' || col=='lossRate' || col == 'baseQuantity' || col == 'checkQuantity' || col == 'checkAmount' || col == 'requireQuantity' || col== 'subQuantity' || col=='amount')">{{value| NumFormat }}</div>
                <div v-else>{{ value || '&nbsp;' }}</div>
            </div>
        </div>
    </div>
</template>
<script>

import getDate from "@/utils/tool/date";
import moment from "moment";
import searchGroupDetail from "@/components/PopUpLayer/searchGroupDetail";  //静态表格明细搜索组
import { searchCheckBoxArchives } from "@/components/PopUpLayer";           //物料多选组件
import { ACCESS_TOKEN } from "@/store/mutation-types";

export default {
    components: {
        searchGroupDetail,
        searchCheckBoxArchives
    },
    props: {
        text: String,
        record: {
            type: Object,
            default: {}
        },
        col: {
            type: String
        },
        //物料类型
        checkType: {
            type: Array,
            default: () => []
        },
        unitsAssistSelect: {//辅计量
            type: Array,
        },
        unitsDataDetails: {
            type: Array,
        }
    },
    data () {
        return {
            value: this.text,
            editable: false,
            componentName: '',      //组件名
            processMethod: '',      //加工方式
            workFlag: '',            //工序标识
            deliveryMethod: '',      //发料方式
            paymentType: '',         //结算类型
            planDate: '',            //收付款日期
            routePath: this.$route.path,

            headersData: {
                "Access-Token": Vue.ls.get(ACCESS_TOKEN),
            },
            fileList: [],
        };
    },
    mounted () {

    },
    created () {

    },
    watch: {
        processMethod (val) {
            console.log(`selected:`, val);
        },
    },
    methods: {
        moment,
        closeModel () {
            //关闭弹出层
            const closesModel = document.getElementById('closesModel');
            closesModel.addEventListener('click', (e) => {
                this.editable = false;
                this.archivesCheck();
            }, false)
        },
        //==========================默认输入框==========================
        handleChange (e, num) {
            console.log(num)
            const value = e.target.value;
            let numReg = /^\d+(?:\.\d{0,4})?/;//整数或者0-4位小数


            let numberColArray = ['checkQuantity'];//数字类型数组
            if (numberColArray.includes(this.col)) {
                if (!numReg.test(value)) {
                    this.$message.warning('盘点数量输入有误！');
                    this.value = 0.00;
                    return;
                } else {
                    this.value = value;
                }
            }


            if (num && value) {
                if (!numReg.test(value)) {
                    this.$message.warning('输入有误');
                    this.value = 0.00;
                    return;
                } else {
                    if (value.split('.')[1] && value.split('.')[1].length > 4) {
                        this.value = value.split('.')[0] + '.' + value.split('.')[1].slice(0, 4);
                    } else {
                        this.value = value;
                    }
                }
            } else {
                this.value = value;
            }

        },
        checkClose () {
            this.editable = false;
            this.$emit("change", this.value);
        },
        check () {
            this.editable = false;
            this.$emit("change", this.value);
        },
        handleSelectChange (value, label) {
            this.editable = false;
            this.value = label.componentOptions.children[0].text;
            this.$emit("change", value);
        },
        //==========================默认输入框==========================
        handleSelectBlur () {
            this.editable = false;
        },
        edit () {

            if (this.col == 'workFlag' || this.col == 'specification' || this.col == 'baseUnitName' || this.col == 'unitName' || this.col == 'processMethod') {//加工方式不可修改
                return;
            }

            this.editable = true;
            if (this.col == 'teamName') {
                //班组
                this.componentName = 'team';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.col == 'workName' || this.col == 'workCode') {
                //工序名称
                console.log(this.text);
                this.componentName = 'process';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.col == 'bomVersion') {
                //子件bom
                this.componentName = 'bomVersion';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.col == 'workerName') {
                //工人
                this.componentName = 'workerName';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.routePath == '/contract/setting/contractPhaseGroup' && (this.col == 'name' || this.col == 'code')) {
                //合同阶段编码
                this.componentName = 'contractPhase';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.col == 'codeTerms' || this.col == 'nameTerms') {
                //合同条款编码 ，合同条款名称
                this.componentName = 'contractTerms';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })

            } else if (this.col == 'fileUrl') {
                //合同附件上传
                this.$nextTick(() => {
                    // this.$refs.focusid.dispatchEvent(new MouseEvent('click')) 
                    // document.querySelector('#file').click();
                });

            } else if (this.col == 'inventoryCode' || this.col == 'inventoryName') {
                
                //子件编码||子件名称
                if (this.$route.path == '/inventory/bills/inventoryWork') {
                    this.$nextTick(() => {
                        this.$refs.focusid.focus();
                    });
                    this.$emit('detailAddInventory');
                } else {
                    this.$nextTick(() => {
                        this.closeModel();
                    })
                }

            } else if (this.col == 'warehouseName' || this.col == 'warehouseId') {
                //仓库
                this.componentName = 'warehouse';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.col == 'inventoryLocationName') {
                //货位
                this.componentName = 'location';
                this.$nextTick(() => {
                    this.$refs.searchComponents.showModal();
                })
            } else if (this.col == 'unitExchangeRate') {
                //有辅计量&&convertType==1浮动   换算率才可以点击
                let unitNum = 0;
                this.unitsDataDetails.forEach((element, index) => {
                    if (element.unitGroupId == this.record.unitGroupId && !element.isMainUnit) {//&& !element.isMainUnit
                        unitNum += 1;
                    }
                });

                if (unitNum == 1) {
                    //浮动只允许有一个辅计量
                    this.$nextTick(() => {
                        this.$refs.focusid.focus();
                    });
                } else {
                    this.editable = false;
                    this.$message.warning('该换算类型为固定不可更改');
                    return;
                }
            } else {
                this.$nextTick(() => {
                    this.$refs.focusid.focus();
                });
            }
        },
        searchBackData (record) {
            this.editable = false;
            if (record) {
                if (record.constructor === Object) {
                    this.value = record.name;
                    this.$emit("change", record);
                }
            } else {
                this.$emit("change");
            }
        },
        //==========================物料编码==========================
        archivesCheck (backData) {
            this.editable = false;
            console.log(backData)
            // if (backData) {
            if (backData && backData.length >= 1) {
                this.$emit("choiceAddData", backData);
            } else {
                if (backData) {
                    this.$emit("change", backData);
                }
            }
            // }
        },
        archivesEnter () {
            //搜索后点击回车
            // this.$refs.searchRef.handleEnter();
        },
        archivesData (e) {
            const value = e.target.value;
            this.value = value;
            if (this.setTime) {
                clearTimeout(this.setTime)
            }
            this.setTime = setTimeout(() => {
                this.$refs.searchRef.inputVal = value;
                this.$refs.searchRef.getData(1);
            }, 500)
        },
        //==========================物料编码==========================

        //==========================辅计量==========================
        unitsChange (id) {
            this.editable = true;
            let name = null;
            let unitExchangeRate = null;
            let convertType = null;
            for (const key in this.unitsAssistSelect) {
                if (this.unitsAssistSelect[key].id == id) {
                    name = this.unitsAssistSelect[key].name;
                    unitExchangeRate = this.unitsAssistSelect[key].changeRate;
                    this.value = name;
                    convertType = this.unitsAssistSelect[key].convertType;//换算率是否是浮动还是固定
                }
            }
            let backData = {
                id: id,
                name: name,
                unitExchangeRate: unitExchangeRate,
                convertType: convertType
            }
            this.$emit("change", backData);
        },
        unitsBlur () {
            this.editable = false;
        },
        unitsFocus () {
            this.$refs.focusid.open = true;
        },
        //==========================辅计量==========================


        onChangeTime (d, string, code) {
            //时间处理string
            // this.dateString = string;
            // this.code = code;
            let backData = {
                dateString: string,
                code: code
            }
            this.value = string;
            this.editable = false;
            this.$emit("change", this.value);
        },
        closePicker () {
            //隐藏日期控件
            this.editable = false;
        },
        importFile ({ fileList }) {
            //上传文件

            this.fileList = fileList;
            let data = this.fileList[this.fileList.length - 1];//最新一条数据
            console.log(data)
            if (data.response) {
                this.value = {
                    fileName: data.response.name,
                    fileUrl: data.response.url,
                    fileType: data.response.type,
                }
                this.$emit("change", this.value);
            }

        },
    },
};
</script>
<style lang="less">
    #closesModel {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 82;
        background: rgba(255, 255, 255, 0);
    }
    .editable-cell-process {
        position: relative;
        height: 30px;
        line-height: 30px;
        width: 100%;
        margin: 0 auto;
        cursor: pointer;
        .ant-input {
            height: 30px;
            text-align: left;
            font-size: 13px;
            padding: 0;
            border: 1px solid #000 !important;
        }
        .ant-select-selection--single {
            height: 28px !important;
        }
        .ant-select-selection {
            border: 1px solid #000 !important;
        }

        .editable-cell-input-wrapper {
            padding: 0;
        }
        .editable-cell-text-wrapper {
            padding: 0 2px;
            height: 100%;
            width: 100%;
        }
        .editable-cell-icon,
        .editable-cell-icon-check {
            position: absolute;
            right: 0;
            width: 20px;
            cursor: pointer;
        }

        .editable-cell-icon {
            line-height: 18px;
            display: none;
        }

        .editable-cell-icon-check {
            line-height: 28px;
        }

        .editable-cell:hover .editable-cell-icon {
            display: inline-block;
        }

        .editable-cell-icon:hover,
        .editable-cell-icon-check:hover {
            color: #108ee9;
        }

        .editable-add-btn {
            margin-bottom: 8px;
        }

        .editable-cell-input-search {
            position: relative;
        }
    }
</style>