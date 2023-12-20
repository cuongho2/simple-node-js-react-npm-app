/**
 * Created by A on 7/18/17.
 */
"use strict";
const StationProductsResourceAccess = require("../resourceAccess/ProductsResourceAccess");

const Logger = require("../../../utils/logging");
const formatDate = require("../../ApiUtils/utilFunctions");
const ImageUtils = require("../../ApiUtils/imageUtilsFunctions");
const ApiUtilsFunctions = require("../../ApiUtils/utilFunctions");
async function insert(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let stationProductsData = req.payload;

			//xu ly cap nhat thumbnail neu co update avatar
			// if (stationProductsData.stationProductsAvatar) {
			// 	let _thumbnailsUrl = await ImageUtils.createThumbnailsImage(
			// 		stationProductsData.stationProductsAvatar,
			// 	);
			// 	if (_thumbnailsUrl) {
			// 		stationProductsData.stationProductsAvatarThumbnails = _thumbnailsUrl;
			// 	}
			// }

			let result = await StationProductsResourceAccess.insert({
				...stationProductsData,
				slug: ApiUtilsFunctions.makeid(12),
			});
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

async function find(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let filter = req.payload.filter;
			let skip = req.payload.skip;
			let limit = req.payload.limit;
			let order = req.payload.order;
			let searchText = req.payload.searchText;
			let endDate = req.payload.endDate;
			let startDate = req.payload.startDate;

			if (endDate) {
				endDate = formatDate.FormatDate(endDate);
			}
			if (startDate) {
				startDate = formatDate.FormatDate(startDate);
			}

			if (!filter) {
				filter = {};
			}

			let stationProducts = await StationProductsResourceAccess.customSearch(
				filter,
				skip,
				limit,
				startDate,
				endDate,
				searchText,
				order,
			);
			let stationProductsCount = await StationProductsResourceAccess.customCount(
				filter,
				startDate,
				endDate,
				searchText,
				order,
			);
			if (stationProducts && stationProductsCount) {
				resolve({ data: stationProducts, total: stationProductsCount[0].count });
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
			let stationProductsId = req.payload.id;
			let stationProductsData = req.payload.data;

			let result = await StationProductsResourceAccess.updateById(
				stationProductsId,
				stationProductsData,
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

async function findById(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let stationProductsId = req.payload.id;
			let result = await StationProductsResourceAccess.findById(stationProductsId);
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
			let stationProductsId = req.payload.id;

			let result = await StationProductsResourceAccess.deleteById(stationProductsId);
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

async function userGetDetailProduct(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let stationProductsId = req.payload.id;
			let slug = req.payload.slug;
			let result = await StationProductsResourceAccess.findByIdCustom(
				slug || stationProductsId,
				slug ? "slug" : "productsId",
			);
			if (result && result[0]) {
				const Discount = await StationProductsResourceAccess.findByAnyTableId(
					"Discount",
					"id",
					+result[0]["Products"]["discountId"],
				);
				if (Discount) {
					result[0]["Discount"] = Discount;
				}

				const Category = await StationProductsResourceAccess.findByAnyTableId(
					"Category",
					"id",
					+result[0]["Products"]["productsCategory"],
				);
				if (Category) {
					result[0]["Category"] = Category;
				}

				const Size = await StationProductsResourceAccess.findProductSizeChildId(
					+result[0]["Products"]["productsId"],
				);
				if (Size) {
					result[0]["Size"] = Size;
				}

				const Designs = await StationProductsResourceAccess.findByAnyTableId(
					"Designs",
					"id",
					+result[0]["Products"]["designsId"],
				);
				if (Designs) {
					result[0]["Designs"] = Designs;
				}

				const Color = await StationProductsResourceAccess.findByAnyTableId(
					"Color",
					"id",
					+result[0]["Products"]["colorId"],
				);
				if (Color) {
					result[0]["Color"] = Color;
				}

				const Brand = await StationProductsResourceAccess.findByAnyTableId(
					"Brand",
					"id",
					+result[0]["Products"]["brandId"],
				);
				if (Brand) {
					result[0]["Brand"] = Brand;
				}

				resolve(result[0]);
			} else {
				reject("failed");
			}
		} catch (e) {
			Logger.error(__filename, e);
			reject("failed");
		}
	});
}

async function userGetListProduct(req) {
	return new Promise(async (resolve, reject) => {
		try {
			let appUserId = req?.currentUser?.appUserId;

			let filter = req.payload.filter;
			let skip = req.payload.skip;
			let limit = req.payload.limit;

			let searchText = req.payload.searchText;
			let endDate = req.payload.endDate;
			let startDate = req.payload.startDate;
			let prices = req.payload.prices;
			let designs = req.payload.designs;
			let sizes = req.payload.sizes;
			let colors = req.payload.colors;
			let order = req.payload.order;
			let stationProducts = await StationProductsResourceAccess.customSearch(
				filter,
				skip,
				limit,
				startDate,
				endDate,
				searchText,
				order,
				prices,
				designs,
				sizes,
				colors,
			);

			let newData = [];
			for (const key in stationProducts) {
				let Discount = null;
				let Favourite = [];
				let Color = {};
				let Size = [];
				let Designs = {};
				if (
					stationProducts[key]["Products"] &&
					stationProducts[key]["Products"]["designsId"]
				) {
					Designs = await StationProductsResourceAccess.findByAnyTableId(
						"Designs",
						"id",
						+stationProducts[key]["Products"]["designsId"],
					);
				}

				if (
					stationProducts[key]["Products"] &&
					stationProducts[key]["Products"]["discountId"]
				) {
					Discount = await StationProductsResourceAccess.findByAnyTableId(
						"Discount",
						"id",
						+stationProducts[key]["Products"]["discountId"],
					);
				}

				if (stationProducts[key]["Products"]) {
					Color = await StationProductsResourceAccess.findByAnyTableId(
						"Color",
						"id",
						+stationProducts[key]["Products"]["colorId"],
					);

					Size = await StationProductsResourceAccess.findProductSizeChildId(
						+stationProducts[key]["Products"]["productsId"],
					);

					if (appUserId) {
						Favourite = await StationProductsResourceAccess.findFauvoriteChildId({
							userId: appUserId,
							productId: stationProducts[key]["Products"]["productsId"],
							isDeleted: 0,
						});
					}
				}
				newData.push({
					...stationProducts[key],
					Discount,
					Favourite: Favourite.length ? { ...Favourite[0] } : {},
					Color,
					Size,
					Designs,
				});
			}
			if (stationProducts && stationProducts.length > 0) {
				let stationProductsCount = await StationProductsResourceAccess.customCount(
					filter,
					null,
					null,
					searchText,
					order,
					prices,
					designs,
					sizes,
					colors,
				);

				resolve({ data: newData, total: stationProductsCount[0][""].count });
			} else {
				resolve({ data: [], total: 0 });
			}
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
	findById,
	userGetDetailProduct,
	userGetListProduct,
	deleteById,
};
