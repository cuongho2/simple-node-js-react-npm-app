/**
 * Created by A on 7/18/17.
 */
"use strict";
const UserResourceAccess = require("../resourceAccess/UserResourceAccess");
const BetRecordsResourceAccess = require("../../BetRecords/resourceAccess/BetRecordsResourceAccess");
async function resetMemberLevelName() {
  return new Promise(async (resolve, reject) => {
    try {
      //get all user order by commission level decending
      let userIdList = await CommissionUserResourceAccess.find({}, undefined, undefined, {key: 'commisionLevel', value: 'desc'});
      if(userIdList === undefined || userIdList.length < 0){
        reject("No member to reset");
        return;
      }

      for (let i = 0; i < userIdList.length; i++) {
        const userId = userIdList[i];
        
      }
      //re-calculate membership of all member

      //

      //reset all membership to lowest level "Member"
      let updateResult = await UserResourceAccess.updateAll({memberLevelName: "Member"});
      if (updateResult === undefined) {
        console.error("CAN NOT RESET MEMBER_LEVEL_NAME");
        reject("can not insert user");
      }
      resolve("done");
    } catch (e) {
      console.error(e);
      reject("failed");
    }
  });
};


module.exports = {
  resetMemberLevelName,
};
