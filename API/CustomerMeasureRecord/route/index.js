const CustomerMeasureRecord_UserRoute = require('./CustomerMeasureRecord_UserRoute');

module.exports = [
  //Api CustomerSchedule
  { method: 'POST', path: '/CustomerMeasureRecord/user/getList', config: CustomerMeasureRecord_UserRoute.userGetListMeasureRecord },
  { method: 'POST', path: '/CustomerMeasureRecord/user/getDetail', config: CustomerMeasureRecord_UserRoute.userGetDetailMeasureRecordById },
  { method: 'POST', path: '/CustomerMeasureRecord/staff/getListByUser', config: CustomerMeasureRecord_UserRoute.staffGetListMeasureRecord },

];