<template>
  <nly-content-wrapper>
    <nly-content>
      <a-tabs type="card" @change="callback" v-model="tabKey" style="margin-top: 40px;">
        <a-tab-pane key="1" tab="单位租户">
          <nly-row class="ml-1 mb-2 lr mt-4">
            <nly-col xs="12" sm="12" md="12" lg="12" xl="12" class="form-inline" style="justify-content: left;">
              <form-input rightStyle="width:120px;" name="companyName" title="单位名称" v-model="postData.companyName"></form-input>
              <form-input rightStyle="width:120px;" name="mobile" title="手机号码" v-model="postData.mobile"></form-input>
              <form-input rightStyle="width:120px;" name="realName" title="管理员姓名" v-model="postData.realName"></form-input>
              <a-button type="primary" style="margin-left: 10px;height: 28px;" @click="PageList">查询</a-button>
            </nly-col>
          </nly-row>
          <a-table
            :columns="columns"
            :components="components"
            :data-source="data"
            :scroll="{x: 500, y: 500}"
            style="height: calc(100vh - 15rem);"
            bordered
            :pagination="pagination"
            @change="onTableChange"
          ></a-table>
        </a-tab-pane>
        <a-tab-pane key="2" tab="个人租户">
          <nly-row class="ml-1 mb-2 lr mt-4">
            <nly-col xs="12" sm="12" md="12" lg="12" xl="12" class="form-inline" style="justify-content: left;">
              <form-input rightStyle="width:120px;" name="companyName" title="单位名称" v-model="postData.companyName"></form-input>
              <form-input rightStyle="width:120px;" name="mobile" title="手机号码" v-model="postData.mobile"></form-input>
              <form-input rightStyle="width:120px;" name="realName" title="管理员姓名" v-model="postData.realName"></form-input>
              <a-button type="primary" style="margin-left: 10px;height: 28px;" @click="memberPage">查询</a-button>
            </nly-col>
          </nly-row>
          <!-- 个人租户列表 -->
          <a-table
            :columns="memberColumns"
            :components="memberComponents"
            :data-source="memberData"
            bordered
            :scroll="{x: 500, y: 500}"
            style="height: calc(100vh - 15rem);"
            :pagination="pagination"
            @change="onTableChange"
          ></a-table>
        </a-tab-pane>
      </a-tabs>
    </nly-content>
  </nly-content-wrapper>
</template>

<script>
import { pageList } from "@/api/companyInfo.js";
import { components } from "@/utils/antTableComponents";
import { pageMember } from "@/api/user.js";

const basePostData = {
  current: 1,
  size: 20
};

export default {
  data() {
    //单位table列
    const columns = [
      {
        title: "单位名称",
        dataIndex: "companyName",
        key: "companyName",
        width: 260,
        align: "left"
      },
      {
        title: "统一代码",
        dataIndex: "unifiedSocialCoding",
        key: "unifiedSocialCoding",
        width: 120
      },
      {
        title: "所在地区",
        dataIndex: "areaName",
        key: "areaName",
        width: 120
      },
      {
        title: "登录名",
        dataIndex: "userName",
        key: "userName",
        width: 120
      },
      {
        title: "管理员姓名",
        dataIndex: "realName",
        key: "realName",
        width: 120
      },
      {
        title: "手机号码",
        dataIndex: "mobile",
        key: "mobile",
        width: 120
      },
      {
        title: "电话号码",
        dataIndex: "phone",
        key: "phone",
        width: 120
      },
      {
        title: "电子邮件",
        dataIndex: "email",
        key: "email",
        width: 120
      },
      {
        title: "邮件认证",
        dataIndex: "autoEmail",
        key: "autoEmail",
        width: 120
      },
      {
        title: "员工数量",
        dataIndex: "enterpriseScale",
        key: "enterpriseScale",
        width: 120
      },
      {
        title: "注册类型",
        dataIndex: "type",
        key: "type",
        width: 120
      },
      {
        title: "密钥类型",
        dataIndex: "secretType",
        key: "secretType",
        width: 120,
        customRender: (text, row, index) => {
          if(row.secretKey) {
            return text == 0 ? "免费" : "付费"
          }
        }
      },
      {
        title: "当前密钥",
        dataIndex: "secretKey",
        key: "secretKey",
        width: 120
      },
      {
        title: "到期日期",
        dataIndex: "secretEndDate",
        key: "secretEndDate",
        width: 120
      },
      {
        title: "产品名称",
        dataIndex: "goodsName",
        key: "goodsName",
        width: 120
      },
      {
        title: "角色名称",
        dataIndex: "roleName",
        key: "roleName",
        width: 120
      },
      {
        title: "用户数",
        dataIndex: "freeUser",
        key: "freeUser",
        width: 120,
        customRender: (text, row, index) => {
          return row.freeUser + row.companyUser
        }
      },
      {
        title: "最后登录时间",
        dataIndex: "loginDate",
        key: "loginDate",
        width: 120
      },
      {
        title: "登录ip",
        dataIndex: "loginIp",
        key: "loginIp",
        width: 120
      },
      {
        title: "登录次数",
        dataIndex: "loginCount",
        key: "loginCount",
        width: 120
      },
      {
        title: "注册时间",
        dataIndex: "createDate",
        key: "createDate",
        width: 120
      },
      {
        title: "注册ip",
        dataIndex: "registerIp",
        key: "registerIp",
        width: 120
      },
      {
        title: "注册地址",
        dataIndex: "registerAddress",
        key: "registerAddress",
        width: 120
      },
      {
        title: "推荐人",
        dataIndex: "shareUserName",
        key: "shareUserName",
        width: 120
      }
    ];
    //个人租户table列
    const memberColumns = [
      {
        title: "姓名",
        dataIndex: "realName",
        key: "realName",
        align: "left",
        width: 120
      },
      
      {
        title: "性别",
        dataIndex: "sex",
        key: "sex",
        width: 120,
        customRender: (text, row, index) => {
          return text ? "男" : "女"
        }
      },
      {
        title: "登录名",
        dataIndex: "userName",
        key: "userName",
        width: 120
      },
      {
        title: "手机号",
        dataIndex: "mobile",
        key: "mobile",
        width: 120
      },
      {
        title: "电子邮箱",
        dataIndex: "email",
        key: "email",
        width: 120
      },
      {
        title: "邮箱认证",
        dataIndex: "autoEmail",
        key: "autoEmail",
        width: 120
      },
      {
        title: "注册类型",
        dataIndex: "type",
        key: "type",
        width: 120,
        customRender: (text, row, index) => {
          return row.shareUserId != null ? "邀请注册" : "普通注册";
        }
      },
       {
        title: "用户类型",
        dataIndex: "companyId",
        key: "companyId",
        width: 120,
        customRender: (text, row, index) => {
          return text ? "员工" : "个人";
        }
      },
      {
        title: "所属单位",
        dataIndex: "companyName",
        key: "companyName",
        width: 260
      },
      {
        title: "最后登录时间",
        dataIndex: "lastLoginDate",
        key: "lastLoginDate",
        width: 120
      },
      {
        title: "登录ip",
        dataIndex: "lastLoginIp",
        key: "lastLoginIp",
        width: 120
      },
       {
        title: "登录次数",
        dataIndex: "loginCount",
        key: "loginCount",
        width: 120
      },
      {
        title: "注册时间",
        dataIndex: "createDate",
        key: "createDate",
        width: 120
      },
      {
        title: "注册IP",
        dataIndex: "registerIp",
        key: "registerIp",
        width: 120
      },
      {
        title: "注册地址",
        dataIndex: "registerAddress",
        key: "registerAddress",
        width: 120
      },
      {
        title: "邮箱",
        dataIndex: "email",
        key: "email",
        width: 120
      }
    ];

    //表格 头部 可伸缩
    this.components = components(columns);
    this.memberComponents = components(memberColumns);
    return {
      loading: false,
      imageUrl: "",
      userInfo: {}, //基本信息
      goodsInfo: {},
      columns, //单位租户列表
      data: [], //单位租户数据
      memberColumns, //个人租户列表
      memberData: [], //个人租户列表数据
      form: this.$form.createForm(this, { name: "coordinated" }),
      tabKey: "1",
      postData: { ...basePostData },
      pagination: {
        defaultPageSize: 20,
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: total => {
          return (
            <div>
              共 {total} 条数据，每页
              <a-input-number
                value={this.pagination.pageSize}
                min={1}
                max={500}
                onPressEnter={e => this.changePageSize(e)}
              />
              条
            </div>
          );
        },
        showQuickJumper: true,
        showLessItems: true
      }
    };
  },
  mounted() {
    this.PageList();
  },
  methods: {
    callback(key) {
      this.postData = { ...basePostData };
      console.log(key);
      this.tabKey = key;
      if (key == 1) {
        this.PageList();
      } else if (key == 2) {
        this.memberPage();
      }
    },
    //获取单位租户列表
    PageList() {
      const { postData } = this;
      pageList(postData)
        .then(response => {
          if (response.code === 200) {
            const { data } = response;
            const { records, total, current, size } = data;
            this.data = records;
            Object.assign(this.pagination, {
              total
            });
            console.log("this.data == ", this.data);
          }
        })
        .catch(error => {});
    },
    //获取个人租户列表
    memberPage() {
      const { postData } = this;
      pageMember(postData)
        .then(response => {
          if (response.code === 200) {
            const { data } = response;
            const { records, total, current, size } = data;
            this.memberData = records;
            Object.assign(this.pagination, {
              total
            });
            console.log("this.data == ", this.memberData);
          }
        })
        .catch(error => {});
    },
    //table分页触发
    onTableChange(pagination, filters, sorter) {
      Object.assign(this.postData, {
        current: pagination.current,
        size: pagination.pageSize
      });
      Object.assign(this.pagination, {
        current: pagination.current,
        pageSize: pagination.pageSize
      });
      if(this.tabKey == 1) {
        this.PageList();
      }else {
        this.memberPage();
      }
    },
    changePageSize(e) {
      const value = e.target.value;
      const { pagination } = this;

      console.log(e, value);
      Object.assign(this.postData, {
        size: value
      });
      Object.assign(this.pagination, {
        pageSize: Number.parseInt(value)
      });
      if(this.tabKey == 1) {
        this.PageList();
      }else {
        this.memberPage();
      }
    },
  }
};
</script>
<style scoped>
.avatar-uploader > .ant-upload {
  width: 110px;
  height: 110px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}
.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
.user-class .ant-form-item {
  margin-bottom: 2px !important;
}
.form-inline label {
  justify-content: left !important;
}
.form-inline > .col {
  margin-bottom: 1.5rem !important;
}
.icons-list >>> .anticon {
  margin-right: 8px;
  font-size: 16px;
}
.ant-advanced-search-form {
  padding: 24px;
  background: #fbfbfb;
}

.ant-advanced-search-form .ant-form-item {
  display: flex;
}

.ant-advanced-search-form .ant-form-item-control-wrapper {
  flex: 1;
}

#components-form-demo-advanced-search .ant-form {
  max-width: none;
}
#components-form-demo-advanced-search .search-result-list {
  margin-top: 16px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 80px;
}
</style>