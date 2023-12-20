"use strict";
require("dotenv").config();
const { DB, timestamps } = require("../../../config/database")
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const { DEPOSIT_TRX_STATUS } = require('../PaymentDepositTransactionConstant');

const tableName = "PaymentDepositTransaction";
const primaryKeyField = "paymentDepositTransactionId";

async function createTable() {
  console.log(`createTable ${tableName}`);
  return new Promise(async (resolve, reject) => {
    DB.schema.dropTableIfExists(`${tableName}`).then(() => {
      DB.schema
        .createTable(`${tableName}`, function (table) {
          table.increments('paymentDepositTransactionId').primary();
          table.integer('appUserId');
          table.integer('walletId');
          table.integer('referId'); // nguoi gioi thieu
          table.integer('paymentMethodId');
          table.float('paymentAmount', 48, 24).defaultTo(0);
          table.float('paymentRewardAmount', 48, 24).defaultTo(0);
          table.string('paymentUnit'); //don vi tien
          table.string('paymentStatus').defaultTo(DEPOSIT_TRX_STATUS.NEW);
          table.string('paymentTransactionCode', 500).nullable();
          table.string('paymentNote').defaultTo(''); //Ghi chu hoa don
          table.string('paymentRef').defaultTo(''); //Ma hoa don ngoai thuc te
          table.timestamp('paymentApproveDate',{ useTz: true }); // ngay duyet
          table.integer('paymentPICId');  // nguoi duyet
          timestamps(table);
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

async function findById(id) {
  return await Common.findById(tableName, primaryKeyField, id);
}

async function find(filter, skip, limit, order) {
  return await Common.find(tableName, filter, skip, limit, order);
}

async function count(filter, order) {
  return await Common.count(tableName, primaryKeyField, filter, order);
}

async function customSearch(startDate, endDate) {
  let queryBuilder = DB(tableName);
  if (startDate) {
    queryBuilder.where("createdAt", ">=", startDate);
  }
  if (endDate) {
    queryBuilder.where("createdAt", "<=", endDate);
  }
  queryBuilder.where({ isDeleted: 0 });
  return await queryBuilder.select();
}

async function customSum(filter, startDate, endDate) {
  const _field = 'paymentAmount';

  let queryBuilder = DB(tableName);
  if (startDate) {
    queryBuilder.where("createdAt", ">=", startDate);
  }
  if (endDate) {
    queryBuilder.where("createdAt", "<=", endDate);
  }
  queryBuilder.where({ isDeleted: 0 });

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
    } catch (e) {
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
  customSearch,
  findById,
  modelName: tableName,
  customSum,
  sumAmountDistinctByDate
};
