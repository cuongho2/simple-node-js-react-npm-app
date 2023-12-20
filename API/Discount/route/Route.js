/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");
const insertSchema = {
	name: joi.string(),
	value: joi.string(),
	type: joi.string(),
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
		name: joi.string(),
	},
};
module.exports = {
	postDiscount: {
		tags: ["api", "Discount"],
		description: "create Discount",
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
	getDiscount: {
		tags: ["api", "Discount"],
		description: "List Discount",
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
	deleteDiscount: {
		tags: ["api", "Discount"],
		description: "delete Discount",
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
	putDiscount: {
		tags: ["api", "Discount"],
		description: "update Discount",
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
