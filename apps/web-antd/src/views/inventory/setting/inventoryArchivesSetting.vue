<template>
    <div class="content-wrapper a-base-container">
        <div class="wh100 resize-table-container customizeSet" style="padding:10px;">
            <!-- 顶部搜索区域 -->
            <div class="table-page-search-wrapper">
                <a-form layout="inline">
                    <a-row :gutter="24" style="width:100%">
                        <a-col :md="6" :sm="8">
                            <a-form-item label="字段定位">
                                <a-input @change="locate(false)" placeholder="请输入字段名称" v-model="locateText"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :md="2" :sm="8">
                            <a-button type="primary" @click="locate(true)">定位</a-button>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24" style="width:100%">
                        <a-col :md="8" :sm="8">
                            <a-button type="primary" @click="addField" style="margin-right:10px;">新增字段</a-button>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
            <a-tabs :defaultActiveKey="tabKey" @change="tabChange">
                <a-tab-pane v-for="(name) in tabList" :tab="name" :key="name"></a-tab-pane>
            </a-tabs>
            <a-table :columns="columns" :data-source="tableData" :pagination="false" :components="components" :scroll="scroll" :customRow="customClick" :loading="loading" bordered>
                <a-input-number slot="columnWidth" slot-scope="text, record" v-model="record.columnWidth" :precision="0" :step="10" @change="ItemEdit(record)"></a-input-number>
                <span slot="operation" slot-scope="text, record">
                    <a-popconfirm title="确定删除吗?" @confirm="handleDelete(record)" v-if="record.dataType == 2 || record.dataType == 3 ">
                        <a href="javascript:;" title="删除">
                            <a-icon type="delete" :style="{ fontSize: '16px', color: '#DC3545' }" />
                        </a>
                    </a-popconfirm>
                </span>
                <span slot="field-type-list" slot-scope="text, record">
                    {{record.columnType}}
                    <!-- <a-select style="width:100%;" @change="fieldTypeChange(index)" placeholder="请输入字段类型" v-model="record.type">
          <a-select-option v-for="select in fieldTypeList" :key="select.key">{{ select.title }}</a-select-option>
        </a-select> -->
                </span>

                <template slot="field-type" slot-scope="text, record, index">
                    <form-select v-if=" record.columnType == '下拉'" title="下拉效果" size="small" :selectStyle="(record.onEdit && (record.dataType == 1 || record.dataType == 2)) ? ' width:80%;':' width:100%;'" labelStyle="display: none;" :dataList="valForFormFN(text)" v-model="record.value">
                        <a slot="actions" v-if="record.onEdit && (record.dataType == 1 || record.dataType == 2)" @click="editFieldContent(record,index)" style="color:#138496;font-size:1.2rem;display: inline-block;width:20%;">
                            <a-icon type="edit" theme="twoTone" title="编辑下拉框内容" />
                        </a>
                    </form-select>
                    <form-select v-if=" record.columnType == '性别'" title="下拉效果" size="small" selectStyle=" width:100%;" labelStyle="display: none;" :dataList="valForFormFN(text)" v-model="record.value">
                    </form-select>
                    <form-radio v-if="record.columnType == '单选'" title="单选效果" labelStyle="display: none;" keyPre="menuType" :dataList="valForFormFN(text)" v-model="record.value">
                        <a slot="actions" v-if="record.onEdit && (record.dataType == 1 || record.dataType == 2)" @click="editFieldContent(record,index)" style="color:#138496;font-size:1.2rem;display: inline-block;width:20%;">
                            <a-icon type="edit" theme="twoTone" title="编辑单选框内容" />
                        </a>
                    </form-radio>
                    <form-check-box v-if="record.columnType == '复选'" title="复选效果" labelStyle="display: none;" :dataList="valForCheckBoxFN(text)" v-model="record.value">
                        <a slot="actions" v-if="record.onEdit && (record.dataType == 1 || record.dataType == 2)" @click="editFieldContent(record,index)" style="color:#138496;font-size:1.2rem;display: inline-block;width:20%;">
                            <a-icon type="edit" theme="twoTone" title="编辑复选框内容" />
                        </a>
                    </form-check-box>
                    <form-radio v-if="record.columnType == '是否'" title="是否效果" labelStyle="display: none;" v-model="record.value" keyPre="menuType" :dataList="[
                        { key: '是', title: '是' },
                        { key: '否', title: '否' }
                    ]"></form-radio>
                    <form-date-picker v-if="record.columnType == '日期'" title="日期效果" labelStyle="display: none;" v-model="record.value"></form-date-picker>
                    <form-date-picker v-if="record.columnType == '时间'" title="日期效果" show-time format="YYYY-MM-DD HH:mm" labelStyle="display: none;" v-model="record.value"></form-date-picker>
                    <form-input-number v-if="record.columnType == '整数'" title="整数效果" labelStyle="display: none;" :precision="0" :step="1" v-model="record.value"></form-input-number>
                    <form-input-number v-if="record.columnType == '小数'" title="小数效果" labelStyle="display: none;" :step="0.1" v-model="record.value"></form-input-number>

                    <!-- <a-input class="w100pencent" v-if="record.columnType === '整数'" placeholder="请输入整数" type="number" step="1"></a-input>
        <a-input class="w100pencent" v-if="record.columnType === '小数'" placeholder="请输入整数" type="number" step="0.1"></a-input>
        <a-textarea class="w100pencent" v-if="record.columnType === '区块'" :rows="1" />
        <a-radio-group class="w100pencent" v-if="record.columnType === '是否'" default-value="是">
          <a-radio value="是">是</a-radio>
          <a-radio value="否">否</a-radio>
        </a-radio-group>
        <a-date-picker class="w100pencent" v-if="record.columnType === '日期'" />
        <a-date-picker
          class="w100pencent"
          v-if="record.columnType === '时间'"
          show-time
          placeholder="请选择时间"
          format="YYYY-MM-DD HH:mm"
        />
        <a-input class="w100pencent" v-if="record.columnType === '文本'"
        <a-select class="w100pencent-30" placeholder="点击查看下拉效果" v-if="record.columnType === '下拉'" v-model="record.value">
          <a-select-option v-for="data1 in valForFormFN(record.val)" :key="data1">{{ data1 }}</a-select-option>
        </a-select>
        <a-radio-group class="w100pencent-30" v-if="record.columnType === '单选'"   v-model="record.value">
          <a-radio
            :style="radioBoxStyle"
            v-for="item in valForFormFN(record.val)"
            :key="item.key"
          >{{ item.title }}</a-radio>
        </a-radio-group>
        <a-checkbox-group class="w100pencent-30" v-if="record.columnType === '复选'"  v-model="record.value">
          <a-checkbox
            :style="radioBoxStyle"
            v-for="item in valForFormFN(record.val)"
            :key="item.key"
          >{{ item.title }}</a-checkbox>
        </a-checkbox-group>
        <a-icon 
        v-if="'下拉复选单选'.indexOf(record.columnType) !== -1" 
        style="fontSize :18px;margin-left:8px" 
        type="edit" 
        theme="twoTone" 
        @click="editFieldContent(record,index)"
        title="编辑选项内容"/> -->
                </template>
                <div slot="filterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }" style="padding: 8px">
                    <a-input v-ant-ref="c => (searchInput = c)" :placeholder="`搜索 ${column.title}`" :value="selectedKeys[0]" style="width: 188px; margin-bottom: 8px; display: block;" @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])" @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)" />
                    <a-button size="small" style="width: 90px;margin-right: 8px" @click="() => handleReset(clearFilters)">
                        重置
                    </a-button>
                    <a-button type="primary" icon="search" size="small" style="width: 90px;" @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)">
                        搜索
                    </a-button>
                </div>
                <a-icon slot="filterIcon" slot-scope="filtered" type="search" :style="{ color: filtered ? '#108ee9' : undefined }" />
                <template slot="customRender" slot-scope="text, record, index, column">
                    <span v-if="searchText && searchedColumn === column.dataIndex">
                        <template v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
                            <mark v-if="fragment.toLowerCase() === searchText.toLowerCase()" :key="i" class="highlight">{{ fragment }}</mark>
                            <template v-else>{{ fragment }}</template>
                        </template>
                    </span>
                    <template v-else>
                        {{ text }}
                    </template>
                </template>
            </a-table>
            <!-- 右键菜单 -->
            <a-menu class="menu-style" :style="menuStyle" v-if="menuVisible">
                <a-menu-item @click="clockMenu('head')">上移至顶部</a-menu-item>
                <a-menu-item @click="clockMenu('headval')">
                    上移
                    <a-input type="number" v-model="headValue" :min="1" :max="99" class="menu-input" style="width:80px;"></a-input>行
                </a-menu-item>
                <a-menu-item @click="clockMenu('tail')">下移至尾部</a-menu-item>
                <a-menu-item @click="clockMenu('tailval')">
                    下移
                    <a-input type="number" v-model="tailValue" :min="1" :max="99" class="menu-input" style="width:80px;"></a-input>行
                </a-menu-item>
            </a-menu>
            <!-- 保存按钮 -->
            <div class="a-button-bar">
                <a-button type="primary" @click="SaveVoucherDesign">保存</a-button>
            </div>
            <fieldEdit ref="fieldEdit" @ok="fieldEditOk"></fieldEdit>
            <fieldContentEdit ref="fieldContentEdit" @ok="fieldContentEditOk"></fieldContentEdit>
        </div>
    </div>
</template>
<script>

import { valForFormFN, valForCheckBoxFN, getOnlyCode, IdFieldToNameField } from "@/utils/customize"
import { DisAbleFirfoxDrag } from "@/utils/browser";
import { components } from "@/utils/antTableComponents";
import fieldEdit from "@/views/finance/setting/model/fieldEdit";
import fieldContentEdit from "@/views/finance/setting/model/fieldContentEdit";
import { list, save, deleteOne, add as addCustomField, addProperty } from "@/api/erp/voucherDesign";
import Sortable from "sortablejs";

export default {
    data () {
        const columns = [
            {
                title: "序号",
                dataIndex: "sort",
                key: "sort",
                width: 50,
                customRender: (text, record, index) => {
                    const title = "上下拖动可进行排序";
                    const style = "cursor: move;";
                    return (
                        <div title={title} style={style}>
                            {text}
                        </div>
                    );
                }
                // scopedSlots: { customRender: 'sort' },
                // customRender: (value, row, index) => `${index + 1}`
            },
            {
                title: "字段名称",
                dataIndex: "sysName",
                key: "sysName",
                width: 150,
                scopedSlots: {
                    filterDropdown: 'filterDropdown',
                    filterIcon: 'filterIcon',
                    customRender: 'customRender',
                },
                onFilter: (value, record) =>
                    record.sysName
                        .toString()
                        .toLowerCase()
                        .includes(value.toLowerCase()),
                onFilterDropdownVisibleChange: visible => {
                    if (visible) {
                        setTimeout(() => {
                            this.searchInput.focus();
                        }, 0);
                    }
                },
            },
            {
                title: "显示名称",
                dataIndex: "name",
                key: "name",
                width: 150,
                customRender: (text, record, index) => {
                    const key = "name";
                    const change = e => {
                        record[key] = e.target.value;
                        record.isEdit = true;
                    };
                    return <a-input class={'inputs' + index} value={record[key]} onChange={change}></a-input>;
                },
                scopedSlots: {
                    filterDropdown: 'filterDropdown',
                    filterIcon: 'filterIcon',
                    customRender: 'customRender',
                },
                onFilter: (value, record) =>
                    record.name
                        .toString()
                        .toLowerCase()
                        .includes(value.toLowerCase()),
                onFilterDropdownVisibleChange: visible => {
                    if (visible) {
                        setTimeout(() => {
                            this.searchInput.focus();
                        }, 0);
                    }
                },
            },
            {
                title: "数据类型",
                dataIndex: "dataType",
                key: "dataType",
                width: 100,
                customRender: (text, row, index) => {
                    let heml = null;
                    switch (text) {
                        case 1: heml = <div>系统字段</div>; break;
                        case 2: heml = <div>自定义</div>; break;
                        case 3: heml = <div>引用属性</div>; break;
                    }
                    return heml;
                }
            },
            {
                title: "字段类型",
                dataIndex: "columnType",
                key: "columnType",
                width: 100,
                scopedSlots: { customRender: "field-type-list" }
            },
            {
                title: "字段内容",
                dataIndex: "val",
                key: "val",
                width: 240,
                align: "left",
                scopedSlots: { customRender: "field-type" }
            },
            {
                title: "列宽",
                dataIndex: "columnWidth",
                width: 100,
                key: "columnWidth",
                scopedSlots: { customRender: 'columnWidth' },
            },
            {
                title: "启用",
                dataIndex: "onOff",
                key: "onOff",
                width: 80,
                customRender: (text, record) => {
                    const key = "onOff";
                    const change = e => {
                        record[key] = e.target.checked;
                        record.isEdit = true;
                    };
                    return (
                        <a-checkbox checked={record[key]} onChange={change}></a-checkbox>
                    );
                }
            },
            {
                title: "必填",
                dataIndex: "onFill",
                key: "onFill",
                width: 80,
                customRender: (text, record) => {
                    const key = "onFill";
                    const change = e => {
                        record[key] = e.target.checked;
                        record.isEdit = true;
                    };
                    return (
                        <a-checkbox checked={record[key]} onChange={change}></a-checkbox>
                    );
                }
            },
            {
                title: "搜索条件",
                dataIndex: "isSearch",
                key: "isSearch",
                width: 80,
                customRender: (text, record) => {
                    const key = "isSearch";
                    const change = e => {
                        record[key] = e.target.checked;
                        record.isEdit = true;
                    };
                    return (
                        <a-checkbox checked={record[key]} disabled={record.onLocked} onChange={change}></a-checkbox>
                    );
                }
            },
            {
                title: "操作",
                dataIndex: "operation",
                key: "operation",
                align: "center",
                width: 120,
                scopedSlots: { customRender: "operation" }
            }
        ];
        //表格 头部 可伸缩
        this.components = components(columns);
        return {
            valForFormFN,
            valForCheckBoxFN,
            getOnlyCode,
            IdFieldToNameField,
            //定位的输入
            locateText: '',
            //定位的下标
            locateIndex: -1,
            //单选多选样式
            radioBoxStyle: {
                display: "block",
                height: "30px",
                lineHeight: "30px"
            },
            //表格加载状态
            loading: false,
            //
            tabKey: '常用信息',
            //搜索文本
            searchText: '',
            //搜索输入框
            searchInput: null,
            //搜索结果
            searchedColumn: '',
            //当前编辑的数据下标
            editIndex: 0,
            //某个单据 表单设计 集合数据
            designList: [],
            //某个单据 表单设计 tab分类 Map
            designTabMap: new Map(),
            //表格数据
            data: [],
            //表头信息
            columns,
            //表格默认大小设置（滚动条）
            scroll: { x: 500, y: 600 },
            //调用地址
            url: {
                list: [],
                delete: [],
                update: []
            },

            //右键菜单是否显示
            menuVisible: false,
            //右键菜单样式
            menuStyle: {
                boxShadow: "2px 2px 3px #888888",
                position: "fixed",
                top: "0",
                left: "0",
                border: "1px solid #eee"
            },
            //右键窗口是否关闭
            closeFlag: false,
            // 绑定右击事件
            customClick: (record, index) => ({
                on: {
                    contextmenu: e => {
                        e.preventDefault();
                        console.log(index);
                        this.editIndex = index;
                        this.menuVisible = true;

                        this.menuStyle.top = e.clientY + "px";
                        //当点击位置靠下时，修改定位点
                        if (window.innerHeight - 300 < e.clientY) {
                            this.menuStyle.top = e.clientY - 190 + "px"
                        }
                        this.menuStyle.left = e.clientX + 5 + "px";
                        console.log(e.clientY)
                        console.log(window.innerHeight)
                        document.body.addEventListener("mousedown", this.onMouseDown);
                    }
                }
            }),
            //上移单位数量
            headValue: 1,
            //下移单位数量
            tailValue: 1,
            //新增、编辑字段弹窗是否显示
            modalVisible: false,
            //模态框title
            modelTitle: "编辑自定义字段", // '新增自定义字段'
            //字段类型列表
            fieldTypeList: [
                { key: "文本", title: "文本" },
                { key: "下拉", title: "下拉" },
                { key: "复选", title: "复选" },
                { key: "单选", title: "单选" },
                { key: "日期", title: "日期" },
                { key: "时间", title: "时间" },
                { key: "整数", title: "整数" },
                { key: "小数", title: "小数" },
                { key: "是否", title: "是否" },
                { key: "区块", title: "区块" }
            ],
            //单据请求参数
            postData: {
                source: "Inventory",
            },

        };
    },
    components: {
        fieldEdit,
        fieldContentEdit
    },
    created () {
        this.list();
    },
    mounted () {
        DisAbleFirfoxDrag();
        this.LoadData();
    },
    computed: {
        tabList: function () {
            const { designTabMap } = this;
            let keys = [...designTabMap.keys()];
            console.log("计算后的tabKeys：", keys);
            //排序
            keys.sort(function (a, b) { return (a == '图片' || b == "常用信息") ? 1 : -1 });
            let baseList = ["常用信息", "基本信息", "库存信息", "控制", "批号管理", "条形码", "图片"];
            return baseList;
        },
        tableData: function () {
            const { designTabMap, tabKey } = this;
            let dataList = designTabMap.get(tabKey) || [];
            return dataList;
        },
    },
    methods: {
        //移动至表头
        moveToHead (record, oldIndex) {
            const { tableData, designTabMap } = this;
            const removeItem = tableData.splice(oldIndex, 1)[0];
            const headList = designTabMap.get("表头");
            headList.push(removeItem);
            removeItem.dataTab = "表头";
            headList.forEach((item, index) => {
                item.sort = index + 1;
                item.isEdit = true;
            });
            tableData.forEach((item, index) => {
                item.sort = index + 1;
                item.isEdit = true;
            });
            this.renderTab();
        },
        //移动至表尾
        moveToTail (record, oldIndex) {
            const { tableData, designTabMap } = this;
            const removeItem = tableData.splice(oldIndex, 1)[0];
            const tailList = designTabMap.get("表尾");
            tailList.push(removeItem);
            removeItem.dataTab = "表尾";
            tailList.forEach((item, index) => {
                item.sort = index + 1;
                item.isEdit = true;
            });
            tableData.forEach((item, index) => {
                item.sort = index + 1;
                item.isEdit = true;
            });
            this.renderTab();
        },
        //删除 
        handleDelete (record) {
            const { id } = record;
            deleteOne({ id }).then(response => {
                if (response.code == 200) {
                    this.$message.success("删除成功");
                    this.list();
                }
            }).catch(err => { })
        },
        //批量保存 单据设计数据
        SaveVoucherDesign () {
            const { designList } = this;
            let filter = designList.filter(f => f.isEdit);
            if (!filter.length) {
                this.$message.error("当前页面没有修改");
                return false;
            }
            save(filter).then(response => {
                if (response.code == 200) {
                    this.$message.success("保存成功");
                    this.list();
                } else {
                    this.$message.error(response.message);
                }
            }).catch(error => { });
        },
        //tab分类Map
        changeToTabMap () {
            const { designList } = this;
            let designTabMap = new Map();
            designList.forEach(item => {
                let list = designTabMap.get(item.dataTab);
                if (!list) {
                    list = new Array();
                    designTabMap.set(item.dataTab, list);
                }
                list.push(item);
            });
            console.log("tab分类Map", designTabMap);
            Object.assign(this, { designTabMap });

        },
        //获取 某个单据的单据设计 数据
        list () {
            const { postData } = this;
            list(postData)
                .then(response => {
                    if (response.code === 200) {
                        const { data } = response;
                        this.designList = data;
                        this.changeToTabMap();
                    }
                })
                .catch(error => { });
        },
        //定位字段
        locate (searchFlag) {
            //如果是输入框变更，设置查询定位下标为-1
            if (!searchFlag) {
                this.locateIndex = -1;
                return;
            }
            this.$nextTick(() => {
                var index = this.locateIndex === -1 ? 0 : this.locateIndex + 1;
                let flag = false;
                for (index; index < this.tableData.length; index++) {
                    if (this.tableData[index].sysName.indexOf(this.locateText) !== -1) {
                        flag = true;
                        // this.locateIndex = index;
                        break;
                    }
                }
                if (flag) {
                    this.locateIndex = index;
                    document.getElementsByClassName("inputs" + this.locateIndex)[0].focus();
                    console.log(this.locateIndex);
                } else {
                    if (this.locateIndex !== -1) {
                        this.locateIndex = -1;
                        this.locate(true);
                    } else {
                        console.log('没有哦');
                    }

                }
            })
        },
        //字段类型变更时
        fieldTypeChange (index) {
            const type = this.data[index].type;
            //如果从非下拉、复选、单选，变更成下拉、复选、单选
            //需要初始化listData（字段内容）
            if ("下拉复选单选".indexOf(type) !== -1
                && this.data[index].listData === undefined) {
                this.data[index].listData = [];
            }
        },
        //编辑字段内容回调
        fieldContentEditOk (listData) {
            console.log("编辑字段内容回调", listData)
            this.tableData[this.editIndex].val = listData.join(",");
            this.tableData[this.editIndex].isEdit = true;
            //TODO 保存更新
        },
        //编辑字段内容
        editFieldContent (record, index) {
            this.editIndex = index;
            this.$refs.fieldContentEdit.edit(record.val ? record.val.split(",") : []);
            this.$refs.fieldContentEdit.title = "编辑字段内容";
        },
        //自定义 字段 添加成功后的回调
        fieldEditOk () {
            this.list();
        },
        //添加字段
        addField () {
            const { source } = this.postData;
            const { tabKey } = this;
            let props = {
                title: "新增字段",
                source,
                dataTab: tabKey
            }
            Object.assign(this.$refs.fieldEdit, { ...props });
            this.$refs.fieldEdit.add();
        },
        moveTabelNode (target) {
            //取出当前操作节点
            const node = this.tableData.splice(this.editIndex, 1)[0];
            console.log(node)
            // 放到第一个
            if (target < 0) {
                target = 0;
            }
            if (target > this.tableData.length) {
                target = this.tableData.length;
            }
            console.log(target);
            this.tableData.splice(target, 0, node);
            this.menuVisible = false;
            this.tableData.forEach((item, index) => {
                item.sort = index + 1;
                item.isEdit = true;
            });
            this.renderTab();
            document.body.removeEventListener("mousedown", this.onMouseDown);
        },
        //刷新Tab里面的表格数据
        renderTab () {
            let oldTabKey = this.tabKey;
            this.tabKey = '';
            this.$nextTick(function () {
                this.tabKey = oldTabKey;
            })
        },
        //点击右键小菜单
        clockMenu (type) {
            console.log(this.closeFlag);
            if (!this.closeFlag) {
                return;
            }
            if (type === 'head') {
                this.moveTabelNode(0);
                return;
            }
            if (type === 'tail') {
                this.moveTabelNode(this.tableData.length - 1);
                return;
            }
            if (type === 'headval') {
                this.moveTabelNode(this.editIndex - this.headValue);
                this.headValue = 1;
                return;
            }
            if (type === 'tailval') {
                this.moveTabelNode(this.editIndex + this.tailValue);
                this.tailValue = 1;
                return;
            }

        },
        //点击鼠标时，移出右键显示的菜单
        onMouseDown (event) {
            var e = event || window.event;
            var elem = e.target;
            //获取自定义菜单区域
            var targetArea = document.getElementsByClassName("menu-style")[0];
            if (targetArea.contains(elem)) {
                // 在区域内
                //判断电机的是不是input框
                var inputArea = document.getElementsByClassName("menu-input");
                if (!inputArea[0].contains(elem) && !inputArea[1].contains(elem)) {
                    this.closeFlag = true;
                } else {
                    this.closeFlag = false;
                }
            } else {
                //在区域外时，结束右击事件
                this.menuVisible = false;
                document.body.removeEventListener("mousedown", this.onMouseDown);
            }
        },
        //加载数据
        LoadData () {
            this.drag();
            // let queryParam = {};
            // this.loading = true;
            // getAction(this.url.list, queryParam).then(res => {
            //   if (res.success) {
            //     this.data = res.result.records;
            //     //添加拖动效果
            //     this.drag();
            //   } else {
            //     // this.$message.warning(res.message);
            //   }
            //   this.loading = false;
            // });
        },
        //标签切换调用
        tabChange (key) {
            console.log(key);
            this.tabKey = key;
        },
        //搜索
        handleSearch (selectedKeys, confirm, dataIndex) {
            confirm();
            this.searchText = selectedKeys[0];
            this.searchedColumn = dataIndex;
        },
        //搜索重置
        handleReset (clearFilters) {
            clearFilters();
            this.searchText = '';
        },
        // 拖动
        drag () {
            // 首先获取需要拖拽的dom节点
            const el1 = document.querySelectorAll(
                ".customizeSet .ant-table-tbody"
            )[0];
            if (!el1) return false;
            this.isDrag = true;
            console.log(el1);
            Sortable.create(el1, {
                disabled: false, // 是否开启拖拽
                ghostClass: "sortable-ghost", //拖拽样式
                animation: 150, // 拖拽延时，效果更好看
                group: {
                    // 是否开启跨表拖拽
                    pull: false,
                    put: false
                },
                onEnd: e => {
                    // 这里主要进行数据的处理，拖拽实际并不会改变绑定数据的顺序，这里需要自己做数据的顺序更改
                    let arr = this.tableData; // 获取表数据
                    let removeItem = arr.splice(e.oldIndex, 1)[0];
                    arr.splice(e.newIndex, 0, removeItem); // 数据处理
                    //提前 赋值一个带值的数组（BUG 修复）

                    arr.forEach((item, index) => {
                        item.sort = index + 1;
                        item.isEdit = true;
                    });
                    let oldTabKey = this.tabKey;
                    this.tabKey = '';
                    this.$nextTick(function () {
                        this.tabKey = oldTabKey;
                    })
                }
            });
        }
    }
};
</script>
<style lang="less" >
    .menu-style {
        padding: 5px;
        width: 200px;
    }
    .ant-menu-item:hover {
        background-color: rgb(236, 236, 236) !important;
    }
    .ant-checkbox-group,
    .ant-radio-group {
        display: flex;
        flex-wrap: wrap;
    }
    .ant-checkbox-wrapper,
    .ant-radio-wrapper {
        margin-left: 0px;
        margin-right: 8px;
        font-size: 13px;
    }
    .w100pencent {
        width: 100%;
    }
    .w100pencent-30 {
        width: calc(100% - 30px);
    }
</style>