/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");
const insertSchema = {
	lastName: joi.string(),
	firstName: joi.string(),
	phoneNumber: joi.string(),
	email: joi.string().email().required(),
	content: joi.string(),
};

const updateSchema = {
	lastName: joi.string(),
	firstName: joi.string(),
	phoneNumber: joi.string(),
	email: joi.string().email().required(),
	content: joi.string(),
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	filter: {
		email: joi.string(),
		phoneNumber: joi.string(),
	},
};
module.exports = {
	postCustomerFeeback: {
		tags: ["api", "CustomerFeeback"],
		description: "create CustomerFeeback",
		validate: {
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	find: {
		tags: ["api", "CustomerFeeback"],
		description: "List CustomerFeeback",
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
	getCustomerFeeback: {
		tags: ["api", "CustomerFeeback"],
		description: "List CustomerFeeback",
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
	deleteCustomerFeeback: {
		tags: ["api", "CustomerFeeback"],
		description: "delete CustomerFeeback",
		validate: {
			params: {
				id: joi.alternatives().try(joi.number(), joi.string()).required(),
			},
		},

		handler: function (req, res) {
			Response(req, res, "deleteById");
		},
	},
	putCustomerFeeback: {
		tags: ["api", "CustomerFeeback"],
		description: "update CustomerFeeback",
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
	// getCustomerFeebackByProduct: {
	// 	tags: ["api", "CustomerFeeback"],
	// 	description: "List CustomerFeebackByProduct",
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
	// 		Response(req, res, "getCustomerFeebackByProduct");
	// 	},
	// },
};
