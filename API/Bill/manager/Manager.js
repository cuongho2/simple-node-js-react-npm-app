/**
 * Created by A on 7/18/17.
 */
"use strict";
const ResourceAccess = require("../resourceAccess/ResourceAccess");
const rolesResourceAccess = require("../../Products/resourceAccess/ProductsResourceAccess");
const Logger = require("../../../utils/logging");
const ApiUtilsFunctions = require("../../ApiUtils/utilFunctions");
const AppUsersFunctions = require("../../AppUsers/AppUsersFunctions");
const formatDate = require("../../ApiUtils/utilFunctions");
async function insert(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = req.payload;

			ResourceAccess.insert({ ...data, orderCode: ApiUtilsFunctions.makeid(12) }).then(
				(result) => {
					const id = result[0];

					ResourceAccess.find({ id }).then(async (result2) => {
						await AppUsersFunctions.sendEmailBillToCustomer(result2[0]);
						return resolve({
							message: "create susscessfull",
							data: result2[0],
							statusCode: 200,
						});
					});
				},
			);
		} catch (e) {
			Logger.error(__filename, e);
			reject("failed");
		}
	});
}

async function find(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let filter = req.payload.filter;
			let skip = req.payload.skip;
			let limit = req.payload.limit;
			let order = req.payload.order;
			let endDate = req.payload.endDate;
			let startDate = req.payload.startDate;

			if (endDate) {
				endDate = formatDate.FormatDate(endDate, "");
			}
			if (startDate) {
				startDate = formatDate.FormatDate(startDate, "");
			}
			let searchText = req.payload.searchText;
			let roles = await ResourceAccess.customSearch(
				filter,
				skip,
				limit,
				startDate,
				endDate,
				searchText,
				order,
			);
			let rolesCount = await ResourceAccess.customCount(
				filter,
				startDate,
				endDate,
				searchText,
				order,
			);
			if (roles && rolesCount) {
				resolve({ data: roles, total: rolesCount[0].count });
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
			let id = req.params.id;
			let roleData = req.payload;
			let result = await ResourceAccess.updateById(id, roleData);
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

async function deleteById(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let id = req.params.id;
			let data = {
				isDeleted: 1,
			};

			let result = await ResourceAccess.updateById(id, data);
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
}

async function findById(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await ResourceAccess.findById(req.payload.orderCode);
			resolve(data);
		} catch (e) {
			Logger.error(__filename, e);
			reject("failed");
		}
	});
}

module.exports = {
	insert,
	find,
	updateById,
	deleteById,
	findById,
};
