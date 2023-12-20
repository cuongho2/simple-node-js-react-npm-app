"use strict";
require("dotenv").config();
const { DB, timestamps } = require("../../../config/database");
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const { WITHDRAW_TRX_STATUS } = require('../PaymentWithdrawTransactionConstant');
const tableName = "PaymentWithdrawTransaction";
const primaryKeyField = "paymentWithdrawTransactionId";
async function createTable() {
  console.log(`createTable ${tableName}`);
  return new Promise(async (resolve, reject) => {
    DB.schema.dropTableIfExists(`${tableName}`).then(() => {
      DB.schema
        .createTable(`${tableName}`, function (table) {
          table.increments('paymentWithdrawTransactionId').primary();
          table.integer('appUserId');
          table.integer('walletId');
          table.integer('referId'); // nguoi gioi thieu
          table.integer('paymentMethodId');
          table.float('paymentAmount', 48, 24).defaultTo(0);
          table.float('balanceBefore', 48, 24).defaultTo(0);
          table.float('balanceAfter', 48, 24).defaultTo(0);
          table.float('paymentRewardAmount', 48, 24).defaultTo(0);
          table.string('paymentUnit'); //don vi tien
          table.string('paymentStatus').defaultTo(WITHDRAW_TRX_STATUS.NEW);
          table.string('paymentNote').defaultTo(''); //Ghi chu hoa don
          table.string('paymentRef').defaultTo(''); //Ma hoa don ngoai thuc te
          table.timestamp('paymentApproveDate',{ useTz: true }); // ngay duyet
          table.integer('paymentPICId');  // nguoi duyet
          timestamps(table);
          table.index('appUserId');
          table.index('walletId');
          table.index('referId');
        })
        .then(() => {
          console.log(`${tableName} table created done`);
          resolve();
        });
    });
  });
}

async function initDB() {
  await createTable();
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

async function customSum(filter, startDate, endDate) {
  const _field = 'paymentAmount';

  let queryBuilder = DB(tableName);
  if (startDate) {
    DB.where('createdAt', '>=', startDate);
  }

  if (endDate) {
    DB.where('createdAt', '<=', endDate);
  }

  if (filter.referAgentId) {
    DB.where('referId', referAgentId);
  }

  DB.where({
    status: WITHDRAW_TRX_STATUS.COMPLETED
  });

  return new Promise((resolve, reject) => {
    try {
      queryBuilder.sum(`${_field} as sumResult`)
        .then(records => {
          if (records && records[0].sumResult === null) {
            resolve(undefined)
          } else {
            resolve(records);
          }
        });
    }
    catch (e) {
      Logger.error("ResourceAccess", `DB SUM ERROR: ${tableName} ${field}: ${JSON.stringify(filter)}`);
      Logger.error("ResourceAccess", e);
      reject(undefined);
    }
  });
}

async function sumAmountDistinctByDate(filter, startDate, endDate) {
  return await Common.sumAmountDistinctByDate(tableName, 'paymentAmount', filter, startDate, endDate);
}
module.exports = {
  insert,
  find,
  count,
  updateById,
  initDB,
  customSum,
  sumAmountDistinctByDate
};
