"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "Category";
const primaryKeyField = "id";
async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments("id").primary();
					table.string("categoryName");
					table.string("parentId");
					table.string("imageUrl");
					table.string("slug");
					table.boolean("isHot").default(false);
					timestamps(table);
					table.index("id");
					table.index("imageUrl");
					table.index("parentId");
					table.index("categoryName");
					table.index("slug");
				})
				.then(() => {
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
		let initialcategorys = [
			{
				categoryName: "Sản phẩm áo",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/group-210.png?v=1679024140727",
				slug: "san-pham-ao",
				isHot: true,
			},
			{
				categoryName: "Sản phẩm quần",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-68.png?v=1677070813003",
				slug: "san-pham-quan",
				isHot: true,
			},
			{
				categoryName: "Sản phẩm váy",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-69.png?v=1677070822467",
				slug: "san-pham-vay",
				isHot: true,
			},
			{
				categoryName: "Giầy dép",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-71.png?v=1677070857193",
				slug: "giay-dep",
				isHot: true,
			},
			{
				categoryName: "Túi xách",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-70.png?v=1677070838007",
				isHidden: true,
				slug: "tui-xach",
				isHot: true,
			},
			{
				categoryName: "Áo sơ mi",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-71.png?v=1677070857193",
				parentId: "1",
				slug: "ao-so-mi",
			},
			{
				categoryName: "Áo kiểu",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-71.png?v=1677070857193",
				parentId: "1",
				slug: "ao-kieu",
				isHot: true,
			},
			{
				categoryName: "Áo khoác",
				imageUrl:
					"https://bizweb.dktcdn.net/100/456/491/collections/ellipse-71.png?v=1677070857193",
				parentId: "1",
				slug: "ao-khoac",
			},
		];
		DB(`${tableName}`)
			.insert(initialcategorys)
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
	dataId[primaryKeyField] = id;
	return await Common.updateById(tableName, dataId, data);
}

async function find(filter, skip, limit, order) {
	return await Common.find(tableName, filter, skip, limit, order);
}

async function count(filter, order) {
	return await Common.count(tableName, primaryKeyField, filter, order);
}

function _makeQueryBuilderByFilter(filter, skip, limit, order) {
	let queryBuilder = DB(tableName);
	let filterData = filter ? JSON.parse(JSON.stringify(filter)) : {};

	if (filterData.categoryName) {
		queryBuilder.where("categoryName", "like", `%${filter.categoryName}%`);
		delete filterData.categoryName;
	}
	queryBuilder.where(filterData);
	queryBuilder.where({ isDeleted: 0 });
	if (limit) {
		queryBuilder.limit(limit);
	}
	if (skip) {
		queryBuilder.offset(skip);
	}
	if (
		order &&
		order.key !== "" &&
		order.value !== "" &&
		(order.value === "desc" || order.value === "asc")
	) {
		queryBuilder.orderBy(order.key, order.value);
	} else {
		queryBuilder.orderBy("createdAt", "desc");
	}

	return queryBuilder;
}

async function customSearch(filter, skip, limit, order) {
	let query = _makeQueryBuilderByFilter(filter, skip, limit, order);
	return await query.select();
}

async function customCount(filter, order) {
	let query = _makeQueryBuilderByFilter(filter, undefined, undefined, order);
	return await query.count(`${primaryKeyField} as count`);
}
module.exports = {
	insert,
	find,
	count,
	updateById,
	initDB,
	customSearch,
	customCount,
};
