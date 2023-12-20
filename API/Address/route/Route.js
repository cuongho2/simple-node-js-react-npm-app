/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");

const insertSchema = {
	userId: joi.string(),
	address: joi.string(),
	cityCode: joi.string(),
	cityIndex: joi.string(),
	cityName: joi.string(),
	couponCode: joi.string(),
	districtCode: joi.string(),
	districtIndex: joi.string(),
	districtName: joi.string(),
	email: joi.string(),
	firstName: joi.string(),
	note: joi.string(),
	phoneNumber: joi.string(),
	wardCode: joi.string(),
	wardIndex: joi.string(),
	wardName: joi.string(),
	zipCode: joi.string(),
	company: joi.string(),
	active: joi.number(),
};

const updateSchema = {
	...insertSchema,
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	filter: {
		userId: joi.string(),
		active: joi.number(),
	},
};
module.exports = {
	postAddress: {
		tags: ["api", "Address"],
		description: "create Address",

		validate: {
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	find: {
		tags: ["api", "Address"],
		description: "List Address",
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
			payload: joi.object(filterSchema),

			options: {
				allowUnknown: true,
			},
		},
		pre: [
			{ method: CommonFunctions.verifyToken },
			{ method: CommonFunctions.verifyStaffToken },
		],
		handler: function (req, res) {
			Response(req, res, "find");
		},
	},
	getAddress: {
		tags: ["api", "Address"],
		description: "List Address",

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
	deleteAddress: {
		tags: ["api", "Address"],
		description: "delete Address",

		pre: [
			{ method: CommonFunctions.verifyToken },
			// { method: CommonFunctions.verifyStaffToken },
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
	putAddress: {
		tags: ["api", "Address"],
		description: "update Address",
		pre: [
			{ method: CommonFunctions.verifyToken },
			// { method: CommonFunctions.verifyStaffToken },
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
	findById: {
		tags: ["api", "Address"],
		description: "detail Address",
		validate: {
			payload: { orderCode: joi.string() },
			options: {
				allowUnknown: true,
			},
		},

		handler: function (req, res) {
			Response(req, res, "findById");
		},
	},
};
