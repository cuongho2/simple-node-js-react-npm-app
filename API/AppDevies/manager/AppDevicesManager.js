"use strict";
const AppDevicesResourceAccess = require("../resourceAccess/AppDevicesResourceAccess");
const AppDeviesViews = require("../resourceAccess/AppDevicesView")
async function insert(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let deviceData = req.payload;
            await AppDevicesResourceAccess.insert(deviceData);
            resolve("done");
        } catch (e) {
            console.error(e);
            reject("failed");
        }
    });
};

async function find(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let filter = req.payload.filter;
            let skip = req.payload.skip;
            let limit = req.payload.limit;
            let order = req.payload.order;
            let searchText = req.payload.searchText;
            let deviceList = await AppDeviesViews.customSearch(filter, skip, limit, searchText, order);
            let deviceCount = await AppDeviesViews.customCount(filter, searchText, order);
            if (deviceList && deviceCount && deviceList.length > 0) {
                resolve({
                    data: deviceList,
                    total: deviceCount,
                });
            } else {
                resolve({
                    data: [],
                    total: 0,
                });
            }
        } catch (e) {
            console.error(e);
            reject("failed");
        }
    });
};

async function updateById(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let updateResult = await AppDevicesResourceAccess.updateById(req.payload.id, req.payload.data);
            if (updateResult) {
                resolve(updateResult);
            } else {
                resolve({});
            }
        } catch (e) {
            console.error(e);
            reject("failed");
        }
    });
};

async function findById(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let deviceList = await AppDeviesViews.find({ appDeviceId: req.payload.id });
            if (deviceList) {
                resolve(deviceList[0]);
            } else {
                resolve({});
            }
            resolve("success");
        } catch (e) {
            console.error(e);
            reject("failed");
        }
    });
};

async function deleteById(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let AppDeviceId = req.payload.id;

            let result = await AppDevicesResourceAccess.deleteById(AppDeviceId);
            if (result) {
                resolve(result);
            }
            else {
                reject("failed");
            }

        } catch (e) {

            Logger.error(__filename, e);
            reject("failed");
        }
    });
};
module.exports = {
    insert,
    find,
    updateById,
    findById,
    deleteById
};
