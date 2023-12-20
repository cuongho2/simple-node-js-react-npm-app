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
	filter: {
		brandName: joi.string(),
		isHidden: joi.number(),
	},
};
module.exports = {
	postBrand: {
		tags: ["api", "Brand"],
		description: "create Brand",
		validate: {
			payload: joi.object(insertSchema),
		},
		handler: function (req, res) {
			Response(req, res, "insert");
		},
	},
	find: {
		tags: ["api", "Brand"],
		description: "List Brand",
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
	getBrand: {
		tags: ["api", "Brand"],
		description: "List Brand",
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
	deleteBrand: {
		tags: ["api", "Brand"],
		description: "delete Brand",
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
	putBrand: {
		tags: ["api", "Brand"],
		description: "update Brand",
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
	// getBrandByProduct: {
	// 	tags: ["api", "Brand"],
	// 	description: "List BrandByProduct",
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
	// 		Response(req, res, "getBrandByProduct");
	// 	},
	// },
};
