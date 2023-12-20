module.exports = {
  PACKAGE_STATUS: {
    NEW: 1,
    HOT: 2,
    NORMAL: 3,
    SOLD: 4
  },
  ACTIVITY_STATUS: {
    PENDING: -10,
    COMPLETED: 0,
    WORKING: 1,
    STANDBY: 2,
    CANCELED: 3,
  },
  CLAIMABLE_STATUS: {
    DISABLE: 0,
    ENABLE: 1,
    CLAIMED: 2,
  },
  MINING_DURATION: 24, //24 hours
  PACKAGE_CATEGORY: {
    NORMAL: 'Normal',
    BONUS: 'Bonus'
  },
  PACKAGE_TYPE: {
    PERIOD: "PERIOD",
    COUNTER: "COUNTER",
  }
};
