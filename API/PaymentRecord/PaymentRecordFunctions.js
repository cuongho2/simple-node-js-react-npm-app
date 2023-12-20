/**
 * Created by A on 7/18/17.
 */
'use strict';
let PaymentRecordResourceAccess = require('./resourceAccess/PaymentRecordResourceAccess');
const WalletResourAccess = require('../Wallet/resourceAccess/WalletResourceAccess');
const WalletType = require('../Wallet/WalletConstant').WALLET_TYPE;
const SystemConfiguration = require('../SystemConfigurations/resourceAccess/SystemConfigurationsResourceAccess')

const Logger = require('../../utils/logging');

async function userPaytoGetRealEstateContact(idUser, realEstateId) {
  let filterWallet = {};
  filterWallet.appUserId = idUser;
  filterWallet.walletType = WalletType.POINT;
  let resultWallet = await WalletResourAccess.find(filterWallet, undefined, undefined, undefined);
  let balanceSystem = await SystemConfiguration.find();
  if (resultWallet !== undefined && resultWallet.length > 0 && balanceSystem.length > 0) {
    let idWallet = resultWallet[0].walletId;
    let balanceWallet = resultWallet[0].balance;
    let amount = balanceSystem[0].coinNeedToGetInfoProjectOwner;
    if (balanceWallet < amount) {
      Logger.error(`user ${idUser} - wallet ${idWallet} do not have enough balance`)
      return "NOTENOUGHBALANCE"
    }
    let result = await WalletResourAccess.decrementBalance(idWallet, amount, "balance");
    if (result) {
      let data = {};
      data.paymentUserId = idUser;
      data.paymentTargetId = realEstateId;
      data.paymentTitle = "Xem thông tin liên hệ";
      data.paymentDetail = "Xem thông tin liên hệ";
      data.paymentTargetType = "REALESTATE";
      data.paymentTargetTypeName = "Xem thông tin liên hệ";
      data.walletId = idWallet;
      data.paymentAmount = amount;
      data.walletBalanceBefore = balanceWallet;
      let resultBalanceAfter = await WalletResourAccess.findById(idWallet);
      if (resultBalanceAfter) {
        data.walletBalanceAfter = resultBalanceAfter.balance;
      }
      await PaymentRecordResourceAccess.insert(data);
      return result
    }
  } else {
    Logger.error(`can not find wallet for user ${idUser} - or system configurations`)
  }
  return undefined
}

async function userPaytoPushNewRealEstate(idUser, realEstateId) {
  let filterWallet = {};
  filterWallet.appUserId = idUser;
  filterWallet.walletType = WalletType.POINT;
  let resultWallet = await WalletResourAccess.find(filterWallet, undefined, undefined, undefined);
  let balanceSystem = await SystemConfiguration.find();
  if (resultWallet !== undefined && resultWallet.length > 0 && balanceSystem.length > 0) {
    let idWallet = resultWallet[0].walletId;
    let balanceWallet = resultWallet[0].balance;
    let amount = balanceSystem[0].coinNeedToPushNewRealEstate;
    if (balanceWallet < amount) {
      Logger.error(`user ${idUser} - wallet ${idWallet} do not have enough balance`)
      return "NOTENOUGHBALANCE"
    }
    let result = await WalletResourAccess.decrementBalance(idWallet, amount, "balance");
    if (result) {
      let data = {};
      data.paymentUserId = idUser;
      data.paymentTargetId = realEstateId;
      data.paymentTitle = "Đẩy tin BDS";
      data.paymentDetail = "Đẩy tin BDS";
      data.paymentTargetType = "REALESTATE";
      data.paymentTargetTypeName = "Đẩy tin BDS";
      data.walletId = idWallet;
      data.paymentAmount = amount;
      data.walletBalanceBefore = balanceWallet;
      let resultBalanceAfter = await WalletResourAccess.findById(idWallet);
      if (resultBalanceAfter) {
        data.walletBalanceAfter = resultBalanceAfter.balance;
      }
      await PaymentRecordResourceAccess.insert(data);
      return result
    }
  } else {
    Logger.error(`can not find wallet for user ${idUser} - or system configurations`)
  }
  return undefined
}
module.exports = {
  userPaytoGetRealEstateContact,
  userPaytoPushNewRealEstate
}