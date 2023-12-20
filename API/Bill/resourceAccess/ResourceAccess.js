"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "Bill";
const primaryKeyField = "id";
async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments("id").primary();
					table.string("orderCode");
					table.string("address");
					table.string("cityCode");
					table.string("cityIndex");
					table.string("cityName");
					table.string("couponCode");
					table.string("districtCode");
					table.string("districtIndex");
					table.string("districtName");
					table.string("email");
					table.string("firstName");
					table.string("note");
					table.string("paymentMethod");
					table.string("phoneNumber");
					table.string("wardCode");
					table.string("wardIndex");
					table.string("wardName");
					table.string("feeShip");
					table.string("couponPrice");
					table.string("totalPrice");
					table.string("totalAmount");
					table.text("listCart", "longtext");
					table.string("totalSum");
					table.string("status").default(1);
					table.string("paymentStatus").default(1);
					table.string("userId").default(1);
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
		let initialBrands = [];
		for (let i = 0; i <= 1000; i++) {
			const total = `${Math.floor(Math.random() * 10000)}`;
			initialBrands.push({
				userId: "string",
				address: "string",
				cityCode: "string",
				cityIndex: "string",
				cityName: "string",
				couponCode: "string",
				districtCode: "string",
				districtIndex: "string",
				districtName: "string",
				email: "string",
				firstName: "string",
				note: "string",
				paymentMethod: Math.floor(Math.random() * 3),
				phoneNumber: "string",
				wardCode: "string",
				wardIndex: "string",
				wardName: "string",
				listCart: "string",
				status: Math.floor(Math.random() * 3),
				totalSum: total,
				feeShip: "15000",
				couponPrice: "string",
				totalPrice: total,
				totalAmount: total,
				paymentStatus: Math.floor(Math.random() * 3),
			});
		}
		DB(`${tableName}`)
			.insert(initialBrands)
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

function _makeQueryBuilderByFilter(filter, skip, limit, startDate, endDate, searchText, order) {
	let queryBuilder = DB(tableName);
	let filterData = JSON.parse(JSON.stringify(filter || "{}"));

	if (searchText) {
		queryBuilder.where(function () {
			this.orWhere(`${tableName}.firstName`, "like", `%${searchText}%`).orWhere(
				`${tableName}.orderCode`,
				"like",
				`%${searchText}%`,
			);
		});
	}

	if (startDate) {
		queryBuilder.where(`${tableName}.createdAt`, ">=", startDate);
	}
	if (endDate) {
		queryBuilder.where(`${tableName}.createdAt`, "<=", endDate);
	}

	queryBuilder.where(`${tableName}.isDeleted`, 0);
	queryBuilder.where(filterData);
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
		queryBuilder.orderBy(`${tableName}.${order.key}`, order.value);
	} else {
		queryBuilder.orderBy(`${tableName}.createdAt`, "desc");
	}
	console.log(queryBuilder.toString());
	return queryBuilder;
}

async function customSearch(filter, skip, limit, startDate, endDate, searchText, order) {
	let query = _makeQueryBuilderByFilter(
		filter,
		skip,
		limit,
		startDate,
		endDate,
		searchText,
		order,
	);
	return await query.select();
}

async function customCount(filter, startDate, endDate, searchText, order) {
	let query = _makeQueryBuilderByFilter(
		filter,
		null,
		null,
		startDate,
		endDate,
		searchText,
		order,
		order,
	);
	return await query.count(`${primaryKeyField} as count`);
}

async function findById(id) {
	let dataId = {};
	dataId["orderCode"] = id;
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
