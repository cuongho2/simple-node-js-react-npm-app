/**
 * Created by A on 7/18/17.
 */
"use strict";

const BalanceUnitResource = require("./resourceAccess/WalletBalanceUnitResourceAccess");

async function insertNewBalanceUnit(data) {
  let createdResult = await BalanceUnitResource.insert(data);
  return createdResult;
}

module.exports = {
  insertNewBalanceUnit
};
