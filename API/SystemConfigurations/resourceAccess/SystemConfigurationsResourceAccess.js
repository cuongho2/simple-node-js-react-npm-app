"use strict";
require("dotenv").config();

const Logger = require("../../../utils/logging");
const { DB, timestamps } = require("../../../config/database");
const Common = require("../../Common/resourceAccess/CommonResourceAccess");
const tableName = "SystemConfigurations";
const primaryKeyField = "SystemConfigurationsId";
async function createTable() {
	Logger.info("ResourceAccess", `createTable ${tableName}`);
	return new Promise(async (resolve, reject) => {
		DB.schema.dropTableIfExists(`${tableName}`).then(() => {
			DB.schema
				.createTable(`${tableName}`, function (table) {
					table.increments(`${primaryKeyField}`).primary();
					table.double("exchangeRateCoin"); // tỉ lệ quy đổi xu (VND > XU)
					table.double("freeShip").defaultTo(15000);
					table.string("telegramGroupUrl").defaultTo("https://telegram.com"); // link group telegram
					table.string("fbMessengerUrl").defaultTo("https://messenger.com"); // link messenger FB
					table.string("zaloUrl").defaultTo("https://zalo.com"); //link zalo OA
					table.string("playStoreUrl").defaultTo("https://play.google.com/"); //link play store
					table.string("appStoreUrl").defaultTo("https://apps.apple.com/"); //link app store
					table.string("instagramUrl").defaultTo("https://instagram.com"); //link instagram
					table.string("facebookUrl").defaultTo("https://facebook.com"); // link fan page facebook
					table.string("twitterUrl").defaultTo("https://twitter.com"); // link fan page twitter
					table.string("youtubeUrl").defaultTo("https://youtube.com"); // link channel youtube
					table.string("websiteUrl").defaultTo("https://google.com"); // website chinh
					table
						.string("offer1")
						.defaultTo("Miễn phí giao hàng với các đơn trị giá trên 2.000.000Đ");
					table
						.string("offer2")
						.defaultTo("Đổi trả trong 30 ngày đầu tiên cho tất cả các sản phẩm");
					table
						.string("offer3")
						.defaultTo("Luôn hỗ trợ khách hàng 24/24 các ngày trong tuần");
					table
						.string("offer4")
						.defaultTo("Chương trình khuyến mãi cực lớn và hấp dẫn hàng tháng");
					table.string("hotlineNumber").defaultTo("123456789"); //hotline
					table.string("supportEmail").defaultTo("supportEmail@gmail.com"); //hotline
					table.string("address").defaultTo("123 Ho Chi Minh, VietNam"); //dia chi cong ty
					table.string("systemVersion").defaultTo("1.0.0"); //version he thong
					table.double("exchangeVNDPrice").defaultTo(23000); //gia quy doi USD - VND
					table
						.string("bannerImage1")
						.defaultTo(`${process.env.HOST_NAME}/uploads/slider_1.jpg`);
					table
						.string("bannerImage2")
						.defaultTo(`${process.env.HOST_NAME}/uploads/slider_2.jpg`);
					table
						.string("bannerImage3")
						.defaultTo(`${process.env.HOST_NAME}/uploads/slider_3.jpg`);
					table
						.string("bannerImage4")
						.defaultTo(`${process.env.HOST_NAME}/uploads/sample_banner.png`);
					table
						.string("bannerImage5")
						.defaultTo(`${process.env.HOST_NAME}/uploads/sample_banner.png`);
					table
						.string("qCImage1")
						.defaultTo(`${process.env.HOST_NAME}/uploads/feature_banner_1.png`);
					table.string("linkQCImage1").defaultTo(`collections/san-pham-moi`);
					table
						.string("qCImage2")
						.defaultTo(`${process.env.HOST_NAME}/uploads/feature_banner_2.png`);
					table.string("linkQCImage2").defaultTo(`collections/san-pham-noi-bat`);
					table
						.string("qCImage3")
						.defaultTo(`${process.env.HOST_NAME}/uploads/feature_banner_3.png`);
					table.string("linkQCImage3").defaultTo(`flashSale`);
					timestamps(table);
					table.index(`${primaryKeyField}`);
				})
				.then(async () => {
					Logger.info(`${tableName}`, `${tableName} table created done`);
					seeding().then(() => {
						resolve();
					});
				});
		});
	});
}

async function seeding() {
	let projectStatus = [
		{
			systemVersion: "1.0.0",
			exchangeRateCoin: 1000,
			bannerImage1: `${process.env.HOST_NAME}/uploads/slider_1.jpg`,
			bannerImage2: `${process.env.HOST_NAME}/uploads/slider_2.jpg`,
			bannerImage3: `${process.env.HOST_NAME}/uploads/slider_3.jpg`,
		},
	];
	return new Promise(async (resolve, reject) => {
		DB(`${tableName}`)
			.insert(projectStatus)
			.then((result) => {
				Logger.info(`${tableName}`, `seeding ${tableName}` + result);
				resolve();
			});
	});
}

async function initDB() {
	await createTable();
}

async function updateById(id, data) {
	let dataId = {};
	dataId[primaryKeyField] = id;
	return await Common.updateById(tableName, dataId, data);
}

async function find(filter, skip, limit, order) {
	return await Common.find(tableName, filter, skip, limit, order);
}

module.exports = {
	find,
	updateById,
	initDB,
};
