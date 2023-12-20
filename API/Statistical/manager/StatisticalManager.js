const Logger = require('../../../utils/logging');
const StatisticalFunctions = require('../StatisticalFunctions');

async function generalReport(req) {
  let endDate = req.payload.endDate;
  let startDate = req.payload.startDate;

  return new Promise(async (resolve, reject) => {

    let reportData = {
      totalUsers: 0, //<< tong so luong user
      totalNewUsers: 0, //<< tong so luong new user 
      totalAgency: 0, //<< tong so luong PT
      totalStations: 0, //<< tong so luong phong gym
      totalCustomerSchedule: 0, //<< tong so lich hen
    };
    try {
      let promiseList = [];
      let promisetotalUsers = StatisticalFunctions.countTotalUser();
      promiseList.push(promisetotalUsers);

      let promisetotalNewUsers = StatisticalFunctions.countTotalNewUsers(startDate, endDate);
      promiseList.push(promisetotalNewUsers);

      let promisetotalAgency = StatisticalFunctions.countTotalAgency();
      promiseList.push(promisetotalAgency);

      let promisetotalStations = StatisticalFunctions.countTotalStation();
      promiseList.push(promisetotalStations);

      let promisetotalCustomerSchedule = StatisticalFunctions.countTotalCustomerSchedule(startDate, endDate);
      promiseList.push(promisetotalCustomerSchedule);

      Promise.all(promiseList).then((values) => {
        reportData.totalUsers = values[0];
        reportData.totalNewUsers = values[1];
        reportData.totalAgency = values[2];
        reportData.totalStations = values[3];
        reportData.totalCustomerSchedule = values[4];
        resolve(reportData);
      });

    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  })
}

async function summaryUserPayment(req) {
  let endDate = req.payload.endDate;
  let startDate = req.payload.startDate;
  let appUserId = req.payload.appUserId;

  return new Promise(async (resolve, reject) => {
    try {
      let summaryUserPaymentResult = StatisticalFunctions.summaryUserPayment(appUserId, startDate, endDate);
      if (summaryUserPaymentResult) {
        resolve(summaryUserPaymentResult);
      } else {
        resolve({});
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  })
}

async function userSummaryReferUser(req) {
  return new Promise(async (resolve, reject) => {
    try {
      // let referData = {
      //   totalWithdraw: 100,
      //   totalDeposit: 200,
      //   totalBuy: 300,
      //   totalSell: 400,
      // };
      
      // let data = [];
      // referData.appUserId = 1;
      // referData.username = "username1";
      // data.push(referData);
      // referData.appUserId = 2;
      // referData.username = "username2";
      // data.push(referData);
      // referData.appUserId = 3;
      // referData.username = "username3";
      // data.push(referData);
      // referData.appUserId = 4;
      // referData.username = "username4";
      // data.push(referData);

      let skip = req.payload.skip;
      let limit = req.payload.limit;

      let data = await StatisticalFunctions.summaryReferUser(req.currentUser.appUserId, skip, limit);
      
      if (data) {
        resolve({ 
          data: data.summaryData, 
          total: data.summaryCountTotal,
          totalDeposit: data.summaryTotalDeposit,
          totalWithdraw: data.summaryTotalWithdraw,
          totalBuy: data.summaryTotalBuy,
          totalSell: data.summaryTotalSell,
        });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};


module.exports = {
  generalReport,
  summaryUserPayment,
  userSummaryReferUser
}