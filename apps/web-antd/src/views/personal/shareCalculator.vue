<template>
  <ContentWrap class="inner-wrapper">
    <Content>
      <div class="flex flex-col md:flex-row gap-6 p-4">
        <div class="w-full md:w-2/3 lg:w-1/2">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <ProForm
              layout="vertical"
              :model="formData"
              class="form-inline"
            >
              <ProFormSelect
                name="selectedGoodsKey"
                label="产品"
                :options="goodsSelects"
                v-model:value="selectedGoodsKey"
                placeholder="请选择产品"
                @change="handleGoodsChange"
              />
              <ProFormText
                name="users"
                label="用户数"
                :value="selectedGoods?.users || ''"
                disabled
              />
              <ProFormInputNumber
                name="years"
                label="年限"
                v-model:value="selectedGoods.years"
                :min="1"
                placeholder="请输入年限"
              />
              <ProFormText
                name="goodsMoney"
                label="产品金额"
                :value="goodsMoney"
                prefix="￥"
                disabled
              />
              <ProFormText
                name="goodsDiscount"
                label="产品折扣"
                :value="goodsDiscount"
                suffix="%"
                disabled
              />
            </ProForm>

            <div class="mt-6 space-y-3">
              <div v-if="commissionConfig.firstReward" class="flex items-center">
                <span class="h-title">本人签单数量：</span>
                <a-input-number
                  v-model:value="firstNum"
                  :min="0"
                  :max="10000"
                  :step="5"
                  style="width: 80px; margin-right: 12px;"
                />
                <span class="ml-2">预计收益：</span>
                <a-input
                  prefix="￥"
                  suffix="RMB"
                  :value="formatNumber(firstNumMoney)"
                  disabled
                  style="width: 180px;"
                />
              </div>

              <div v-if="commissionConfig.firstReward && commissionConfig.secondReward" class="flex items-center">
                <span class="h-title">直属下级签单数：</span>
                <a-input-number
                  v-model:value="secondNum"
                  :min="0"
                  :max="10000"
                  :step="5"
                  style="width: 80px; margin-right: 12px;"
                />
                <span class="ml-2">预计收益：</span>
                <a-input
                  prefix="￥"
                  suffix="RMB"
                  :value="formatNumber(secondNumMoney)"
                  disabled
                  style="width: 180px;"
                />
              </div>

              <div v-if="commissionConfig.firstReward && commissionConfig.secondReward && commissionConfig.thirdReward" class="flex items-center">
                <span class="h-title">间接下级签单数：</span>
                <a-input-number
                  v-model:value="thirdNum"
                  :min="0"
                  :max="10000"
                  :step="5"
                  style="width: 80px; margin-right: 12px;"
                />
                <span class="ml-2">预计收益：</span>
                <a-input
                  prefix="￥"
                  suffix="RMB"
                  :value="formatNumber(thirdNumMoney)"
                  disabled
                  style="width: 180px;"
                />
              </div>

              <div v-if="commissionConfig.firstReward && commissionConfig.secondReward && commissionConfig.thirdReward && commissionConfig.fourthReward" class="flex items-center">
                <span class="h-title">三级下级签单数：</span>
                <a-input-number
                  v-model:value="fourNum"
                  :min="0"
                  :max="10000"
                  :step="5"
                  style="width: 80px; margin-right: 12px;"
                />
                <span class="ml-2">预计收益：</span>
                <a-input
                  prefix="￥"
                  suffix="RMB"
                  :value="formatNumber(fourNumMoney)"
                  disabled
                  style="width: 180px;"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="w-full md:w-1/3 lg:w-1/2 flex items-center justify-center p-6">
          <div class="text-center w-full max-w-xs">
            <h4 class="text-lg font-medium mb-4">预期收益</h4>
            <a-statistic
              title="人民币（元）"
              :value=