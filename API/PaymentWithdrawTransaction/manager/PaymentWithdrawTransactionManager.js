/**
 * Created by A on 7/18/17.
 */
"use strict";

const UserResouce = require("../../AppUsers/resourceAccess/AppUsersResourceAccess");
const WithdrawTransactionResourceAccess = require("../resourceAccess/PaymentWithdrawTransactionResourceAccess");
const WithdrawTransactionUserView = require("../resourceAccess/WithdrawTransactionUserView");
const WithdrawTransactionFunction = require('../PaymentWithdrawTransactionFunctions');
const AppUserFunctions = require('../../AppUsers/AppUsersFunctions');
const { USER_ERROR } = require('../../AppUsers/AppUserConstant');
const { WITHDRAW_TRX_STATUS } = require('../PaymentWithdrawTransactionConstant');
const Logger = require('../../../utils/logging');

async function insert(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let appUserId = req.payload.id;
      let paymentAmount = req.payload.paymentAmount;

      let targetUser = await UserResouce.find({appUserId: appUserId}, 0, 1);
      if (targetUser && targetUser.length > 0) {
        let createResult = await WithdrawTransactionFunction.createWithdrawRequest(targetUser[0], paymentAmount, req.currentUser);
        if (createResult) {
          resolve(createResult);
        } else {
          Logger.error(`can not WithdrawTransactionFunction.createWithdrawRequest`);
          reject("can not create withdraw transaction");
        }
      } else {
        Logger.error(`can not WithdrawTransactionFunction.insert invalid user`);
        reject("failed");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function find(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let searchText = req.payload.searchText;
      let transactionList = await WithdrawTransactionUserView.customSearch(filter, skip, limit, startDate, endDate, searchText, order);
      let transactionCount = await WithdrawTransactionUserView.customCount(filter, startDate, endDate, searchText, order);

      if (transactionList && transactionCount && transactionList.length > 0) {
        resolve({
          data: transactionList, 
          total: transactionCount[0].count,
        });
      }else{
        resolve({
          data: [], 
          total: 0,
        });
      }
      reject("failed");
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function updateById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let newStatus = req.payload.data.status;
      let result = undefined;
      console.log(newStatus);
      if(newStatus === WITHDRAW_TRX_STATUS.COMPLETED){
        result = await WithdrawTransactionFunction.acceptWithdrawRequest(req.payload.id);
      }else{
        result = await WithdrawTransactionFunction.rejectWithdrawRequest(req.payload.id)
      }

      if(result) {
        resolve(result);
      }else{
        reject("update transaction failed");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};
async function findById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      
      let transactionList = await WithdrawTransactionUserView.find({paymentWithdrawTransactionId: req.payload.id});
      if(transactionList && transactionList.length > 0) {
        resolve(transactionList[0]);
      }else{
        Logger.error(`WithdrawTransactionUserView can not findById ${req.payload.id}`);
        reject("failed");
      }
      
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};
async function getList(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = {};
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      if (req.currentUser.appUserId) {
        filter.appUserId = req.currentUser.appUserId;
      } else {
        reject("failed");
        return;
      }

      let transactionList = await WithdrawTransactionUserView.customSearch(filter, skip, limit, startDate, endDate, undefined, order);

      if (transactionList && transactionList.length > 0) {
        let transactionCount = await WithdrawTransactionUserView.customCount(filter, startDate, endDate, undefined, order);
        resolve({
          data: transactionList, 
          total: transactionCount[0].count,
        });
      }else{
        resolve({
          data: [], 
          total: 0,
        });
      }
      resolve("success");
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function approveWithdrawTransaction(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await WithdrawTransactionFunction.acceptWithdrawRequest(req.payload.id, req.payload.paymentNote);
      if(result) {
        resolve(result);
      }else{
        reject("failed");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function denyWithdrawTransaction(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await WithdrawTransactionFunction.rejectWithdrawRequest(req.payload.id, req.payload.paymentNote);
      if(result) {
        resolve(result);
      }else{
        reject("failed");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};


async function summaryUser(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let filter = req.payload.filter;
      filter.userId = req.currentUser.userId;

      let result = await WithdrawTransactionResourceAccess.customSum(filter, startDate, endDate);
      if(result) {
        resolve(result[0]);
      }else{
        reject("failed");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function summaryAll(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let filter = req.payload.filter;

      let result = await WithdrawTransactionResourceAccess.customSum(filter, startDate, endDate);
      if(result) {
        resolve(result[0]);
      }else{
        reject("failed");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function requestWithdraw(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let paymentAmount = req.payload.paymentAmount;

      //if system support for secondary password
      if (req.payload.secondaryPassword) {
        let verifyResult = await AppUserFunctions.verifyUserSecondaryPassword(req.currentUser.username, req.payload.secondaryPassword);
        if (verifyResult === undefined) {
          Logger.error(`${USER_ERROR.NOT_AUTHORIZED} requestWithdraw`);
          reject(USER_ERROR.NOT_AUTHORIZED);
          return;
        }
      }

      let createResult = await WithdrawTransactionFunction.createWithdrawRequest(req.currentUser, paymentAmount, req.payload.paymentNote);
      if (createResult) {
        resolve(createResult);
      } else {
        Logger.error(`can not WithdrawTransactionFunction.createWithdrawRequest`);
        reject("can not create withdraw transaction");
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

module.exports = {
  insert,
  find,
  updateById,
  findById,
  requestWithdraw,
  getList,
  denyWithdrawTransaction,
  approveWithdrawTransaction,
  summaryAll,
  summaryUser,
};
