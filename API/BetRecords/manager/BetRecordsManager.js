/**
 * Created by A on 7/18/17.
 */
"use strict";
const BetRecordsResourceAccess = require("../resourceAccess/BetRecordsResourceAccess");
const UserBetRecordsView = require("../resourceAccess/UserBetRecordsView");

async function _getHistoryBetRecord() {

}
async function insert(req) {
  return new Promise(async (resolve, reject) => {
    resolve("success");
  })
};

async function find(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;

      let betRecordList = await UserBetRecordsView.customSearch(filter, skip, limit, order);
      if (betRecordList && betRecordList.length > 0) {
        let betRecordCount = await UserBetRecordsView.customCount(filter, order);
        let betRecordSum = await UserBetRecordsView.sum('betRecordAmountIn', filter, order);
        for (let i = 0; i < betRecordList.length; i++) {
          betRecordList[i] = BetRecodsModel.fromData(betRecordList[i]); 
        }
        resolve({data: betRecordList, total: betRecordCount[0].count, totalSum: betRecordSum[0].sumResult});
      }else{
        resolve({data: [], total: 0, totalSum: 0});
      }
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function updateById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let updateResult = await BetRecordsResourceAccess.updateById(req.payload.id, req.payload.data);
      if(updateResult) {
        resolve(updateResult);
      }else{
        resolve({});
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
      let betRecordList = await UserBetRecordsView.find({betRecordId: req.payload.id});
      if(betRecordList) {
        for (let i = 0; i < betRecordList.length; i++) {
          betRecordList[i] = BetRecodsModel.fromData(betRecordList[i]); 
        }
        resolve(betRecordList[0]);
      }else{
        resolve({});
      }
      resolve("success");
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};

async function getList(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      
      //only get record of current user
      filter.appUserId = req.currentUser.appUserId;

      let betRecordList = await UserBetRecordsView.customSearch(filter, skip, limit, order);
      if (betRecordList && betRecordList.length > 0) {
        let betRecordCount = await UserBetRecordsView.customCount(filter, order);
        let betRecordSum = await UserBetRecordsView.sum('betRecordAmountIn', filter, order);
        for (let i = 0; i < betRecordList.length; i++) {
          betRecordList[i] = BetRecodsModel.fromData(betRecordList[i]); 
        }
        resolve({data: betRecordList, total: betRecordCount[0].count, totalSum: betRecordSum[0].sumResult});
      }else{
        resolve({data: [], total: 0, totalSum: 0});
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

      let result = await BetRecordsResourceAccess.sumaryPointAmount(startDate, endDate, filter);
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

      let result = await BetRecordsResourceAccess.sumaryPointAmount(startDate, endDate, filter);
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

module.exports = {
  insert,
  find,
  updateById,
  findById,
  getList,
  summaryAll,
  summaryUser,
};
