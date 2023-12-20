"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "AppUser";
const {
	USER_VERIFY_INFO_STATUS,
	USER_TYPE,
	USER_VERIFY_EMAIL_STATUS,
	USER_VERIFY_PHONE_NUMBER_STATUS,
	USER_MEMBER_LEVEL,
} = require("../AppUserConstant");
const primaryKeyField = "appUserId";
async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments(`${primaryKeyField}`).primary();
					table.string("username");
					table.string("firstName");
					table.string("lastName");
					table.string("phoneNumber");
					table.string("email");
					table.string("job");
					table.string("birthDay");
					table.integer("sex");
					table.string("password");
					table.string("secondaryPassword");
					table.string("lastActiveAt");
					table.string("twoFACode");
					table.string("twoFAQR");
					table.integer("twoFAEnable").defaultTo(0);
					table
						.string("userAvatar", 2000)
						.defaultTo(`${process.env.HOST_NAME}/uploads/avatar.png`); //Image from social login may be so long (include token)
					table.string("socialInfo", 2000); //Image from social login may be so long (include token)
					table.string("identityNumber");
					table.string("imageBeforeIdentityCard"); //link hinh (ben trong he thong nen chi can 255)
					table.string("imageAfterIdentityCard"); //link hinh (ben trong he thong nen chi can 255)
					table.boolean("active").defaultTo(1);
					table.string("verifiedAt");
					table.integer("isVerified").defaultTo(USER_VERIFY_INFO_STATUS.NOT_VERIFIED);
					table
						.integer("isVerifiedEmail")
						.defaultTo(USER_VERIFY_EMAIL_STATUS.NOT_VERIFIED);
					table.integer("isVerifiedPhoneNumber");
					table.integer("referUserId").nullable(); //dung de luu tru nguoi gioi thieu (khi can thiet)
					table.string("referUser").nullable(); //dung de luu username cua nguoi gioi thieu (khi can thiet)
					table.string("memberLevelName").defaultTo(USER_MEMBER_LEVEL.MEMBER); //luu membership
					table.float("limitWithdrawDaily", 48, 24).defaultTo(1000000); //luu so tien toi da duoc rut (khi can thiet)
					table.string("ipAddress").nullable(); //luu IP address -> chong spam va hack
					table.string("googleId").nullable(); //luu google id - phong khi 1 user co nhieu tai khoan
					table.string("telegramId").nullable(); //luu telegram id - phong khi 1 user co nhieu tai khoan
					table.string("facebookId").nullable(); //luu facebook id - phong khi 1 user co nhieu tai khoan
					table.string("appleId").nullable(); //luu apple id - phong khi 1 user co nhieu tai khoan
					table.string("firebaseToken", 500).nullable();
					table.integer("userServiceId"); //<<ID cua nhu cau
					table.string("province", 500).nullable(); //<<ID hoac ten cua province
					table.string("district", 500).nullable(); //<<ID hoac ten cua district
					table.string("ward", 500).nullable(); //<<ID hoac ten cua ward
					table.string("address", 500).nullable(); //<<dia chi
					table.string("sotaikhoan", 500).nullable();
					table.string("tentaikhoan", 500).nullable();
					table.string("tennganhang", 500).nullable();
					table.string("packageExpireDate");
					table.integer("packageDuration").defaultTo(1); // << thoi han cua package
					timestamps(table);
					table.index(`${primaryKeyField}`);
					table.unique("username");
					table.unique("email");
					table.unique("phoneNumber");
					table.index("memberLevelName");
					table.index("username");
					table.index("firstName");
					table.index("lastName");
					table.index("referUserId");
					table.index("active");
					table.index("phoneNumber");
					table.index("lastActiveAt");
					table.index("referUser");
					table.index("email");
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
		let initialStaff = [
			{
				lastName: "",
				firstName: "Incognito",
				username: "",
				email: "Incognito@string.com",
				password: "9d8e0483d5a71a73d4cf762d3dfdd30d5f441a85a060d3335c0c4979ff3e0530",
				phoneNumber: "Incognito",
				userAvatar: `${process.env.HOST_NAME}/uploads/avatar.png`,
				job: "Incognito",
			},
			{
				lastName: "",
				firstName: "Lưu Phương Huyền",
				username: "string",
				email: "string@string.com",
				password: "9d8e0483d5a71a73d4cf762d3dfdd30d5f441a85a060d3335c0c4979ff3e0530",
				phoneNumber: "string",
				userAvatar: `${process.env.HOST_NAME}/uploads/avatar2.png`,
				job: "Nhân viên văn phòng",
			},
			{
				lastName: "",
				firstName: "Phùng Xuân Minh",
				username: "string2",
				email: "string2@string.com",
				password: "9d8e0483d5a71a73d4cf762d3dfdd30d5f441a85a060d3335c0c4979ff3e0530",
				phoneNumber: "string3",
				userAvatar: `${process.env.HOST_NAME}/uploads/avatar3.png`,
				job: "Nhân viên văn phòng",
			},
			{
				lastName: "",
				firstName: "Thanh Tâm",
				username: "string3",
				email: "string3@string.com",
				password: "9d8e0483d5a71a73d4cf762d3dfdd30d5f441a85a060d3335c0c4979ff3e0530",
				phoneNumber: "string4",
				userAvatar: `${process.env.HOST_NAME}/uploads/avatar4.png`,
				job: "Nhân viên văn phòng",
			},
		];
		DB(`${tableName}`)
			.insert(initialStaff)
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
	let filter = {};
	filter[`${primaryKeyField}`] = id;
	return await Common.updateById(tableName, filter, data);
}

async function find(filter, skip, limit, order) {
	return await Common.find(tableName, filter, skip, limit, order);
}

async function count(filter, order) {
	return await Common.count(tableName, primaryKeyField, filter, order);
}

async function updateAll(data, filter) {
	return await Common.updateAll(tableName, data, filter);
}

async function updateAllById(idList, data) {
	return await Common.updateAllById(tableName, primaryKeyField, idList, data);
}

async function findById(id) {
	let dataId = {};
	dataId[primaryKeyField] = id;
	return await Common.findById(tableName, dataId, id);
}

function _makeQueryBuilderByFilter(filter, skip, limit, searchText, startDate, endDate, order) {
	let queryBuilder = DB(tableName);
	let filterData = filter ? JSON.parse(JSON.stringify(filter)) : {};

	if (searchText) {
		queryBuilder.where(function () {
			this.orWhere("username", "like", `%${searchText}%`)
				.orWhere("firstName", "like", `%${searchText}%`)
				.orWhere("lastName", "like", `%${searchText}%`)
				.orWhere("phoneNumber", "like", `%${searchText}%`)
				.orWhere("email", "like", `%${searchText}%`);
		});
	} else {
		if (filterData.username) {
			queryBuilder.where("username", "like", `%${filterData.username}%`);
			delete filterData.username;
		}

		if (filterData.firstName) {
			queryBuilder.where("firstName", "like", `%${filterData.firstName}%`);
			delete filterData.firstName;
		}

		if (filterData.lastName) {
			queryBuilder.where("lastName", "like", `%${filterData.lastName}%`);
			delete filterData.lastName;
		}

		if (filterData.phoneNumber) {
			queryBuilder.where("phoneNumber", "like", `%${filterData.phoneNumber}%`);
			delete filterData.phoneNumber;
		}

		if (filterData.email) {
			let index = filterData.email.indexOf("@");
			let email = filterData.email.slice(0, index);
			queryBuilder.where("email", "like", `%${email}%`);
			delete filterData.email;
		}
	}

	if (startDate) {
		queryBuilder.where("createdAt", ">=", startDate);
	}
	if (endDate) {
		queryBuilder.where("createdAt", "<=", endDate);
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
async function customSearch(filter, skip, limit, searchText, startDate, endDate, order) {
	let query = _makeQueryBuilderByFilter(
		filter,
		skip,
		limit,
		searchText,
		startDate,
		endDate,
		order,
	);
	return await query.select();
}
async function customCount(filter, searchText, startDate, endDate, order) {
	let query = _makeQueryBuilderByFilter(
		filter,
		undefined,
		undefined,
		searchText,
		startDate,
		endDate,
		order,
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

module.exports = {
	insert,
	find,
	count,
	updateById,
	initDB,
	updateAll,
	findById,
	customSearch,
	customCount,
	modelName: tableName,
};
