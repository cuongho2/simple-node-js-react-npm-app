const Logger = require('../../utils/logging');
const AppUserResource = require('../AppUsers/resourceAccess/AppUsersResourceAccess');
const StaffResource = require('../Staff/resourceAccess/StaffResourceAccess');
const StationResource = require('../Stations/resourceAccess/StationsResourceAccess');
const CustomerScheduleResource = require('../CustomerSchedule/resourceAccess/CustomerScheduleResourceAccess');

const ServicePackageResource = require('../PaymentServicePackage/resourceAccess/PaymentServicePackageResourceAccess');
const BalanceUnitResource = require('../WalletBalanceUnit/resourceAccess/WalletBalanceUnitResourceAccess');
const PaymentDepositResource = require('../PaymentDepositTransaction/resourceAccess/PaymentDepositTransactionResourceAccess');
const DepositTransactionUserView = require('../PaymentDepositTransaction/resourceAccess/PaymentDepositTransactionUserView');
const PaymentWithdrawResource = require('../PaymentWithdrawTransaction/resourceAccess/PaymentWithdrawTransactionResourceAccess');
const WithdrawTransactionUserView = require('../PaymentWithdrawTransaction/resourceAccess/WithdrawTransactionUserView');
const ExchangeTransactionUserView = require('../PaymentExchangeTransaction/resourceAccess/ExchangeTransactionUserView');

const SummaryDepositUserViews = require('../PaymentDepositTransaction/resourceAccess/SummaryUserPaymentDepositTransactionView');
const SummaryWithdrawUserViews = require('../PaymentWithdrawTransaction/resourceAccess/SummaryUserWithdrawTransactionView');
const SummaryServicePackageUserViews = require('../PaymentServicePackage/resourceAccess/SummaryPaymentServicePackageUserView');
const SummaryExchangeUserViews = require('../PaymentExchangeTransaction/resourceAccess/SummaryUserExchangeTransactionView');

async function countTotalUser() {
  let countAll = await AppUserResource.customCount({});
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
};

async function countTotalServicePackage() {
  let countAll = await ServicePackageResource.count({});
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
};

async function countTotalBalanceUnit() {
  let countAll = await BalanceUnitResource.count({});
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
};

async function sumTotalUserPaymentDeposit(startDate, endDate) {
  let sumAll = await PaymentDepositResource.customSum({}, startDate, endDate);
  if (sumAll) {
    return sumAll[0].sumResult;
  }

  return 0;
};

async function sumTotalUserPaymentWithdraw(startDate, endDate) {
  let sumAll = await PaymentWithdrawResource.customSum({}, startDate, endDate);
  if (sumAll) {
    return sumAll[0].sumResult;
  }

  return 0;
};

async function sumTotalUserPaymentService(startDate, endDate) {
  const UserPackageServiceViews = require('../PaymentServicePackage/resourceAccess/UserServicePackageViews');
  let sumAll = await UserPackageServiceViews.customSum({}, startDate, endDate);
  if (sumAll) {
    return sumAll[0].sumResult;
  }

  return 0;
};

async function sumTotalUserSellRecord(startDate, endDate) {
  // let sumAll = await PaymentDepositResource.customSum({}, startDate, endDate);
  // if (sumAll) {
  //   return sumAll[0].sumResult;
  // }

  return 0;
};

async function summaryWalletBalanceUnit(startDate, endDate) {
  const UserPackageServiceViews = require('../PaymentServicePackage/resourceAccess/UserServicePackageViews');
  let distinctFields = [
    'walletBalanceUnitDisplayName',
    'walletBalanceUnitCode',
    'walletBalanceUnitAvatar'
  ];

  let sumAll = await UserPackageServiceViews.customSumCountDistinct(distinctFields, {}, startDate, endDate);

  if (sumAll) {
    return sumAll;
  }

  return [];
};

async function summaryUserPaymentServicePackage(startDate, endDate) {
  const UserPackageServiceViews = require('../PaymentServicePackage/resourceAccess/UserServicePackageViews');
  
  let distinctFields = [
    'packageName',
  ];

  let sumAll = await UserPackageServiceViews.customSumCountDistinct(distinctFields, {}, startDate, endDate);
  console.log(sumAll);
  if (sumAll) {
    return sumAll;
  }

  return [];
};

async function countTotalNewUsers(startDate, endDate) {
  let countAll = await AppUserResource.customCount({}, undefined, startDate, endDate);
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
}

async function countTotalAgency() {
  const AGENCY_ROLE = 5;
  let countAll = await StaffResource.count();
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
}

async function countTotalStation() {
  let countAll = await StationResource.count();
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
}

async function countTotalCustomerSchedule(startDate, endDate) {
  let countAll = await CustomerScheduleResource.customCount({}, startDate, endDate);
  if (countAll) {
    return countAll[0].count;
  }

  return 0;
}

function _extractCreatedDate(createdDateList, newListData) {
  if (newListData) {
    for (let i = 0; i < newListData.length; i++) {
      const _newDate = newListData[i];
      if (createdDateList.indexOf(_newDate.createdDate) < 0) {
        createdDateList.push(_newDate.createdDate);
      }
    }
  }
  return createdDateList;
}

function _extractSummaryResult(createdDate, summaryResultList) {
  if (summaryResultList) {
    for (let i = 0; i < summaryResultList.length; i++) {
      const _result = summaryResultList[i];
      if (createdDate === _result.createdDate) {
        return _result.totalSum;
      }
    }
  }

  return 0;
}

async function summaryUserPayment(appUserId, startDate, endDate) {

  let summaryDeposit = await DepositTransactionUserView.sumAmountDistinctByDate({ appUserId: appUserId }, startDate, endDate);

  let summaryWithdraw = await WithdrawTransactionUserView.sumAmountDistinctByDate({ appUserId: appUserId }, startDate, endDate);

  let summaryBuy = await ExchangeTransactionUserView.sumAmountDistinctByDate({ appUserId: appUserId }, startDate, endDate);

  let summarySell = await ExchangeTransactionUserView.sumAmountDistinctByDate({ referId: appUserId }, startDate, endDate);

  let createdDateList = [];
  createdDateList = _extractCreatedDate(createdDateList, summaryDeposit);
  createdDateList = _extractCreatedDate(createdDateList, summaryWithdraw);
  createdDateList = _extractCreatedDate(createdDateList, summaryBuy);
  createdDateList = _extractCreatedDate(createdDateList, summarySell);
  createdDateList = createdDateList.sort();

  let summaryResultList = [];
  for (let i = 0; i < createdDateList.length; i++) {
    const _createdDate = createdDateList[i];
    let _newSummaryResult = {
      createdDate: _createdDate,
      totalDeposit: _extractSummaryResult(_createdDate, summaryDeposit),
      totalWithdraw: _extractSummaryResult(_createdDate, summaryWithdraw),
      totalSell: _extractSummaryResult(_createdDate, summaryBuy),
      totalBuy: _extractSummaryResult(_createdDate, summarySell),
    }
    summaryResultList.push(_newSummaryResult);
  }

  return summaryResultList;
}

async function summaryReferUser(appUserId, skip = 0, limit = 5) {
  const DEPOSIT_TRX_STATUS = require('../PaymentDepositTransaction/PaymentDepositTransactionConstant').DEPOSIT_TRX_STATUS;
  const WITHDRAW_TRX_STATUS = require('../PaymentWithdrawTransaction/PaymentWithdrawTransactionConstant').WITHDRAW_TRX_STATUS;
  const EXCHANGE_TRX_STATUS = require('../PaymentExchangeTransaction/PaymentExchangeTransactionConstant').EXCHANGE_TRX_STATUS;

  let summaryResult = {
    summaryData: [],
    summaryCountTotal: 0,
    summaryTotalDeposit: 0,
    summaryTotalWithdraw: 0,
    summaryTotalBuy: 0,
    summaryTotalSell: 0,
  }
  let totalCountReferUser = await AppUserResource.count({
    referUserId: appUserId,
  });

  if (!totalCountReferUser || totalCountReferUser.length <= 0) {
    Logger.info(`There is no data to summary refer user for appUserId ${appUserId}`);
    //No data to summary
    return summaryResult;
  }

  const _order = {
    key: "appUserId",
    value: "desc"
  }
  let _userList = await AppUserResource.find({
    referUserId: appUserId,
  }, skip, limit, _order);

  if (!_userList) {
    Logger.info(`There is no data to summary refer user for appUserId ${appUserId}`);
    //No data to summary
    return summaryResult;
  }
  let userSummaryRecords = [];
  for (let i = 0; i < _userList.length; i++) {
    const _userData = _userList[i];
    let summaryDeposit = await SummaryDepositUserViews.find({
      appUserId: _userData.appUserId,
      paymentStatus: DEPOSIT_TRX_STATUS.COMPLETED
    }, 0, 1, _order);

    let summaryWithdraw = await SummaryWithdrawUserViews.find({
      appUserId: _userData.appUserId,
      paymentStatus: WITHDRAW_TRX_STATUS.COMPLETED
    }, 0, 1, _order);
  
    let summaryBuy = await SummaryServicePackageUserViews.find({
      appUserId: _userData.appUserId,
    }, 0, 1, _order);
  
    let summarySell = await SummaryExchangeUserViews.find({
      appUserId: _userData.appUserId,
      paymentStatus: EXCHANGE_TRX_STATUS.COMPLETED
    }, 0, 1, _order);
    
    let _summaryRecord = {
      totalWithdraw: 0,
      totalDeposit: 0,
      totalBuy: 0,
      totalSell: 0,
      username: _userData.username,
      appUserId: _userData.appUserId,
    };

    if (summaryDeposit && summaryDeposit.length > 0) {
      _summaryRecord.totalDeposit = summaryDeposit[0].totalSum;
    }

    if (summaryWithdraw && summaryWithdraw.length > 0) {
      _summaryRecord.totalWithdraw = summaryWithdraw[0].totalSum;
    }
  
    if (summaryBuy && summaryBuy.length > 0) {
      _summaryRecord.totalBuy = summaryBuy[0].totalSum;
    }
  
    if (summarySell && summarySell.length > 0) {
      _summaryRecord.totalSell = summarySell[0].totalSum;
    }
    
    userSummaryRecords.push(_summaryRecord);
  }

  //summaryTotalDeposit
  let _summaryTotalDeposit = await SummaryDepositUserViews.sum('totalSum',{
    paymentStatus: DEPOSIT_TRX_STATUS.COMPLETED,
    referUserId: appUserId,
  });

  if (_summaryTotalDeposit && _summaryTotalDeposit.length > 0) {
    summaryResult.summaryTotalDeposit = _summaryTotalDeposit[0].sumResult;
  }

  //_summaryTotalWithdraw
  let _summaryTotalWithdraw = await SummaryWithdrawUserViews.sum('totalSum',{
    paymentStatus: WITHDRAW_TRX_STATUS.COMPLETED,
    referUserId: appUserId,
  });
  
  if (_summaryTotalWithdraw && _summaryTotalWithdraw.length > 0) {
    summaryResult.summaryTotalWithdraw = _summaryTotalWithdraw[0].sumResult;
  }

  //summaryTotalBuy
  let _summaryTotalBuy = await SummaryServicePackageUserViews.sum('totalSum',{
    referUserId: appUserId,
  });

  if (_summaryTotalBuy && _summaryTotalBuy.length > 0) {
    summaryResult.summaryTotalBuy = _summaryTotalBuy[0].sumResult;
  }

  //_summaryTotalSell
  let _summaryTotalSell = await SummaryExchangeUserViews.sum('totalSum',{
    paymentStatus: EXCHANGE_TRX_STATUS.COMPLETED,
    referUserId: appUserId,
  });
  
  if (_summaryTotalSell && _summaryTotalSell.length > 0) {
    summaryResult.summaryTotalSell = _summaryTotalSell[0].sumResult;
  }

  summaryResult.summaryData = userSummaryRecords;
  summaryResult.summaryCountTotal = totalCountReferUser[0].count;
  
  return summaryResult
}


module.exports = {
  countTotalNewUsers,
  countTotalAgency,
  countTotalStation,
  countTotalCustomerSchedule,
  summaryUserPaymentServicePackage,
  summaryWalletBalanceUnit,
  sumTotalUserSellRecord,
  sumTotalUserPaymentService,
  sumTotalUserPaymentWithdraw,
  sumTotalUserPaymentDeposit,
  countTotalBalanceUnit,
  countTotalServicePackage,
  countTotalUser,
  summaryUserPayment,
  summaryReferUser,
}