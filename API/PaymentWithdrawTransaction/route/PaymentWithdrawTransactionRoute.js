/**
 * Created by A on 7/18/17.
 */
"use strict";
const moduleName = 'PaymentWithdrawTransaction';
const Manager = require(`../manager/${moduleName}Manager`);
const Joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require('../../Common/CommonFunctions');
const SystemStatus = require('../../Maintain/MaintainFunctions').systemStatus;

const insertSchema = {
  id: Joi.number().required(),
  paymentAmount: Joi.number().required().min(0).default(1000000),
};

const updateSchema = {
  status: Joi.string(),
}

const filterSchema = {
  appUserId: Joi.number(),
  userName: Joi.string(),
  walletAddress: Joi.string(),
  walletType: Joi.string(),
  createdAt: Joi.string(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string(),
  memberLevelName: Joi.string(),
  active: Joi.number(),
  ipAddress: Joi.string(),
  phoneNumber: Joi.string(),
  paymentStatus: Joi.string(),
  paymentRef: Joi.string(),
  paymentApproveDate: Joi.string(),
  paymentMethodId: Joi.number(),
};

module.exports = {
  insert: {
    tags: ["api", `${moduleName}`],
    description: `insert ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }, { method: CommonFunctions.verifyStaffToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        ...insertSchema,
      })
    },
    handler: function (req, res) {
      if (SystemStatus.withdraw === false) {
        res("maintain").code(500);
        return;
      }
      Response(req, res, "insert");
    }
  },
  updateById: {
    tags: ["api", `${moduleName}`],
    description: `update ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }, { method: CommonFunctions.verifyStaffToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        id: Joi.number().min(0),
        data: Joi.object(updateSchema),
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateById");
    }
  },
  find: {
    tags: ["api", `${moduleName}`],
    description: `update ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }, { method: CommonFunctions.verifyStaffToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        filter: Joi.object(filterSchema),
        skip: Joi.number().default(0).min(0),
        limit: Joi.number().default(20).max(100),
        startDate: Joi.string(),
        endDate: Joi.string(),
        searchText: Joi.string(),
        order: Joi.object({
          key: Joi.string()
            .default("createdAt")
            .allow(""),
          value: Joi.string()
            .default("desc")
            .allow("")
        })
      })
    },
    handler: function (req, res) {
      Response(req, res, "find");
    }
  },
  findById: {
    tags: ["api", `${moduleName}`],
    description: `find by id ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        id: Joi.number().min(0)
      })
    },
    handler: function (req, res) {
      Response(req, res, "findById");
    }
  },
  requestWithdraw: {
    tags: ["api", `${moduleName}`],
    description: `requestWithdraw ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        paymentAmount: Joi.number().required().min(0).default(1000000),
        secondaryPassword: Joi.string().min(6),
        paymentNote: Joi.string(),
      })
    },
    handler: function (req, res) {
      if (SystemStatus.withdraw === false) {
        res("maintain").code(500);
        return;
      }
      Response(req, res, "requestWithdraw");
    }
  },
  getList: {
    tags: ["api", `${moduleName}`],
    description: `update ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        skip: Joi.number().default(0).min(0),
        limit: Joi.number().default(20).max(100),
        startDate: Joi.string(),
        endDate: Joi.string(),
        order: Joi.object({
          key: Joi.string()
            .default("createdAt")
            .allow(""),
          value: Joi.string()
            .default("desc")
            .allow("")
        })
      })
    },
    handler: function (req, res) {
      Response(req, res, "getList");
    }
  },
  approveWithdrawTransaction: {
    tags: ["api", `${moduleName}`],
    description: `approveWithdrawTransaction ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }, { method: CommonFunctions.verifyStaffToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        id: Joi.number().min(0),
        paymentNote: Joi.string(),
      })
    },
    handler: function (req, res) {
      if (SystemStatus.withdraw === false) {
        res("maintain").code(500);
        return;
      }
      Response(req, res, "approveWithdrawTransaction");
    }
  },
  denyWithdrawTransaction: {
    tags: ["api", `${moduleName}`],
    description: `denyWithdrawTransaction ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }, { method: CommonFunctions.verifyStaffToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        id: Joi.number().min(0),
        paymentNote: Joi.string(),
      })
    },
    handler: function (req, res) {
      if (SystemStatus.withdraw === false) {
        res("maintain").code(500);
        return;
      }
      Response(req, res, "denyWithdrawTransaction");
    }
  },
};
