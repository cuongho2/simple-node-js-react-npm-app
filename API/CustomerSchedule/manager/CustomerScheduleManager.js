/**
 * Created by A on 7/18/17.
 */
"use strict";
const moment = require('moment');

const CustomerScheduleResourceAccess = require("../resourceAccess/CustomerScheduleResourceAccess");
const CustomerScheduleStaffServiceView = require('../resourceAccess/CustomerScheduleStaffServiceView');
const StationsResourceAccess = require('../../Stations/resourceAccess/StationsResourceAccess');
const ScheduleFunctions = require('../CustomerScheduleFunctions');
const CustomerMessageFunction = require('../../CustomerMessage/CustomerMessageFunctions');
const { SCHEDULE_STATUS } = require('../CustomerScheduleConstants');
const utilFunctions = require('../../ApiUtils/utilFunctions');

const Logger = require('../../../utils/logging');

function _generateScheduleCode(customerScheduleId) {
  let _scheduleCode = utilFunctions.convertStringToHex(customerScheduleId + "");
  _scheduleCode = _scheduleCode.toUpperCase();
  _scheduleCode = utilFunctions.padLeadingZeros(_scheduleCode, 6);
  return _scheduleCode;
}

async function _addNewCustomerSchedule(scheduleData, stationsData) {
  if (stationsData) {
    scheduleData.customerScheduleAddress = `${stationsData.stationsName} - ${stationsData.stationsAddress}`;
  }

  let result = await ScheduleFunctions.insertSchedule(scheduleData);

  if (result) {
    scheduleData.customerScheduleId = result[0];

    //generate newScheduleCode
    let newScheduleCode = _generateScheduleCode(scheduleData.customerScheduleId);

    await CustomerScheduleResourceAccess.updateById(scheduleData.customerScheduleId, {
      scheduleCode: newScheduleCode
    });

    await CustomerMessageFunction.sendMessageNewSchedule(scheduleData, stationsData);
  } else {
    Logger.error(`can not add new schedule`);
  }
  return result;
}

async function _notifyCancelSchedule(customerScheduleId) {
  let _schedule = await CustomerScheduleResourceAccess.findById(customerScheduleId);

  if (_schedule) {
    let _station = undefined;
    if (_schedule.stationsId) {
      _station = await StationsResourceAccess.findById(_schedule.stationsId);
    }
    if (process.env.GOOGLE_FIREBASE_PUSH_ENABLE) {
      const sendMessageCancelSchedule = require('../../CustomerMessage/CustomerMessageFunctions').sendMessageCancelSchedule;
      sendMessageCancelSchedule(_schedule, _station);
    }
  }
}
async function insert(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleData = req.payload;
      let _currentStaff = req.currentUser;

      //neu la nhan vien cua tram dat lich thi tu lay id tram
      if (_currentStaff.stationsId) {
        customerScheduleData.stationsId = _currentStaff.stationsId;
      }

      //neu staff/agency tao lich hen thi luu lai lich su
      customerScheduleData.staffId = _currentStaff.staffId;

      let result = await _addNewCustomerSchedule(customerScheduleData, undefined);
      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("error");
    }
  });
};

async function find(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      let searchText = req.payload.searchText;
      let endDate = req.payload.endDate;
      let startDate = req.payload.startDate;

      if (!filter) {
        filter = {}
      }

      //only get data of current station
      if (filter && req.currentUser.stationsId && req.currentUser.stationsId !== null) {
        filter.stationsId = req.currentUser.stationsId;
      }

      let customerScheduleList = await CustomerScheduleStaffServiceView.customSearch(filter, skip, limit, startDate, endDate, searchText, order);
      
      if (customerScheduleList && customerScheduleList.length > 0) {
        const { createQRCode } = require('../../../ThirdParty/QRCode/QRCodeFunctions');
        for (let i = 0; i < customerScheduleList.length; i++) {
          customerScheduleList[i].scheduleQRUrl = await createQRCode(customerScheduleList[i].scheduleCode);
          customerScheduleList[i].scheduleQRUrl = `https://${process.env.HOST_NAME}/${customerScheduleList[i].scheduleQRUrl}`;
        }
        let customerScheduleCount = await CustomerScheduleStaffServiceView.customCount(filter, startDate, endDate, searchText, order);
        resolve({ data: customerScheduleList, total: customerScheduleCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

function generateEmptyBookingScheduleList(numberOfDevices) {
  let __emptyScheduleList = [];
  let __emptySchedule = {
    customerScheduleId: null,
    customerIdentity: null,
    customerPhone: null,
    customerName: null,
    customerEmail: null,
    customerScheduleDate: null,
    customerScheduleTime: null,
    customerScheduleAddress: null,
    customerScheduleNote: null,
    customerScheduleStatus: null,
    stationsId: null,
    appUserId: null,
    staffId: null,
    agencyId: null,
    stationServicesId: null,
    stationProductsId: null,
    createdAt: null,
    isDeleted: null,
    isHidden: null,
    scheduleRefId: null,
    scheduleCode: null,

    firstName: null, //ho va ten PT
    lastName: null, //ho va ten PT
    staffAvatar: null, //avatar cua PT

    packageName: null,  //<< Tên gói tap 
    packageType: null,  //<< Loai goi tap
    bookedStatus: 0,
  }
  const SECTION_PER_HOUR = 2;
  const SECTION_PER_DAY = SECTION_PER_HOUR * 20; //18 hours per day
  for (let i = 0; i < SECTION_PER_DAY ; i++) {
    let _newEmptySchedule = JSON.parse(JSON.stringify(__emptySchedule));
    _newEmptySchedule.customerScheduleTime = moment("04:00","HH:mm").add(i * 30, 'minute').format("HH:mm");

    for (let i = 0; i < numberOfDevices; i++) {
      __emptyScheduleList.push(_newEmptySchedule);
    }
  }

  return __emptyScheduleList;
}

function _fillBookedSchedule(currentUser, emptyScheduleList, bookedScheduleList) {
  for (let i = 0; i < emptyScheduleList.length; i++) {
    const __emptySchedule = emptyScheduleList[i];
    for (let j = 0; j < bookedScheduleList.length; j++) {
      const __bookedSchedule = bookedScheduleList[j];
      
      if (!bookedScheduleList[j].checked && __emptySchedule.customerScheduleTime === __bookedSchedule.customerScheduleTime && __emptySchedule.bookedStatus === 0) {
        emptyScheduleList[i] = __bookedSchedule;
        if (currentUser.appUserId && currentUser.appUserId === __bookedSchedule.appUserId) {
          const OWNED_SCHEDULE = 2;
          emptyScheduleList[i].bookedStatus = OWNED_SCHEDULE;
        } else {
          const BOOKED_BY_OTHERS = 1;
          emptyScheduleList[i].bookedStatus = BOOKED_BY_OTHERS;
        }
        bookedScheduleList[j].checked = 1;
        break;
      }
    }
  }
  return emptyScheduleList;
}
async function fetchPublicList(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      let searchText = req.payload.searchText;
      let endDate = req.payload.endDate;
      let startDate = req.payload.startDate;
      let stationsId = req.payload.stationsId;

      if (!filter) {
        filter = {}
      }
      filter.stationsId = stationsId;

      let customerScheduleList = await CustomerScheduleStaffServiceView.customSearch(filter, skip, limit, startDate, endDate, searchText, order);

      if (customerScheduleList && customerScheduleList.length > 0) {
        
        let customerScheduleCount = await CustomerScheduleStaffServiceView.customCount(filter, startDate, endDate, searchText, order);
        const { createQRCode } = require('../../../ThirdParty/QRCode/QRCodeFunctions');
        for (let i = 0; i < customerScheduleList.length; i++) {
          customerScheduleList[i].scheduleQRUrl = await createQRCode(customerScheduleList[i].scheduleCode)
          customerScheduleList[i].scheduleQRUrl = `https://${process.env.HOST_NAME}/${customerScheduleList[i].scheduleQRUrl}`;
        }

        //neu co station thi se mapping tung khung gio vao cho station
        if (stationsId) {
          let _station = await StationsResourceAccess.findById(stationsId);
          let __allCustomerScheduleList = generateEmptyBookingScheduleList(_station.stationDevices);
          customerScheduleList = _fillBookedSchedule(req.currentUser, __allCustomerScheduleList, customerScheduleList);
        }

        resolve({ data: customerScheduleList, total: customerScheduleCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function updateById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;
      let customerScheduleData = req.payload.data;
      let result = await CustomerScheduleResourceAccess.updateById(customerScheduleId, customerScheduleData);
      if (result) {
        resolve(result);
      }
      reject("failed");
    } catch (e) {
      Logger.error(__filename, e);
      reject("error");
    }
  });
};

async function findById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;
      let _scheduleData = await CustomerScheduleStaffServiceView.findById(customerScheduleId);
      if (_scheduleData) {
        resolve(_scheduleData);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function deleteById(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;

      let result = await CustomerScheduleResourceAccess.deleteById(customerScheduleId);
      if (result) {
        resolve(result);
      }
      else {
        reject("failed");
      }

    } catch (e) {

      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

//kiem tra thoi gian hen
async function _allowScheduleByTimeDiffFromLastSchedule(appUserId, customerScheduleData) {
  //thoi diem hien tai
  let _lastScheduledLimitTime = moment(customerScheduleData.customerScheduleDate, 'YYYY/MM/DD').toDate();
  _lastScheduledLimitTime.setHours(moment(customerScheduleData.customerScheduleTime, 'HH:mm').toDate().getHours());
  _lastScheduledLimitTime.setMinutes(moment(customerScheduleData.customerScheduleTime, 'HH:mm').toDate().getMinutes());

  //danh sach lich hen hien tai
  let _scheduleList = await CustomerScheduleResourceAccess.customSearch({
    appUserId: appUserId,
    customerScheduleStatus: SCHEDULE_STATUS.NEW
  }, 0, 10, undefined, undefined, undefined, { key: "customerScheduleDate", value: "desc" });
  if (_scheduleList && _scheduleList.length > 0) {
    for (let i = 0; i < _scheduleList.length; i++) {
      const _schedule = _scheduleList[i];

      let _scheduleDateTime = moment(_schedule.customerScheduleDate, 'YYYY/MM/DD').toDate();
      _scheduleDateTime.setHours(moment(_schedule.customerScheduleTime, 'HH:mm').toDate().getHours());
      _scheduleDateTime.setMinutes(moment(_schedule.customerScheduleTime, 'HH:mm').toDate().getMinutes());

      //thoi gian so voi buoi tap truoc do toi thieu phai cach nhau 72h
      let _diffHour = moment(_lastScheduledLimitTime).diff(_scheduleDateTime, 'hours', true);

      if (_diffHour < 72 && _diffHour > 0) {
        const NOT_ALLOWED = false;
        return NOT_ALLOWED;
      }
    }
  }
  const ALLOWED = true;
  return ALLOWED;
}

async function userInsertSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleData = req.payload;
      let _currentUser = req.currentUser;

      let _verifySchedule = await _allowScheduleByTimeDiffFromLastSchedule(_currentUser.appUserId, customerScheduleData);
      if (_verifySchedule !== true) {
        Logger.error(`_allowScheduleByTimeDiffFromLastSchedule false for appUserId ${_currentUser.appUserId}`);
        reject("NEW_SCHEDULE_TOO_SOON");
        return;
      }

      let selectedStation = undefined;
      if (!selectedStation && req.payload.stationUrl) {
        selectedStation = await StationsResourceAccess.find({ stationUrl: req.payload.stationUrl }, 0, 1);
        if (!selectedStation && selectedStation.length <= 0) {
          Logger.error(`can not find station for userInsertSchedule`);
          reject("failed");
          return;
        } else {
          selectedStation = selectedStation[0];
        }
        delete customerScheduleData.stationUrl;
      }

      if (!selectedStation && req.payload.stationsId) {
        selectedStation = await StationsResourceAccess.find({ stationsId: req.payload.stationsId }, 0, 1);
        if (!selectedStation && selectedStation.length <= 0) {
          Logger.error(`can not find station for userInsertSchedule`);
          reject("failed");
          return;
        } else {
          selectedStation = selectedStation[0];
        }
      }

      customerScheduleData.stationsId = selectedStation.stationsId;

      //neu user ben trong he thong (da login) tao lich hen thi luu lai lich su
      if (_currentUser) {
        customerScheduleData.appUserId = _currentUser.appUserId;
      }

      let result = await _addNewCustomerSchedule(customerScheduleData, selectedStation);
      if (result) {
        resolve(result);
        return;
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function userGetListSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      let searchText = req.payload.searchText;
      let endDate = req.payload.endDate;
      let startDate = req.payload.startDate;

      //only get data of current station
      if (filter && req.currentUser.stationsId) {
        filter.stationsId = req.currentUser.stationsId;
      }
      let customerScheduleList = await CustomerScheduleStaffServiceView.customSearch(filter, skip, limit, startDate, endDate, searchText, order);

      if (customerScheduleList && customerScheduleList.length > 0) {
        let customerScheduleCount = await CustomerScheduleStaffServiceView.customCount(filter, startDate, endDate, searchText, order);
        resolve({ data: customerScheduleList, total: customerScheduleCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function _validCancelTimeForSchedule(customerScheduleId) {
  let _schedule = await CustomerScheduleStaffServiceView.findById(customerScheduleId);

  //thoi diem hien tai
  let _lastScheduledLimitTime = moment();

  let _scheduleDateTime = moment(_schedule.customerScheduleDate, 'YYYY/MM/DD').toDate();
  _scheduleDateTime.setHours(moment(_schedule.customerScheduleTime, 'HH:mm').toDate().getHours());
  _scheduleDateTime.setMinutes(moment(_schedule.customerScheduleTime, 'HH:mm').toDate().getMinutes());

  //chi cho cancel truoc 2h
  let _diffHour = moment(_lastScheduledLimitTime).diff(_scheduleDateTime, 'hours');

  if (_diffHour < 2 && _diffHour > 0) {
    const NOT_ALLOWED = false;
    return NOT_ALLOWED;
  }
  const ALLOWED = true;
  return ALLOWED;

}

async function userCancelSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;

      let _verifySchedule = await _validCancelTimeForSchedule(customerScheduleId);
      if (_verifySchedule !== true) {
        Logger.error(`_validCancelTimeForSchedule false for appUserId ${_currentUser.appUserId}`);
        reject("CANCEL_SCHEDULE_TOO_LATE");
        return;
      }

      let customerScheduleData = {
        customerScheduleStatus: SCHEDULE_STATUS.CANCELED,
        customerScheduleNote: req.payload.customerScheduleNote ? req.payload.customerScheduleNote : "Người dùng tự hủy"
      };
      let result = await CustomerScheduleResourceAccess.updateById(customerScheduleId, customerScheduleData);
      if (result) {
        await _notifyCancelSchedule
        resolve(result);
      }
      reject("failed");
    } catch (e) {
      Logger.error(__filename, e);
      reject("error");
    }
  });
};

async function userGetDetailSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;
      let _scheduleData = await CustomerScheduleStaffServiceView.findById(customerScheduleId);
      if (_scheduleData) {
        const { createQRCode } = require('../../../ThirdParty/QRCode/QRCodeFunctions');
        _scheduleData.scheduleQRUrl = await createQRCode(_scheduleData.scheduleCode);
        _scheduleData.scheduleQRUrl = `https://${process.env.HOST_NAME}/${_scheduleData.scheduleQRUrl}`;
        resolve(_scheduleData);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function staffInsertSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleData = req.payload;
      let _currentStaff = req.currentUser;

      let _verifySchedule = await _allowScheduleByTimeDiffFromLastSchedule(customerScheduleData.appUserId);
      if (_verifySchedule !== true) {
        Logger.error(`_allowScheduleByTimeDiffFromLastSchedule false for appUserId ${customerScheduleData.appUserId}`);
        reject("NEW_SCHEDULE_TOO_SOON");
        return;
      }

      //neu la agency thi tu lay stationsId gan vao luon
      if (!customerScheduleData.stationsId && _currentStaff.stationsId) {
        customerScheduleData.stationsId = _currentStaff.stationsId;
      }

      //neu staff tao lich hen thi staff tu duyet luon roi
      customerScheduleData.customerScheduleStatus = SCHEDULE_STATUS.APPROVED;

      if (_currentStaff.staffId) {
        //neu staff/agency tao lich hen thi luu lai lich su
        customerScheduleData.staffId = _currentStaff.staffId;

        //neu la agency tao lich hen thi tu phan cong cho agency luon
        customerScheduleData.agencyId = _currentStaff.staffId;
      }

      let result = await _addNewCustomerSchedule(customerScheduleData, undefined);
      if (result) {
        resolve(result);
        return;
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function staffGetListSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let filter = req.payload.filter;
      let skip = req.payload.skip;
      let limit = req.payload.limit;
      let order = req.payload.order;
      let searchText = req.payload.searchText;
      let endDate = req.payload.endDate;
      let startDate = req.payload.startDate;

      if (!filter) {
        filter = {}
      }
      //only get data of current station
      if (filter && req.currentUser.stationsId) {
        filter.stationsId = req.currentUser.stationsId;
      }

      let _currentStaff = req.currentUser;
      if (_currentStaff.staffId) {
        //neu la agency tao lich hen thi tu phan cong cho agency luon
        filter.agencyId = _currentStaff.staffId;
      }

      let customerScheduleList = await CustomerScheduleStaffServiceView.customSearch(filter, skip, limit, startDate, endDate, searchText, order);

      if (customerScheduleList && customerScheduleList.length > 0) {
        let customerScheduleCount = await CustomerScheduleStaffServiceView.customCount(filter, startDate, endDate, searchText, order);
        resolve({ data: customerScheduleList, total: customerScheduleCount[0].count });
      } else {
        resolve({ data: [], total: 0 });
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function staffCancelSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;

      let _verifySchedule = await _validCancelTimeForSchedule(customerScheduleId);
      if (_verifySchedule !== true) {
        Logger.error(`_validCancelTimeForSchedule false for appUserId ${_currentUser.appUserId}`);
        reject("CANCEL_SCHEDULE_TOO_LATE");
        return;
      }

      let customerScheduleData = {
        customerScheduleStatus: SCHEDULE_STATUS.CANCELED,
        customerScheduleNote: req.payload.customerScheduleNote ? req.payload.customerScheduleNote : "Nhân viên tự hủy"
      };

      let result = await CustomerScheduleResourceAccess.updateById(customerScheduleId, customerScheduleData);
      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }

    } catch (e) {
      Logger.error(__filename, e);
      reject("error");
    }
  });
};

//cap nhat so buoi tap con lai
async function _updateServicePackage(customerScheduleId) {
  //lay thong tin lich hen
  let _schedule = await CustomerScheduleResourceAccess.findById(customerScheduleId);
  if (_schedule === undefined) {
    Logger.error(`can not reduce servicePackage counter`)
    return undefined;
  }

  //lay thong tin goi user dang mua
  const ServicePackageResource = require('../../PaymentServicePackage/resourceAccess/PaymentServicePackageUserResourceAccess');
  let _package = ServicePackageResource.findById(_schedule.scheduleRefId);
  if (_package === undefined || _package.profitClaimed === _package.profitEstimate) {
    Logger.error(`can not find package to reduce counter`)
    return undefined;
  }

  //cap nhat so buoi da tap
  let updatedResult = ServicePackageResource.updateById(_schedule.scheduleRefId, {
    profitClaimed: _package.profitClaimed + 1
  });

  return updatedResult;
}

async function staffAcceptSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;
      let customerScheduleData = {
        customerScheduleStatus: SCHEDULE_STATUS.APPROVED,
      };

      //cap nhat so buoi tap
      let result = await _updateServicePackage(customerScheduleId);;
      if (result === undefined) {
        reject("OVER_LIMITED_PACKAGE");
        return; //make sure everything stop
      }

      result = await CustomerScheduleResourceAccess.updateById(customerScheduleId, customerScheduleData);

      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }

    } catch (e) {
      Logger.error(__filename, e);
      reject("error");
    }
  });
};

async function staffGetDetailSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;
      let _scheduleData = await CustomerScheduleStaffServiceView.findById(customerScheduleId);
      if (_scheduleData) {
        resolve(_scheduleData);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};
async function staffGetDetailScheduleByQR(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let _scheduleCode = req.payload.scheduleCode;
      let _scheduleData = await CustomerScheduleStaffServiceView.find({
        scheduleCode: _scheduleCode
      }, 0, 1);

      if (_scheduleData && _scheduleData.length > 0) {
        _scheduleData = _scheduleData[0];
        const { createQRCode } = require('../../../ThirdParty/QRCode/QRCodeFunctions');
        _scheduleData.scheduleQRUrl = await createQRCode(_scheduleData.scheduleCode);
        _scheduleData.scheduleQRUrl = `https://${process.env.HOST_NAME}/${_scheduleData.scheduleQRUrl}`;
        resolve(_scheduleData);
      } else {
        reject("failed");
      }
    } catch (e) {
      Logger.error(__filename, e);
      reject("failed");
    }
  });
};

async function adminCancelSchedule(req) {
  return new Promise(async (resolve, reject) => {
    try {
      let customerScheduleId = req.payload.customerScheduleId;

      let _verifySchedule = await _validCancelTimeForSchedule(customerScheduleId);
      if (_verifySchedule !== true) {
        Logger.error(`_validCancelTimeForSchedule false for appUserId ${_currentUser.appUserId}`);
        reject("CANCEL_SCHEDULE_TOO_LATE");
        return;
      }

      let customerScheduleData = {
        customerScheduleStatus: SCHEDULE_STATUS.CANCELED,
        customerScheduleNote: req.payload.customerScheduleNote ? req.payload.customerScheduleNote : "Nhân viên tự hủy"
      };

      let result = await CustomerScheduleResourceAccess.updateById(customerScheduleId, customerScheduleData);
      if (result) {
        resolve(result);
      } else {
        reject("failed");
      }

    } catch (e) {
      Logger.error(__filename, e);
      reject("error");
    }
  });
};


module.exports = {
  insert,
  find,
  updateById,
  findById,
  deleteById,
  adminCancelSchedule,

  staffInsertSchedule,
  staffGetListSchedule,
  staffCancelSchedule,
  staffAcceptSchedule,
  staffGetDetailSchedule,
  staffGetDetailScheduleByQR,
  userInsertSchedule,
  userGetListSchedule,
  userGetDetailSchedule,
  userCancelSchedule,

  fetchPublicList
};
