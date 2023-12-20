/**
 * Created by A on 7/18/17.
 */
"use strict";

const Manager = require(`../manager/Manager`);
const joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");
const insertSchema = {
	brandName: joi.string().required(),
	parentId: joi.string(),
	imageUrl: joi.string(),
};

const updateSchema = {
	brandName: joi.string().required(),
	parentId: joi.string(),
	imageUrl: joi.string(),
};

const filterSchema = {
	skip: joi.number(),
	limit: joi.number(),
	orderBy: joi.string(),
	value: joi.string(),
	filter: {},
};
module.exports = {
	postCustomerComment: {
		tags: ["api", "CustomerComment"],
		description: "create CustomerComment",
		validate: {
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	find: {
		tags: ["api", "CustomerComment"],
		description: "List CustomerComment",
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
	getCustomerComment: {
		tags: ["api", "CustomerComment"],
		description: "List CustomerComment",
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
	deleteCustomerComment: {
		tags: ["api", "CustomerComment"],
		description: "delete CustomerComment",
		validate: {
			params: {
				id: joi.alternatives().try(joi.number(), joi.string()).required(),
			},
		},

		handler: function (req, res) {
			Response(req, res, "deleteById");
		},
	},
	putCustomerComment: {
		tags: ["api", "CustomerComment"],
		description: "update CustomerComment",
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
	// getCustomerCommentByProduct: {
	// 	tags: ["api", "CustomerComment"],
	// 	description: "List CustomerCommentByProduct",
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
	// 		Response(req, res, "getCustomerCommentByProduct");
	// 	},
	// },
};
