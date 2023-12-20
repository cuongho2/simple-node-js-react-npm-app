/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");
const insertSchema = {
	productId: joi.string().required(),
	userId: joi.string().required(),
};

const updateSchema = {
	productId: joi.string().required(),
	userId: joi.string().required(),
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	filter: {
		userId: joi.string(),
	},
};
module.exports = {
	postCustomerFavourite: {
		tags: ["api", "CustomerFavourite"],
		description: "create CustomerFavourite",
		auth: {
			strategy: "jwt",
		},
		pre: [{ method: CommonFunctions.verifyToken }],
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
	find: {
		tags: ["api", "CustomerFavourite"],
		description: "List CustomerFavourite",
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
	getCustomerFavourite: {
		tags: ["api", "CustomerFavourite"],
		description: "List CustomerFavourite",
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
		pre: [{ method: CommonFunctions.verifyToken }],

		handler: function (req, res) {
			Response(req, res, "find");
		},
	},
	deleteCustomerFavourite: {
		tags: ["api", "CustomerFavourite"],
		description: "delete CustomerFavourite",
		auth: {
			strategy: "jwt",
		},
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
	putCustomerFavourite: {
		tags: ["api", "CustomerFavourite"],
		description: "update CustomerFavourite",
		validate: {
			params: {
				id: joi.alternatives().try(joi.number(), joi.string()).required(),
			},
			payload: joi.object(updateSchema),
		},

		handler: function (req, res) {
			Response(req, res, "updateById");
		},
	},
	// getCustomerFavouriteByProduct: {
	// 	tags: ["api", "CustomerFavourite"],
	// 	description: "List CustomerFavouriteByProduct",
	// 	validate: {
	// 		query: joi.object().keys({
	// 			skip: joi.number(),
	// 			limit: joi.number(),
	// 			orderBy: joi.string(),
	// 			value: joi.string(),
	// 			name: joi.string(),
	// 		}),
	// 		// options: {
	// 		//   allowUnknown: true
	// 		// }
	// 	},

	// 	handler: function (req, res) {
	// 		Response(req, res, "getCustomerFavouriteByProduct");
	// 	},
	// },
};
