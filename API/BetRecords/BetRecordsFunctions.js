/**
 * Created by A on 7/18/17.
 */
'use strict';

const BetRecordsResource = require('./resourceAccess/BetRecordsResourceAccess');
const { BET_STATUS } = require('./BetRecordsConstant');

function getCurrentBetSection() {
  let currentTime = new Date();
  let currentMinutes = currentTime.getMinutes() * 1 + 1;
  let currentHour = currentTime.getHours();
  if (currentMinutes >= 60) {
    currentMinutes = 0;
    currentHour = currentHour + 1;
    if (currentHour >= 24) {
      currentHour = 0;
    }
  }
  return `${currentHour}:${currentMinutes}:00`;
}

async function _placeNewBet(userId, betRecordAmountIn, betRecordType, betRecordUnit, referUserPackageId) {
  let newBetData = {
    appUserId: userId,
    betRecordSection: getCurrentBetSection(),
    betRecordAmountIn: betRecordAmountIn,
    betRecordType: betRecordType,
    betRecordUnit: betRecordUnit,
    betRecordStatus: BET_STATUS.COMPLETED,
  }
  if (referUserPackageId && referUserPackageId > 0) {
    newBetData.referUserPackageId = referUserPackageId;
  }
  let newBetResult = await BetRecordsResource.insert(newBetData);
  return newBetResult;
}

async function placeUserBet(userId, betRecordAmountIn, betRecordType, betRecordUnit, referUserPackageId) {
  if (!userId || userId < 1) {
    console.error("null userid can not place bet");
    return undefined;
  }

  return await _placeNewBet(userId, betRecordAmountIn, betRecordType, betRecordUnit, referUserPackageId);
}


module.exports = {
  placeUserBet,
  getCurrentBetSection,
}