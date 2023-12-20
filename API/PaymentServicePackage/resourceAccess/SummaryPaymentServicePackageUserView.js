"use strict";
require("dotenv").config();
const { DB } = require("../../../config/database");
const Common = require('../../Common/resourceAccess/CommonResourceAccess');

const tableName = "SummaryPaymentServicePackageUserView";
const rootTableName = 'AppUserViews';
const primaryKeyField = "appUserId";
async function createView() {
  const PaymentServicePackageUserTable = 'PaymentServicePackageUser';

  let fields = [
    `${rootTableName}.appUserId`,
    // `${rootTableName}.sotaikhoan`,
    // `${rootTableName}.tentaikhoan`,
    // `${rootTableName}.tennganhang`,
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
    `${rootTableName}.isDeleted`,
    `${rootTableName}.referUserId`,
    // `${rootTableName}.appUserMembershipTitle`,
    // `${rootTableName}.memberReferIdF1`,
    // `${rootTableName}.memberReferIdF2`,
    // `${rootTableName}.memberReferIdF3`,
    // `${rootTableName}.memberReferIdF4`,
    // `${rootTableName}.memberReferIdF5`,
  ];

  var viewDefinition = DB.select(fields)
  .from(rootTableName)
  .sum('packagePaymentAmount as totalpackagePaymentAmount')
  .sum('profitActual as totalProfitActual')
  .sum('profitClaimed as totalProfitClaimed')
  .count('paymentServicePackageUserId as totalCount')
  .groupBy(`${rootTableName}.appUserId`)
  .orderBy(`${rootTableName}.appUserId`)
  .leftJoin(PaymentServicePackageUserTable, function () {
    this.on(`${rootTableName}.appUserId`, '=', `${PaymentServicePackageUserTable}.appUserId`)
  })

  Common.createOrReplaceView(tableName, viewDefinition)
}

async function initViews() {
  createView();
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

function _makeQueryBuilderForReferedUser(appUserId, skip, limit, startDate, endDate, searchText, order) {
  let queryBuilder = DB(tableName);

  let filterData = {};

  if (searchText) {
    queryBuilder.where(function () {
      this.orWhere('username', 'like', `%${searchText}%`)
        .orWhere('firstName', 'like', `%${searchText}%`)
        .orWhere('lastName', 'like', `%${searchText}%`)
        .orWhere('phoneNumber', 'like', `%${searchText}%`)
        .orWhere('email', 'like', `%${searchText}%`)
    })
  }

  if (startDate) {
    queryBuilder.where("createdAt", ">=", startDate);
  }
  if (endDate) {
    queryBuilder.where("createdAt", "<=", endDate);
  }

  queryBuilder.where(filterData);

  if (limit) {
    queryBuilder.limit(limit);
  }

  if (skip) {
    queryBuilder.offset(skip);
  }

  if (appUserId) {
    queryBuilder.where(function () {
      this.orWhere('memberReferIdF1', appUserId)
        .orWhere('memberReferIdF2', appUserId)
        .orWhere('memberReferIdF3', appUserId)
        .orWhere('memberReferIdF4', appUserId)
        .orWhere('memberReferIdF5', appUserId)
    })
  }
  
  if (order && order.key !== '' && order.value !== '' && (order.value === 'desc' || order.value === 'asc')) {
    queryBuilder.orderBy(order.key, order.value);
  } else {
    queryBuilder.orderBy("createdAt", "desc")
  }

  return queryBuilder;
}

async function findReferedUserByUserId(appUserId, skip, limit) {
  let queryBuilder = _makeQueryBuilderForReferedUser(appUserId, skip, limit);
  return await queryBuilder.select();
}

async function countReferedUserByUserId(appUserId) {
  let queryBuilder = _makeQueryBuilderForReferedUser(appUserId);
  return await queryBuilder.count(`${primaryKeyField} as count`);
}

module.exports = {
  insert,
  find,
  count,
  updateById,
  initViews,
  sum,
  findReferedUserByUserId,
  countReferedUserByUserId,
};
