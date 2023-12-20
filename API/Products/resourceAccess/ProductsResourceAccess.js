"use strict";
require("dotenv").config();
const ApiUtilsFunctions = require("../../ApiUtils/utilFunctions");
const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const { PRODUCT_VIEW_STATUS } = require("../ProductsConstants");
const tableName = "Products";
const primaryKeyField = "slug";

async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments("productsId").primary();
					table.integer("discountId");
					table.integer("appUserId");
					table.string("groupId");
					table.string("groupName");
					table.string("slug");
					table.string("designsId");
					table.string("productsTitle", 1000);
					table.text("productsContent", "longtext");
					table.text("productsDes", "longtext");
					table.integer("productsRating").defaultTo(5);
					table.string("productsCreators");
					table.integer("productsViewStatus").defaultTo(PRODUCT_VIEW_STATUS.NORMAL);
					table
						.string("productsAvatar")
						.defaultTo(`${process.env.HOST_NAME}/uploads/sample_product_avatar.jpg`);
					table
						.string("productsAvatarThumbnails")
						.defaultTo(`${process.env.HOST_NAME}/uploads/sample_product_avatar.png`);
					table.string("productsCategory");
					table.string("brandId").defaultTo(1);
					table.float("inStock", 48, 24).defaultTo(0);
					table.float("totalStock", 48, 24).defaultTo(0);
					table.string("productAttribute1").defaultTo(""); //thoi gian chuan bi
					table.string("productAttribute2").defaultTo(""); //khau phan
					table.string("productAttribute3").defaultTo(""); //Nang luong
					table.string("productAttribute4").defaultTo(""); //chua su dung
					table.string("productAttribute5").defaultTo(""); //chua su dung
					table.integer("totalViewed").defaultTo(0);
					table.integer("dayViewed").defaultTo(0);
					table.integer("monthViewed").defaultTo(0);
					table.integer("weekViewed").defaultTo(0);
					table.integer("searchCount").defaultTo(0);
					table.integer("followCount").defaultTo(0);
					table.integer("productPrice").defaultTo(0);
					table.boolean("isHot").defaultTo(0);
					table.integer("colorId");
					table.integer("sizeId");
					timestamps(table);
					table.index("productsId");
					table.index("productsViewStatus");
					table.index("productsCategory");
					table.index("productPrice");
				})
				.then(async () => {
					Logger.info(`${tableName}`, `${tableName} table created done`);
					seeding().then((result) => {
						Logger.info(`${tableName}`, `init ${tableName}` + result);
						resolve();
					});
				});
		});
	});
}

async function initDB() {
	await createTable();
}

async function seeding() {
	return new Promise(async (resolve, reject) => {
		let initialData = [];

		for (let i = 1; i < 50; i++) {
			initialData.push({
				discountId: i < 15 ? Math.floor(Math.random() * 4) + 1 : null,
				groupId: `group-${parseInt(i % 4)}`,
				groupName: `group-${parseInt(i % 4)}`,
				productsRating: Math.floor(Math.random() * 6) + 1,
				productsTitle: `${i} Ví nữ dài cầm tay 2 ngăn kéo nhiều ngăn tiện dụng`,
				ProductsContent: `${i} <div class="ba-text-fpt">
						<p>CHI TIẾT SẢN PHẨM</p>
						<p>Ví nữ dài cầm tay khoá kéo sang trọng ngăn đựng thẻ tiện dụng</p>
						<p>Kích thước: dài 19,5, rộng 2,5, cao 9,5 cm</p>
						<p>Kiểu dáng trẻ trung vô cùng sang trọng và trang nhã với chất liệu da PU cao cấp, thiết kế nhiều ngăn nhỏ tiện dụng cho người sử dụng.</p>
						<p>Màu sắc thời thượng, khẳng định gu thẩm mỹ đỉnh cao và đẳng cấp</p>
						</div>`,
				productsDes: `Ví nữ dài cầm tay khoá kéo sang trọng ngăn đựng thẻ tiện dụng Kích thước: dài 19,5, rộng 2,5, cao 9,5 cm`,
				productAttribute1: `${process.env.HOST_NAME}/uploads/sample_product_avatar.jpg`,
				productAttribute2: `${process.env.HOST_NAME}/uploads/sample_product_avatar.jpg`,
				productAttribute3: `${process.env.HOST_NAME}/uploads/sample_product_avatar.jpg`,
				productAttribute4: `${process.env.HOST_NAME}/uploads/sample_product_avatar.jpg`,
				productAttribute5: `${process.env.HOST_NAME}/uploads/sample_product_avatar.jpg`,
				ProductsCategory: `${parseInt(i % 4)}`,
				slug: ApiUtilsFunctions.makeid(
					6,
					`${i} Ví nữ dài cầm tay 2 ngăn kéo nhiều ngăn tiện dụng`,
				),
				designsId: `${parseInt(i % 4)}`,
				colorId: `${parseInt(i % 4)}`,
				sizeId: `${parseInt(i % 4)}`,
				brandId: Math.floor(Math.random() * 6) + 1,
				inStock: Math.floor(Math.random() * 4) * 100,
				totalStock: 400,
				isHot: i > 15,
				productPrice: Math.floor(Math.random() * 6 + 1) * 1000000,
				productsAvatar: `${process.env.HOST_NAME}/uploads/${
					i < 15 ? "sample_product_avatar.png" : "vi_tien.png"
				}`,
				productsAvatarThumbnails: `${process.env.HOST_NAME}/uploads/${
					i < 15 ? "sample_product_avatar.jpg" : "vi_tien2.png"
				}`,
			});
		}

		DB(`${tableName}`)
			.insert(initialData)
			.then((result) => {
				Logger.info(`${tableName}`, `seeding ${tableName}` + result);
				resolve();
			});
	});
}

async function insert(data) {
	return await Common.insert(tableName, data);
}

async function updateById(id, data) {
	let dataId = {};
	dataId["productsId"] = id;
	return await Common.updateById(tableName, dataId, data);
}

async function findById(id) {
	return await Common.findById(tableName, primaryKeyField, id);
}

async function findByAnyTableId(tableName, primaryKeyField, id) {
	return await Common.findById(tableName, primaryKeyField, id);
}

async function findByIdCustom(id, name) {
	let queryBuilder = DB(tableName)
		.select()
		.where(name || primaryKeyField, id);
	return queryBuilder.options({ nestTables: true });
}

async function findByChildId(id) {
	return await Common.findById("Discount", "id", id);
}

async function findFauvoriteChildId(filter) {
	return await Common.find("CustomerFavourite", filter);
}

async function findProductSizeChildId(id) {
	let queryBuilder = DB("ProductSize");
	queryBuilder
		.join("Size", "Size.id", "=", `ProductSize.sizeId`)
		.where(`ProductSize.ProductId`, id);
	return queryBuilder;
}

async function find(filter, skip, limit, order, tbName) {
	return await Common.find(tbName || tableName, filter, skip, limit, order);
}

async function count(filter, order) {
	return await Common.count(tableName, primaryKeyField, filter, order);
}

function _makeQueryBuilderByFilter(
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
) {
	let queryBuilder = DB(tableName);
	let filterData = JSON.parse(JSON.stringify(filter));

	if (searchText) {
		queryBuilder.where(function () {
			this.orWhere(`${tableName}.productsTitle`, "like", `%${searchText}%`).orWhere(
				`${tableName}.productsContent`,
				"like",
				`%${searchText}%`,
			);
		});
	} else {
		if (filterData.productsTitle) {
			queryBuilder.where(
				`${tableName}.productsTitle`,
				"like",
				`%${filterData.productsTitle}%`,
			);
			delete filterData.productsTitle;
		}
		if (filterData.productsContent) {
			queryBuilder.where(
				`${tableName}.ProductsContent`,
				"like",
				`%${filterData.productsContent}%`,
			);
			delete filterData.productsContent;
		}
	}
	if (filterData.isHot) {
		queryBuilder.where(`${tableName}.isHot`, "=", true);
	}
	if (filterData.isDiscount) {
		queryBuilder.whereNotNull(`${tableName}.discountId`);
	} else if (`${filterData.isDiscount}` === "0") {
		queryBuilder.whereNull(`${tableName}.discountId`);
	}

	if (startDate) {
		queryBuilder.where(`${tableName}.createdAt`, ">=", startDate);
	}
	if (endDate) {
		queryBuilder.where(`${tableName}.createdAt`, "<=", endDate);
	}

	delete filterData.isDiscount;
	delete filterData.isHot;

	if (designs) {
		queryBuilder.whereIn("designsId", designs);
	}

	if (colors) {
		queryBuilder.whereIn("colorId", colors);
	}

	if (sizes) {
		queryBuilder.whereExists(function () {
			this.select("*")
				.from("ProductSize")
				.whereRaw(`${tableName}.productsId = ProductSize.productId`)
				.whereIn(`ProductSize.sizeId`, sizes);
		});
	}

	if (prices) {
		prices.forEach((id) => {
			if (id === "1") {
				queryBuilder.where(`${tableName}.productPrice`, "<", 200000);
			}
			if (id === "2") {
				queryBuilder.where(`${tableName}.productPrice`, ">=", 200000);
				queryBuilder.where(`${tableName}.productPrice`, "<", 300000);
			}
			if (id === "3") {
				queryBuilder.where(`${tableName}.productPrice`, ">=", 300000);
				queryBuilder.where(`${tableName}.productPrice`, "<", 400000);
			}
			if (id === "4") {
				queryBuilder.where(`${tableName}.productPrice`, ">=", 400000);
				queryBuilder.where(`${tableName}.productPrice`, "<", 500000);
			}

			if (id === "5") {
				queryBuilder.where(`${tableName}.productPrice`, ">=", 500000);
				queryBuilder.where(`${tableName}.productPrice`, "<", 10000000000);
			}
		});
	}
	if (filterData.inStock) {
		queryBuilder.where(`${tableName}.inStock`, ">", 0);
	}
	delete filterData.inStock;
	queryBuilder.options({ nestTables: true }).where(filterData);
	if (limit) {
		queryBuilder.limit(limit);
	}

	if (skip) {
		queryBuilder.offset(skip);
	}

	queryBuilder.where(`${tableName}.isDeleted`, 0);

	if (
		order &&
		order.key !== "" &&
		order.value !== "" &&
		(order.value === "desc" || order.value === "asc")
	) {
		queryBuilder.orderBy(`${tableName}.${order.key}`, order.value);
	} else {
		queryBuilder.orderBy(`${tableName}.productsId`, "desc");
	}

	return queryBuilder;
}

async function customSearch(
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
) {
	let query = _makeQueryBuilderByFilter(
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
	return await query.select();
}

async function customCount(
	filter,
	startDate,
	endDate,
	searchText,
	order,
	prices,
	designs,
	sizes,
	colors,
) {
	let query = _makeQueryBuilderByFilter(
		filter,
		null,
		null,
		startDate,
		endDate,
		searchText,
		order,
		prices,
		designs,
		sizes,
		colors,
	);

	return new Promise((resolve, reject) => {
		try {
			query.count(`${primaryKeyField} as count`).then((records) => {
				resolve(records);
			});
		} catch (e) {
			Logger.error(
				"ResourceAccess",
				`DB COUNT ERROR: ${tableName} : ${JSON.stringify(filter)} - ${JSON.stringify(
					order,
				)}`,
			);
			Logger.error("ResourceAccess", e);
			reject(undefined);
		}
	});
}

async function updateFollowCount(ProductsId) {
	let filter = {};
	filter[primaryKeyField] = ProductsId;
	return await DB(tableName).where(filter).increment("followCount", 1);
}

async function updateSearchCount(ProductsId) {
	let filter = {};
	filter[primaryKeyField] = ProductsId;
	return await DB(tableName).where(filter).increment("searchCount", 1);
}

async function addViewCount(ProductsId) {
	let filter = {};
	filter[primaryKeyField] = ProductsId;

	await DB(tableName).where(filter).increment("productsTotalViewed", 1);
	await DB(tableName).where(filter).increment("dayViewed", 1);
	await DB(tableName).where(filter).increment("monthViewed", 1);
	await DB(tableName).where(filter).increment("weekViewed", 1);

	return 1;
}

async function resetDayViewedCount() {
	return await DB(tableName).update({ dayViewed: 0 });
}

async function resetMonthViewedCount() {
	return await DB(tableName).update({ monthViewed: 0 });
}

async function resetWeekViewedCount() {
	return await DB(tableName).update({ weekViewed: 0 });
}
async function deleteById(ProductsId) {
	let dataId = {};

	dataId["productsId"] = ProductsId;
	return await Common.deleteById(tableName, dataId);
}
module.exports = {
	insert,
	find,
	findById,
	count,
	updateById,
	initDB,
	modelName: tableName,
	customSearch,
	customCount,
	resetWeekViewedCount,
	resetMonthViewedCount,
	resetDayViewedCount,
	updateFollowCount,
	updateSearchCount,
	addViewCount,
	deleteById,
	findByChildId,
	findFauvoriteChildId,
	findByIdCustom,
	findByAnyTableId,
	findProductSizeChildId,
};
