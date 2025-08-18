<!-- 可编辑单元格组件 -->
<template>
    <div class="editable-cell-process">
        <div v-if="editable" class="editable-cell-input-wrapper">
            <div v-if="col=='estimatedPrice' || col=='price'"><!--暂估单价 || 单价-->
                <a-input onkeyup="value=value.toString().match(/^\d+(?:\.\d{0,4})?/)" :value="value" ref="focusid" @change="((e,num)=>{handleChange(e,'num')})" @pressEnter="check" @blur="checkClose" />
            </div>
            <a-input v-else :value="value" ref="focusid" @change="handleChange" @pressEnter="check" @blur="checkClose" />
        </div>
        <div v-else class="editable-cell-text-wrapper" @click="edit" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
            <div style="text-align:right;padding-right:2px;" v-if="value && (col == 'estimatedAmount' || col== 'estimatedPrice'|| col== 'price'|| col== 'amount'|| col== 'baseQuantity')">{{value| NumFormat }}</div>
            <div v-else>{{ value || '&nbsp;' }}</div>
        </div>
    </div>
</template>
<script>

import getDate from "@/utils/tool/date";
import moment from "moment";
import searchGroupDetail from "@/components/PopUpLayer/searchGroupDetail";  //静态表格明细搜索组
import { searchCheckBoxArchives } from "@/components/PopUpLayer";           //物料多选组件

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
        }
    },
    data() {
        return {
            value: this.text,
            editable: false,
            componentName: '',      //组件名
            processMethod: '',      //加工方式
            workFlag: '',            //工序标识
        };
    },
    mounted() {

    },
    created() {

    },
    watch: {
        processMethod(val) {
            console.log(`selected:`, val);
        },
    },
    methods: {
        moment,
        closeModel() {
            //关闭弹出层
            const closesModel = document.getElementById('closesModel');
            closesModel.addEventListener('click', (e) => {
                this.editable = false;
                this.archivesCheck();
            }, false)
        },
        //==========================默认输入框==========================
        handleChange(e, num) {
            console.log(num)
            const value = e.target.value;
            let numReg = /^\d+(?:\.\d{0,4})?/;//整数或者0-4位小数


            let numberColArray = ['estimatedPrice'];//数字类型数组
            if (numberColArray.includes(this.col)) {
                if (!numReg.test(value)) {
                    this.$message.warning('暂估单价输入有误！');
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
        checkClose() {
            this.editable = false;
            this.$emit("change", this.value);
        },
        check() {
            this.editable = false;
            this.$emit("change", this.value);
        },
        handleSelectChange(value, label) {
            this.editable = false;
            this.value = label.componentOptions.children[0].text;
            this.$emit("change", value);
        },
        //==========================默认输入框==========================
        handleSelectBlur() {
            this.editable = false;
        },
        edit() {
            console.log(this.col, this.text, this.unitsAssistSelect);

            if (this.col == 'estimatedAmount' || this.col == 'estimatedPrice' || this.col == 'price') {
                //暂估金额 || 暂估单价 才可以修改
                this.editable = true;

                this.$nextTick(() => {
                    this.$refs.focusid.focus();
                });
            } else {
                //其他字段不可修改
                return;
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