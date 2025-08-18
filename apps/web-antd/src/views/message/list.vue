<!--
 * @Descripttion: 消息管理
 * @version: V1.0
 * @Author: GW
 * @Date: 2022-01-11 09:10:24
 * @LastEditors: GW
 * @LastEditTime: 2022-01-12 11:34:11
-->
<template>
    <div class="message-list">
        <div class="message-header">
            <a-row :gutter="[16, 16]">
                <a-col :span="8">
                    <a-button type="primary" @click="refreshMessage">刷新消息</a-button>
                    <a-button @click="markAllRead" style="margin-left: 10px;">标记全部已读</a-button>
                    <a-button @click="deleteAll" style="margin-left: 10px;">删除全部</a-button>
                </a-col>
                <a-col :span="16"/>
            </a-row>
        </div>
        <div class="message-content">
            <a-table
                ref="table"
                size="middle"
                bordered
                rowKey="id"
                :columns="columns"
                :dataSource="dataSource"
                :pagination="pagination"
                :loading="loading"
                @change="handleTableChange"
                :scroll="{ x: 1000 }"
            >
                <template slot="operation" slot-scope="text, record">
                    <a-button size="small" @click="showDetails(record)">查看</a-button>
                    <a-button size="small" @click="readMessage(record.id)" style="margin-left: 5px;">{{record.status == 0 ? '标记已读' : '已读'}}</a-button>
                    <a-button size="small" @click="deleteMessage(record.id)" style="margin-left: 5px; color: #f5222d;">删除</a-button>
                </template>
            </a-table>
        </div>
        <msg-modal ref="msgModal" @closeDraws="closeDraws"></msg-modal>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import MsgModal from './components/msgModal';
import { count, list, read, remove } from '@/api/message/msg';
import { parseTime } from '@/utils/index';

export default {
    name: 'MessageList',
    components: {
        MsgModal
    },
    mixins: [],
    data() {
        return {
            dataSource: [],
            columns: [
                {
                    title: '消息标题',
                    dataIndex: 'title',
                    width: 200,
                    customRender: (text, record) => {
                        return (
                            <span style={{ fontWeight: record.status == 0 ? 'bold' : 'normal' }}>{text}</span>
                        );
                    }
                },
                {
                    title: '消息内容',
                    dataIndex: 'content',
                    width: 300,
                    ellipsis: true
                },
                {
                    title: '接收时间',
                    dataIndex: 'createDate',
                    width: 180,
                    customRender: (text) => {
                        return parseTime(text);
                    }
                },
                {
                    title: '消息类型',
                    dataIndex: 'type',
                    width: 100,
                    customRender: (text) => {
                        return text == 1 ? '系统消息' : '业务消息';
                    }
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    width: 100,
                    customRender: (text) => {
                        return text == 0 ? '未读' : '已读';
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    width: 200,
                    scopedSlots: { customRender: 'operation' }
                }
            ],
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            loading: false,
            queryParam: {
                page: 1,
                pageSize: 10
            }
        };
    },
    computed: {
        ...mapState({
            userInfo: state => state.user.userInfo
        })
    },
    created() {
        this.getList();
        this.getCount();
    },
    methods: {
        closeDraws() {
            this.$refs.msgModal.cancel();
        },
        // 获取消息列表
        getList() {
            this.loading = true;
            list(this.queryParam).then(res => {
                this.loading = false;
                if (res && res.code === 200) {
                    this.dataSource = res.data.records || [];
                    this.pagination.total = res.data.total || 0;
                }
            }).catch(err => {
                this.loading = false;
                console.error('获取消息列表失败:', err);
            });
        },
        // 获取未读消息数量
        getCount() {
            count().then(res => {
                if (res && res.code === 200) {
                    this.$store.dispatch('actionsSetNumber', res.data);
                }
            });
        },
        // 刷新消息
        refreshMessage() {
            this.getList();
            this.getCount();
        },
        // 查看消息详情
        showDetails(record) {
            this.$refs.msgModal.showMsgDetails(record);
            if (record.status === 0) {
                this.readMessage(record.id);
            }
        },
        // 标记已读
        readMessage(id) {
            read(id).then(res => {
                if (res && res.code === 200) {
                    this.getList();
                    this.getCount();
                }
            });
        },
        // 删除消息
        deleteMessage(id) {
            this.$confirm('确定要删除这条消息吗？', '提示', {
                okType: 'danger'
            }).then(() => {
                remove(id).then(res => {
                    if (res && res.code === 200) {
                        this.$message.success('删除成功');
                        this.getList();
                        this.getCount();
                    }
                });
            }).catch(() => {
                // 取消操作
            });
        },
        // 标记全部已读
        markAllRead() {
            this.$confirm('确定要标记全部消息为已读吗？', '提示').then(() => {
                read().then(res => {
                    if (res && res.code === 200) {
                        this.$message.success('标记成功');
                        this.getList();
                        this.getCount();
                    }
                });
            }).catch(() => {
                // 取消操作
            });
        },
        // 删除全部消息
        deleteAll() {
            this.$confirm('确定要删除全部消息吗？', '提示', {
                okType: 'danger'
            }).then(() => {
                remove().then(res => {
                    if (res && res.code === 200) {
                        this.$message.success('删除成功');
                        this.getList();
                        this.getCount();
                    }
                });
            }).catch(() => {
                // 取消操作
            });
        },
        // 分页变化
        handleTableChange(pagination) {
            this.pagination = { ...pagination };
            this.queryParam.page = pagination.current;
            this.queryParam.pageSize = pagination.pageSize;
            this.getList();
        }
    }
};
</script>

<style lang="less" scoped>
@import "~@/style/setting/inventory.less";

.message-list {
    .message-header {
        padding: 16px;
        background-color: #f7f7f7;
        border-bottom: 1px solid #e8e8e8;
    }
    .message-content {
        padding: 16px;
    }
}
</style>