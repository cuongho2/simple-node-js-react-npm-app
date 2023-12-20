"use strict";
require("dotenv").config();

const Logger = require('../../../utils/logging');
const { DB, timestamps } = require("../../../config/database");
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const tableName = "PaymentServicePackageUser";
const primaryKeyField = "paymentServicePackageUserId";
const { ACTIVITY_STATUS } = require('../PaymentServicePackageConstant');
const moment = require('moment');

async function createTable() {
  Logger.info('ResourceAccess', `createTable ${tableName}`);
  return new Promise(async (resolve, reject) => {
    DB.schema.dropTableIfExists(`${tableName}`).then(() => {
      DB.schema
        .createTable(`${tableName}`, function (table) {
          table.increments(`${primaryKeyField}`).primary();
          table.integer('appUserId'); //<< User nguoi mua
          table.integer('paymentServicePackageId'); //<< goi cuoc 
          table.timestamp('packageExpireDate', { useTz: true }).defaultTo(DB.fn.now()); // << ngay het han
          table.timestamp('packageLastActiveDate', { useTz: true }).defaultTo(DB.fn.now());
          table.integer('packageActivityStatus').defaultTo(ACTIVITY_STATUS.WORKING); // << tinh trang hoat dong cua package
          table.double('packagePrice'); // << gia mua package tai thoi diem do
          table.double('packageDiscountPrice').nullable(); // << gia mua khuyen mai cua package tai thoi diem do
          table.double('packagePaymentAmount').nullable(); // << so tien thuc te ma nhan vien da thu
          table.string('packagePaymentImage', 500); // << hinh anh bill
          table.double('packagePauseCount').defaultTo(0); // << so lan tam hoan
          table.double('profitEstimate').defaultTo(0); // << loi ich du kien
          table.double('profitActual').defaultTo(0); // << loi ich thuc the
          table.double('profitClaimed').defaultTo(0); // << loi ich da nhan
          table.double('profitBonus').defaultTo(0); // << loi ich duoc thuong (admin tang hoac he thong tu thuong)
          table.double('packageCurrentPerformance').defaultTo(0); // << so FAC  khai thac theo giai doan
          table.float('percentCompleted').defaultTo(0)// phần trăm thanh lý
          timestamps(table);
          table.index(`${primaryKeyField}`);
          table.index(`appUserId`);
          table.index(`paymentServicePackageId`);
          table.index(`packageExpireDate`);
          table.index(`packagePauseCount`);
        })
        .then(async () => {
          Logger.info(`${tableName}`, `${tableName} table created done`);
          seeding().then(() => {
            resolve();
          });
        });
    });
  });
}

async function seeding() {
  return new Promise(async (resolve, reject) => {
    resolve();
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
async function findById(id) {
  let dataId = {};
  dataId[primaryKeyField] = id;
  return await Common.findById(tableName, dataId, id);
}

async function count(filter, order) {
  return await Common.count(tableName, primaryKeyField, filter, order);
}
async function deleteById(id) {
  let dataId = {};
  dataId[primaryKeyField] = id;
  return await Common.deleteById(tableName, dataId)
}

async function customSum(filter, field, startDate, endDate) {
  let queryBuilder = DB(tableName);
  if (startDate) {
    DB.where('createdAt', '>=', startDate);
  }

  if (endDate) {
    DB.where('createdAt', '<=', endDate);
  }

  return new Promise((resolve, reject) => {
    try {
      queryBuilder.sum(`${field} as sumResult`)
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

async function customCountAllPackage(id) {
  let query = DB(tableName)
    .whereNot('packageActivityStatus', ACTIVITY_STATUS.COMPLETED)
    .where('packageExpireDate', '>', new Date())
    .where('paymentServicePackageId', '=', id);
  return await query.count('* as count');
}

async function findGrantedPackage(id) {
  let query = DB(tableName)
    .whereNot('packageActivityStatus', ACTIVITY_STATUS.COMPLETED)
    .where('packageExpireDate', '>', new Date())
    .where('paymentServicePackageId', '=', id)
    .limit(100);
  return await query.select();
}
async function customCountDistinct(filter, distinctFields, startDate, endDate) {
  let queryBuilder = DB(tableName);
  if (startDate) {
    DB.where('createdAt', '>=', startDate);
  }

  if (endDate) {
    DB.where('createdAt', '<=', endDate);
  }
  return new Promise((resolve, reject) => {
    try {
      queryBuilder.countDistinct(` ${distinctFields} as CountResult`)
        .then(records => {
          if (records && records[0].sumResult === null) {
            resolve(undefined)
          } else {
            resolve(records);
          }
        });
    }
    catch (e) {
      Logger.error("ResourceAccess", `DB SUM ERROR: ${tableName} ${_field}: ${JSON.stringify(filter)}`);
      Logger.error("ResourceAccess", e);
      reject(undefined);
    }
  });
}
function _makeQueryBuilderByFilter(filter, skip, limit, startDate, endDate, order) {
  let queryBuilder = DB(tableName);
  let filterData = filter ? JSON.parse(JSON.stringify(filter)) : {};
  queryBuilder.where({ isDeleted: 0 });
  queryBuilder.where(filterData);

  if (startDate) {
    queryBuilder.where('createdAt', '>=', startDate)
  }

  if (endDate) {
    queryBuilder.where('createdAt', '<=', endDate)
  }

  if (limit) {
    queryBuilder.limit(limit);
  }

  if (skip) {
    queryBuilder.offset(skip);
  }
  if (
    order &&
    order.key !== "" &&
    order.value !== "" &&
    (order.value === "desc" || order.value === "asc")
  ) {
    queryBuilder.orderBy(order.key, order.value);
  } else {
    queryBuilder.orderBy("createdAt", "desc");
  }
  return queryBuilder;
}
async function customSearch(filter, skip, limit, startDate, endDate, order) {
  let query = _makeQueryBuilderByFilter(filter, skip, limit, startDate, endDate, order);
  return await query.select();
}
async function customCount(filter, startDate, endDate, order) {
  let query = _makeQueryBuilderByFilter(filter, undefined, undefined, startDate, endDate, order);
  return await query.count(`${primaryKeyField} as count`);
}

async function incrementBalance(id, field, amount) {
  return await Common.incrementFloat(tableName, primaryKeyField, id, `${field}`, amount);
}

module.exports = {
  insert,
  find,
  count,
  updateById,
  findById,
  deleteById,
  initDB,
  customSum,
  sumAmountDistinctByDate,
  customCountAllPackage,
  findGrantedPackage,
  customCountDistinct,
  customSearch,
  customCount,
  incrementBalance
};
