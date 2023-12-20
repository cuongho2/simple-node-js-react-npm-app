/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");
const insertSchema = {
	name: joi.string().required(),
};

const updateSchema = {
	name: joi.string().required(),
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
	postSize: {
		tags: ["api", "Size"],
		description: "create Size",
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
	getSize: {
		tags: ["api", "Size"],
		description: "List Size",
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
	deleteSize: {
		tags: ["api", "Size"],
		description: "delete Size",
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
	putSize: {
		tags: ["api", "Size"],
		description: "update Size",
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
