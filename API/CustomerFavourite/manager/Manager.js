/**
 * Created by A on 7/18/17.
 */
"use strict";
const ResourceAccess = require("../resourceAccess/ResourceAccess");
const rolesResourceAccess = require("../../Products/resourceAccess/ProductsResourceAccess");
const Logger = require("../../../utils/logging");

async function insert(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let data = req.payload;
			const { userId, productId } = data;
			ResourceAccess.find({ productId, userId }).then(async (resultCheck) => {
				if (resultCheck[0]) {
					let data = {
						isDeleted: 0,
					};
					await ResourceAccess.updateById(resultCheck[0].id, data);
					return resolve({
						message: "create susscessfull",
						data: resultCheck[0],
						statusCode: 200,
					});
				}

				ResourceAccess.insert(data).then((result) => {
					const id = result[0];
					ResourceAccess.find({ id }).then((result2) => {
						return resolve({
							message: "create susscessfull",
							data: result2[0],
							statusCode: 200,
						});
					});
				});
			});
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
			let appUserId = req?.currentUser?.appUserId;
			let roles = await ResourceAccess.customSearch(filter, skip, limit, order);
			let newData = [];
			for (const key in roles) {
				let Discount = null;
				let Favourite = [];
				let Color = {};
				let Size = [];
				let Designs = {};
				if (roles[key]["Products"] && roles[key]["Products"]["discountId"]) {
					Discount = await rolesResourceAccess.findByChildId(
						+roles[key]["Products"]["discountId"],
					);
				}

				if (roles[key]["Products"]) {
					if (filter.groupId) {
						Color = await rolesResourceAccess.findByAnyTableId(
							"Color",
							"id",
							+roles[key]["Products"]["colorId"],
						);
					}

					Size = await rolesResourceAccess.findProductSizeChildId(
						+roles[key]["Products"]["productsId"],
					);

					Designs = await rolesResourceAccess.findByAnyTableId(
						"Designs",
						"id",
						+roles[key]["Products"]["designsId"],
					);
					if (appUserId) {
						Favourite = await rolesResourceAccess.findFauvoriteChildId({
							userId: appUserId,
							productId: roles[key]["Products"]["productsId"],
							isDeleted: 0,
						});
					}
				}
				newData.push({
					...roles[key],
					Discount,
					Favourite: Favourite.length ? { ...Favourite[0] } : {},
					Color,
					Size,
					Designs,
				});
			}
			let rolesCount = await ResourceAccess.customCount(filter, order);
			if (newData && rolesCount) {
				resolve({ data: newData, total: rolesCount[0][""].count });
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
			let id = req.payload.id;
			let roleData = req.payload.data;
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

// async function findById(req) {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			resolve("success");
// 		} catch (e) {
// 			Logger.error(__filename, e);
// 			reject("failed");
// 		}
// 	});
// }

module.exports = {
	insert,
	find,
	updateById,
	deleteById,
	// findById,
};
