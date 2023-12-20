/**
 * Created by A on 7/18/17.
 */
"use strict";

const WalletResource = require("./resourceAccess/WalletResourceAccess");
const WALLET_TYPE = require("./WalletConstant").WALLET_TYPE;
const SystemConfigFunction = require("../SystemConfigurations/SystemConfigurationsFunction");

async function createWalletForUser(userId) {
  let newWalletData = [
    {
      appUserId: userId,
      walletType: WALLET_TYPE.POINT, //vi diem
    },
    {
      appUserId: userId,
      walletType: WALLET_TYPE.REWARD, //vi diem khuyen mai
    },
  ];
  let createdResult = await WalletResource.insert(newWalletData);
  return createdResult;
}

module.exports = {
  createWalletForUser
};
