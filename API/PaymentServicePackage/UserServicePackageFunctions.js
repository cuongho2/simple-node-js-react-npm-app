const moment = require('moment');

const WalletResource = require('../Wallet/resourceAccess/WalletResourceAccess');
const AppUserResource = require('../AppUsers/resourceAccess/AppUsersResourceAccess');
const { WALLET_TYPE } = require('../Wallet/WalletConstant');
const ServicePackageUser = require('./resourceAccess/PaymentServicePackageUserResourceAccess');
const ServicePackageResource = require('./resourceAccess/PaymentServicePackageResourceAccess');
const UserBonusPackageResource = require('./resourceAccess/UserBonusPackageResourceAccess');
const ServicePackageWalletViews = require('./resourceAccess/ServicePackageWalletViews');
const ServicePackageUserViews = require('./resourceAccess/ServicePackageUserViews');
const { ACTIVITY_STATUS, PACKAGE_CATEGORY, CLAIMABLE_STATUS, PACKAGE_TYPE, PACKAGE_STATUS } = require('./PaymentServicePackageConstant');
const PaymentRecordResource = require('./../PaymentRecord/resourceAccess/PaymentRecordResourceAccess');
const Logger = require('../../utils/logging');

async function _addBonusPackageForUser(appUserId, bonusPackageId) {
  //check if there is any existing bonus package that still enable
  //then skip this process, we do not allow to add duplicated bonus package at the same time
  let _existingBonusPackages = await UserBonusPackageResource.find({
    appUserId: appUserId,
    bonusPackageId: bonusPackageId,
    bonusPackageClaimable: CLAIMABLE_STATUS.ENABLE,
  });

  if (_existingBonusPackages && _existingBonusPackages.length > 0) {
    Logger.error(`_existingBonusPackages for appUserId ${appUserId} - bonusPackageId ${bonusPackageId}`);
    return;
  }

  let _newBonusPackageData = {
    appUserId: appUserId,
    bonusPackageId: bonusPackageId,
    bonusPackageClaimable: CLAIMABLE_STATUS.ENABLE,
  };
  let insertNewBonus = await UserBonusPackageResource.insert(_newBonusPackageData);
  if (!insertNewBonus) {
    Logger.error(`can not insertNewBonus for appUserId ${appUserId} - bonusPackageId ${bonusPackageId}`);
    return;
  }
}
async function checkBonusAvaibility(appUserId) {
  //count existing bonus package, if available then we will proceed, else we skip it
  let _existingBonusPackagesCount = await ServicePackageResource.count({
    packageCategory: PACKAGE_CATEGORY.BONUS,
    isDeleted: false
  });

  if (!_existingBonusPackagesCount || _existingBonusPackagesCount.length <= 0) {
    return;
  }
  _existingBonusPackagesCount = _existingBonusPackagesCount[0].count;
  if (_existingBonusPackagesCount <= 0) {
    return;
  }

  //count userReferralCount, if available then we will proceed, else we skip it
  let _userReferralCount = await AppUserResource.count({
    referUserId: appUserId
  });
  if (!_userReferralCount || _userReferralCount.length <= 0) {
    _userReferralCount = 0;
  } else {
    _userReferralCount = _userReferralCount[0].count;
  }

  //count number of package that user buy
  let _totalReferPayment = await ServicePackageUserViews.sum('packagePaymentAmount', {
    referUserId: appUserId,
  });
  if (!_totalReferPayment || _totalReferPayment.length <= 0) {
    _totalReferPayment = 0;
  } else {
    _totalReferPayment = _totalReferPayment[0].sumResult;
  }
  //find available bonus packages
  let _bonusPackages = await ServicePackageResource.countByReferral({
    packageCategory: PACKAGE_CATEGORY.BONUS,
  }, _userReferralCount, _totalReferPayment);

  if (_bonusPackages && _bonusPackages.length > 0) {
    for (let i = 0; i < _bonusPackages.length; i++) {
      const _bonusPackage = _bonusPackages[i];
      await _addBonusPackageForUser(appUserId, _bonusPackage.paymentServicePackageId);
    }
  }
}

async function userBuyServicePackage(user, packageId) {
  const FUNC_FAILED = undefined;
  //find user selecting package
  let package = await ServicePackageResource.find({
    paymentServicePackageId: packageId,
  }, 0, 1);
  if (package === undefined || package.length < 1) {
    Logger.error(`userBuyServicePackage invalid package ${packageId}`);
    return FUNC_FAILED;
  }
  package = package[0];

  //find user exisitng package
  let existingPackages = await ServicePackageUser.find({
    paymentServicePackageId: packageId,
    appUserId: user.appUserId,
  }, 0, 5);
  if (existingPackages && existingPackages.length > 0) {
    for (let counter = 0; counter < existingPackages.length; counter++) {
      const _existedPackage = existingPackages[counter];
      if (_existedPackage.packageActivityStatus !== ACTIVITY_STATUS.COMPLETED) {
        Logger.error(`userBuyServicePackage existing package ${packageId}`);
        return FUNC_FAILED;
      }
    }
  }

  if (package.isHidden === 1) {
    Logger.error(`item is hidden ${packageId}`);
    return FUNC_FAILED;
  }
  if (package.packageStatus === PACKAGE_STATUS.SOLD) {
    Logger.error(`item is sold ${packageId}`);
    return FUNC_FAILED;
  }

  //tam thoi du an nay chua can thanh toan
  // //retrieve wallet info to check balance
  // let userWallet = await WalletResource.find({
  //   appUserId: user.appUserId,
  //   walletType: WALLET_TYPE.USDT
  // }, 0, 1);
  // if (userWallet === undefined || userWallet.length < 1) {
  //   Logger.error(`userBuyServicePackage can not wallet USDT ${user.appUserId}`)
  //   return FUNC_FAILED;
  // }
  // userWallet = userWallet[0];

  // //check if wallet balance is enough to pay or not
  let paymentAmount = package.packageDiscountPrice === null ? package.packagePrice : package.packageDiscountPrice;
  // if (userWallet.balance - paymentAmount < 0) {
  //   Logger.error(`userBuyServicePackage do not have enough balance`)
  //   return FUNC_FAILED;
  // };

  // //update wallet balance
  // let updateWallet = await WalletResource.decrementBalance(userWallet.walletId, paymentAmount);

  //TEMP data (tam thoi du an nay chua can wallet)
  let updateWallet = true;

  if (updateWallet) {

    //TEMP data (tam thoi du an nay chua can wallet)
    // //store payment history record 
    // let paymentRecordData = {
    //   paymentUserId: user.appUserId,
    //   paymentTargetId: package.paymentServicePackageId,
    //   paymentTitle: `Purchase service package: ${package.packageName}`,
    //   paymentTargetType: "SERVICE_PACKAGE",
    //   paymentAmount: paymentAmount,
    //   walletBalanceBefore: userWallet.balance,
    //   walletBalanceAfter: userWallet.balance - paymentAmount,
    // }
    // let newPaymentRecord = await PaymentRecordResource.insert(paymentRecordData);
    // if (newPaymentRecord === undefined) {
    //   Logger.error(`userBuyServicePackage can not store payment record user ${user.appUserId} - packageId ${packageId} `)
    // }

    // //create new wallet follow balance unit if wallet is not existed
    // let newUnitWallet = await WalletResource.find({
    //   appUserId: user.appUserId,
    //   walletType: WALLET_TYPE.FAC,
    //   walletBalanceUnitId: package.packageUnitId
    // });
    // if (newUnitWallet && newUnitWallet.length > 0) {
    //   //if wallet existed, then do nothing
    // } else {
    //   let createNewUnitWallet = await WalletResource.insert({
    //     appUserId: user.appUserId,
    //     walletType: WALLET_TYPE.FAC,
    //     walletBalanceUnitId: package.packageUnitId
    //   });
    //   if (createNewUnitWallet === undefined) {
    //     Logger.error(`userBuyServicePackage can not create new wallet FAC user ${user.appUserId} - unitId ${package.packageUnitId}`)
    //   }
    // }

    //store working package 
    let userPackageData = {
      appUserId: user.appUserId,
      paymentServicePackageId: packageId,
      packageExpireDate: moment().add(package.packageDuration, 'days').toDate(),
      profitEstimate: package.packagePerformance,
      packagePrice: package.packagePrice,
      packageDiscountPrice: package.packageDiscountPrice,
      packagePaymentAmount: paymentAmount,
      packageLastActiveDate: new Date(),
      packageCurrentPerformance: package.packagePerformance,
      packageActivityStatus: ACTIVITY_STATUS.PENDING
    };
    let newPackageResult = await ServicePackageUser.insert(userPackageData);
    if (newPackageResult) {
      //check to add bonus packages
      //Tam thoi chua can chuc nang nay
      // await checkBonusAvaibility(user.appUserId);
      // await checkBonusAvaibility(user.referUserId)

      // update package is sold
      // await ServicePackageResource.updateById(packageId, { packageStatus: PACKAGE_STATUS.SOLD });
      
      return newPackageResult;
    } else {
      Logger.error(`userBuyServicePackage can not record user ${user.appUserId} - packageId ${packageId}`)
      return FUNC_FAILED;
    }
  } else {
    Logger.error(`userBuyServicePackage can not pay to wallet ${userWallet.walletId}, ${paymentAmount}`)
    return FUNC_FAILED;
  }
}

async function userCollectServicePackage(user, packageId) {
  const FUNC_FAILED = undefined;
  //find user selecting package
  let package = await ServicePackageWalletViews.find({
    paymentServicePackageUserId: packageId,
    appUserId: user.appUserId
  }, 0, 1);
  if (package === undefined || package.length < 1) {
    Logger.error(`userCollectServicePackage invalid package ${packageId}`);
    return FUNC_FAILED;
  }
  package = package[0];

  //retrieve wallet info to check balance
  let userWallet = await WalletResource.find({
    appUserId: user.appUserId,
    walletBalanceUnitId: package.walletBalanceUnitId
  }, 0, 1);

  if (userWallet === undefined || userWallet.length < 1) {
    Logger.error(`userCollectServicePackage can not find wallet POINT ${appUserId}`)
    return FUNC_FAILED;
  }
  userWallet = userWallet[0];

  let collectAmount = package.profitActual;
  let claimedAmount = package.profitClaimed * 1 + collectAmount * 1;
  let updatedPackageData = {
    profitActual: 0,
    profitClaimed: claimedAmount,
    packageActivityStatus: ACTIVITY_STATUS.WORKING,
  }
  //tam thoi chua co gioi han so luong dao
  // if (claimedAmount >= package.profitEstimate) {
  //   updatedPackageData.packageActivityStatus = ACTIVITY_STATUS.COMPLETED
  // }

  let collectUpdated = await ServicePackageUser.updateById(packageId, updatedPackageData);
  if (collectUpdated === undefined) {
    Logger.error(`userCollectServicePackage can not collect`)
    return FUNC_FAILED;
  }

  //update wallet balance
  let updateWallet = await WalletResource.incrementBalance(userWallet.walletId, collectAmount);
  if (updateWallet) {
    return collectAmount;
  } else {
    Logger.error(`userBuyServicePackage can not pay to wallet ${userWallet.walletId}, ${paymentAmount}`)
    return FUNC_FAILED;
  }
}

async function userActivateServicePackage(user, packageId) {
  const FUNC_FAILED = undefined;
  //find user selecting package
  let package = await ServicePackageWalletViews.find({
    paymentServicePackageUserId: packageId,
    appUserId: user.appUserId,
    packageActivityStatus: ACTIVITY_STATUS.STANDBY
  }, 0, 1);
  if (package === undefined || package.length < 1) {
    Logger.error(`userCollectServicePackage invalid package ${packageId}`);
    return FUNC_FAILED;
  }
  package = package[0];

  let _packageExpire = new Date(package.packageExpireDate) - 1;
  if (_packageExpire > (new Date() - 1)) {
    let collectUpdated = await ServicePackageUser.updateById(packageId, {
      packageActivityStatus: ACTIVITY_STATUS.WORKING,
      packageLastActiveDate: new Date()
    });

    if (collectUpdated === undefined) {
      Logger.error(`userCollectServicePackage can not collect`)
      return FUNC_FAILED;
    } else {
      return collectUpdated;
    }

  } else {
    Logger.error(`_packageExpire - package ${packageId}`);
    return FUNC_FAILED;
  }
}
async function __completedRateted(countDay) {
  //  Thanh lí từ 90 ngày trở xuống thì sẽ chịu phí 7%
  if (countDay <= 90) {
    return 0.07
  }
  //Còn nếu thanh lí từ ngày 91 thì được tăng giá trị lên 30% và cứ để sau 90 ngày thì giá sẽ được tăng 30%,
  if (countDay > 90 && countDay <= 181) {
    return 0.3
  }
  if (countDay > 181 && countDay <= 271) {
    return 0.6
  }
  if (271 < countDay && countDay < 361) {
    return 0.9
  }
  if (361 <= countDay) {
    return 1.2
  }
}

async function _completeUserServicePackage(userPackage) {
  //neu da complete thi se khong complete duoc nua
  if (userPackage.packageActivityStatus === ACTIVITY_STATUS.COMPLETED) {
    Logger.error(`package was completed before`);
    return FUNC_FAILED;
  }

  //% phi khi thanh ly
  ////phi thanh ly luon la 7%
  let _returnFeeRate = 7 / 100;

  //tinh toan thoi gian da dao
  let day = Date.now();
  today = moment(new Date(day))
  let dayActivePackage = moment(new Date(userPackage.createdAt));
  let dayComplete = today.diff(dayActivePackage, 'days')
  let _completedRate = await __completedRateted(dayComplete);

  //tim kiem thong tin vi cua user
  let usdtWallet = await WalletResource.find({
    appUserId: userPackage.appUserId,
    walletType: WALLET_TYPE.USDT
  }, 0, 1);

  if (!usdtWallet || usdtWallet.length < 1) {
    console.error("usdtWallet is invalid");
    return undefined;
  }
  usdtWallet = usdtWallet[0];

  let returnAmount = 0;

  //phi thanh ly luon la 7%
  returnAmount = userPackage.packagePrice - userPackage.packagePrice * _returnFeeRate;

  //cap nhat thong tin package
  let _userPackageUpdatedData = {
    packageActivityStatus: ACTIVITY_STATUS.COMPLETED,
    percentCompleted: _completedRate
  }
  let result = await ServicePackageUser.updateById(userPackage.paymentServicePackageUserId, _userPackageUpdatedData);
  if (result) {
    //cap nhat so du cua Vi
    let updateWalletResult = await WalletResource.incrementBalance(usdtWallet.walletId, returnAmount);
    if (updateWalletResult) {
      return updateWalletResult
    } else {
      Logger.error(`WalletResource.incrementBalance usdtWallet.walletId ${usdtWallet.walletId}`);
      return undefined;
    }
  } else {
    Logger.error(`_completeUserServicePackage Failse`);
    return FUNC_FAILED;
  }
}

async function adminCompleteUserServicePackage(paymentServicePackageUserId, staff) {
  const FUNC_FAILED = undefined;

  let _filterData = {
    paymentServicePackageUserId: paymentServicePackageUserId,
  };

  let packageUser = await ServicePackageUserViews.find(_filterData, 0, 1);

  //khong tim thay package can xu ly
  if (packageUser === undefined || packageUser.length < 1) {
    Logger.error(`userCompledServicePackage invalid package ${paymentServicePackageUserId}`);
    return FUNC_FAILED;
  }
  packageUser = packageUser[0];

  let completeResult = await _completeUserServicePackage(packageUser);

  return completeResult;
}

async function userCompleteUserServicePackage(paymentServicePackageUserId, user) {
  const FUNC_FAILED = undefined;

  let _filterData = {
    paymentServicePackageUserId: paymentServicePackageUserId,
  };

  //neu user chu dong Complete package nay thi se loc theo thong tin user
  //de dam bao khong complete package cua user khac
  if (user) {
    _filterData.appUserId = user.appUserId
  }

  let packageUser = await ServicePackageUserViews.find(_filterData, 0, 1);

  //khong tim thay package can xu ly
  if (packageUser === undefined || packageUser.length < 1) {
    Logger.error(`userCompledServicePackage invalid package ${paymentServicePackageUserId}`);
    return FUNC_FAILED;
  }
  packageUser = packageUser[0];

  //user khong duoc tu complete package THUONG
  if (user && packageUser.packageCategory === PACKAGE_CATEGORY.BONUS) {
    Logger.error(`package is auto completed`);
    return FUNC_FAILED;
  }

  let completeResult = await _completeUserServicePackage(packageUser);
  return completeResult;
}

module.exports = {
  userBuyServicePackage,
  userCollectServicePackage,
  userActivateServicePackage,
  checkBonusAvaibility,
  adminCompleteUserServicePackage,
  userCompleteUserServicePackage,
};
