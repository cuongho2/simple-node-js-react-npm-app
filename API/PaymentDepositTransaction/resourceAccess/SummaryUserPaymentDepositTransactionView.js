"use strict";
require("dotenv").config();
const { DB, timestamps } = require("../../../config/database")
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const tableName = "SummaryUserPaymentDepositTransactionView";
const { DEPOSIT_TRX_STATUS } = require('../PaymentDepositTransactionConstant');
const rootTableName = 'AppUser';
const primaryKeyField = "appUserId";
async function createUserDepositTransactionView() {
  const depositTableName = 'PaymentDepositTransaction';
  let fields = [
    `${rootTableName}.appUserId`,
    `${rootTableName}.createdAt`,
    `${rootTableName}.firstName`,
    `${rootTableName}.lastName`,
    `${rootTableName}.email`,
    `${rootTableName}.memberLevelName`,
    `${rootTableName}.active`,
    `${rootTableName}.ipAddress`,
    `${rootTableName}.phoneNumber`,
    `${rootTableName}.telegramId`,
    `${rootTableName}.facebookId`,
    `${rootTableName}.appleId`,
    `${rootTableName}.username`,
    `${rootTableName}.isHidden`,
    `${rootTableName}.isDeleted`,
    `${rootTableName}.referUserId`,
    `${depositTableName}.paymentStatus`,
  ];

  var viewDefinition = DB.select(fields)
  .from(depositTableName)
  .sum('paymentAmount as totalSum')
  .count('paymentDepositTransactionId as totalCount')
  .groupBy(`${rootTableName}.appUserId`)
  .groupBy(`${depositTableName}.paymentStatus`)
  .orderBy(`${rootTableName}.appUserId`)
  .leftJoin(rootTableName, function () {
    this.on(`${rootTableName}.appUserId`, '=', `${depositTableName}.appUserId`)
  })
  Common.createOrReplaceView(tableName, viewDefinition)
}

async function initViews() {
  createUserDepositTransactionView();
}

async function insert(data) {
  return await Common.insert(tableName, data);
}

async function updateById(id, data) {
  let dataId = {};
  dataId[primaryKeyField] = id;
  return await Common.updateById(tableName, dataId, data);
}

async function find(filter, skip, limit, order) {
  return await Common.find(tableName, filter, skip, limit, order);
}

async function count(filter, order) {
  return await Common.count(tableName, primaryKeyField, filter, order);
}

async function sum(field, filter, order) {
  return await Common.sum(tableName, field, filter, order);
}

//find any user that have balance bigger than requirement
async function findByMinBalance(minBalance, skip, limit) {
  let queryBuilder = DB(tableName);
  if(minBalance){
    queryBuilder.where('sumPaymentDepositTransactionAmount', '>=', minBalance);
  } else {
    return undefined;
  }

  if (limit) {
    queryBuilder.limit(limit);
  }

  if (skip) {
    queryBuilder.offset(skip);
  }

  queryBuilder.where({isDeleted: 0});
  queryBuilder.where({paymentStatus: DEPOSIT_TRX_STATUS.COMPLETED});
  return new Promise((resolve, reject) => {
    try {
      queryBuilder.select()
        .then(records => {
          resolve(records);
        });
    } catch (e) {
      resolve(undefined);
    }
  });
}

//find any user that have balance bigger than requirement
async function countByMinBalance(minBalance, skip, limit) {
  let queryBuilder = DB(tableName);
  if(minBalance){
    queryBuilder.where('sumPaymentDepositTransactionAmount', '>=', minBalance);
  } else {
    return undefined;
  }

  if (limit) {
    queryBuilder.limit(limit);
  }

  if (skip) {
    queryBuilder.offset(skip);
  }

  queryBuilder.where({paymentStatus: DEPOSIT_TRX_STATUS.COMPLETED});
  queryBuilder.where({isDeleted: 0});
  
  return new Promise((resolve, reject) => {
    try {
      queryBuilder.count(`${primaryKeyField} as count`)
        .then(records => {
          resolve(records);
        });
    } catch (e) {
      resolve(undefined);
    }
  });
}

module.exports = {
  insert,
  find,
  count,
  updateById,
  initViews,
  sum,
  findByMinBalance,
  countByMinBalance,
  modelName: tableName,
};
