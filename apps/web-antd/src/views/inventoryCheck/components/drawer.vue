<!--
 * @Descripttion: 右侧抽屉字段显示组件
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-07-06 17:06:33
 * @LastEditors: GaoWei
 * @LastEditTime: 2021-07-16 10:52:46
-->
<template>
    <a-drawer class="check-drawer-main" title="自定义列" placement="right" :closable="false" :width="520" :visible="visible" :after-visible-change="afterVisibleChange" @close="onClose">
        <a-checkbox-group @change="onMySetChange" :default-value="checkedArray">
            <a-checkbox v-for="(item, index) in allField" :value="item.title" :key="index" :disabled="!item.isCancel">{{item.title}}</a-checkbox>
        </a-checkbox-group>
        <div :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }">
            <a-button :style="{ marginRight: '8px' }" @click="onClose">
                关闭
            </a-button>
            <a-button type="primary" @click="onSave">
                保存
            </a-button>
        </div>
    </a-drawer>
</template>
<script>
import { checkOutColumnsJson, evaluateColumnsJson, selfRestraintColumnsJson, delegateColumnsJson, otherColumnsJson, outInventoryColumnsJson, outSelfColumnsJson } from '../columnsJson/checkOut'

import { saveAccountingFieldtApi } from '@/api/inventoryCheck/inventoryCheckOut'
export default {
    data() {
        return {
            visible: false,
            defaultArray: [],//默认必须选中的字段
            allField: [],//全部字段
            checkedArray: [],//选中的数组
        }
    },
    props: {
        data: {
            type: Array,
            default: []
        },
        type: {//区分列表
            type: Number,
            default: 1
        }
    },
    created() {

    },
    methods: {
        initData() {
            this.allField = [];
            this.checkedArray = [];
            console.log(this.data, this.type)
            //判断当前单据显示不同字段json
            if (this.type == 1) {
                this.allField = checkOutColumnsJson;//外购入库核算
            } else if (this.type == 2) {
                this.allField = evaluateColumnsJson;//存货暂估入库
            } else if (this.type == 3) {
                this.allField = selfRestraintColumnsJson;//自制入库核算
            } else if (this.type == 4) {
                this.allField = delegateColumnsJson;//委外入库核算
            } else if (this.type == 5) {
                this.allField = otherColumnsJson;//其他入库核算
            } else if (this.type == 6) {
                this.allField = outInventoryColumnsJson;//材料出库库核算
            } else if (this.type == 7) {
                this.allField = outSelfColumnsJson;//自制出库库核算
            }

            //初始化显示字段
            if (this.data.length > 0) {
                this.checkedArray = this.data;
                console.log('tag', this.checkedArray)
            } else {
                this.allField.forEach(item => {
                    this.checkedArray.push(item.title);
                });
            }
        },
        afterVisibleChange(val) {
            console.log('visible', val);
        },
        showDrawer() {
            this.visible = true;
            this.initData();
        },
        onClose() {
            this.visible = false;
        },
        onMySetChange(event) {
            console.log(event)
            this.checkedArray = event;
        },
        onSave() {
            //保存显示字段
            let request = {
                field: this.checkedArray.toString(),//显示的字段
                type: this.type
            }
            saveAccountingFieldtApi(request).then(res => {
                if (res.code === 200) {
                    this.$message.success('保存成功');
                    this.onClose();
                    this.$emit('getField');
                } else {
                    // this.$message.warning(res.message);
                }
            }).catch(err => {
                this.$message.warning(err.message);
            })
        }
    }
}
</script>
<style lang="less">
.check-drawer-main {
    .ant-checkbox-wrapper {
        margin-bottom: 0.5rem !important;
        width: 110px !important;
    }
    .ant-checkbox-wrapper + .ant-checkbox-wrapper {
        margin-left: 0;
    }
}
</style>