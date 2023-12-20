/**
 * Created by A on 7/18/17.
 */
"use strict";
const moduleName = "Upload";
const Manager = require(`../manager/${moduleName}Manager`);
const Joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require("../../Common/CommonFunctions");

module.exports = {
	uploadMediaFile: {
		tags: ["api", `${moduleName}`],
		description: `${moduleName} upload media`,
		pre: [{ method: CommonFunctions.verifyToken }],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object({
				imageData: Joi.binary().encoding("base64"),
				imageFormat: Joi.string().default("png"),
			}),
		},
		payload: {
			maxBytes: 100 * 1024 * 1024, //100 mb
			// output: 'file',
			parse: true,
			// allow: 'multipart/form-data',
			// multipart: {
			//     output: 'data',
			// }
		},
		handler: function (req, res) {
			Response(req, res, "uploadMediaFile");
		},
	},
	uploadUserAvatar: {
		tags: ["api", `${moduleName}`],
		description: `${moduleName} upload media`,
		pre: [{ method: CommonFunctions.verifyToken }],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object({
				image: Joi.binary().encoding("base64"),
				imageFormat: Joi.string().default("png"),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "uploadUserAvatar");
		},
	},
	detectTextImage: {
		tags: ["api", `${moduleName}`],
		description: `${moduleName} detectTextImage`,
		pre: [{ method: CommonFunctions.verifyToken }],
		auth: {
			strategy: "jwt",
		},
		validate: {
			headers: Joi.object({
				authorization: Joi.string(),
			}).unknown(),
			payload: Joi.object({
				url: Joi.string(),
			}),
		},
		handler: function (req, res) {
			Response(req, res, "detectText");
		},
	},
};
