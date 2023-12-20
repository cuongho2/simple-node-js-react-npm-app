const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
// const fs = require('fs');

const { checkResponseStatus } = require('../../Common/test/Common');
const TestFunctions = require('../../Common/test/CommonTestFunctions');

chai.should();
chai.use(chaiHttp);
chai.use(chaiHttp);

const app = require('../../../server');

describe(`Tests PaymentExchangeTransaction`, () => {
  let staffToken = "";
  let paymentMethodId = "";
  let userToken = "";
  let testUserId;
  let transactionId;
  before(done => {
    new Promise(async (resolve, reject) => {
      let staffData = await TestFunctions.loginStaff();
      staffToken = `Bearer ${staffData.token}`;
      let userData = await TestFunctions.loginUser();
      testUserId = userData.appUserId;
      userToken = `Bearer ${userData.token}`;
      resolve();
    }).then(() => done());
  });

  it('user request new PaymentExchangeTransaction', done => {
    const body = {
      paymentAmount: 1,
      walletBalanceUnitId: 2 //always available 
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/requestExchange`)
      .set("Authorization", `${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        transactionId = res.body.data[0];
        done();
      });
  });

  it('player request new PaymentExchangeTransaction', done => {
    const body = {
      paymentAmount: 1,
      walletBalanceUnitId: 2 //always available 
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/requestExchange`)
      .set("Authorization", `${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        transactionId = res.body.data[0];
        done();
      });
  });

  it('player request new PaymentExchangeTransaction', done => {
    const body = {
      paymentAmount: 1,
      walletBalanceUnitId: 2 //always available 
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/requestExchange`)
      .set("Authorization", `${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        transactionId = res.body.data[0];
        done();
      });
  });

  it('POST /PaymentExchangeTransaction/user/exchangeHistory', done => {
    const body = {
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/exchangeHistory`)
      .set("Authorization", `${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('POST /PaymentExchangeTransaction/user/receiveHistory', done => {
    const body = {
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/receiveHistory`)
      .set("Authorization", `${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('POST /PaymentExchangeTransaction/user/viewExchangeRequests', done => {
    const body = {
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/viewExchangeRequests`)
      .set("Authorization", `${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('POST /PaymentExchangeTransaction/user/denyExchangeRequest', done => {
    const body = {
      id: transactionId,
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/denyExchangeRequest`)
      .set("Authorization", `${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('POST /PaymentExchangeTransaction/user/acceptExchangeRequest', done => {
    const body = {
      id: transactionId,
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/acceptExchangeRequest`)
      .set("Authorization", `${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('POST /PaymentExchangeTransaction/user/cancelExchangeRequest', done => {
    const body = {
      id: transactionId,
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentExchangeTransaction/user/cancelExchangeRequest`)
      .set("Authorization", `${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });
})