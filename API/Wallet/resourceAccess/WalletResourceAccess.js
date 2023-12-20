"use strict";
require("dotenv").config();
const { DB, timestamps } = require("../../../config/database");
const Common = require('../../Common/resourceAccess/CommonResourceAccess');
const tableName = "Wallet";
const primaryKeyField = "walletId";
const { WALLET_TYPE, BALANCE_UNIT } = require('../WalletConstant');

async function createTable() {
  console.log(`createTable ${tableName}`);
  return new Promise(async (resolve, reject) => {
    DB.schema.dropTableIfExists(`${tableName}`).then(() => {
      DB.schema
        .createTable(`${tableName}`, function (table) {
          table.increments('walletId').primary();
          table.integer('appUserId');
          table.string('walletType').defaultTo(WALLET_TYPE.POINT);
          table.float('balance', 48, 24).defaultTo(0);
          table.string('balanceUnit').defaultTo(BALANCE_UNIT.VND);
          table.integer('walletBalanceUnitId').defaultTo(0);
          table.string('lastDepositAt');
          table.string('walletAddress'); //use for crypto wallet
          table.string('walletPrivatekey'); //use for crypto wallet
          table.string('walletNote');
          timestamps(table);
          table.index('walletId');
          table.index('appUserId');
          table.index('walletType');
          table.index('balance');
          table.index('balanceUnit');
          table.index('walletBalanceUnitId');
          table.index('lastDepositAt');
          table.index('walletAddress');
          table.index('walletPrivatekey');
          table.index('walletNote');
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

async function incrementBalance(id, amount) {
  return await Common.incrementFloat(tableName, primaryKeyField, id, 'balance', amount);
}

async function updateBalanceTransaction(walletsDataList) {
  try {
    await DB.transaction(async trx => {
      for (let i = 0; i < walletsDataList.length; i++) {
        let walletData = walletsDataList[i];

        await trx(tableName)
          .where({ walletId: walletData.walletId })
          .update({ balance: walletData.balance });
      }
    });
    return "ok";
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

async function findById(id) {
  let dataId = {};
  dataId[primaryKeyField] = id;
  return await Common.findById(tableName, dataId, id);
}

async function decrementBalance(id, amount) {
  return await Common.decrementFloat(tableName, primaryKeyField, id, 'balance', amount);
}

module.exports = {
  insert,
  find,
  count,
  updateById,
  initDB,
  updateBalanceTransaction,
  incrementBalance,
  findById,
  decrementBalance
};
