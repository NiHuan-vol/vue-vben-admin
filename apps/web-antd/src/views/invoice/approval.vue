<template>
<nly-content-wrapper class="a-base-container">
  <div class="wh100 flex" >
    <!-- 树形菜单 -->
      <div class="tree-box">
        <a-tree class="tree" show-line :tree-data="numberSetTree" @select="treeSelect" @expand="treeExpand" :expandedKeys="expandedNumberSetKeys" :selected-keys="selectedNumberSetKeys">
          <a-icon slot="switcherIcon" type="down" />
          <template slot="title" slot-scope="{ title }">
            <span >{{ title }}</span>
          </template>
        </a-tree>
      </div>
    <div class="resize-table-container ">
      <a-table :columns="columns" :components="components" :data-source="data" :scroll="{ x: 500, y: 600 }" bordered :pagination="false" />
   <!-- modal 弹窗  -->
    <a-modal v-model="editeModel" title="单据审核" width="1000px">
      <div id="components-form-demo-advanced-search">
        <a-form class="ant-advanced-search-form" :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 24 }" @submit="handleSubmit">
          <a-row :gutter="24">
            <a-col :span="10" :push="2">
              <a-form-item label="单据名称">
                <a-input v-decorator="['name', { rules: [{ required: true, message: '单据名称不能为空' }] }]" placeholder="请输入单据名称"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="10" :push="2" >
              <a-form-item label="审核人">
                 <input-group-search rightStyle="width: 320px;" labelStyle="display:none" treeType="officeUser" :valueTitle.sync="editItem.approvalUserName" v-model="editItem.approvalUserId"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="10" :push="2">
              <a-form-item label="需要审核">
                <a-checkbox v-model="editItem.isApproval" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="10" :push="2">
              <a-form-item label="启用审批">
                <a-checkbox v-model="editItem.isStartApproval" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :push="2" :span="10">
              <a-form-item label="移动审批">
                <a-checkbox v-model="editItem.isMoveApproval" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="10" :push="2">
              <a-form-item label="邮件审批">
                <a-checkbox v-model="editItem.isEmailApproval" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <template slot="footer">
        <a-button type="primary" html-type="submit" @click="handleSubmit">保存</a-button>
        <a-button :style="{ marginLeft: '8px' }" @click="()=>this.editeModel = false">关闭</a-button>
      </template>
    </a-modal>
    </div>
  </div>
</nly-content-wrapper>
</template>
<script>


import { DisAbleFirfoxDrag } from "@/utils/browser";
import { components } from "@/utils/antTableComponents";
import { parentList as listNumberSet, pageList, save } from "@/api/erp/mumberSet";
import { classPageListToTree, searchInTreeData } from "@/utils/tree";
import Sortable from "sortablejs";

export default {
  data() {
    const columns = [
      {
        title: "模块编码",
        dataIndex: "moduleCode",
        key: "moduleCode",
        width: 80
      },
      {
        title: "单据名称",
        dataIndex: "name",
        align: "left",
        key: "name",
        width: 80,
        customRender: (text, row, index) => {
          return (
            <span>
              <i class={row.menuIcon || ""} style="margin-right:5px;"></i>
              <a href="javascript:;" onClick={() => this.showModal(row)}>
                {text}
              </a>
            </span>
          );
        }
      },
      {
        title: "需要审核",
        dataIndex: "isApproval",
        key: "isApproval",
        width: 80,
        customRender: (text, row, index) => {
            return text ? "是" : "否";
        }
      },
      {
        title: "启用审核流程",
        dataIndex: "isStartApproval",
        key: "isStartApproval",
        width: 80,
        customRender: (text, row, index) => {
            return text ? "是" : "否";
        }
      },
      {
        title: "审核人",
        dataIndex: "approvalUserName",
        key: "approvalUserName",
        width: 80
      },
      {
        title: "移动审批",
        dataIndex: "isMoveApproval",
        key: "isMoveApproval",
        width: 80,
        customRender: (text, row, index) => {
            return text ? "是" : "否";
        }
      },
      {
        title: "邮件审批",
        dataIndex: "isEmailApproval",
        key: "isEmailApproval",
        width: 180,
        customRender: (text, row, index) => {
            return text ? "是" : "否";
        }
      },
      {
        title: "操作",
        dataIndex: "o",
        key: "o",
        width: 80,
        customRender: (text, row, index) => {
          return (
            <div class="row justify-content-md-center">
              <span class="col"></span>
              <span class="col-sm-auto col-md-auto col-lg-auto col-xl-auto">
                <a href="javascript:;" title="编辑" class="mr-1 col-1" onClick={() => this.showModal(row)}>
                  <i class="fa fa-edit" style="color: #69aa46;"></i>
                </a>
              </span>
              <span class="col"></span>
            </div>
          );
        }
      }
    ];

    //表格 头部 可伸缩
    this.components = components(columns);
    return {
      data: [],
      columns,
      editItem: {},
      moduleCode: 'ARAP',
      numberSetTree: [],
      editeModel: false,
      form: this.$form.createForm(this, { name: "advanced_search" })
    };
  },

  created(){
    this.listNumberSet();
  },

  computed: {
    //选择单据的名称
    selectedInvoiceName: function() {
      // console.log("AntMenu_this.$route",this.$route);
      return [this.$route.meta.title || "未选择单据"];
    },
    //选择单据的id（目前是页面的id）
    selectedInvoiceId: function() {
      // console.log("AntMenu_this.$route",this.$route);
      return [this.$route.meta.id || ""];
    }
  },
  methods: {
    //重新加载 单据数据
    reloadData(){
      this.list();
      this.listProperty();
    },
    //选择树
    treeSelect(selectedKeys, info) {
      console.log(selectedKeys[0]);
      this.moduleCode = selectedKeys[0];
      this.codeList();
    },
    codeList() {
        pageList({moduleCode: this.moduleCode}).then(response => {
        this.data = response.data.records;
      });
    },
    treeExpand(expandedKeys){
        console.log("展开的节点1：",this.expandedNumberSetKeys );
        this.expandedNumberSetKeys = expandedKeys;
         console.log("展开的节点：",expandedKeys );
    },
    //加载 单据编码
    listNumberSet(){
      listNumberSet()
      .then(response => {
        if (response.code === 200) {
          const { data } = response;
          let map = new Map();
          data.forEach(item=>{
            let { moduleName,moduleCode,name } = item;
            let firstLevel = map.get(moduleName);
            if(!firstLevel){
              firstLevel = new Object();
              firstLevel.title = moduleName;
              firstLevel.key = moduleCode;
              firstLevel.children = [];
              map.set(moduleName,firstLevel);
            }
          });
          this.numberSetTree =  [...map.values()];
          if(data.length > 0){
              const firstParent =  this.numberSetTree[0];
              const parentKey = firstParent.key;
              const firstItem = firstParent.children[0];
              
              console.log("加载第一个对象.....",firstItem);
              const { key ,title } = firstItem;
              this.selectedTitle = title;
              this.selectedNumberSetKeys = [key];
              this.expandedNumberSetKeys = [parentKey];
              console.log("展开、选择的keys:",this.expandedNumberSetKeys,this.selectedNumberSetKeys);
              this.postData.source = key;
              //加载
              this.reloadData();
          }
        }
      })
      .catch(error => {});
    },
    showModal(editItem) {
      console.log("editItem", editItem);
      this.editItem = { ...editItem };
      this.editeModel = true;
      this.form = this.$form.createForm(this, {
        mapPropsToFields: () => {
          return {
            name: this.$form.createFormField({
              value: this.editItem.name
            }),
            defaultCode: this.$form.createFormField({
              value: this.editItem.defaultCode
            }),
            currentCode: this.$form.createFormField({
              value: this.editItem.currentCode
            })
          };
        }
      });
    },
    add() {
      this.editeModel = true;
    },
    hideModal() {
      this.editeModel = false;
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.editItem.name = values.name;
          this.editItem.defaultCode = values.defaultCode;
          this.editItem.currentCode = values.currentCode;
          this.editItem.createDate = null;
          this.editItem.updateDate = null;
          save(this.editItem).then(response => {
            if (response.code == 200) {
              this.$message.success("保存成功");
              this.codeList();
              this.hideModal();
            } 
          });
        }
      });
    },
  }
};
</script>
<style lang="less" >

.tree-box {
  width: 240px;
  margin-right: 10px;
  background: #efefef;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  .flex {
    align-items: center;
    margin: 5px 0px 10px;
  }
  .title {
    text-align: center;
    font-size: 18px;
  }
  button {
    margin-left: 10px;
  }
}

.resize-table-container {
  width: calc(100% - 250px);
}
.menu-style {
  padding: 5px;
  width: 200px;
}
.ant-menu-item:hover {
  background-color: rgb(236, 236, 236) !important;
}
.ant-checkbox-group,.ant-radio-group{
  display:flex;
  flex-wrap: wrap;
}
.ant-checkbox-wrapper,
.ant-radio-wrapper{
  margin-left:0px;
  margin-right:8px;
  font-size: 13px;
}
w100pencent{
  width:100%;
}
w100pencent-30{
  width:calc( 100% - 30px);
  
}
.test {
  border: 1px solid #ccc;
}
.drag-item {
  width: 200px;
  height: 50px;
  line-height: 50px;
  margin: auto;
  position: relative;
  background: #ddd;
  margin-top: 20px;
}
.ghostClass {
  opacity: 1;
}
.bottom {
  width: 200px;
  height: 50px;
  position: relative;
  background: blue;
  top: 2px;
  left: 2px;
  transition: all 0.5s linear;
}
.form-inline label {
  justify-content: left !important;
}
.form-inline > .col {
  margin-bottom: 1.5rem !important;
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