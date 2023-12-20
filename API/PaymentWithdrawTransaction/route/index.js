const PaymentWithdrawTransaction = require('./PaymentWithdrawTransactionRoute');

module.exports = [
  //TODO LATER
  { method: 'POST', path: '/PaymentWithdrawTransaction/insert', config: PaymentWithdrawTransaction.insert },
  // { method: 'POST', path: '/PaymentWithdrawTransaction/updateById', config: PaymentWithdrawTransaction.updateById },
  { method: 'POST', path: '/PaymentWithdrawTransaction/find', config: PaymentWithdrawTransaction.find },
  { method: 'POST', path: '/PaymentWithdrawTransaction/findById', config: PaymentWithdrawTransaction.findById },
  // { method: 'POST', path: '/PaymentWithdrawTransaction/deleteById', config: PaymentWithdrawTransaction.deleteById },
  { method: 'POST', path: '/PaymentWithdrawTransaction/user/requestWithdraw', config: PaymentWithdrawTransaction.requestWithdraw },
  { method: 'POST', path: '/PaymentWithdrawTransaction/user/withdrawHistory', config: PaymentWithdrawTransaction.getList },
  { method: 'POST', path: '/PaymentWithdrawTransaction/approveWithdrawTransaction', config: PaymentWithdrawTransaction.approveWithdrawTransaction },
  { method: 'POST', path: '/PaymentWithdrawTransaction/denyWithdrawTransaction', config: PaymentWithdrawTransaction.denyWithdrawTransaction },
];
