<!-- 会计科目->总帐 -->
<template>
    <div class="content-wrapper a-base-container">
        <div class="requisition-set-wrapper">
            <!-- 按钮 -->
            <!-- <div class="btn-wrapper clearfix" style="margin-bottom:0px;">
                <a-row class="text-center clearfix">
                    <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
                        <a-col :xs="btn_grid.xs" :sm="btn_grid.sm" :md="btn_grid.md" :lg="btn_grid.lg" :xl="btn_grid.xl">
                            <div class="btns" @click="searchDynamic">
                                <a-icon class="btns-icon" type="search" />
                                <div class="btns-text">查询</div>
                            </div>
                        </a-col>
                        <a-col :xs="btn_grid.xs" :sm="btn_grid.sm" :md="btn_grid.md" :lg="btn_grid.lg" :xl="btn_grid.xl">
                            <div class="btns">
                                <a-icon class="btns-icon" type="unordered-list" />
                                <div class="btns-text">明细账</div>
                            </div>
                        </a-col>
                        <a-col :xs="btn_grid.xs" :sm="btn_grid.sm" :md="btn_grid.md" :lg="btn_grid.lg" :xl="btn_grid.xl">
                            <div class="btns" @click="printOrder">
                                <a-icon class="btns-icon" type="export" />
                                <div class="btns-text">导出</div>
                            </div>
                        </a-col>
                        <a-col :xs="btn_grid.xs" :sm="btn_grid.sm" :md="btn_grid.md" :lg="btn_grid.lg" :xl="btn_grid.xl">
                            <div class="btns" @click="printOrder">
                                <a-icon class="btns-icon" type="printer" />
                                <div class="btns-text">打印</div>
                            </div>
                        </a-col>
                    </a-col>
                </a-row>
            </div>-->
            <div ref="print" class="credentials-wrapper">
                <h3 class="text-center" style="border-bottom:1px solid #ccc;line-height:60px;margin-bottom:0;">
                    <span class="text-name">编码规则设置</span><br>
                </h3>
                <a-table :columns="ruleColumns" :dataSource="ruleDataSource" :pagination="false" :loading="loading" bordered>
                    <div v-for="col in slotArray" :slot="col" slot-scope="text,record,index">
                        <a-input v-if="isUpdate" oninput="value=value.replace(/[^\d]/g,'')" v-model="text" @blur="changeValue(text,col,index,record)"></a-input>
                    </div>
                </a-table>
                <div style="text-align:center;margin:20px auto;width:100%;">
                    <a-button @click="saveRule" type="primary">保存</a-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { list, save } from "@/api/erp/gradeRule";
export default {
    components: {

    },
    data () {
        return {
            isUpdate: true,
            ruleDataSource: [],
            ruleColumns: [
                {
                    title: "项目",
                    width: 150,
                    dataIndex: "title",
                    align: 'center'
                },
                {
                    title: "最大长度",
                    dataIndex: "maxLen",
                    width: 80,
                    align: 'center'
                    // scopedSlots: {
                    //     customRender: 'maxLen'
                    // },
                },
                {
                    title: "第1级",
                    dataIndex: "level1",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level1'
                    },
                },
                {
                    title: "第2级",
                    dataIndex: "level2",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level2'
                    },
                },
                {
                    title: "第3级",
                    dataIndex: "level3",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level3'
                    },
                },
                {
                    title: "第4级",
                    dataIndex: "level4",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level4'
                    },
                },
                {
                    title: "第5级",
                    dataIndex: "level5",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level5'
                    },
                },
                {
                    title: "第6级",
                    dataIndex: "level6",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level6'
                    },
                },
                {
                    title: "第7级",
                    dataIndex: "level7",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level7'
                    },
                },
                {
                    title: "第8级",
                    dataIndex: "level8",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level8'
                    },
                },
                {
                    title: "第9级",
                    dataIndex: "level9",
                    width: 50,
                    scopedSlots: {
                        customRender: 'level9'
                    },
                }
            ],
            slotArray: [],
            loading: false,

        };
    },
    created () {
        this.ruleColumns.forEach(item => {
            if (item.scopedSlots) {
                this.slotArray.push(item.dataIndex)
            }
        })
        this.loadRuleList();
    },
    mounted () {

    },
    methods: {
        reload () {
            this.isUpdate = false;
            this.$nextTick(() => {
                this.isUpdate = true;
            })
        },
        //加载 编码规则
        loadRuleList () {
            this.loading = true;
            list().then(res => {
                if (res.code == 200) {
                    let data = res.data.filter(item => item.title == '科目编码级次' || item.title == '结算方式编码级次');
                    this.ruleDataSource = this.getRuleData(data);
                } else {
                    // this.$message.warning(res.message);
                }
                this.loading = false;

                console.log(this.ruleDataSource)
            });
        },
        //处理 编码规则数据
        getRuleData (data) {
            for (let j = 0; j < data.length; j++) {
                let level = data[j].codingRule.split("");
                level.forEach((item, index) => {
                    data[j]['level' + (index + 1)] = item;
                })
            }
            return data;
        },
        changeValue (text, col, index, record) {
            console.log(text, col, index, record)


            this.ruleDataSource.forEach((item, i) => {
                if (index == i) {
                    item[col] = text != 0 ? text : null;
                }
            })

            if (text == 0) {
                this.reload();
                return;
            }

            let maxNum = 0;
            for (let j = 1; j < 10; j++) {
                if (record['level' + j]) {
                    maxNum += Number(record['level' + j])
                }
            }

            console.log('当前长度：', maxNum, '最大长度：', record.maxLen);
            if (maxNum > record.maxLen) {
                this.$message.warning('级次数量之和，不能大于最大长度');
                this.ruleDataSource.forEach((item, i) => {
                    if (index == i) {
                        item[col] = null;
                    }
                })
            }


            this.reload();
        },
        //保存 编码规则数据
        saveRule () {
            let data = _.cloneDeep(this.ruleDataSource);
            for (let i = 0; i < data.length; i++) {
                data[i].codingRule = "";
                for (let j = 1; j < 10; j++) {
                    data[i].codingRule += data[i]['level' + j]
                }
                data[i].codingRule = data[i].codingRule.replaceAll('undefined', '');
                data[i].codingRule = data[i].codingRule.replaceAll('n', '');
                data[i].codingRule = data[i].codingRule.replaceAll('u', '');
                data[i].codingRule = data[i].codingRule.replaceAll('l', '');
            }
            console.log(data);
            save(data).then(res => {
                if (res.code == 200) {
                    this.$message.success("保存成功");
                    this.loadRuleList();
                }
            });
        },
        getNowAccount () {
            //获取当前账套
            getNowAccount().then(res => {
                if (res.code === 200) {
                    console.log(res);
                    this.monthArray = [];
                    this.accountBeginDate = res.data.beginDate;
                    this.accountEndDate = res.data.endDate;


                    let accountMonthBegin = this.accountBeginDate.split('-');
                    let accountMonthEnd = this.accountEndDate.split('-');

                    let year = accountMonthBegin[0];
                    let month = parseInt(accountMonthBegin[1]);

                    let monthEnd = accountMonthEnd[1];
                    console.log(year, month, monthEnd);

                    for (let i = month; i <= monthEnd; i++) {
                        let m = year + '-' + (i < 10 ? '0' + i : i);
                        this.monthArray.push(m);
                    }

                    this.planData.beginDate = this.monthArray[0];
                    this.planData.endDate = moment().format('YYYY-MM');
                    // this.planData.endDate = this.monthArray[this.monthArray.length - 1];
                }
            })
        },

    }
};
</script>
<style lang="less" scoped>
    @import '~@/style/purchase/voucher.less';

    .credentials-wrapper {
        padding: 0px !important;
        height: 100% !important;
        overflow-y: auto;
        font-size: 14px;
    }
</style>