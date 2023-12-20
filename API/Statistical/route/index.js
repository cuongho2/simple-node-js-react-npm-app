const Statistical = require('./StatisticalRoute');

module.exports = [
  { method: 'POST', path: '/Statistical/generalReport', config: Statistical.generalReport },
  // { method: 'POST', path: '/Statistical/summaryUserPayment', config: Statistical.summaryUserPayment },
  // { method: 'POST', path: '/Statistical/user/summaryReferUser', config: Statistical.userSummaryReferUser },
];
