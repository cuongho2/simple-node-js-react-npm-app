/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const CommonFunctions = require("../../Common/CommonFunctions");
const Response = require("../../Common/route/response").setup(Manager);
const insertSchema = {
	productId: joi.number(),
	sizeId: joi.number(),
	inStock: joi.number(),
	totalStock: joi.number(),
};

const updateSchema = {
	...insertSchema,
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	filter: {},
};
module.exports = {
	postProductSize: {
		tags: ["api", "ProductSize"],
		description: "create ProductSize",
		auth: {
			strategy: "jwt",
		},
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		validate: {
			headers: joi
				.object({
					authorization: joi.string(),
				})
				.unknown(),
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	getProductSize: {
		tags: ["api", "ProductSize"],
		description: "List ProductSize",
		validate: {
			payload: joi.object(filterSchema),

			options: {
				allowUnknown: true,
			},
		},

		handler: function (req, res) {
			Response(req, res, "find");
		},
	},
	deleteProductSize: {
		tags: ["api", "ProductSize"],
		description: "delete ProductSize",
		auth: {
			strategy: "jwt",
		},
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		validate: {
			headers: joi
				.object({
					authorization: joi.string(),
				})
				.unknown(),
			params: {
				id: joi.alternatives().try(joi.number(), joi.string()).required(),
			},
		},

		handler: function (req, res) {
			Response(req, res, "deleteById");
		},
	},
	putProductSize: {
		tags: ["api", "ProductSize"],
		description: "update ProductSize",
		auth: {
			strategy: "jwt",
		},
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		validate: {
			headers: joi
				.object({
					authorization: joi.string(),
				})
				.unknown(),
			params: {
				id: joi.alternatives().try(joi.number(), joi.string()).required(),
			},
			payload: joi.object(updateSchema),
		},

		handler: function (req, res) {
			Response(req, res, "updateById");
		},
	},
};
