/*
 * @Descripttion: 说明
 * @version: V1.0
 * @Author: GaoWei
 * @Date: 2021-07-06 16:36:07
 * @LastEditors: GaoWei
 * @LastEditTime: 2021-07-16 10:51:01
 */
//入库核算
const checkOutColumnsJson = [
    {
        code: 'voucherCode',
        title: '单据编号',
        scopedSlots: { customRender: 'voucherCode' },
        isCancel: false,
        width: 150,
    },
    {
        code: 'invoiceCode',
        title: '发票号',
        scopedSlots: { customRender: 'invoiceCode' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'voucherDate',
        title: '单据日期',
        scopedSlots: { customRender: 'voucherDate' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryCode',
        title: '物料编号',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryName',
        title: '物料名称',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventorySpecification',
        title: '物料规格型号',
        isCancel: false,
        width: 150,
    },
    {
        code: 'baseQuantity',
        title: '数量',
        isCancel: false,
        width: 100,
    },
    {
        code: 'price',
        title: '单价',
        isCancel: false,
        width: 100,
    },
    {
        code: 'amount',
        title: '金额',
        isCancel: false,
        width: 100,
    },
    {
        code: 'isAccounting',
        title: '是否核算',
        scopedSlots: { customRender: 'isAccounting' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'isAudit',
        title: '是否钩稽',
        scopedSlots: { customRender: 'isAudit' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'estimatedAmount',
        title: '暂估金额',
        scopedSlots: { customRender: 'estimatedAmount' },
        isCancel: true,
        width: 100,
    },
    {
        code: 'estimatedPrice',
        title: '暂估单价',
        scopedSlots: { customRender: 'estimatedPrice' },
        isCancel: true,
        width: 100,
    },
    {
        code: 'baseUnitName',
        title: '主计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subQuantity',
        title: '辅计量数量',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subUnitName',
        title: '辅计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'tax',
        title: '税额',
        isCancel: true,
        width: 100,
    },
    {
        code: 'taxRate',
        title: '税率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'unitExchangeRate',
        title: '换算率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'warehouseName',
        title: '仓库名称',
        isCancel: true,
        width: 100,
    }
]

//存货暂估入库
const evaluateColumnsJson = [
    {
        code: 'voucherCode',
        title: '单据编号',
        scopedSlots: { customRender: 'voucherCode' },
        isCancel: false,
        width: 150,
    },
    {
        code: 'invoiceCode',
        title: '发票号',
        scopedSlots: { customRender: 'invoiceCode' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'voucherDate',
        title: '单据日期',
        scopedSlots: { customRender: 'voucherDate' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryCode',
        title: '物料编号',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryName',
        title: '物料名称',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventorySpecification',
        title: '物料规格型号',
        isCancel: false,
        width: 150,
    },
    {
        code: 'baseQuantity',
        title: '数量',
        isCancel: false,
        width: 100,
        scopedSlots: { customRender: 'baseQuantity' },
    },
    {
        code: 'price',
        title: '单价',
        isCancel: false,
        width: 100,
        scopedSlots: { customRender: 'price' },
    },
    {
        code: 'amount',
        title: '金额',
        isCancel: false,
        width: 100,
        scopedSlots: { customRender: 'amount' },
    },
    {
        code: 'isAccounting',
        title: '是否核算',
        scopedSlots: { customRender: 'isAccounting' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'isAudit',
        title: '是否钩稽',
        scopedSlots: { customRender: 'isAudit' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'estimatedAmount',
        title: '暂估金额',
        scopedSlots: { customRender: 'estimatedAmount' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'estimatedPrice',
        title: '暂估单价',
        scopedSlots: { customRender: 'estimatedPrice' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'baseUnitName',
        title: '主计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subQuantity',
        title: '辅计量数量',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subUnitName',
        title: '辅计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'tax',
        title: '税额',
        isCancel: true,
        width: 100,
    },
    {
        code: 'taxRate',
        title: '税率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'unitExchangeRate',
        title: '换算率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'warehouseName',
        title: '仓库名称',
        isCancel: true,
        width: 100,
    }
]

//自制入库核算
const selfRestraintColumnsJson = [
    {
        code: 'voucherCode',
        title: '单据编号',
        scopedSlots: { customRender: 'voucherCode' },
        isCancel: false,
        width: 150,
    },
    {
        code: 'invoiceCode',
        title: '发票号',
        scopedSlots: { customRender: 'invoiceCode' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'voucherDate',
        title: '单据日期',
        scopedSlots: { customRender: 'voucherDate' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryCode',
        title: '物料编号',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryName',
        title: '物料名称',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventorySpecification',
        title: '物料规格型号',
        isCancel: false,
        width: 150,
    },
    {
        code: 'baseQuantity',
        title: '数量',
        isCancel: false,
        width: 100,
    },
    {
        code: 'price',
        title: '单价',
        isCancel: false,
        scopedSlots: { customRender: 'price' },
        width: 100,
    },
    {
        code: 'amount',
        title: '金额',
        isCancel: false,
        scopedSlots: { customRender: 'amount' },
        align: 'right',
        width: 100,
    },
    {
        code: 'isAccounting',
        title: '是否核算',
        scopedSlots: { customRender: 'isAccounting' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'isAudit',
        title: '是否钩稽',
        scopedSlots: { customRender: 'isAudit' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'baseUnitName',
        title: '主计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subQuantity',
        title: '辅计量数量',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subUnitName',
        title: '辅计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'tax',
        title: '税额',
        isCancel: true,
        width: 100,
    },
    {
        code: 'taxRate',
        title: '税率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'unitExchangeRate',
        title: '换算率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'warehouseName',
        title: '仓库名称',
        isCancel: true,
        width: 100,
    }
]

//委外入库核算
const delegateColumnsJson = [
    {
        code: 'voucherCode',
        title: '单据编号',
        scopedSlots: { customRender: 'voucherCode' },
        isCancel: false,
        width: 150,
    },
    {
        code: 'invoiceCode',
        title: '发票号',
        scopedSlots: { customRender: 'invoiceCode' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'voucherDate',
        title: '单据日期',
        scopedSlots: { customRender: 'voucherDate' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryCode',
        title: '物料编号',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryName',
        title: '物料名称',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventorySpecification',
        title: '物料规格型号',
        isCancel: false,
        width: 150,
    },
    {
        code: 'baseQuantity',
        title: '数量',
        isCancel: false,
        width: 100,
    },
    {
        code: 'price',
        title: '单价',
        isCancel: false,
        scopedSlots: { customRender: 'price' },
        width: 100,
    },
    {
        code: 'amount',
        title: '金额',
        isCancel: false,
        scopedSlots: { customRender: 'amount' },
        align: 'right',
        width: 100,
    },
    {
        code: 'isAccounting',
        title: '是否核算',
        scopedSlots: { customRender: 'isAccounting' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'isAudit',
        title: '是否钩稽',
        scopedSlots: { customRender: 'isAudit' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'baseUnitName',
        title: '主计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subQuantity',
        title: '辅计量数量',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subUnitName',
        title: '辅计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'tax',
        title: '税额',
        isCancel: true,
        width: 100,
    },
    {
        code: 'taxRate',
        title: '税率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'unitExchangeRate',
        title: '换算率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'warehouseName',
        title: '仓库名称',
        isCancel: true,
        width: 100,
    }
]

//其他入库核算
const otherColumnsJson = [
    {
        code: 'voucherCode',
        title: '单据编号',
        scopedSlots: { customRender: 'voucherCode' },
        isCancel: false,
        width: 150,
    },
    {
        code: 'invoiceCode',
        title: '发票号',
        scopedSlots: { customRender: 'invoiceCode' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'voucherDate',
        title: '单据日期',
        scopedSlots: { customRender: 'voucherDate' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryCode',
        title: '物料编号',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventoryName',
        title: '物料名称',
        isCancel: false,
        width: 100,
    },
    {
        code: 'inventorySpecification',
        title: '物料规格型号',
        isCancel: false,
        width: 150,
    },
    {
        code: 'baseQuantity',
        title: '数量',
        isCancel: false,
        width: 100,
    },
    {
        code: 'price',
        title: '单价',
        isCancel: false,
        scopedSlots: { customRender: 'price' },
        width: 100,
    },
    {
        code: 'amount',
        title: '金额',
        isCancel: false,
        scopedSlots: { customRender: 'amount' },
        align: 'right',
        width: 100,
    },
    {
        code: 'isAccounting',
        title: '是否核算',
        scopedSlots: { customRender: 'isAccounting' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'isAudit',
        title: '是否钩稽',
        scopedSlots: { customRender: 'isAudit' },
        isCancel: false,
        width: 100,
    },
    {
        code: 'baseUnitName',
        title: '主计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subQuantity',
        title: '辅计量数量',
        isCancel: true,
        width: 100,
    },
    {
        code: 'subUnitName',
        title: '辅计量名称',
        isCancel: true,
        width: 100,
    },
    {
        code: 'tax',
        title: '税额',
        isCancel: true,
        width: 100,
    },
    {
        code: 'taxRate',
        title: '税率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'unitExchangeRate',
        title: '换算率',
        isCancel: true,
        width: 100,
    },
    {
        code: 'warehouseName',
        title: '仓库名称',
        isCancel: true,
        width: 100,
    }
]


//材料出库核算
const outInventoryColumnsJson = delegateColumnsJson;
const outSelfColumnsJson = delegateColumnsJson;
export {
    checkOutColumnsJson,//入库核算
    evaluateColumnsJson,//存货暂估入库
    selfRestraintColumnsJson,//自制入库核算
    delegateColumnsJson,//委外入库核算
    otherColumnsJson,//其他入库核算

    outInventoryColumnsJson,//材料出库核算
    outSelfColumnsJson,//自制出库核算
}