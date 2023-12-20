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
	paymentMethod: joi.string(),
	phoneNumber: joi.string(),
	wardCode: joi.string(),
	wardIndex: joi.string(),
	wardName: joi.string(),
	listCart: joi.string(),
	status: joi.string(),
	totalSum: joi.string(),
	feeShip: joi.string(),
	couponPrice: joi.string(),
	totalPrice: joi.string(),
	totalAmount: joi.string(),
	paymentStatus: joi.string(),
};

const updateSchema = {
	...insertSchema,
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	startDate: joi.string(),
	endDate: joi.string(),
	searchText: joi.string(),
	filter: {
		userId: joi.string(),
		orderCode: joi.string(),
		status: joi.string(),
		paymentStatus: joi.string(),
	},
};
module.exports = {
	postBill: {
		tags: ["api", "Bill"],
		description: "create Bill",

		validate: {
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	find: {
		tags: ["api", "Bill"],
		description: "List Bill",
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

		handler: function (req, res) {
			Response(req, res, "find");
		},
	},
	getBill: {
		tags: ["api", "Bill"],
		description: "List Bill",

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
	deleteBill: {
		tags: ["api", "Bill"],
		description: "delete Bill",
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
	putBill: {
		tags: ["api", "Bill"],
		description: "update Bill",
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
	findById: {
		tags: ["api", "Bill"],
		description: "detail Bill",
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
