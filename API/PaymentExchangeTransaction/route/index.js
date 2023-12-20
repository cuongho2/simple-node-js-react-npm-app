const PaymentExchangeTransaction = require('./PaymentExchangeTransactionRoute');
const UserPaymentExchangeTransaction = require('./UserPaymentExchangeTransactionRoute');

module.exports = [
  //APIs for Admin / staff
  // { method: 'POST', path: '/PaymentExchangeTransaction/insert', config: PaymentExchangeTransaction.insert },
  // { method: 'POST', path: '/PaymentExchangeTransaction/updateById', config: PaymentExchangeTransaction.updateById },
  { method: 'POST', path: '/PaymentExchangeTransaction/find', config: PaymentExchangeTransaction.find },
  { method: 'POST', path: '/PaymentExchangeTransaction/findById', config: PaymentExchangeTransaction.findById },
  { method: 'POST', path: '/PaymentExchangeTransaction/receiveHistory', config: PaymentExchangeTransaction.receiveHistory },
  { method: 'POST', path: '/PaymentExchangeTransaction/exchangeHistory', config: PaymentExchangeTransaction.exchangeHistory },
  { method: 'POST', path: '/PaymentExchangeTransaction/approveExchangeTransaction', config: PaymentExchangeTransaction.approveExchangeTransaction },
  { method: 'POST', path: '/PaymentExchangeTransaction/denyExchangeTransaction', config: PaymentExchangeTransaction.denyExchangeTransaction },
  { method: 'POST', path: '/PaymentExchangeTransaction/viewExchangeRequests', config: PaymentExchangeTransaction.viewExchangeRequests },
  // { method: 'POST', path: '/PaymentExchangeTransaction/deleteById', config: PaymentExchangeTransaction.deleteById },

  //APIs for user
  { method: 'POST', path: '/PaymentExchangeTransaction/user/requestExchange', config: UserPaymentExchangeTransaction.userRequestExchange },
  { method: 'POST', path: '/PaymentExchangeTransaction/user/exchangeHistory', config: UserPaymentExchangeTransaction.userExchangeHistory },
  { method: 'POST', path: '/PaymentExchangeTransaction/user/receiveHistory', config: UserPaymentExchangeTransaction.userReceiveHistory },
  { method: 'POST', path: '/PaymentExchangeTransaction/user/acceptExchangeRequest', config: UserPaymentExchangeTransaction.userAcceptExchangeRequest },
  { method: 'POST', path: '/PaymentExchangeTransaction/user/denyExchangeRequest', config: UserPaymentExchangeTransaction.userDenyExchangeRequest },
  { method: 'POST', path: '/PaymentExchangeTransaction/user/cancelExchangeRequest', config: UserPaymentExchangeTransaction.userCancelExchangeRequest },
  { method: 'POST', path: '/PaymentExchangeTransaction/user/viewExchangeRequests', config: UserPaymentExchangeTransaction.userViewExchangeRequests },
];
