/**
 * Created by A on 7/18/17.
 */
'use strict';
const moment = require('moment');

const DepositTransactionAccess = require("./resourceAccess/PaymentDepositTransactionResourceAccess");
const UserWallet = require('../Wallet/resourceAccess/WalletResourceAccess');
const Logger = require('../../utils/logging');

const DEPOSIT_TRX_STATUS = require('./PaymentDepositTransactionConstant').DEPOSIT_TRX_STATUS;
const WALLET_TYPE = require('../Wallet/WalletConstant').WALLET_TYPE;

async function createDepositTransaction(user, paymentMethodId, amount, rewardAmount) {
  let wallet = await UserWallet.find({
    appUserId: user.appUserId,
    walletType: WALLET_TYPE.POINT
  });

  if (!wallet || wallet.length < 1) {
    Logger.error("user wallet is invalid");
    return undefined;
  }
  wallet = wallet[0];

  let transactionData = {
    appUserId: user.appUserId,
    walletId: wallet.walletId,
    paymentAmount: amount,
    paymentMethodId: paymentMethodId
  };

  if (paymentMethodId) {
    transactionData.paymentMethodId = paymentMethodId
  }

  if (rewardAmount && rewardAmount > 0) {
    transactionData.paymentRewardAmount = rewardAmount
  }

  let result = await DepositTransactionAccess.insert(transactionData);
  if (result) {
    return result;
  } else {
    Logger.error("insert deposit transaction error");
    return undefined;
  }
}

async function approveDepositTransaction(transactionId, staff) {
  //get info of transaction
  let transaction = await DepositTransactionAccess.find({
    paymentDepositTransactionId: transactionId
  });

  if (!transaction || transaction.length < 1) {
    Logger.error("transaction is invalid");
    return undefined;
  }
  transaction = transaction[0];

  if (!(transaction.status === DEPOSIT_TRX_STATUS.NEW || transaction.status === DEPOSIT_TRX_STATUS.WAITING || transaction.status !== DEPOSIT_TRX_STATUS.PENDING)) {
    Logger.error("deposit transaction was approved or canceled");
    return undefined;
  }

  //get wallet info of user
  let pointWallet = await UserWallet.find({
    appUserId: transaction.appUserId,
    walletType: WALLET_TYPE.POINT
  });

  if (!pointWallet || pointWallet.length < 1) {
    Logger.error("pointWallet is invalid");
    return undefined;
  }
  pointWallet = pointWallet[0];

  //Change payment status and store info of PIC
  transaction.paymentStatus = DEPOSIT_TRX_STATUS.COMPLETED;
  if (staff) {
    transaction.paymentPICId = staff.staffId;
  }

  let approveDate = new Date();
  transaction.paymentApproveDate = approveDate.toString();

  delete transaction.paymentDepositTransactionId;

  //Update payment in DB
  let updateTransactionResult = await DepositTransactionAccess.updateById(transactionId, transaction);
  if (updateTransactionResult) {
    //Update wallet balance in DB
    let updateWalletResult = UserWallet.incrementBalance(pointWallet.walletId, transaction.paymentAmount);
    if (updateWalletResult) {
      return {
        paymentRewardAmount: transaction.paymentRewardAmount,
        balance: pointWallet.balance
      };
    } else {
      Logger.error(`updateWalletResult error pointWallet.walletId ${pointWallet.walletId} - ${JSON.stringify(transaction)}`);
      return undefined;
    }
  } else {
    Logger.error("approveDepositTransaction error");
    return undefined;
  }
}

async function denyDepositTransaction(transactionId, staff) {
  //get info of transaction
  let transaction = await DepositTransactionAccess.find({
    paymentDepositTransactionId: transactionId
  });

  if (!transaction || transaction.length < 1) {
    Logger.error("transaction is invalid");
    return undefined;
  }
  transaction = transaction[0];

  //Nếu không phải giao dịch "ĐANG CHỜ" (PENDING / WAITING) hoặc "MỚI TẠO" (NEW) thì không xử lý
  if (!(transaction.status === DEPOSIT_TRX_STATUS.NEW || transaction.status === DEPOSIT_TRX_STATUS.WAITING || transaction.status !== DEPOSIT_TRX_STATUS.PENDING)) {
    Logger.error("deposit transaction was approved or canceled");
    return undefined;
  }

  //Change payment status and store info of PIC
  let updatedData = {
    paymentStatus: DEPOSIT_TRX_STATUS.CANCELED,
    paymentApproveDate: new Date(),
    paymentNote: `Hệ thống tự động từ chối nạp tiền`,
  }

  //if transaction was performed by Staff, then store staff Id for later check
  if (staff) {
    updatedData.paymentPICId = staff.staffId;
    updatedData.paymentNote = `${staff.firstName} ${staff.lastName} (id: ${staff.staffId}) từ chối nạp tiền`;
  }
  let updateResult = await DepositTransactionAccess.updateById(transactionId, updatedData);
  return updateResult;
}

//Thêm tiền cho user vì 1 số lý do. Ví dụ hoàn tất xác thực thông tin cá nhân
//Nên tạo ra 1 transaction đồng thời lưu lại luôn vào lịch sử để dễ kiểm soát
async function addRewardPointForUser(appUserId, rewardAmount, staff, paymentNote) {
  let pointWallet = await UserWallet.find({
    appUserId: appUserId,
    walletType: WALLET_TYPE.POINT
  });

  if (pointWallet === undefined || pointWallet.length < 0) {
    Logger.error(`Can not find reward wallet to add point for user id ${appUserId}`)
    return undefined;
  }
  pointWallet = pointWallet[0];

  //Tạo 1 transaction mới và tự động complete
  let newRewardTransaction = {
    paymentStatus: DEPOSIT_TRX_STATUS.COMPLETED,
    paymentApproveDate: new Date(),
    paymentNote: `Hệ thống tự động thưởng - lý do: ${paymentNote}`,
    appUserId: appUserId,
    walletId: pointWallet.walletId,
    paymentAmount: 0,
    paymentRewardAmount: rewardAmount,
  }

  //if transaction was performed by Staff, then store staff Id for later check
  if (staff) {
    newRewardTransaction.paymentPICId = staff.staffId;
    newRewardTransaction.paymentNote = `${staff.firstName} ${staff.lastName} (id: ${staff.staffId}) nạp điểm cho người dùng`;
  }

  if (paymentNote) {
    newRewardTransaction.paymentNote = paymentNote;
  }
  let insertResult = await DepositTransactionAccess.insert(newRewardTransaction);

  if (insertResult) {
    // tự động thêm tiền vào ví thưởng của user
    await UserWallet.incrementBalance(pointWallet.walletId, rewardAmount);
    return insertResult;
  } else {
    Logger.error(`can not create reward point transaction`);
    return undefined;
  }
}

// CAI NAY THAY DANG KHONG DUNG DEN
async function processSuccessTransaction(transactionId, staff) {
  //get info of transaction
  let transaction = await DepositTransactionAccess.find({
    paymentDepositTransactionId: transactionId
  });

  if (!transaction || transaction.length < 1) {
    Logger.error("transaction is invalid");
    return undefined;
  }
  transaction = transaction[0];

  if (!(transaction.status === DEPOSIT_TRX_STATUS.NEW || transaction.status === DEPOSIT_TRX_STATUS.WAITING || transaction.status !== DEPOSIT_TRX_STATUS.PENDING)) {
    Logger.error("deposit transaction was approved or canceled");
    return undefined;
  }

  //get wallet info of user
  let pointWallet = await UserWallet.find({
    appUserId: transaction.appUserId,
    walletType: WALLET_TYPE.POINT
  });

  if (!pointWallet || pointWallet.length < 1) {
    Logger.error("pointWallet is invalid");
    return undefined;
  }
  pointWallet = pointWallet[0];

  //Change payment status and store info of PIC
  transaction.paymentStatus = DEPOSIT_TRX_STATUS.COMPLETED;
  if (staff) {
    transaction.paymentPICId = staff.staffId;
  }

  let approveDate = new Date();
  transaction.paymentApproveDate = approveDate.toString();

  delete transaction.paymentDepositTransactionId;

  //Update payment in DB
  let updateTransactionResult = await DepositTransactionAccess.updateById(transactionId, transaction);
  if (updateTransactionResult) {
    //Update wallet balance in DB
    let updateWalletResult = UserWallet.incrementBalance(pointWallet.walletId, transaction.paymentAmount);
    if (updateWalletResult) {
      return updateWalletResult;
    } else {
      Logger.error(`updateWalletResult error pointWallet.walletId ${pointWallet.walletId} - ${JSON.stringify(transaction)}`);
      return undefined;
    }
  } else {
    Logger.error("approveDepositTransaction error");
    return undefined;
  }
}

async function processFailureTransaction(transactionId, staff) {
  //get info of transaction
  let transaction = await DepositTransactionAccess.find({
    paymentDepositTransactionId: transactionId
  });

  if (!transaction || transaction.length < 1) {
    Logger.error("transaction is invalid");
    return undefined;
  }
  transaction = transaction[0];

  //Nếu không phải giao dịch "ĐANG CHỜ" (PENDING / WAITING) hoặc "MỚI TẠO" (NEW) thì không xử lý
  if (!(transaction.status === DEPOSIT_TRX_STATUS.NEW || transaction.status === DEPOSIT_TRX_STATUS.WAITING || transaction.status !== DEPOSIT_TRX_STATUS.PENDING)) {
    Logger.error("deposit transaction was approved or canceled");
    return undefined;
  }

  //Change payment status and store info of PIC
  let updatedData = {
    paymentStatus: DEPOSIT_TRX_STATUS.CANCELED,
    paymentApproveDate: new Date(),
    paymentNote: `Hệ thống nạp tiền thất bại`,
  }

  //if transaction was performed by Staff, then store staff Id for later check
  if (staff) {
    updatedData.paymentPICId = staff.staffId;
    updatedData.paymentNote = `${staff.firstName} ${staff.lastName} (id: ${staff.staffId}) từ chối nạp tiền`;
  }
  let updateResult = await DepositTransactionAccess.updateById(transactionId, updatedData);
  return updateResult;
}

module.exports = {
  createDepositTransaction,
  approveDepositTransaction,
  denyDepositTransaction,
  addRewardPointForUser,
  processFailureTransaction,
  processSuccessTransaction
}