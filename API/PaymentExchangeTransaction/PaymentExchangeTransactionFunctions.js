/**
 * Created by A on 7/18/17.
 */
'use strict';
const ExchangeTransactionResource = require('./resourceAccess/PaymentExchangeTransactionResourceAccess');
const WalletResourceAccess = require('../Wallet/resourceAccess/WalletResourceAccess');
const WalletBalanceUnitView = require('../Wallet/resourceAccess/WalletBalanceUnitView');
const { WALLET_TYPE } = require('../Wallet/WalletConstant');
const { EXCHANGE_ERROR, EXCHANGE_TRX_STATUS } = require('./PaymentExchangeTransactionConstant');
const { USER_MEMBER_LEVEL } = require('../AppUsers/AppUserConstant');
const Logger = require('../../utils/logging');

async function _acceptExchangeRequest(transaction, staff, receiveWallet) {
  let updatedTransactionData = {
    paymentStatus: EXCHANGE_TRX_STATUS.COMPLETED
  };

  //update transaction paymentStatus
  if (staff) {
    updatedTransactionData.paymentApproveDate = new Date();
    updatedTransactionData.paymentPICId = staff.staffId;
  }

  //if there is receiving user (wallet), then store their balance
  if (receiveWallet) {
    updatedTransactionData.receiveWalletBalanceBefore = receiveWallet.balance;
    updatedTransactionData.receiveWalletBalanceAfter = receiveWallet.balance * 1 - transaction.receiveAmount * 1;
  }

  let updateResult = await ExchangeTransactionResource.updateById(transaction.paymentExchangeTransactionId, updatedTransactionData);

  if (updateResult) {
    //find wallet of sender
    let senderWallet = await WalletBalanceUnitView.find({
      appUserId: transaction.appUserId,
      walletType: WALLET_TYPE.POINT,
    });
    if (senderWallet && senderWallet.length > 0) {
      senderWallet = senderWallet[0];
      //add balance to wallet of sender
      let increaseBalanceResult = await WalletResourceAccess.incrementBalance(
        senderWallet.walletId,
        transaction.receiveAmount
      );
      if (increaseBalanceResult === undefined) {
        Logger.error(`staffAcceptExchangeRequest but can not incrementBalance wallet ${senderWallet.walletId} amount ${transaction.receiveAmount}`);
        return undefined
      }
    }
    return updateResult;
  } else {
    return undefined;
  }
}

async function _denyExchangeRequest(transaction, staff) {
  let transactionRequestId = transaction.paymentExchangeTransactionId;
  if (transaction === undefined) {
    Logger.error(`Can not _denyExchangeRequest ${transactionRequestId}`);
    return undefined;
  }

  if (transaction.paymentStatus === EXCHANGE_TRX_STATUS.COMPLETED || transaction.paymentStatus === EXCHANGE_TRX_STATUS.CANCELED || transaction.paymentStatus === EXCHANGE_TRX_STATUS.DELETED) {
    Logger.error(`already _denyExchangeRequest ${transactionRequestId}`);
    return undefined;
  }

  //find sender wallet to rollback balance
  let wallet = await WalletResourceAccess.find({
    walletId: transaction.sendWalletId
  });

  if (wallet === undefined || wallet.length < 1) {
    Logger.error(`Can not find wallet ${transaction.sendWalletId} for transaction ${transactionRequestId}`);
    return undefined;
  }
  wallet = wallet[0];

  //rollback balance for wallet
  await WalletResourceAccess.incrementBalance(wallet.walletId, transaction.paymentAmount);

  //update transaction paymentStatus
  let updatedTransactionData = {
    paymentStatus: EXCHANGE_TRX_STATUS.CANCELED
  }
  //update transaction paymentStatus
  if (staff) {
    updatedTransactionData.paymentApproveDate = new Date();
    updatedTransactionData.paymentPICId = staff.staffId;
  }
  let updateResult = await ExchangeTransactionResource.updateById(transactionRequestId, updatedTransactionData);
  if (updateResult) {
    return updateResult;
  } else {
    return undefined;
  }
}

async function _cancelExchangeRequest(transaction, staff) {
  let transactionRequestId = transaction.paymentExchangeTransactionId;
  if (transaction === undefined) {
    Logger.error(`Can not _cancelExchangeRequest ${transactionRequestId}`);
    return undefined;
  }

  if (transaction.paymentStatus === EXCHANGE_TRX_STATUS.COMPLETED || transaction.paymentStatus === EXCHANGE_TRX_STATUS.CANCELED || transaction.paymentStatus === EXCHANGE_TRX_STATUS.DELETED) {
    Logger.error(`already _cancelExchangeRequest ${transactionRequestId}`);
    return undefined;
  }

  //find sender wallet to rollback balance
  let wallet = await WalletResourceAccess.find({
    walletId: transaction.sendWalletId
  });

  if (wallet === undefined || wallet.length < 1) {
    Logger.error(`Can not find wallet ${transaction.sendWalletId} for transaction ${transactionRequestId}`);
    return undefined;
  }
  wallet = wallet[0];

  //rollback balance for wallet
  await WalletResourceAccess.incrementBalance(wallet.walletId, transaction.paymentAmount);

  //update transaction paymentStatus
  let updatedTransactionData = {
    paymentStatus: EXCHANGE_TRX_STATUS.CANCELED
  }
  //update transaction paymentStatus
  if (staff) {
    updatedTransactionData.paymentApproveDate = new Date();
    updatedTransactionData.paymentPICId = staff.staffId;
  }
  let updateResult = await ExchangeTransactionResource.updateById(transactionRequestId, updatedTransactionData);
  if (updateResult) {
    return updateResult;
  } else {
    return undefined;
  }
}

async function staffAcceptExchangeRequest(transactionRequestId, staff) {
  let transaction = await ExchangeTransactionResource.find({ paymentExchangeTransactionId: transactionRequestId });
  if (transaction === undefined || transaction.length < 1) {
    Logger.error(`Can not staffAcceptExchangeRequest ${transactionRequestId}`);
    return undefined;
  }
  transaction = transaction[0];
  // //do not allow staff accept user exchange request to another user
  // if (staff && transaction.receiveWalletId) {
  //   Logger.error(`staffAcceptExchangeRequest do not allow ${transactionRequestId} - transaction.receiveWalletId ${transaction.receiveWalletId}`);
  //   return undefined;
  // }

  if (transaction.paymentStatus !== EXCHANGE_TRX_STATUS.NEW) {
    Logger.error(`staffAcceptExchangeRequest ${transactionRequestId} already processed`);
    return undefined;
  }

  return await _acceptExchangeRequest(transaction, staff);
}

async function userAcceptExchangeRequest(transactionRequestId, user) {
  return new Promise(async (resolve, reject) => {
    let transaction = await ExchangeTransactionResource.find({ paymentExchangeTransactionId: transactionRequestId });
    if (transaction === undefined || transaction.length < 1) {
      Logger.error(`Can not userAcceptExchangeRequest ${transactionRequestId}`);
      resolve(undefined);
      return;
    }
    transaction = transaction[0];

    if (transaction.paymentStatus !== EXCHANGE_TRX_STATUS.NEW) {
      Logger.error(`userAcceptExchangeRequest ${transactionRequestId} already processed`);
      resolve(undefined);
    }

    if (transaction.receiveWalletId && transaction.receiveWalletId !== "" && transaction.receiveWalletId !== null) {
      //find wallet of receiver, to make sure they have enough money to pay for exchanging amount
      let receiverWallet = await WalletBalanceUnitView.find({
        walletId: transaction.receiveWalletId,
        walletType: WALLET_TYPE.POINT,
      });
      if (receiverWallet && receiverWallet.length > 0) {
        receiverWallet = receiverWallet[0];

        //do not allow other user to accept transaction from another user (even staff can not do this)
        //only receiver can accept their transaction
        if (user.appUserId === undefined || user.appUserId !== receiverWallet.appUserId) {
          Logger.error(`receiverWallet ${receiverWallet.walletId} do not have authorized`);
          resolve(undefined);
          return;
        }

        if (receiverWallet.balance < transaction.receiveAmount) {
          Logger.error(`receiverWallet ${receiverWallet.walletId} do not have enough balance`);
          reject(EXCHANGE_ERROR.NOT_ENOUGH_BALANCE);
          return;
        }

        //update balance of receiver
        let updateResult = await WalletResourceAccess.decrementBalance(receiverWallet.walletId, transaction.receiveAmount);
        if (updateResult) {
          let acceptResult = await _acceptExchangeRequest(transaction, undefined, receiverWallet);
          resolve(acceptResult);
          return;
        } else {
          Logger.error(`transaction.transactionRequestId ${transactionRequestId} can not decrease balance wallet ${receiverWallet.walletId}`);
          resolve(undefined);
          return;
        }
      } else {
        Logger.error(`transaction.transactionRequestId ${transactionRequestId} do not have receiver`)
        resolve(undefined);
        return;
      }
    } else {
      Logger.error(`transaction.receiveWalletId ${transaction.receiveWalletId} is invalid`)
      resolve(undefined);
      return;
    }
  });
}

async function staffRejectExchangeRequest(transactionRequestId, staff) {
  let transaction = await ExchangeTransactionResource.find({ paymentExchangeTransactionId: transactionRequestId });
  if (transaction === undefined || transaction.length < 1) {
    Logger.error(`Can not staffRejectExchangeRequest ${transactionRequestId}`);
    return undefined;
  }
  transaction = transaction[0];
  //do not allow staff accept user exchange request to another user
  if (staff && transaction.receiveWalletId) {
    Logger.error(`staffRejectExchangeRequest do not allow ${transactionRequestId} - transaction.receiveWalletId ${transaction.receiveWalletId}`);
    return undefined;
  }

  if (transaction.paymentStatus !== EXCHANGE_TRX_STATUS.NEW) {
    Logger.error(`staffAcceptExchangeRequest ${transactionRequestId} already processed`);
    return undefined;
  }

  return await _denyExchangeRequest(transaction, staff);
}

async function userRejectExchangeRequest(transactionRequestId) {
  return new Promise(async (resolve, reject) => {

    let transaction = await ExchangeTransactionResource.find({ paymentExchangeTransactionId: transactionRequestId });
    if (transaction === undefined || transaction.length < 1) {
      Logger.error(`Can not userRejectExchangeRequest ${transactionRequestId}`);
      resolve(undefined);
      return;
    }
    transaction = transaction[0];

    if (transaction.paymentStatus !== EXCHANGE_TRX_STATUS.NEW) {
      Logger.error(`userRejectExchangeRequest ${transactionRequestId} already processed`);
      resolve(undefined);
    }

    let denyResult = await _denyExchangeRequest(transaction);
    resolve(denyResult);
    return;
  });
}

async function createExchangeRequest(user, exchangeAmount, balanceUnitId) {
  return new Promise(async (resolve, reject) => {
    const MIN_PERSIST_AMOUNT = process.env.MIN_PERSIST_AMOUNT | 0;

    if (user.appUserId === undefined) {
      Logger.error(`createExchangeRequest invalid user`);
      resolve(undefined);
      return;
    }
    
    //validate if wallet have enough balance
    let originWallet = await WalletBalanceUnitView.find({
      appUserId: user.appUserId,
      walletType: WALLET_TYPE.CRYPTO,
      walletBalanceUnitId: balanceUnitId
    });

    if (!originWallet || originWallet.length < 1) {
      Logger.error(`user ${user.appUserId} crypto (originWallet) do not have balance for unitId ${balanceUnitId}`);
      //notify to front-end this error
      reject(EXCHANGE_ERROR.NOT_ENOUGH_BALANCE);
      return;
    }
    originWallet = originWallet[0];
    if (originWallet.balance < 0 || originWallet.balance - exchangeAmount - MIN_PERSIST_AMOUNT < 0) {
      Logger.error("wallet do not have enough amount");
      //notify to front-end this error
      reject(EXCHANGE_ERROR.NOT_ENOUGH_BALANCE);
      return;
    }

    let receiveAmount = exchangeAmount * originWallet.userSellPrice;
    if (user.memberLevelName === USER_MEMBER_LEVEL.AGENCY) {
      //neu day la user agent (dai ly) thi lay theo gia dai ly
      receiveAmount = exchangeAmount * originWallet.agencySellPrice;
    } else {
      //neu day la user binh thuong thi lay theo gia user
      receiveAmount = exchangeAmount * originWallet.userSellPrice;
    }

    let transactionData = {
      appUserId: user.appUserId,
      sendWalletId: originWallet.walletId,
      sendWalletBalanceBefore: originWallet.balance,
      sendWalletBalanceAfter: originWallet.balance - exchangeAmount,
      receiveAmount: receiveAmount,
      paymentAmount: exchangeAmount,
      paymentRewardAmount: 0,
      paymentUnit: `${originWallet.walletBalanceUnitCode}-USD`,
      sendPaymentUnitId: originWallet.walletBalanceUnitId,
      receivePaymentUnitId: 1 // hien tai dang mac dinh luon luon la 1 - don vi la USD
    };

    if (user.referUserId) {
      //store receiver id
      transactionData.referId = user.referUserId;

      //find receiver wallet id
      let receiverWallet = await WalletBalanceUnitView.find({
        appUserId: user.referUserId,
        walletType: WALLET_TYPE.POINT,
      });
      if (!receiverWallet || receiverWallet.length < 1) {
        Logger.error(`user crypto ${user.referUserId} receiverWallet is invalid`);
        resolve(undefined);
        return;
      }
      receiverWallet = receiverWallet[0];

      //store receiver wallet id into transaction
      transactionData.receiveWalletId = receiverWallet.walletId;
    }

    await WalletResourceAccess.decrementBalance(originWallet.walletId, exchangeAmount);

    let result = await ExchangeTransactionResource.insert(transactionData);

    if (result) {
      resolve(result);
      return;
    } else {
      Logger.error("insert exchange trx error");
      resolve(undefined);
      return;
    }
  });
}

async function userCancelExchangeRequest(transactionRequestId) {
  return new Promise(async (resolve, reject) => {

    let transaction = await ExchangeTransactionResource.find({ paymentExchangeTransactionId: transactionRequestId });
    if (transaction === undefined || transaction.length < 1) {
      Logger.error(`Can not userRejectExchangeRequest ${transactionRequestId}`);
      resolve(undefined);
      return;
    }
    transaction = transaction[0];

    if (transaction.paymentStatus !== EXCHANGE_TRX_STATUS.NEW) {
      Logger.error(`userRejectExchangeRequest ${transactionRequestId} already processed`);
      resolve(undefined);
    }

    let cancelResult = await _cancelExchangeRequest(transaction);
    resolve(cancelResult);
    return;
  });
}

module.exports = {
  staffAcceptExchangeRequest,
  userAcceptExchangeRequest,
  staffRejectExchangeRequest,
  userRejectExchangeRequest,
  userCancelExchangeRequest,
  createExchangeRequest
}