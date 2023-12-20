/**
 * Created by Huu on 11/18/21.
 */

"use strict";
const SystemConfigurationsResourceAccess = require("../resourceAccess/SystemConfigurationsResourceAccess");
const Logger = require("../../../utils/logging");

async function find(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await SystemConfigurationsResourceAccess.find();

			if (data) {
				resolve({ data: data, total: 1 });
			} else {
				resolve({ data: [], total: 0 });
			}
		} catch (e) {
			Logger.error(__filename, e);
			reject("failed");
		}
	});
}

async function updateById(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let config = await SystemConfigurationsResourceAccess.find();
			let data = req.payload.data;
			let result = await SystemConfigurationsResourceAccess.updateById(
				config[0].systemConfigurationsId,
				data,
			);
			if (result) {
				resolve(result);
			}
			reject("failed");
		} catch (e) {
			Logger.error(__filename, e);
			reject("failed");
		}
	});
}

async function userGetDetail(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await SystemConfigurationsResourceAccess.find();

			if (data && data.length > 0) {
				resolve(data[0]);
			} else {
				reject("failed");
			}
		} catch (e) {
			Logger.error(__filename, e);
			reject("failed");
		}
	});
}

module.exports = {
	find,
	updateById,
	userGetDetail,
};
