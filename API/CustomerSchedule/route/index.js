const CustomerSchedule = require('./CustomerScheduleRoute');
const CustomerSchedule_User = require('./CustomerSchedule_UserRoute');
const CustomerSchedule_Staff = require('./CustomerSchedule_StaffRoute');

module.exports = [
  //Api CustomerSchedule
  { method: 'POST', path: '/CustomerSchedule/insert', config: CustomerSchedule.insert },
  { method: 'POST', path: '/CustomerSchedule/updateById', config: CustomerSchedule.updateById },
  { method: 'POST', path: '/CustomerSchedule/findById', config: CustomerSchedule.findById },
  { method: 'POST', path: '/CustomerSchedule/find', config: CustomerSchedule.find },
  { method: 'POST', path: '/CustomerSchedule/cancelSchedule', config: CustomerSchedule.adminCancelSchedule },

  { method: 'POST', path: '/CustomerSchedule/deleteById', config: CustomerSchedule.deleteById },
  { method: 'POST', path: '/CustomerSchedule/user/insertSchedule', config: CustomerSchedule_User.userInsertSchedule },
  { method: 'POST', path: '/CustomerSchedule/user/getList', config: CustomerSchedule_User.userGetListSchedule },
  { method: 'POST', path: '/CustomerSchedule/user/getDetail', config: CustomerSchedule_User.userGetDetailSchedule },
  { method: 'POST', path: '/CustomerSchedule/user/cancelSchedule', config: CustomerSchedule_User.userCancelSchedule },
  { method: 'POST', path: '/CustomerSchedule/user/fetchPublicList', config: CustomerSchedule_User.fetchPublicList },

  { method: 'POST', path: '/CustomerSchedule/staff/insertSchedule', config: CustomerSchedule_Staff.staffInsertSchedule },
  { method: 'POST', path: '/CustomerSchedule/staff/getList', config: CustomerSchedule_Staff.staffGetListSchedule },
  { method: 'POST', path: '/CustomerSchedule/staff/getDetail', config: CustomerSchedule_Staff.staffGetDetailSchedule },
  { method: 'POST', path: '/CustomerSchedule/staff/getDetailByQR', config: CustomerSchedule_Staff.staffGetDetailScheduleByQR },
  { method: 'POST', path: '/CustomerSchedule/staff/cancelSchedule', config: CustomerSchedule_Staff.staffCancelSchedule },
  { method: 'POST', path: '/CustomerSchedule/staff/acceptSchedule', config: CustomerSchedule_Staff.staffAcceptSchedule },
  { method: 'POST', path: '/CustomerSchedule/staff/getUserSchedule', config: CustomerSchedule_Staff.staffGetListUserSchedule },
  
];