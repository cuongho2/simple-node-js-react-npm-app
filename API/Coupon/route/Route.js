/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const CommonFunctions = require("../../Common/CommonFunctions");
const Response = require("../../Common/route/response").setup(Manager);
const insertSchema = {
	name: joi.string(),
	percent: joi.number(),
	requirePrice: joi.number(),
	code: joi.string(),
	expireDate: joi.string(),
};

const updateSchema = {
	name: joi.string(),
	percent: joi.number(),
	requirePrice: joi.number(),
	code: joi.string(),
	expireDate: joi.string(),
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	filter: {
		name: joi.string(),
		startDate: joi.string(),
	},
};
module.exports = {
	postCoupon: {
		tags: ["api", "Coupon"],
		description: "create Coupon",
		validate: {
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	getCoupon: {
		tags: ["api", "Coupon"],
		description: "List Coupon",
		validate: {
			payload: joi.object(filterSchema),

			options: {
				allowUnknown: true,
			},
		},

		handler: function (req, res) {
			console.log(req);
			Response(req, res, "find");
		},
	},
	find: {
		tags: ["api", "Coupon"],
		description: "List Coupon",
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
			console.log(req);
			Response(req, res, "find");
		},
	},
	findById: {
		tags: ["api", "Coupon"],
		description: "detail Coupon",
		validate: {
			payload: { code: joi.string(), totalPrice: joi.string() },
			options: {
				allowUnknown: true,
			},
		},

		handler: function (req, res) {
			console.log(req);
			Response(req, res, "findById");
		},
	},
	deleteCoupon: {
		tags: ["api", "Coupon"],
		description: "delete Coupon",
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
				id: joi.alternatives().try(joi.number(), joi.string()),
			},
		},

		handler: function (req, res) {
			Response(req, res, "deleteById");
		},
	},
	putCoupon: {
		tags: ["api", "Coupon"],
		description: "update Coupon",
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
				id: joi.alternatives().try(joi.number(), joi.string()),
			},
			payload: joi.object(updateSchema),
		},

		handler: function (req, res) {
			Response(req, res, "updateById");
		},
	},
};
