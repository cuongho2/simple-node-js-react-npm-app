/**
 * Created by A on 7/18/17.
 */
"use strict";
const Logger = require('../../../utils/logging');
const CustomerMeasureRecordFunctions = require("../CustomerMeasureRecordFunctions");
const AppUserResource = require('../../AppUsers/resourceAccess/AppUsersResourceAccess');

async function userGetListMeasureRecord(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let appUserId = req.currentUser.appUserId;

      let foundUser = await AppUserResource.findById(appUserId);
      if (!foundUser) {
        reject("failed");
        return; //make sure everything stop
      }

      let customerPhone = foundUser.username;
      if (customerPhone.indexOf("84") === 0) {
        customerPhone = customerPhone.replace("84","0");
      }
      console.log(customerPhone);
      let result = await CustomerMeasureRecordFunctions.fetchAllRecordByPhone(customerPhone);

      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function userGetDetailMeasureRecordById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let measureId = req.payload.id;

      let result = await CustomerMeasureRecordFunctions.fetchRecordDetailById(measureId);

      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function staffGetListMeasureRecord(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let appUserId = req.payload.appUserId;

      let foundUser = await AppUserResource.findById(appUserId);
      if (!foundUser) {
        reject("failed");
        return; //make sure everything stop
      }

      let customerPhone = foundUser.username;
      if (customerPhone.indexOf("84") === 0) {
        customerPhone = customerPhone.replace("84","0");
      }
      console.log(customerPhone);
      let result = await CustomerMeasureRecordFunctions.fetchAllRecordByPhone(customerPhone);

      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};
module.exports = {
  userGetListMeasureRecord,
  userGetDetailMeasureRecordById,
  staffGetListMeasureRecord,
};
