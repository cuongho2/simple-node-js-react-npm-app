/**
 * Created by A on 7/18/17.
 */
"use strict";
const moment = require('moment');

const ServicePackageWalletViews = require("../resourceAccess/ServicePackageWalletViews");
const ServicePackageUserViews = require('../resourceAccess/ServicePackageUserViews');
const SummaryPaymentServicePackageUserView = require('../resourceAccess/SummaryPaymentServicePackageUserView');
const UserServicePackageFunctions = require('../UserServicePackageFunctions');
const AppUserFunctions = require('../../AppUsers/AppUsersFunctions');
const { USER_ERROR } = require('../../AppUsers/AppUserConstant');
const Logger = require('../../../utils/logging');
const MINING_DURATION = require('../PaymentServicePackageConstant').MINING_DURATION;
const ServicePackageUser = require('../resourceAccess/PaymentServicePackageUserResourceAccess');
const { ACTIVITY_STATUS, PACKAGE_CATEGORY, PACKAGE_TYPE } = require('../PaymentServicePackageConstant');
const BetRecordsFunctions = require('../../BetRecords/BetRecordsFunctions');
const PaymentServicePackageFunctions = require('../PaymentServicePackageFunctions');

async function getListUserBuyPackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let searchText = req.payload.searchText;

      if (filter === undefined) {
        filter = {};
      }
      filter.appUserId = req.currentUser.appUserId;
      console.log(filter);
      let packages = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, searchText, order);

      if (packages && packages.length > 0) {
        let packagesCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, searchText, skip, order);
        resolve({ data: packages, total: packagesCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function findUserBuyPackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let searchText = req.payload.searchText;

      if (filter === undefined) {
        filter = {};
      }

      let packages = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, searchText, order);

      if (packages && packages.length > 0) {
        let packagesCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, searchText, skip, order);
        resolve({ data: packages, total: packagesCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function historyServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let searchText = req.payload.searchText;

      if (filter === undefined) {
        filter = {};
      }

      filter.appUserId = req.currentUser.appUserId;

      let distinctFields = [
        `walletBalanceUnitId`,
        `walletBalanceUnitDisplayName`,
        `walletBalanceUnitCode`,
        `walletBalanceUnitAvatar`,
        `userSellPrice`,
        `agencySellPrice`,
        `balance`,
      ];
      let packages = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, searchText, order);

      if (packages && packages.length > 0) {
        for (let i = 0; i < packages.length; i++) {
          const _package = packages[i];

          //get time diff in milisecond
          let _timeDiff = (new Date() - 1) - (new Date(_package.packageLastActiveDate) - 1);
          packages[i].processing = parseInt(_timeDiff / (MINING_DURATION * 60 * 60 * 1000) * 100);

          //maximum 100% processing
          packages[i].processing = Math.min(packages[i].processing, 100);
        }
        let packagesCount = await ServicePackageUserViews.customCount(filter, skip, limit, startDate, endDate, searchText, order);
        resolve({ data: packages, total: packagesCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function getUserServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;

      if (filter === undefined) {
        filter = {};
      }

      filter.appUserId = req.currentUser.appUserId;

      let distinctFields = [
        `walletBalanceUnitId`,
        `walletBalanceUnitDisplayName`,
        `walletBalanceUnitCode`,
        `walletBalanceUnitAvatar`,
        `userSellPrice`,
        `agencySellPrice`,
        `balance`,
      ];
      let packages = await ServicePackageWalletViews.customSumCountDistinct(distinctFields, filter, startDate, endDate);

      if (packages && packages.length > 0) {
        for (let packagesCounter = 0; packagesCounter < packages.length; packagesCounter++) {
          const userPackage = packages[packagesCounter];
          packages[packagesCounter].packagePerformance = userPackage.totalSum;
        }
        resolve({ data: packages, total: packages.length });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function buyServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let paymentServicePackageId = req.payload.paymentServicePackageId;
      let currentUser = req.currentUser;

      //chi cho phep user mua 1 goi duy nhat / moi loai goi tap 
      let _existedPackage = await ServicePackageUser.find({
        appUserId: currentUser.appUserId,
        paymentServicePackageId: paymentServicePackageId,
        isDeleted: 0
      });

      if (_existedPackage && _existedPackage.length > 0) {
        Logger.error(`ALREADY_BUY_BEFORE buyServicePackage`);
        reject(`ALREADY_BUY_BEFORE`);
        return;
      }

      //if system support for secondary password
      if (req.payload.secondaryPassword) {
        let verifyResult = await AppUserFunctions.verifyUserSecondaryPassword(req.currentUser.username, req.payload.secondaryPassword);
        if (verifyResult === undefined) {
          Logger.error(`${USER_ERROR.NOT_AUTHORIZED} buyServicePackage`);
          reject(USER_ERROR.NOT_AUTHORIZED);
          return;
        }
      }

      let result = await UserServicePackageFunctions.userBuyServicePackage(currentUser, paymentServicePackageId);
      if (result) { 
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function userGetBalanceByUnitId(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;

      let packages = await ServicePackageWalletViews.find(filter, skip, limit, order);

      if (packages && packages.length > 0) {
        let paymentServiceCount = await ServicePackageWalletViews.count(filter, order);
        resolve({ data: packages, total: paymentServiceCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};


async function userActivateServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let paymentServicePackageUserId = req.payload.paymentServicePackageUserId;
      let currentUser = req.currentUser;

      let result = await UserServicePackageFunctions.userActivateServicePackage(currentUser, paymentServicePackageUserId);
      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};


async function userCollectServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let paymentServicePackageUserId = req.payload.paymentServicePackageUserId;
      let currentUser = req.currentUser;

      let collectedAmount = await UserServicePackageFunctions.userCollectServicePackage(currentUser, paymentServicePackageUserId);
      if (collectedAmount !== undefined) {
        if (collectedAmount !== 0) {
          await BetRecordsFunctions.payCommissionForReferalByUserId(currentUser.appUserId, collectedAmount);
        }
        resolve(collectedAmount);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function userRequestCompletedServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let paymentServicePackageUserId = req.payload.paymentServicePackageUserId;
      let currentUser = req.currentUser;
      //if system support for secondary password
      if (req.payload.secondaryPassword) {
        let verifyResult = await AppUserFunctions.verifyUserSecondaryPassword(currentUser.username, req.payload.secondaryPassword);
        if (verifyResult === undefined) {
          Logger.error(`${USER_ERROR.NOT_AUTHORIZED} requestWithdraw`);
          reject(USER_ERROR.NOT_AUTHORIZED);
          return;
        }
      }
      let result = await UserServicePackageFunctions.userCompleteUserServicePackage(paymentServicePackageUserId, currentUser);
      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function adminCompletePackagesById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let paymentServicePackageUserId = req.payload.id;
      let currentUser = req.currentUser;

      let result = await UserServicePackageFunctions.adminCompleteUserServicePackage(paymentServicePackageUserId, currentUser);
      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function historyCompleteServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      if (filter === undefined) {
        filter = {};
      }

      filter.appUserId = req.currentUser.appUserId;
      filter.packageActivityStatus = ACTIVITY_STATUS.COMPLETED;

      let result = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, undefined, order);
      

      if (result && result.length > 0) {
        let resultCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, undefined, order);
        resolve({
          data: result,
          total: resultCount[0].count,
        });
      } else {
        resolve({
          data: [],
          total: 0,
        });
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}
async function adminHistoryCompleteServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let searchText = req.payload.searchText;

      if (filter === undefined) {
        filter = {};
      }

      filter.packageActivityStatus = ACTIVITY_STATUS.COMPLETED;

      let result = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, searchText, order);
      let resultCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, searchText, order);

      if (result && resultCount && result.length > 0) {
        resolve({
          data: result,
          total: resultCount[0].count,
        });
      } else {
        resolve({
          data: [],
          total: 0,
        });
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}
async function historyCancelServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;

      if (filter === undefined) {
        filter = {};
      }

      filter.appUserId = req.currentUser.appUserId;
      filter.packageActivityStatus = ACTIVITY_STATUS.CANCELED;
      let result = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, undefined, order);
      
      if (result && result.length > 0) {
        let resultCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, undefined, order);
        resolve({
          data: result,
          total: resultCount[0].count,
        });
      } else {
        resolve({
          data: [],
          total: 0,
        });
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}
async function adminHistoryCancelServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let searchText = req.payload.searchText;

      if (filter === undefined) {
        filter = {};
      }
      filter.packageActivityStatus = ACTIVITY_STATUS.CANCELED;
      let result = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, searchText, order);
      
      if (result && result.length > 0) {
        let resultCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, searchText, order);
        resolve({
          data: result,
          total: resultCount[0].count,
        });
      } else {
        resolve({
          data: [],
          total: 0,
        });
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}
async function historyBonusServicePackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let startDate = req.payload.startDate;
      let endDate = req.payload.endDate;
      let order = req.payload.order;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      if (filter === undefined) {
        filter = {};
      }
      filter.appUserId = req.currentUser.appUserId;
      filter.packageCategory = PACKAGE_CATEGORY.BONUS;
      let result = await ServicePackageUserViews.customSearch(filter, skip, limit, startDate, endDate, order);
      if (result && result.length > 0) {
        let resultCount = await ServicePackageUserViews.customCount(filter, startDate, endDate, order);
        if (resultCount) {
          resolve({
            data: result,
            total: resultCount[0].count,
          });
        }
        else {
          resolve({
            data: result,
            total: 0,
          });
        }
      } else {
        resolve({
          data: [],
          total: 0,
        });
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function countAllUserPackage(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      if (filter === undefined) {
        filter = {};
      }
      let resultCount = await ServicePackageUserViews.countDistinct('appUserId', filter, undefined, undefined, limit, skip);
      if (resultCount && resultCount.length > 0) {
        resolve(resultCount);
      } else {
        resolve([]);
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function updateById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = req.payload.id;
      let data = req.payload.data;

      let result = await ServicePackageUser.updateById(id, data);
      if (result && result.length > 0) {
        resolve(result);
      } else {
        reject('failed');
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}
async function summaryReferedUser(req) {
return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      if(filter === undefined){
        filter = {}
      }

      filter.memberReferIdF1 = req.currentUser.appUserId;

      let skip = req.payload.skip;
      let limit = req.payload.limit;

      let result = await SummaryPaymentServicePackageUserView.findReferedUserByUserId(req.currentUser.appUserId, skip, limit);
      if (result && result.length > 0) {
        let totalCount = await SummaryPaymentServicePackageUserView.countReferedUserByUserId(req.currentUser.appUserId);
        resolve({data: result, total: totalCount[0].count});
      } else {
        resolve({data: [], total: 0});
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}


async function adminExtendPackagesById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = req.payload.id;

      //thoi gian gia han (ngay)
      let extendedDuration = req.payload.extendedDuration;

      let _package = await ServicePackageUser.findById(id);

      //tinh lai ngay ket thuc goi
      let _nextExpiredDate = moment(_package.packageExpireDate).add(extendedDuration, 'days').toDate();
      let updatedData = {
        packageExpireDate: _nextExpiredDate
      };

      //cap nhat
      let result = await ServicePackageUser.updateById(id, updatedData);

      if (result !== undefined) {
        resolve(result);
      } else {
        reject('failed');
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function adminCompletePackagesById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = req.payload.id;

      //dong su dung goi
      let updatedData = {
        packageActivityStatus: ACTIVITY_STATUS.COMPLETED
      };

      let result = await ServicePackageUser.updateById(id, updatedData);
      if (result && result.length > 0) {
        resolve(result);
      } else {
        reject('failed');
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function adminPausePackagesById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = req.payload.id;
      //lay thoi gian hoan goi
      let pauseDuration = req.payload.pauseDuration;

      let _package = await ServicePackageUser.findById(id);

      if (_package.packagePauseCount >= 1) {
        Logger.error(`package ${id} is paused before`)
        reject('LIMITED_PAUSE');
        return; //make sure everything stop
      }

      //tinh toan thoi gian ket thuc goi (neu hoan 100% thoi gian)
      let _nextExpiredDate = moment(_package.packageExpireDate).add(pauseDuration, 'days').toDate();

      //luu thoi gian su dung goi cuoi cung
      let _nextLastActiveDate = new Date();
      let updatedData = {
        packageActivityStatus: ACTIVITY_STATUS.STANDBY,
        packageExpireDate: _nextExpiredDate,
        packageLastActiveDate: _nextLastActiveDate,
        packagePauseCount: _package.packagePauseCount + 1
      };
      let result = await ServicePackageUser.updateById(id, updatedData);
      if (result !== undefined) {
        resolve(result);
      } else {
        reject('failed');
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function adminContinuePackagesById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = req.payload.id;

      let _package = await ServicePackageUser.findById(id);

      //tinh lai thoi gian thuc te da hoan
      let _pausedDuration = moment().diff(new Date(_package.packageLastActiveDate), 'days');

      //tinh lai thoi gian het han
      let _nextExpiredDate = moment(_package.packageExpireDate).subtract(_pausedDuration, 'days').toDate();

      let updatedData = {
        packageActivityStatus: ACTIVITY_STATUS.WORKING,
        packageExpireDate: _nextExpiredDate,
        packageLastActiveDate: new Date(),
      };

      let result = await ServicePackageUser.updateById(id, updatedData);
      if (result !== undefined) {
        resolve(result);
      } else {
        reject('failed');
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

async function adminActivatePackagesById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let id = req.payload.id;

      let _package = await ServicePackageUser.findById(id);

      if (_package.packageActivityStatus !== ACTIVITY_STATUS.PENDING) {
        Logger.error(`package ${id} was activated beforer`)
        reject('ALREADY_ACTIVATE');
        return; //make sure everything stop
      }

      let updatedData = req.payload.data;
      updatedData.packageActivityStatus = ACTIVITY_STATUS.WORKING;

      let result = await ServicePackageUser.updateById(id, updatedData);
      if (result !== undefined) {
        resolve(result);
      } else {
        reject('failed');
      }
    }
    catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
}

module.exports = {
  historyServicePackage,
  buyServicePackage,
  userGetBalanceByUnitId,
  getUserServicePackage,
  userCollectServicePackage,
  userActivateServicePackage,
  getListUserBuyPackage,
  userRequestCompletedServicePackage,
  historyCompleteServicePackage,
  historyCancelServicePackage,
  historyBonusServicePackage,
  countAllUserPackage,
  adminCompletePackagesById,
  adminHistoryCancelServicePackage,
  adminHistoryCompleteServicePackage,
  updateById,
  summaryReferedUser,
  findUserBuyPackage,
  adminActivatePackagesById,
  adminExtendPackagesById,
  adminCompletePackagesById,
  adminContinuePackagesById,
  adminPausePackagesById,
};