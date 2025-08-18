<!-- 渲染动态表单 -->
<template>
    <a-row>
        <a-col :span="24">
            <div v-for="(item,index) in FormData" :key="index">

                <a-col v-if="item.columnType == '文本'" v-show="item.isShow" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :ref="item.code" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <slot name="inventoryName" v-if="item.code == 'inventoryName'" :item="item"></slot>
                        <!--物料名称-->
                        <slot name="inventoryCode" v-else-if="item.code == 'inventoryCode'" :item="item"></slot>
                        <!--物料名称-->
                        <slot name="inventorySpecification" v-else-if="item.code == 'inventorySpecification'" :item="item"></slot>
                        <!--规格型号-->

                        <a-input v-else :disabled="!item.onEdit" v-model="item.valueName" :placeholder="`请输入${item.name}`" />
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '下拉'" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <slot :name="item.slot" v-if="item.slot" :code="item.code"></slot>
                        <a-select v-else :disabled="!item.onEdit" :placeholder="`请选择${item.name}`" v-model="item.valueName" @change="onSelectChange(item.code,$event)">
                            <a-select-option v-for=" (select,index) in formatVal(item.val)" :key="index+'select'" :value="select.id">
                                {{select.name}}
                            </a-select-option>
                        </a-select>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '字典'" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <slot :name="item.slot" v-if="item.slot" :code="item.code"></slot>
                        <a-select v-else :disabled="!item.onEdit" :placeholder="`请选择${item.name}`" v-model="item.valueName" @change="onSelectChange(item.code,$event)">
                            <a-select-option v-for=" (select,index) in formatVal(item.val)" :key="index+'select'" :value="select.id">
                                {{select.name}}
                            </a-select-option>
                        </a-select>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '搜索下拉'" v-show="item.isShow" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill, message: `${item.name}不能为空`,trigger:'input' }]">
                        <slot name="unitIdAll"></slot>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '复选'" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill, message: `${item.name}必须选择` }]">
                        <a-checkbox-group :disabled="!item.onEdit" v-model="item.valueName">
                            <a-row>
                                <a-col :style="fromStyle" :span="12" v-for="(check,index) in formatRadioVal(item.val)" :key="index+'check'" :checked="check">
                                    <a-checkbox :value="check">
                                        {{check}}
                                    </a-checkbox>
                                </a-col>
                            </a-row>
                        </a-checkbox-group>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '单选'" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill, message: `${item.name}必须选择` }]">
                        <a-radio-group :disabled="!item.onEdit" v-model="item.valueName">
                            <a-row>
                                <a-col :style="fromStyle" :span="12" v-for="(radio,index) in formatRadioVal(item.val)" :key="index+'radio'">
                                    <a-radio :value="radio">
                                        {{radio}}
                                    </a-radio>
                                </a-col>
                            </a-row>
                        </a-radio-group>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '日期'" :span="8">
                    <a-form-model-item :label="item.name" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <slot :name="item.slot" v-if="item.slot" :code="item.code"></slot>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '时间'" :span="8">
                    <a-form-model-item :label="item.name" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <a-date-picker :disabled="!item.onEdit" style="width: 180px;min-width:180px;" format="YYYY-MM-DD HH:mm" v-model="item.valueName" :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" />
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '整数'" :span="8">
                    <a-form-model-item :label="item.name" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <a-input-number :disabled="!item.onEdit" class="number-box" :min="1" :max="99999999" :placeholder="`请输入${item.name}`" v-model="item.valueName" />
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType=='小数'" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill,trigger:'input'}]">
                        <a-input-number :disabled="!item.onEdit" class="number-box" :min="0" :max="99999999" :step="1" :placeholder="`请输入${item.name}`" v-model="item.valueName" />
                    </a-form-model-item>
                </a-col>
                <!-- <a-col v-if="item.columnType == '是否'" :span="8">
                    <a-form-model-item :label="item.name">
                        <a-radio-group :disabled="!item.onEdit" v-model="item.valueName" :prop="item.code" :rules="[{ required: item.onFill, message: `${item.name}必须选择` }]">
                            <a-row>
                                <a-col :style="fromStyle" :span="24">
                                    <a-radio :value="true">
                                        是
                                    </a-radio>
                                    <a-radio :value="false">
                                        否
                                    </a-radio>
                                </a-col>
                            </a-row>
                        </a-radio-group>
                    </a-form-model-item>
                </a-col> -->
                <a-col v-if="item.columnType == '是否'" :span="6">
                    <a-form-model-item>
                        <a-checkbox :disabled="!item.onEdit || item.onLocalNoEdit" v-model="item.valueName" :prop="item.code" @change="()=>inventoryAttributMutexe(item)">{{item.name}}</a-checkbox>
                        <a-tooltip v-if="item.remarks" style="position:absolute;right:-11px;top:3px;z-index:2" :title="item.remarks">
                            <a-icon type="question-circle" style="color: rgba(0,0,0,.45)" />
                        </a-tooltip>
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '区块'" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill, message: `${item.name}不能为空` }]">
                        <a-input :disabled="!item.onEdit" :span="24" style="resize:none" type="textarea" v-model="item.valueName" />
                    </a-form-model-item>
                </a-col>
                <a-col v-if="item.columnType == '搜索选择'" v-show="item.isShow" :span="8">
                    <a-form-model-item :label="item.name" :prop="item.code" :rules="[{ required: item.onFill, message: `${item.name}不能为空`,trigger:'input' }]">
                        <slot name="search" :code="item.code"></slot>
                    </a-form-model-item>
                </a-col>
            </div>
        </a-col>
    </a-row>
</template>
<script>
import moment from "moment";
import { unitDropDownSearch } from "@/components/PopUpLayer";
export default {
    props: {
        FormData: {
            type: Array,
            default: () => [],
        },
        inventoryAttributMutexe: {
            type: Function,
            default: () => { }
        }
    },
    data () {
        return {
            fromStyle: { paddingTop: "8px" },
        };
    },
    created () { },
    computed: {},
    components: {
        unitDropDownSearch
    },
    methods: {
        moment,
        formatVal (val) {
            //改变下拉数据结构
            let backJson = [];
            if (val && val != '' && val != null) {
                for (let i = 0; i < val.length; i++) {
                    backJson.push({
                        'id': val[i].id,
                        'name': val[i].name
                    })
                }
            }
            return backJson;
        },
        formatRadioVal (val) {
            return val && val != '' && val != null ? val.splist(',') : '';
        },
        onSelectChange (item, val) {
            this.$emit('jlselect', item, val);
        }

    },
};
</script>
<style lang="less" scoped>
    .ant-calendar-picker {
        min-width: none !important;
    }
    .number-box {
        width: 198px;
        height: 32px !important;
        line-height: 32px;
    }
</style>
<style lang="less">
    .number-box .ant-input-number-handler-wrap {
        display: none !important;
    }
</style>