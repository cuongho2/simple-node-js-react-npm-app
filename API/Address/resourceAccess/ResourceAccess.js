"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "Address";
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
					table.string("phoneNumber");
					table.string("wardCode");
					table.string("wardIndex");
					table.string("wardName");
					table.string("zipCode");
					table.string("userId").default(1);
					table.string("company").default("");
					// table.string("country").default("Vietnam");
					table.integer("active").defaultTo(0);
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

async function seeding() {}

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
	dataId["id"] = id;
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
