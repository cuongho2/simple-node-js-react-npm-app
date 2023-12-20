const {CronInstance, executeJob} = require("../../ThirdParty/Cronjob/CronInstance");

const weeklyScheduler = () => {
  //every monday at 7:00
  CronInstance.schedule('0 7 * * 1', async function() {
    executeJob('./User/cronjob/Jobs_ResetMemberLevelName.js');
  });
};

async function startSchedule(){
  console.log("start UserSchedule");
  weeklyScheduler();
}

module.exports = {
  startSchedule,
};
