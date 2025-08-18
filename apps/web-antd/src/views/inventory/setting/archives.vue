<template>
  <div class="inventory-archives-container">
    <!-- 顶部操作栏 -->
    <div class="inventory-archives-header">
      <a-button type="primary" @click="add" :disabled="!hasPermission('inventory:archives:add')">新增</a-button>
      <a-button @click="edit" :disabled="!hasPermission('inventory:archives:edit') || !selectedRowKeys.length">修改</a-button>
      <a-button type="danger" @click="remove" :disabled="!hasPermission('inventory:archives:delete') || !selectedRowKeys.length">删除</a-button>
      <a-upload name="file" :showUploadList="false" :beforeUpload="beforeUpload" :disabled="!hasPermission('inventory:archives:import')">
        <a-button :disabled="!hasPermission('inventory:archives:import')">导入</a-button>
      </a-upload>
      <a-button @click="exportData" :disabled="!hasPermission('inventory:archives:export')">导出</a-button>
    </div>

    <!-- 左侧分类树和右侧数据表格 -->
    <div class="inventory-archives-content">
      <div class="inventory-archives-tree">
        <a-input placeholder="搜索分类" v-model="treeSearchValue" @change="treeSearch" class="tree-search-input"/>
        <div class="archive-tree-refresh" @click="refreshTree">
          <Icon type="icon-refresh" />
        </div>
        <a-tree
          v-model="checkedKeys"
          :tree-data="treeData"
          :default-expand-all="true"
          @select="treeSelect"
          class="inventory-archives-tree-content"
        />
      </div>

      <div class="inventory-archives-table">
        <!-- 搜索区域 -->
        <a-form layout="inline" :form="searchForm" class="ant-advanced-search-form">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="物料编码">
                <a-input v-decorator="['code', {}]" placeholder="请输入物料编码" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="物料名称">
                <a-input v-decorator="['name', {}]" placeholder="请输入物料名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="物料简称">
                <a-input v-decorator="['shortName', {}]" placeholder="请输入物料简称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="助记码">
                <a-input v-decorator="['mnemonicCode', {}]" placeholder="请输入助记码" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="规格型号">
                <a-input v-decorator="['specification', {}]" placeholder="请输入规格型号" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="品牌">
                <a-select v-decorator="['brandId', {}]" placeholder="请选择品牌">
                  <a-select-option v-for="item in brandList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="物料类型">
                <a-select v-decorator="['materialTypeId', {}]" placeholder="请选择物料类型">
                  <a-select-option v-for="item in materialTypeList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="状态">
                <a-select v-decorator="['status', {}]" placeholder="请选择状态">
                  <a-select-option value="1">启用</a-select-option>
                  <a-select-option value="0">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="创建人">
                <a-input v-decorator="['createBy', {}]" placeholder="请输入创建人" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item label="创建时间">
                <a-range-picker v-decorator="['createTime', {}]" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-button type="primary" @click="handleSearch" style="margin-right: 10px;">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-col>
          </a-row>
        </a-form>

        <!-- 数据表格 -->
        <div class="resize-table-container">
          <a-table
            :columns="columns"
            :dataSource="dataSource"
            :pagination="pagination"
            :rowKey="record => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :scroll="{ x: 'max-content' }"
            @change="page"
          />
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <a-modal
      :title="modalTitle"
      :visible="visible"
      :width="1200"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      @ok="handleOk"
      class="archives-flag"
    >
      <a-tabs v-model="activeTabKey" @change="callback">
        <!-- 基本信息 -->
        <a-tab-pane key="1" tab="基本信息">
          <card-wrapper title="常用信息" :collapsible="false">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="物料编码">
                  <a-input v-model="form.code" placeholder="自动生成" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="物料名称" :validateStatus="form.name ? 'success' : 'error'" :help="form.name ? '' : '物料名称不能为空'">
                  <a-input v-model="form.name" placeholder="请输入物料名称" @change="inventoryChange" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="物料简称">
                  <a-input v-model="form.shortName" placeholder="请输入物料简称" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="助记码">
                  <a-input v-model="form.mnemonicCode" placeholder="自动生成" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="规格型号">
                  <a-input v-model="form.specification" placeholder="请输入规格型号" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="品牌">
                  <a-select v-model="form.brandId" placeholder="请选择品牌">
                    <a-select-option v-for="item in brandList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="物料类型">
                  <a-select v-model="form.materialTypeId" placeholder="请选择物料类型">
                    <a-select-option v-for="item in materialTypeList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="物料分类">
                  <a-select v-model="form.categoryId" placeholder="请选择物料分类" @change="categoryChange">
                    <a-select-option v-for="item in categoryList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="销售状态">
                  <a-select v-model="form.status" placeholder="请选择销售状态">
                    <a-select-option value="1">启用</a-select-option>
                    <a-select-option value="0">禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </card-wrapper>

          <card-wrapper title="基本信息" :collapsible="false">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="所属营销机构">
                  <a-select v-model="form.organizationId" placeholder="请选择营销机构">
                    <a-select-option v-for="item in organizationList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="默认仓库">
                  <a-select v-model="form.defaultWarehouseId" placeholder="请选择默认仓库">
                    <a-select-option v-for="item in warehouseList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="默认货位">
                  <a-select v-model="form.defaultLocationId" placeholder="请选择默认货位" :disabled="!form.defaultWarehouseId">
                    <a-select-option v-for="item in locationList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="是否批次管理">
                  <a-select v-model="form.isBatchManagement" placeholder="请选择是否批次管理">
                    <a-select-option value="1">是</a-select-option>
                    <a-select-option value="0">否</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="批次管理方式" :disabled="form.isBatchManagement === '0'">
                  <a-select v-model="form.batchManagementMethod" placeholder="请选择批次管理方式">
                    <a-select-option value="1">自动生成</a-select-option>
                    <a-select-option value="2">手动录入</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最后盘点时间">
                  <a-date-picker v-model="form.lastInventoryTime" />
                </a-form-item>
              </a-col>
            </a-row>
          </card-wrapper>

          <card-wrapper title="物料属性" :collapsible="false">
            <dynamic-form
              :config="dynamicFormConfig"
              :form="form"
              :data-source="dynamicDataSource"
              :disabled="false"
            />
          </card-wrapper>
        </a-tab-pane>

        <!-- 商品属性 -->
        <a-tab-pane key="2" tab="商品属性">
          <card-wrapper title="商品属性配置" :collapsible="false">
            <div class="good-attr-wrapper">
              <template v-for="(item, index) in form.commodityAttributes">
                <a-row :gutter="16" :key="index">
                  <a-col :span="6">
                    <a-form-item label="属性名称" :validateStatus="item.key ? 'success' : 'error'" :help="item.key ? '' : '属性名称不能为空'">
                      <a-input v-model="item.key" placeholder="请输入属性名称" @change="() => checkCommodityKey(index)" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="6">
                    <a-form-item label="属性值">
                      <a-input v-model="item.value" placeholder="请输入属性值" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="6">
                    <a-form-item label="是否必填">
                      <a-select v-model="item.required" placeholder="请选择是否必填">
                        <a-select-option value="1">是</a-select-option>
                        <a-select-option value="0">否</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="6">
                    <a-form-item label="操作">
                      <div class="delete-good-attr" @click="deleteCommodityData(index)">-</div>
                    </a-form-item>
                  </a-col>
                </a-row>
              </template>
            </div>
            <div class="add-good-attr" @click="addCommodityData">+</div>
          </card-wrapper>
        </a-tab-pane>

        <!-- 重量/尺寸 -->
        <a-tab-pane key="3" tab="重量/尺寸">
          <card-wrapper title="重量/尺寸信息" :collapsible="false">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="重量">
                  <div class="input-group">
                    <span class="input-group-before">kg</span>
                    <a-input-number v-model="form.weight" class="input-group-after" placeholder="请输入重量" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="长度">
                  <div class="input-group">
                    <span class="input-group-before">cm</span>
                    <a-input-number v-model="form.length" class="input-group-after" placeholder="请输入长度" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="宽度">
                  <div class="input-group">
                    <span class="input-group-before">cm</span>
                    <a-input-number v-model="form.width" class="input-group-after" placeholder="请输入宽度" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="高度">
                  <div class="input-group">
                    <span class="input-group-before">cm</span>
                    <a-input-number v-model="form.height" class="input-group-after" placeholder="请输入高度" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="体积">
                  <div class="input-group">
                    <span class="input-group-before">m³</span>
                    <a-input-number v-model="form.volume" class="input-group-after" placeholder="自动计算" disabled />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="单位体积重量">
                  <div class="input-group">
                    <span class="input-group-before">kg/m³</span>
                    <a-input-number v-model="form.unitVolumeWeight" class="input-group-after" placeholder="自动计算" disabled />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </card-wrapper>
        </a-tab-pane>

        <!-- 库存信息 -->
        <a-tab-pane key="4" tab="库存信息">
          <card-wrapper title="库存信息" :collapsible="false">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="安全库存">
                  <div class="input-group">
                    <span class="input-group-before">{{ form.unitName }}</span>
                    <a-input-number v-model="form.safetyStock" class="input-group-after" placeholder="请输入安全库存" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最低库存">
                  <div class="input-group">
                    <span class="input-group-before">{{ form.unitName }}</span>
                    <a-input-number v-model="form.minStock" class="input-group-after" placeholder="请输入最低库存" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="最高库存">
                  <div class="input-group">
                    <span class="input-group-before">{{ form.unitName }}</span>
                    <a-input-number v-model="form.maxStock" class="input-group-after" placeholder="请输入最高库存" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="库存预警">
                  <a-select v-model="form.stockWarning" placeholder="请选择库存预警">
                    <a-select-option value="1">启用</a-select-option>
                    <a-select-option value="0">禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="预警阈值">
                  <div class="input-group">
                    <span class="input-group-before">{{ form.unitName }}</span>
                    <a-input-number v-model="form.warningThreshold" class="input-group-after" placeholder="请输入预警阈值" :disabled="form.stockWarning === '0'" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="采购提前期">
                  <div class="input-group">
                    <span class="input-group-before">天</span>
                    <a-input-number v-model="form.purchaseLeadTime" class="input-group-after" placeholder="请输入采购提前期" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </card-wrapper>
        </a-tab-pane>

        <!-- 控制 -->
        <a-tab-pane key="5" tab="控制">
          <card-wrapper title="控制信息" :collapsible="false">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="盘点周期">
                  <a-select v-model="form.inventoryCycle" placeholder="请选择盘点周期">
                    <a-select-option value="1">日</a-select-option>
                    <a-select-option value="7">周</a-select-option>
                    <a-select-option value="30">月</a-select-option>
                    <a-select-option value="90">季度</a-select-option>
                    <a-select-option value="180">半年</a-select-option>
                    <a-select-option value="365">年</a-select-option>
                    <a-select-option value="0">不盘点</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="上次盘点时间">
                  <a-date-picker v-model="form.lastInventoryTime" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="下次盘点时间">
                  <a-date-picker v-model="form.nextInventoryTime" :disabled="form.inventoryCycle === '0'" />
                </a-form-item>
              </a-col>
            </a-row>
          </card-wrapper>
        </a-tab-pane>

        <!-- 二维码 -->
        <a-tab-pane key="6" tab="二维码">
          <card-wrapper title="二维码信息" :collapsible="false">
            <div style="text-align: center;">
              <VueQr :text="qrCodeContent" :size="200" />
              <div class="barcode-btn">
                <a-button @click="downLoad">下载二维码</a-button>
                <a-button @click="qrCodePrint">打印二维码</a-button>
              </div>
            </div>
          </card-wrapper>
        </a-tab-pane>

        <!-- 图片 -->
        <a-tab-pane key="7" tab="图片">
          <card-wrapper title="图片信息" :collapsible="false">
            <a-upload
              listType="picture-card"
              :fileList="fileList"
              :beforeUpload="beforeUploadImage"
              @preview="handlePreview"
              @change="handleChange"
            >
              <div v-if="fileList.length < 5">
                <Icon type="plus" />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancelPreview">
              <img alt="预览" style="width: 100%;" :src="previewImage" />
            </a-modal>
          </card-wrapper>
        </a-tab-pane>

        <!-- 批号管理 -->
        <a-tab-pane key="8" tab="批号管理" v-if="form.isBatchManagement === '1'">
          <card-wrapper title="批号管理" :collapsible="false">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="批次管理方式">
                  <a-select v-model="form.batchManagementMethod" placeholder="请选择批次管理方式">
                    <a-select-option value="1">自动生成</a-select-option>
                    <a-select-option value="2">手动录入</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="批次前缀">
                  <a-input v-model="form.batchPrefix" placeholder="请输入批次前缀" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="批次长度">
                  <a-input-number v-model="form.batchLength" placeholder="请输入批次长度" :min="1" :max="20" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="有效期管理">
                  <a-select v-model="form.isValidityPeriod" placeholder="请选择有效期管理">
                    <a-select-option value="1">是</a-select-option>
                    <a-select-option value="0">否</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="有效期天数" :disabled="form.isValidityPeriod === '0'">
                  <a-input-number v-model="form.validityDays" placeholder="请输入有效期天数" :min="1" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="预警天数" :disabled="form.isValidityPeriod === '0'
 || form.validityWarning === '0'">
                  <a-input-number v-model="form.warningDays" placeholder="请输入预警天数" :min="1" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="有效期预警">
                  <a-select v-model="form.validityWarning" placeholder="请选择有效期预警" :disabled="form.isValidityPeriod === '0'">
                    <a-select-option value="1">启用</a-select-option>
                    <a-select-option value="0">禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </card-wrapper>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 仓库货位选择弹窗 -->
    <a-modal
      title="选择仓库货位"
      :visible="selectModalVisible"
      :width="800"
      @cancel="selectModalCancel"
      @ok="selectModalOk"
    >
      <a-form layout="inline" :form="selectForm">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="仓库">
              <a-select v-model="selectForm.warehouseId" placeholder="请选择仓库" @change="warehouseChange">
                <a-select-option v-for="item in warehouseList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="货位">
              <a-select v-model="selectForm.locationId" placeholder="请选择货位" :disabled="!selectForm.warehouseId">
                <a-select-option v-for="item in locationList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import Vue from 'vue';
import { ACCESS_TOKEN } from '@/store/mutation-types';
import { mixinTable } from '@/mixins/table';
import { getTreeData, getClassList, getMaterialList, saveMaterial, deleteMaterial, getMaterialById, importMaterial, exportMaterial } from '@/api/inventory/archives';
import { getDynamicFormConfig, getDynamicFormData } from '@/api/dynamicForm';
import { getWarehouseList, getLocationListByWarehouseId } from '@/api/inventory/warehouse';
import { getOrganizationList } from '@/api/organization';
import { getBrandList } from '@/api/base/brand';
import { getMaterialTypeList } from '@/api/base/materialType';
import { transTree, transListToTree } from '@/utils/tree';
import { pinyin } from '@/utils/pinyin';
import VueQr from 'vue-qr';
import cardWrapper from '@/components/cardWrapper';
import dynamicForm from '@/components/dynamicForm';
import Icon from '@/components/icon';
import { message } from 'ant-design-vue';
import { validateSQLInjection } from '@/utils/validate';
import Print from 'vue-print-nb';
Vue.use(Print);

Vue.component('VueQr', VueQr);
Vue.component('cardWrapper', cardWrapper);
Vue.component('dynamicForm', dynamicForm);
Vue.component('Icon', Icon);

const columns = [
  { title: '物料编码', dataIndex: 'code', width: 120 },
  { title: '物料名称', dataIndex: 'name', width: 150 },
  { title: '物料简称', dataIndex: 'shortName', width: 120 },
  { title: '规格型号', dataIndex: 'specification', width: 120 },
  { title: '助记码', dataIndex: 'mnemonicCode', width: 120 },
  { title: '品牌', dataIndex: 'brandName', width: 100 },
  { title: '物料类型', dataIndex: 'materialTypeName', width: 100 },
  { title: '物料分类', dataIndex: 'categoryName', width: 100 },
  { title: '状态', dataIndex: 'status', width: 80, customRender: (text) => text === '1' ? '启用' : '禁用' },
  { title: '创建人', dataIndex: 'createBy', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '更新人', dataIndex: 'updateBy', width: 100 },
  { title: '更新时间', dataIndex: 'updateTime', width: 180 },
];

const unitGroupColumns = [
  { title: '单位名称', dataIndex: 'unitName', width: 100 },
  { title: '换算率', dataIndex: 'conversionRate', width: 100 },
  { title: '是否主单位', dataIndex: 'isMainUnit', width: 100, customRender: (text) => text === '1' ? '是' : '否' },
  { title: '操作', width: 100, customRender: (_, record, index) => (
    <a-button type="primary" size="small" @click={() => handleUnitEdit(record, index)}>编辑</a-button>
  )},
];

export default {
  name: 'inventory-archives',
  mixins: [mixinTable],
  data() {
    return {
      // 表格数据
      dataSource: [],
      columns,
      unitGroupColumns,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total) => `共 ${total} 条`,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
      },
      selectedRowKeys: [],

      // 表单数据
      form: {
        id: '',
        code: '',
        name: '',
        shortName: '',
        mnemonicCode: '',
        specification: '',
        brandId: '',
        brandName: '',
        materialTypeId: '',
        materialTypeName: '',
        categoryId: '',
        categoryName: '',
        status: '1',
        organizationId: '',
        organizationName: '',
        defaultWarehouseId: '',
        defaultWarehouseName: '',
        defaultLocationId: '',
        defaultLocationName: '',
        isBatchManagement: '0',
        batchManagementMethod: '1',
        batchPrefix: '',
        batchLength: 6,
        isValidityPeriod: '0',
        validityDays: 0,
        validityWarning: '0',
        warningDays: 0,
        inventoryCycle: '0',
        lastInventoryTime: '',
        nextInventoryTime: '',
        safetyStock: 0,
        minStock: 0,
        maxStock: 0,
        stockWarning: '0',
        warningThreshold: 0,
        purchaseLeadTime: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        volume: 0,
        unitVolumeWeight: 0,
        unitId: '',
        unitName: '',
        unitGroupId: '',
        unitGroup: [],
        commodityAttributes: [],
        dynamicAttributes: {},
        images: [],
      },

      // 搜索表单
      searchForm: this.$form.createForm(this),
      treeSearchValue: '',

      // 模态框
      visible: false,
      modalTitle: '新增物料档案',
      confirmLoading: false,

      // 仓库货位选择模态框
      selectModalVisible: false,
      selectForm: {
        warehouseId: '',
        locationId: '',
      },

      // 树形数据
      treeData: [],
      checkedKeys: [],
      categoryList: [],

      // 其他数据
      warehouseList: [],
      locationList: [],
      organizationList: [],
      brandList: [],
      materialTypeList: [],

      // 动态表单
      dynamicFormConfig: [],
      dynamicDataSource: {},

      // 图片上传
      fileList: [],
      previewVisible: false,
      previewImage: '',

      // 二维码
      qrCodeContent: '',

      // 打印
      printContent: '',
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    },
    permissionMap() {
      return this.$store.getters.permissionMap;
    },
  },
  watch: {
    'form.weight': function(newVal) {
      this.calculateVolumeAndWeight();
    },
    'form.length': function(newVal) {
      this.calculateVolumeAndWeight();
    },
    'form.width': function(newVal) {
      this.calculateVolumeAndWeight();
    },
    'form.height': function(newVal) {
      this.calculateVolumeAndWeight();
    },
    'form.inventoryCycle': function(newVal) {
      this.calculateNextInventoryTime();
    },
    'form.lastInventoryTime': function(newVal) {
      this.calculateNextInventoryTime();
    },
  },
  beforeCreate() {
    // 设置页面标题
    this.$store.dispatch('setPageTitle', '物料档案');
  },
  created() {
    // 获取分类树数据
    this.getTreeData();
    // 获取品牌列表
    this.getBrandList();
    // 获取物料类型列表
    this.getMaterialTypeList();
    // 获取仓库列表
    this.getWarehouseList();
    // 获取营销机构列表
    this.getOrganizationList();
    // 获取动态表单配置
    this.getDynamicFormConfig();
  },
  activated() {
    // 页面激活时重新加载数据
    this.getData();
  },
  updated() {
    // 页面更新时重新计算体积和重量
    this.calculateVolumeAndWeight();
  },
  methods: {
    // 计算体积和单位体积重量
    calculateVolumeAndWeight() {
      const { length, width, height, weight } = this.form;
      if (length && width && height) {
        this.form.volume = (length * width * height) / 1000000;
      } else {
        this.form.volume = 0;
      }
      if (this.form.volume && weight) {
        this.form.unitVolumeWeight = weight / this.form.volume;
      } else {
        this.form.unitVolumeWeight = 0;
      }
    },

    // 计算下次盘点时间
    calculateNextInventoryTime() {
      const { inventoryCycle, lastInventoryTime } = this.form;
      if (inventoryCycle === '0' || !lastInventoryTime) {
        this.form.nextInventoryTime = '';
        return;
      }
      const date = new Date(lastInventoryTime);
      date.setDate(date.getDate() + Number(inventoryCycle));
      this.form.nextInventoryTime = date;
    },

    // 分页大小变更
    onShowSizeChange(current, pageSize) {
      this.pagination.current = 1;
      this.pagination.pageSize = pageSize;
      this.getData();
    },

    // 换算率变更
    onConversionRateChange(index, value) {
      this.form.unitGroup[index].conversionRate = value;
    },

    // 格式化数据
    formatData(data) {
      return data.map(item => {
        // 处理动态属性
        if (item.dynamicAttributes) {
          try {
            item.dynamicAttributes = JSON.parse(item.dynamicAttributes);
          } catch (e) {
            item.dynamicAttributes = {};
          }
        }
        // 处理商品属性
        if (item.commodityAttributes) {
          try {
            item.commodityAttributes = JSON.parse(item.commodityAttributes);
          } catch (e) {
            item.commodityAttributes = [];
          }
        }
        // 处理单位组
        if (item.unitGroup) {
          try {
            item.unitGroup = JSON.parse(item.unitGroup);
          } catch (e) {
            item.unitGroup = [];
          }
          // 找到主单位
          const mainUnit = item.unitGroup.find(unit => unit.isMainUnit === '1');
          if (mainUnit) {
            item.unitId = mainUnit.unitId;
            item.unitName = mainUnit.unitName;
          }
        }
        // 处理图片
        if (item.images) {
          try {
            item.images = JSON.parse(item.images);
            // 格式化图片数据为上传组件需要的格式
            this.fileList = item.images.map(image => ({
              uid: image.id,
              name: image.name,
              status: 'done',
              url: image.url,
            }));
          } catch (e) {
            item.images = [];
            this.fileList = [];
          }
        }
        return item;
      });
    },

    // 物料属性互斥处理
    handleAttributeConflict() {
      // 根据实际业务逻辑实现属性互斥处理
    },

    // 获取动态表单配置
    getDynamicFormConfig() {
      getDynamicFormConfig({ formCode: 'inventory_archives' }).then(res => {
        if (res.code === 0) {
          this.dynamicFormConfig = res.data;
        }
      });
    },

    // 获取动态表单数据
    getDynamicFormData(id) {
      getDynamicFormData({ formCode: 'inventory_archives', businessId: id }).then(res => {
        if (res.code === 0) {
          this.dynamicDataSource = res.data;
        }
      });
    },

    // 获取分类树数据
    getTreeData() {
      getTreeData().then(res => {
        if (res.code === 0) {
          this.treeData = transTree(res.data);
          this.categoryList = transListToTree(res.data);
        }
      });
    },

    // 刷新分类树
    refreshTree() {
      this.getTreeData();
    },

    // 获取品牌列表
    getBrandList() {
      getBrandList().then(res => {
        if (res.code === 0) {
          this.brandList = res.data;
        }
      });
    },

    // 获取物料类型列表
    getMaterialTypeList() {
      getMaterialTypeList().then(res => {
        if (res.code === 0) {
          this.materialTypeList = res.data;
        }
      });
    },

    // 获取仓库列表
    getWarehouseList() {
      getWarehouseList().then(res => {
        if (res.code === 0) {
          this.warehouseList = res.data;
        }
      });
    },

    // 根据仓库获取货位列表
    getLocationListByWarehouseId(warehouseId) {
      getLocationListByWarehouseId(warehouseId).then(res => {
        if (res.code === 0) {
          this.locationList = res.data;
        }
      });
    },

    // 获取营销机构列表
    getOrganizationList() {
      getOrganizationList().then(res => {
        if (res.code === 0) {
          this.organizationList = res.data;
        }
      });
    },

    // 树形菜单搜索
    treeSearch() {
      const { treeSearchValue } = this;
      if (!treeSearchValue) {
        this.getTreeData();
        return;
      }
      // 根据搜索值过滤树形数据
      const filterTree = (tree, keyword) => {
        return tree.filter(node => {
          const match = node.title.includes(keyword);
          if (node.children) {
            node.children = filterTree(node.children, keyword);
          }
          return match || (node.children && node.children.length);
        });
      };
      this.treeData = filterTree([...this.treeData], treeSearchValue);
    },

    // 树形菜单选择
    treeSelect(keys) {
      this.checkedKeys = keys;
      this.getData();
    },

    // 分类变更
    categoryChange(value) {
      const category = this.categoryList.find(item => item.id === value);
      if (category) {
        this.form.categoryName = category.name;
      }
    },

    // 仓库变更
    warehouseChange(value) {
      this.selectForm.locationId = '';
      this.getLocationListByWarehouseId(value);
    },

    // 选中项变更
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },

    // 下拉选择处理
    jlselect(type, value, label) {
      switch (type) {
        case 'warehouse':
          this.form.defaultWarehouseId = value;
          this.form.defaultWarehouseName = label;
          this.form.defaultLocationId = '';
          this.form.defaultLocationName = '';
          this.getLocationListByWarehouseId(value);
          break;
        case 'location':
          this.form.defaultLocationId = value;
          this.form.defaultLocationName = label;
          break;
        case 'organization':
          this.form.organizationId = value;
          this.form.organizationName = label;
          break;
        default:
          break;
      }
    },

    // 弹出框值设置
    setValue(type, value) {
      switch (type) {
        case 'unit':
          this.form.unitId = value.id;
          this.form.unitName = value.name;
          break;
        default:
          break;
      }
    },

    // 模态框显示控制
    selectModalShow(type) {
      this.selectModalVisible = true;
    },

    // 模态框取消
    selectModalCancel() {
      this.selectModalVisible = false;
    },

    // 模态框确认
    selectModalOk() {
      const { warehouseId, locationId } = this.selectForm;
      if (!warehouseId || !locationId) {
        message.warning('请选择仓库和货位');
        return;
      }
      const warehouse = this.warehouseList.find(item => item.id === warehouseId);
      const location = this.locationList.find(item => item.id === locationId);
      if (warehouse && location) {
        this.form.defaultWarehouseId = warehouseId;
        this.form.defaultWarehouseName = warehouse.name;
        this.form.defaultLocationId = locationId;
        this.form.defaultLocationName = location.name;
      }
      this.selectModalVisible = false;
    },

    // 从数据源获取数据
    getFromDataSource(type) {
      // 根据实际业务逻辑实现
    },

    // 转换为标签映射
    changeToTabMap(data) {
      // 根据实际业务逻辑实现
    },

    // 多计量/单计量配置
    unitTypeChange(value) {
      if (value === '1') {
        // 单计量
        this.form.unitGroup = [];
      } else {
        // 多计量
        if (!this.form.unitGroup || this.form.unitGroup.length === 0) {
          this.form.unitGroup = [{
            unitId: '',
            unitName: '',
            conversionRate: 1,
            isMainUnit: '1',
          }];
        }
      }
    },

    // 表单数据分类处理
    classifyFormData() {
      const { form } = this;
      // 常用信息
      const commonInfo = {
        code: form.code,
        name: form.name,
        shortName: form.shortName,
        mnemonicCode: form.mnemonicCode,
        specification: form.specification,
        brandId: form.brandId,
        brandName: form.brandName,
        materialTypeId: form.materialTypeId,
        materialTypeName: form.materialTypeName,
        categoryId: form.categoryId,
        categoryName: form.categoryName,
        status: form.status,
      };
      // 基本信息
      const basicInfo = {
        organizationId: form.organizationId,
        organizationName: form.organizationName,
        defaultWarehouseId: form.defaultWarehouseId,
        defaultWarehouseName: form.defaultWarehouseName,
        defaultLocationId: form.defaultLocationId,
        defaultLocationName: form.defaultLocationName,
        isBatchManagement: form.isBatchManagement,
        batchManagementMethod: form.batchManagementMethod,
        batchPrefix: form.batchPrefix,
        batchLength: form.batchLength,
        isValidityPeriod: form.isValidityPeriod,
        validityDays: form.validityDays,
        validityWarning: form.validityWarning,
        warningDays: form.warningDays,
        inventoryCycle: form.inventoryCycle,
        lastInventoryTime: form.lastInventoryTime,
        nextInventoryTime: form.nextInventoryTime,
      };
      // 库存信息
      const inventoryInfo = {
        safetyStock: form.safetyStock,
        minStock: form.minStock,
        maxStock: form.maxStock,
        stockWarning: form.stockWarning,
        warningThreshold: form.warningThreshold,
        purchaseLeadTime: form.purchaseLeadTime,
      };
      // 重量/尺寸信息
      const weightSizeInfo = {
        weight: form.weight,
        length: form.length,
        width: form.width,
        height: form.height,
        volume: form.volume,
        unitVolumeWeight: form.unitVolumeWeight,
      };
      // 单位信息
      const unitInfo = {
        unitId: form.unitId,
        unitName: form.unitName,
        unitGroupId: form.unitGroupId,
        unitGroup: form.unitGroup,
      };
      // 商品属性
      const commodityInfo = {
        commodityAttributes: form.commodityAttributes,
      };
      // 动态属性
      const dynamicInfo = {
        dynamicAttributes: form.dynamicAttributes,
      };
      // 图片信息
      const imageInfo = {
        images: form.images,
      };
      return {
        commonInfo,
        basicInfo,
        inventoryInfo,
        weightSizeInfo,
        unitInfo,
        commodityInfo,
        dynamicInfo,
        imageInfo,
      };
    },

    // 编辑弹窗取消事件
    handleCancel() {
      this.visible = false;
      this.clearData();
    },

    // 图片预览处理
    handlePreview(file) {
      this.previewImage = file.url || file.thumbUrl;
      this.previewVisible = true;
    },

    // 图片预览取消
    handleCancelPreview() {
      this.previewVisible = false;
    },

    // 表单提交验证逻辑
    validateForm() {
      const { form } = this;
      // 必填字段校验
      if (!form.name) {
        message.warning('物料名称不能为空');
        return false;
      }
      if (!form.categoryId) {
        message.warning('物料分类不能为空');
        return false;
      }
      if (!form.unitId) {
        message.warning('单位不能为空');
        return false;
      }
      // 物料属性选择校验
      // 商品属性完善校验
      if (form.commodityAttributes && form.commodityAttributes.length) {
        for (let i = 0; i < form.commodityAttributes.length; i++) {
          const item = form.commodityAttributes[i];
          if (!item.key) {
            message.warning(`第${i + 1}个商品属性名称不能为空`);
            return false;
          }
          if (item.required === '1' && !item.value) {
            message.warning(`第${i + 1}个商品属性值不能为空`);
            return false;
          }
        }
      }
      // SQL注入校验
      if (validateSQLInjection(form.name) ||
          validateSQLInjection(form.shortName) ||
          validateSQLInjection(form.specification)) {
        message.warning('存在非法字符，请检查输入');
        return false;
      }
      return true;
    },

    // 数据格式化处理
    formatSubmitData() {
      const { form } = this;
      // 系统字段与自定义字段分离
      const submitData = {
        ...form,
      };
      // 下拉选择值处理
      // 商品属性JSON序列化
      if (form.commodityAttributes) {
        submitData.commodityAttributes = JSON.stringify(form.commodityAttributes);
      }
      // 动态属性JSON序列化
      if (form.dynamicAttributes) {
        submitData.dynamicAttributes = JSON.stringify(form.dynamicAttributes);
      }
      // 单位组JSON序列化
      if (form.unitGroup) {
        submitData.unitGroup = JSON.stringify(form.unitGroup);
      }
      // 图片处理
      if (this.fileList && this.fileList.length) {
        submitData.images = JSON.stringify(this.fileList.map(file => ({
          id: file.uid,
          name: file.name,
          url: file.url,
        })));
      } else {
        submitData.images = '[]';
      }
      return submitData;
    },

    // 多计量/单计量数据处理
    handleUnitGroupData() {
      // 根据实际业务逻辑实现
    },

    // 自定义提交数据构建
    buildCustomSubmitData() {
      // 根据实际业务逻辑实现
    },

    // 保存DTO对象组装
    assembleSaveDTO() {
      const submitData = this.formatSubmitData();
      // 构建DTO对象
      return submitData;
    },

    // SQL注入校验
    checkSQLInjection() {
      return this.validateForm();
    },

    // 表单提交
    handleOk() {
      if (!this.validateForm()) {
        return;
      }
      this.confirmLoading = true;
      const submitData = this.assembleSaveDTO();
      saveMaterial(submitData).then(res => {
        if (res.code === 0) {
          message.success('保存成功');
          this.visible = false;
          this.getData();
          this.clearData();
        } else {
          message.error(res.message);
        }
      }).finally(() => {
        this.confirmLoading = false;
      });
    },

    // 删除ID
    deleteId(id) {
      this.selectedRowKeys = [id];
      this.remove();
    },

    // 清除数据
    clearData() {
      this.form = {
        id: '',
        code: '',
        name: '',
        shortName: '',
        mnemonicCode: '',
        specification: '',
        brandId: '',
        brandName: '',
        materialTypeId: '',
        materialTypeName: '',
        categoryId: '',
        categoryName: '',
        status: '1',
        organizationId: '',
        organizationName: '',
        defaultWarehouseId: '',
        defaultWarehouseName: '',
        defaultLocationId: '',
        defaultLocationName: '',
        isBatchManagement: '0',
        batchManagementMethod: '1',
        batchPrefix: '',
        batchLength: 6,
        isValidityPeriod: '0',
        validityDays: 0,
        validityWarning: '0',
        warningDays: 0,
        inventoryCycle: '0',
        lastInventoryTime: '',
        nextInventoryTime: '',
        safetyStock: 0,
        minStock: 0,
        maxStock: 0,
        stockWarning: '0',
        warningThreshold: 0,
        purchaseLeadTime: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        volume: 0,
        unitVolumeWeight: 0,
        unitId: '',
        unitName: '',
        unitGroupId: '',
        unitGroup: [],
        commodityAttributes: [],
        dynamicAttributes: {},
        images: [],
      };
      this.fileList = [];
      this.checkedKeys = [];
      this.dynamicDataSource = {};
    },

    // 单位类型变更
    unitTypeChange(value) {
      // 根据实际业务逻辑实现
    },

    // 文件上传处理
    handleChange({ fileList }) {
      this.fileList = fileList;
      // 处理上传成功的文件
      const successFiles = fileList.filter(file => file.status === 'done');
      if (successFiles.length) {
        this.form.images = successFiles.map(file => ({
          id: file.uid,
          name: file.name,
          url: file.url,
        }));
      }
    },

    // 树形菜单数据处理
    getTreeData() {
      getTreeData().then(res => {
        if (res.code === 0) {
          this.treeData = transTree(res.data);
          this.categoryList = transListToTree(res.data);
        }
      });
    },

    // 分类列表获取
    calssList() {
      getClassList().then(res => {
        if (res.code === 0) {
          this.categoryList = res.data;
        }
      });
    },

    // 树形数据映射
    treeDataMapFunction(data) {
      return data.map(item => ({
        key: item.id,
        title: item.name,
        children: item.children ? this.treeDataMapFunction(item.children) : [],
      }));
    },

    // 表格数据加载
    getData() {
      const { pagination } = this;
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
        categoryId: this.checkedKeys.length ? this.checkedKeys[0] : '',
        ...this.searchForm.getFieldsValue(),
      };
      getMaterialList(params).then(res => {
        if (res.code === 0) {
          this.dataSource = this.formatData(res.data.records);
          this.pagination.total = res.data.total;
        }
      });
    },

    // 分页导航
    page(pagination) {
      this.pagination = pagination;
      this.getData();
    },

    // 新增功能
    add() {
      this.modalTitle = '新增物料档案';
      this.visible = true;
      this.clearData();
    },

    // 编辑功能
    edit() {
      if (!this.selectedRowKeys.length) {
        message.warning('请选择一条数据');
        return;
      }
      const id = this.selectedRowKeys[0];
      this.modalTitle = '修改物料档案';
      this.visible = true;
      this.getMaterialById(id);
    },

    // 根据ID获取物料
    getMaterialById(id) {
      getMaterialById(id).then(res => {
        if (res.code === 0) {
          this.form = res.data;
          // 处理动态属性
          if (this.form.dynamicAttributes) {
            try {
              this.form.dynamicAttributes = JSON.parse(this.form.dynamicAttributes);
            } catch (e) {
              this.form.dynamicAttributes = {};
            }
          }
          // 处理商品属性
          if (this.form.commodityAttributes) {
            try {
              this.form.commodityAttributes = JSON.parse(this.form.commodityAttributes);
            } catch (e) {
              this.form.commodityAttributes = [];
            }
          }
          // 处理单位组
          if (this.form.unitGroup) {
            try {
              this.form.unitGroup = JSON.parse(this.form.unitGroup);
            } catch (e) {
              this.form.unitGroup = [];
            }
          }
          // 处理图片
          if (this.form.images) {
            try {
              this.form.images = JSON.parse(this.form.images);
              // 格式化图片数据为上传组件需要的格式
              this.fileList = this.form.images.map(image => ({
                uid: image.id,
                name: image.name,
                status: 'done',
                url: image.url,
              }));
            } catch (e) {
              this.form.images = [];
              this.fileList = [];
            }
          }
          // 获取动态表单数据
          this.getDynamicFormData(id);
          // 生成二维码内容
          this.qrCodeContent = `material:${this.form.code}`;
        }
      });
    },

    // 删除功能
    remove() {
      if (!this.selectedRowKeys.length) {
        message.warning('请选择一条数据');
        return;
      }
      this.$confirm({
        title: '确认删除',
        content: '确定要删除选中的数据吗？',
        onOk: () => {
          deleteMaterial(this.selectedRowKeys).then(res => {
            if (res.code === 0) {
              message.success('删除成功');
              this.getData();
              this.selectedRowKeys = [];
            } else {
              message.error(res.message);
            }
          });
        },
      });
    },

    // 时间选择处理
    onChangeTimeA(date, dateString) {
      this.form.lastInventoryTime = date;
    },

    onChangeTimeB(date, dateString) {
      this.form.nextInventoryTime = date;
    },

    // 计量单位选择
    okUnit(data) {
      this.form.unitId = data.id;
      this.form.unitName = data.name;
    },

    // 标签页切换
    callback(key) {
      this.activeTabKey = key;
    },

    // 物料名称变更
    inventoryChange(e) {
      const name = e.target.value;
      this.form.name = name;
      // 生成助记码
      this.form.mnemonicCode = pinyin(name).replace(/\s+/g, '').toUpperCase();
    },

    // 导入导出
    importData() {
      // 实现导入功能
      importMaterial().then(res => {
        if (res.code === 0) {
          message.success('导入成功');
          this.getData();
        } else {
          message.error(res.message);
        }
      });
    },

    exportData() {
      // 实现导出功能
      exportMaterial(this.searchForm.getFieldsValue()).then(res => {
        if (res.code === 0) {
          const link = document.createElement('a');
          link.href = res.data;
          link.download = '物料档案.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          message.error(res.message);
        }
      });
    },

    // 表格搜索
    handleSearch() {
      this.pagination.current = 1;
      this.getData();
    },

    // 搜索重置
    handleReset() {
      this.searchForm.resetFields();
      this.pagination.current = 1;
      this.getData();
    },

    // 商品属性增删
    addCommodityData() {
      this.form.commodityAttributes.push({
        key: '',
        value: '',
        required: '0',
      });
    },

    deleteCommodityData(index) {
      this.form.commodityAttributes.splice(index, 1);
    },

    // 属性名称校验
    checkCommodityKey(index) {
      const item = this.form.commodityAttributes[index];
      if (!item.key) {
        message.warning(`第${index + 1}个商品属性名称不能为空`);
      }
    },

    // 二维码生成
    creatQrCode() {
      this.qrCodeContent = `material:${this.form.code}`;
    },

    // 图片下载
    downImg() {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.qrCodeContent;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = '二维码.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    },

    downLoad() {
      this.downImg();
    },

    // 打印功能
    qrCodePrint() {
      this.printContent = document.getElementById('print-content');
      this.$print(this.printContent);
    },

    nihao() {
      // 预留方法
    },
  },
};
</script>

<style scoped>
  .inventory-archives-container {
    padding: 16px;
  }

  .inventory-archives-header {
    margin-bottom: 16px;
  }

  .inventory-archives-content {
    display: flex;
  }

  .inventory-archives-tree {
    width: 260px;
    margin-right: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 10px;
    position: relative;
  }

  .tree-search-input {
    margin-bottom: 10px;
    width: 100%;
  }

  .inventory-archives-tree-content {
    height: calc(100vh - 240px);
    overflow-y: auto;
  }

  .inventory-archives-table {
    flex: 1;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 10px;
  }

  .input-group {
    display: flex;
    width: 100%;
  }

  .resize-table-container {
    height: calc(100vh - 420px);
    overflow-y: auto;
  }

  .upload-list-inline .ant-upload-list-item {
    float: left;
    width: 200px;
    margin-right: 8px;
  }

  .upload-list-inline [class*='-upload-list-rtl'] .ant-upload-list-item {
    float: right;
    margin-right: 0;
    margin-left: 8px;
  }
</style>

<style lang="less">
    @import '~@/style/setting/inventory.less';
    .input-warn {
        border: 1px solid red !important;
    }
    .unitGroupTable {
        width: 100%;
        min-height: 200px;
    }
    .archives-flag {
        .ant-modal-body {
            padding: 0;
        }
        .ant-modal-footer {
            border-top: none;
        }
    }

    .archives-flag .ant-tabs-bar {
        border-bottom: 1px solid rgba(173, 173, 173, 0.5) !important;
    }
    .archives-flag .card-wrapper {
        .content {
            min-height: 260px;
        }
    }
    .ant-advanced-search-form {
        .ant-form-item {
            margin-bottom: 0px;
        }
    }
    .resize-table-container {
        overflow-y: auto;
        .ant-table-tbody {
            cursor: pointer;
        }
    }
    .input-group-before {
        cursor: not-allowed;
        background: #eee;
        text-align: right;
        padding-right: 0px;
        flex: 0 0 40px;
        border: 1px solid #a0a0a0;
        line-height: 29px;
        padding-top: 1px;
    }
    .ant-input-number,
    .ant-input-number-input {
        height: 32px !important;
        padding-left: 0;
    }
    .ant-input-number-handler-wrap {
        display: none;
    }
    .input-group-after {
        border-left: none;
        padding-left: 0px;
        flex: auto;
    }
    .input-group-after:focus {
        box-shadow: none;
    }
    .archive-tree-refresh {
        text-align: center;
        width: 32px;
        height: 32px;
        line-height: 29px;
        position: absolute;
        z-index: 10;
        right: 10px;
        cursor: pointer;
    }
    .archive-tree-refresh:hover {
        transition: all 1s;
        transform: rotate(180deg);
    }
    .page-input {
        height: 24px !important;
        .ant-input-number-input {
            height: 24px !important;
            line-height: 24px;
        }
    }
    .good-attr-wrapper {
        height: 300px;
        overflow-y: auto;
    }
    .add-good-attr {
        margin: 5px;
        margin-left: 75px;
        height: 32px;
        width: 320px;
        text-align: cnter;
        background: #1890ff;
        line-height: 32px;
        font-size: 24px;
        color: #fff;
        cursor: pointer;
    }
    .delete-good-attr {
        color: #fff;
        font-size: 24;
        background: #ff4d4f;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin-top: 5px;
        text-align: center;
        cursor: pointer;
    }
    .archives-barcode-box {
        width: 280px;
        margin: 0px auto;
        border: 2px solid #000;
        font-family: '幼圆';
        font-size: 13px;
        .company-name {
            font-weight: bold;
            text-align: center;
            height: 32px;
            color: #000;
            letter-spacing: 1px;
            line-height: 32px;
            width: 100%;
            border-bottom: 1px solid #000;
        }
        .bar-name {
            border-right: 1px solid #000;
            flex: 0 0 75px;
        }
        .bar-text {
            margin-left: 5px;
        }
        .bar-text-min {
            width: 76px;
            overflow: hidden;
        }
        .barcode-item {
            display: flex;
            font-weight: bold;
            padding: 0 5px;
            border-bottom: 1px solid #000;
            height: 32px;
            color: #000;
            letter-spacing: 1px;
            line-height: 32px;
        }
        .barcode-bottom {
            .barcode-left-wrapper {
                width: 60%;
                float: left;
            }
            .barcode-left {
                display: flex;
                font-weight: bold;
                padding: 0 5px;
                border-bottom: 1px solid #000;
                height: 32px;
                color: #000;
                letter-spacing: 1px;
                line-height: 32px;
                .bar-name {
                    border-right: 1px solid #000;
                    flex: 0 0 75px;
                }
            }
            .borcode-box {
                text-align: center;
                width: 40%;
                border-left: 1px solid #000;
                height: auto;
                float: right;
            }
        }
    }
    .barcode-btn {
        margin: 20px auto;
        text-align: center;
    }
</style>

<style lang="less" scoped>
    .ant-input-suffix {
        display: none;
    }
</style>