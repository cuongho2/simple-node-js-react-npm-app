/**
 * Created by A on 7/18/17.
 */
"use strict";
const moduleName = "Products";
const Manager = require(`../manager/${moduleName}Manager`);
const Joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");

const filterSchema = {
	productsCategory: Joi.string(),
	isHot: Joi.number(),
	isDiscount: Joi.number(),
	userId: Joi.number(),
	groupId: Joi.string(),
	inStock: Joi.number(),
};

module.exports = {
	userGetListProduct: {
		tags: ["api", `${moduleName}`],
		description: `user get list ${moduleName}`,
		pre: [{ method: CommonFunctions.verifyTokenOrAllowEmpty }],
		validate: {
			headers: Joi.object({
				authorization: Joi.string().allow(""),
			}).unknown(),
			payload: Joi.object({
				filter: Joi.object(filterSchema),
				startDate: Joi.string(),
				endDate: Joi.string(),
				searchText: Joi.string(),
				skip: Joi.number().default(0).min(0),
				limit: Joi.number().default(20).max(100),
				prices: Joi.array(),
				designs: Joi.array(),
				sizes: Joi.array(),
				colors: Joi.array(),
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
	userGetDetailProduct: {
		tags: ["api", `${moduleName}`],
		description: `user get details ${moduleName}`,
		// pre: [{ method: CommonFunctions.verifyTokenOrAllowEmpty }],
		validate: {
			// headers: Joi.object({
			// 	authorization: Joi.string().allow(""),
			// }).unknown(),
			payload: Joi.object({
				id: Joi.string(),
				slug: Joi.string(),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "userGetDetailProduct");
		},
	},
};
