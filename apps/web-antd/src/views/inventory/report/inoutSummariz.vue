<template>
  <div class="inventory-report-container">
    <Card title="出入库汇总报表" :bordered="false" :loading="loading">
      <div class="date-tp mb-4">
        <div class="header-tp font-bold text-lg mb-2">
          {{ reportDateText }}
        </div>
        <div class="date-radio-box bg-gray-50 p-3 rounded-md flex flex-col space-y-3">
          <div class="flex items-center space-x-4">
            <RadioButton value="1" v-model:checked="radioValue">
              按日期
            </RadioButton>
            <RangePicker
              v-model:value=