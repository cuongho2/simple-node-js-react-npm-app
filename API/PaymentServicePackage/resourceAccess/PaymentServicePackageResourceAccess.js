"use strict";
require("dotenv").config();

const Logger = require('../../../utils/logging');
const { DB, timestamps } = require("../../../config/database");
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const { PACKAGE_STATUS, PACKAGE_CATEGORY, PACKAGE_TYPE } = require('../PaymentServicePackageConstant');
const tableName = "PaymentServicePackage";
const primaryKeyField = "paymentServicePackageId";

async function createTable() {
  Logger.info('ResourceAccess', `createTable ${tableName}`);
  return new Promise(async (resolve, reject) => {
    DB.schema.dropTableIfExists(`${tableName}`).then(() => {
      DB.schema
        .createTable(`${tableName}`, function (table) {
          table.increments(`${primaryKeyField}`).primary();
          table.string('packageName'); //<< Tên gói cước 
          table.string('packageType'); //<< Loai goi cuoc
          table.string('packageDescription', 500); //<< Mô tả gói cước 
          table.double('packagePrice'); // << gia goi cuoc
          table.double('packageDiscountPrice').nullable(); // << gia goi cuoc khuyen mai
          table.double('packagePerformance'); // << so buoi tap
          table.string('packageCategory').defaultTo(PACKAGE_CATEGORY.NORMAL); // << phan loai
          table.string('packageImage', 500); // << hinh anh cua goi
          table.double('packageDuration').defaultTo(365); // << thoi han cua package
          table.integer('packageUnitId'); // don vi coin map `walletBalanceUnitId`
          table.integer('packageStatus').defaultTo(PACKAGE_STATUS.NEW); // HOT-NEW-NORMAL
          timestamps(table);
          table.index(`${primaryKeyField}`);
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
  // let paymentPackages = [
  // ];
  return new Promise(async (resolve, reject) => {
    // DB(`${tableName}`).insert(paymentPackages).then((result) => {
      // Logger.info(`${tableName}`, `seeding ${tableName}` + result);
      resolve();
    // });
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

async function countByReferral(filter, userReferralCount = 0, totalReferPayment = 0) {
  let queryBuilder = DB(tableName);
  if (filter) {
    queryBuilder.where(filter);
  }

  queryBuilder.where({ isDeleted: 0 });
  queryBuilder.orderBy("createdAt", "desc")

  return new Promise((resolve, reject) => {
    try {
      queryBuilder.select()
        .then(records => {
          resolve(records);
        });
    } catch (e) {
      Logger.error("ResourceAccess", `DB countByReferral ERROR: ${tableName} : ${JSON.stringify(filter)}`);
      Logger.error("ResourceAccess", e);
      reject(undefined);
    }
  });
}

module.exports = {
  insert,
  find,
  count,
  updateById,
  findById,
  deleteById,
  initDB,
  countByReferral
};
