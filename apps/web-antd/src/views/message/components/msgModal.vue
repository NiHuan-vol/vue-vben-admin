<!--
 * @Descripttion: 消息查看弹窗
 * @version: V1.0
 * @Author: GW
 * @Date: 2022-01-11 09:10:24
 * @LastEditors: GW
 * @LastEditTime: 2022-01-12 11:34:11
-->
<template>
    <a-modal title="消息查看" :visible="visibleDetails" @cancel="cancel" :width="800" destroyOnClose>
        <div class="msg-modal-box">
            <div class="title">
                {{msgTitle}}
            </div>
            <div class="content">
                {{msgContent}}
                <div @click="jumpUrl" style="color:#40a9ff;cursor:pointer;position:absolute;bottom:0;right:10px;">
                    前往查看 <i class="fa fa-angle-double-right" aria-hidden="true"></i>
                </div>
            </div>
            <div class="date">
                {{msgTime}}
            </div>
        </div>
        <template slot="footer">
            <a-button type="primary" @click="cancel">确认</a-button>
        </template>
    </a-modal>
</template>

<script>
export default {
    name: 'MsgModal',
    props: {
        itemData: {
            type: Object,
            default: {}
        }
    },
    data () {
        return {
            msgTitle: '',
            msgTime: '',
            msgContent: '',
            jumpPage: null,//跳转页面
            visibleDetails: false,
            id: null,//单据id
        }
    },
    methods: {
        jumpUrl () {
            if (this.jumpPage != null) {
                this.visibleDetails = false;
                this.$emit('closeDraws')
                let path = this.jumpPage + '?id=' + this.id;
                console.log(this.jumpPage, JSON.stringify(this.jumpPage))
                this.$router.push({ path });
            }
        },
        cancel () {
            this.visibleDetails = false;
            this.msgTitle = null;
            this.msgContent = null;
            this.msgTime = null;
            this.jumpPage = null;
        },
        showMsgDetails (item) {
            //展示消息详情
            this.visibleDetails = true;
            this.msgTitle = item.title;
            this.msgContent = item.content;
            this.msgTime = item.createDate;
            this.jumpPage = item.menuHref;
            this.id = item.voucherId;
            this.$store.dispatch('actionsGetRead', item.id).then(res => {
                if (res) {
                    // this.$store.dispatch("actionsGetNumber");
                }
            });
        },
    }
}
</script>

<style lang="less" scoped>
    .msg-modal-box {
        .title {
            width: 100%;
            font-size: 16px;
            color: #222;
            text-align: center;
            margin: 10px 0;
        }
        .content {
            position: relative;
            min-height: 300px;
            font-size: 14px;
            padding: 10px;
        }
        .date {
            width: 100%;
            height: 32px;
            line-height: 32px;
            text-align: right;
            color: #bbb;
        }
    }
</style>