"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "CustomerFeeback";
const primaryKeyField = "id";
async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments("id").primary();
					table.string("content");
					table.string("lastName");
					table.string("firstName");
					table.string("userId");
					table.string("email");
					table.string("phoneNumber");
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
	return new Promise(async (resolve, reject) => {});
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

	queryBuilder.where(`${tableName}.isDeleted`, 0);
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
