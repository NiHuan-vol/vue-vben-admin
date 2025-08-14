<template>
  <div class="content-wrapper a-base-container">
    <div class="big-main-wrapper">
      <!-- 按钮组 -->
      <div class="btn-wrapper clearfix">
        <a-row class="text-center clearfix">
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="12">
            <a-col :span="2">
              <div class="btns" @click="addTask()">
                <a-icon class="btns-icon" type="file-add" />
                <div class="btns-text">新增任务</div>
              </div>
            </a-col>
            <a-col :span="2">
              <div class="btns" @click="reloadData()">
                <a-icon class="btns-icon" type="file-sync" />
                <div class="btns-text">刷新</div>
              </div>
            </a-col>
            <!-- 临时拨号 -->
            <a-col :span="2" style="z-index: 2">
              <div class="dial-other">
                <div class="btns" @click="OpenCallingBox()">
                  <a-icon class="btns-icon phone-box" type="phone" />
                </div>
              </div>
            </a-col>
          </a-col>
        </a-row>
      </div>
      <div class="scroll-content">
        <div class="form-search-wrapper">
          <a-form layout="inline" :form="form" @submit="handleSearch">
            <a-row :gutter="16">
              <a-col :md="4">
                <a-form-item label="任务名称">
                  <a-input v-model="queryParam.taskName" placeholder="请输入任务名称" />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="任务类型">
                  <a-select v-model="queryParam.taskType" placeholder="请选择任务类型">
                    <a-select-option v-for="(item, index) in taskTypeArr" :key="index" :value="index + 1">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="快呼方式">
                  <a-select v-model="queryParam.callType" placeholder="请选择快呼方式">
                    <a-select-option v-for="(item, index) in callTypeArr" :key="index" :value="index + 1">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="业务状态">
                  <a-select v-model="queryParam.businessStatus" placeholder="请选择业务状态">
                    <a-select-option value="null">全部</a-select-option>
                    <a-select-option value="0">正常</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-form-item label="创建时间">
                  <a-range-picker
                    v-model="queryParam.createDateRange"
                    :format="dateFormat"
                    :placeholder="['开始日期', '结束日期']"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="4">
                <a-button type="primary" html-type=