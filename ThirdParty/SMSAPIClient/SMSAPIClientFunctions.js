
const moment = require('moment');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);
chai.use(chaiHttp);

const SMS_API_URL = process.env.SMS_API_URL || 'https://sms.com';
const SMS_API_USERNAME = process.env.SMS_API_USERNAME || 'smsuser';
const SMS_API_PASSWORD = process.env.SMS_API_PASSWORD || 'smspassword';
const SMS_API_BRAND = process.env.SMS_API_BRAND || 'smsbrand';

function _nonAccentVietnamese(str) {
  str = str.toLowerCase();
  //     We can also use this instead of from line 11 to line 17
  //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  //     str = str.replace(/\u0111/g, "d");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
}

async function checkSMS(smsId) {
  let body = {
    "username": SMS_API_USERNAME,
    "password": SMS_API_PASSWORD,
    "brandname": SMS_API_BRAND,
    "textmsg": "Hello",
    "sendtime": "20190219105500",
    "isunicode": 0,
    "listmsisdn": "84391222xxx;84351222xxx"
  };
  return new Promise((resolve, reject) => {
    chai
      .request(SMS_API_URL)
      .post(`/AppUsers/registerUser`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        token = 'Bearer ' + res.body.data.token;
        done();
      });
  });
}

async function sendSMS(message, phoneNumberList, customClient) {
  // username String Tên đăng nhập hệ thống Có phân biệt chữ hoa chữ thường
  // password String Mật khẩu đăng nhập
  // brandname String Tên Brandname Có phân biệt chữ hoa chữ thường
  // textmsg String Nội dung tin nhắn
  // sendtime String Thời gian gửi tin Theo format yyyyMMddHHmmss
  // isunicode Number Tin nhắn Unicode (0: nếu là tin nhắn không dấu, 8: nếu là tin nhắn unicode)
  // listmsisdn String Danh sách số điện thoại
  // nhận SMS Format bắt đầu là 84 hoặc 0. Nếu bắt đầu 0, hệ thống sẽ tự động đổi thành 84 trước khi xử lý dữ liệu. Danh sách SDT cách nhau bởi dấu
  // chấm phẩy “;” và không có khoảng trắng
  let sendTime = moment().format('YYYYMMDDhhmmss');

  let _smsApiUrl = SMS_API_URL;
  let _smsAuth = {
    "username": SMS_API_USERNAME,
    "password": SMS_API_PASSWORD,
    "brandname": SMS_API_BRAND,
  };

  if (customClient) {
    _smsAuth = {
      "username": customClient.smsApiUsername,
      "password": customClient.smsApiPassword,
      "brandname": customClient.smsAPIBrand,
    }
    _smsApiUrl = customClient.smsApiUrl;
  }

  let body = {
    ..._smsAuth,
    "textmsg": _nonAccentVietnamese(message),
    "sendtime": sendTime,
    "isunicode": 0,
    "listmsisdn": phoneNumberList.join(';')
  };
  return new Promise((resolve, reject) => {
    chai
      .request(_smsApiUrl)
      .post(`/sendsms`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        if (res) {
          let result = JSON.parse(res.text);
          console.log(result);
          if (result.code !== 0) {
            resolve(undefined)
          } else {
            resolve(result.transactionid);
          }
        } else {
          resolve(undefined)
        }
      });
  });
}

async function createClient(smsApiUrl, smsApiUsername, smsApiPassword, smsAPIBrand) {
  const invalidClient = undefined;
  if (smsApiUrl === undefined || smsApiUrl === null || smsApiUrl.trim() === "") {
    return invalidClient;
  }

  if (smsApiUsername === undefined || smsApiUsername === null || smsApiUsername.trim() === "") {
    return invalidClient;
  }

  if (smsApiPassword === undefined || smsApiPassword === null || smsApiPassword.trim() === "") {
    return invalidClient;
  }

  if (smsAPIBrand === undefined || smsAPIBrand === null || smsAPIBrand.trim() === "") {
    return invalidClient;
  }
  
  const newClient = {
    smsApiUrl: smsApiUrl,
    smsApiUsername: smsApiUsername,
    smsApiPassword: smsApiPassword,
    smsAPIBrand: smsAPIBrand
  }
  return newClient;
}
module.exports = {
  sendSMS,
  createClient
};
