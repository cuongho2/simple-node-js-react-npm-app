/**
 * Created by A on 7/18/17.
 */
"use strict";
const moduleName = "Products";
const Manager = require(`../manager/${moduleName}Manager`);
const Joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");

const insertSchema = {
	brandId: Joi.string(),
	colorId: Joi.number(),
	appUserId: Joi.number(),
	dayViewed: Joi.number(),
	designsId: Joi.number(),
	discountId: Joi.number(),
	followCount: Joi.number(),
	groupId: Joi.string(),
	inStock: Joi.number(),
	isHot: Joi.number(),
	monthViewed: Joi.number(),
	productsTitle: Joi.string(),
	productsContent: Joi.string(),
	productsAvatar: Joi.string(),
	productsCategory: Joi.string(),
	productAttribute1: Joi.string(),
	productAttribute2: Joi.string(),
	productAttribute3: Joi.string(),
	productAttribute4: Joi.string(),
	productAttribute5: Joi.string(),
	productPrice: Joi.number(),
	productsAvatar: Joi.string(),
	productsAvatarThumbnails: Joi.string(),
	productsCategory: Joi.string(),
	productsContent: Joi.string(),
	productsCreators: Joi.string(),
	productsRating: Joi.number(),
	productsTitle: Joi.string(),
	productsViewStatus: Joi.number(),
	searchCount: Joi.number(),
	sizeId: Joi.number(),
	totalStock: Joi.number(),
	totalViewed: Joi.number(),
	weekViewed: Joi.number(),
	groupName: Joi.string(),
	productsDes: Joi.string(),
};

const updateSchema = {
	...insertSchema,
};

const filterSchema = {
	productsCategory: Joi.string(),
	isHot: Joi.number(),
	groupId: Joi.string(),
	inStock: Joi.number(),
};

module.exports = {
	insert: {
		tags: ["api", `${moduleName}`],
		description: `insert ${moduleName}`,
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	updateById: {
		tags: ["api", `${moduleName}`],
		description: `update ${moduleName}`,
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object({
				id: Joi.number().min(0),
				data: Joi.object(updateSchema),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "updateById");
		},
	},
	find: {
		tags: ["api", `${moduleName}`],
		description: `update ${moduleName}`,
		// pre: [
		// 	{ method: CommonFunctions.verifyToken },
		// 	{ method: CommonFunctions.verifyStaffToken },
		// ],
		// auth: {
		// 	strategy: "jwt",
		// },
		validate: {
			// headers: Joi.object({
			// 	authorization: Joi.string(),
			// }).unknown(),
			payload: Joi.object({
				searchText: Joi.string(),
				filter: Joi.object(filterSchema),
				startDate: Joi.string(),
				endDate: Joi.string(),
				skip: Joi.number().default(0).min(0),
				limit: Joi.number().default(20).max(100),

				order: Joi.object({
					key: Joi.string().default("createdAt").allow(""),
					value: Joi.string().default("desc").allow(""),
				}),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "userGetListProduct");
		},
	},
	findById: {
		tags: ["api", `${moduleName}`],
		description: `find by id ${moduleName}`,
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object({
				id: Joi.number().min(0),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "findById");
		},
	},
	deleteById: {
		tags: ["api", `${moduleName}`],
		description: `find by id ${moduleName}`,
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object({
				id: Joi.number().min(0),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "deleteById");
		},
	},
};
