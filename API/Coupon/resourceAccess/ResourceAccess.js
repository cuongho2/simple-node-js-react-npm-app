"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "Coupon";
const primaryKeyField = "id";
async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments("id").primary();
					table.string("name");
					table.float("percent", 48, 24).defaultTo(0);
					table.float("requirePrice", 48, 24).defaultTo(0);
					table.string("code");
					table.timestamp("expireDate", { useTz: true }).nullable(); // << ngay het han
					timestamps(table);
					table.index("id");
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
		let initialCoupons = [
			{
				name: "MIỄN PHÍ VẬN CHUYỂN",
				percent: 0,
				requirePrice: 300,
				code: "LOFIFREESHIP",
				expireDate: new Date("12/12/2023"),
			},
			{
				name: "GIẢM 20%",
				percent: 20,
				requirePrice: 200,
				code: "LOFI20",
				expireDate: new Date("12/12/2023"),
			},
			{
				name: "GIẢM 30%",
				percent: 30,
				requirePrice: 300,
				code: "LOFI30",
				expireDate: new Date("12/12/2023"),
			},
		];
		DB(`${tableName}`)
			.insert(initialCoupons)
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

	if (filterData.name) {
		queryBuilder.where("name", "like", `%${filter.name}%`);
		delete filterData.name;
	}

	if (filterData.startDate) {
		const startDate = filterData.expireDate;
		queryBuilder.where("expireDate", "<=", startDate);
		delete filterData.expireDate;
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

async function findById(id) {
	let dataId = {};
	dataId["code"] = id;
	return await Common.findById(tableName, dataId, id);
}
module.exports = {
	insert,
	find,
	count,
	updateById,
	initDB,
	customSearch,
	customCount,
	findById,
};
