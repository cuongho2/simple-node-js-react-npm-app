const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const moment = require('moment');

const { checkResponseStatus } = require('../../Common/test/Common');
const TestFunctions = require('../../Common/test/CommonTestFunctions');

chai.should();
chai.use(chaiHttp);
chai.use(chaiHttp);
const expect = chai.expect;

const Model = require('../resourceAccess/PaymentDepositTransactionResourceAccess');

const app = require('../../../server');

const PAYMENT_STATUS = require('../PaymentDepositTransactionConstant').DEPOSIT_TRX_STATUS;

describe(`Tests ${Model.modelName}`, () => {
  let staffToken = "";
  let userToken = "";
  let paymentId = "";
  let userData = {};
  let userId = 0;
  let staffId = 0;

  before(done => {
    new Promise(async (resolve, reject) => {
      let staffData = await TestFunctions.loginStaff();
      userData = await TestFunctions.loginUser();
      staffToken = staffData.token;
      staffId = staffData.staffId;
      userToken = userData.token;
      userId = userData.appUserId;
      userData = userData;
      resolve();
    }).then(() => done());
  });

  it('staff insert new deposit payment (to approve)', done => {
    const body = {
      appUserId: userId,
      paymentAmount: 500000,
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/insert`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        paymentId = res.body.data[0]
        done();
      });
  });
  it('user request new deposit payment (to approve)', done => {
    const body = {
      paymentAmount: 500000,
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/user/requestDeposit`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        paymentId = res.body.data[0]
        done();
      });
  });
  it('staff approve deposit payment manually', done => {
    const body = {
      id: paymentId
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/approveDepositTransaction`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('staff insert new deposit payment (to reject)', done => {
    const body = {
      appUserId: userId,
      paymentAmount: 500000,
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/insert`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        paymentId = res.body.data[0]
        done();
      });
  });

  it('staff deny deposit payment manually', done => {
    const body = {
      id: paymentId
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/denyDepositTransaction`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('staff view detail of deposit payment', done => {
    const body = {
      id: paymentId
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/findById`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (no filter)', done => {
    const body = {};
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter staff)', done => {
    const body = {
      "filter": {
        paymentPICId: staffId
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter user id)', done => {
    const body = {
      "filter": {
        appUserId: userId
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter username)', done => {
    const body = {
      "filter": {
        username: userData.username
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter email)', done => {
    const body = {
      "filter": {
        email: userData.email
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter phoneNumber)', done => {
    const body = {
      "filter": {
        phoneNumber: userData.phoneNumber
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter payment ref number)', done => {
    const body = {
      "filter": {
        paymentRef: "sample ref"
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter NEW payment)', done => {
    const body = {
      "filter": {
        paymentStatus: PAYMENT_STATUS.NEW
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter PENDING payment)', done => {
    const body = {
      "filter": {
        paymentStatus: PAYMENT_STATUS.PENDING
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter CANCELED payment)', done => {
    const body = {
      "filter": {
        paymentStatus: PAYMENT_STATUS.CANCELED
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter APPROVED payment)', done => {
    const body = {
      "filter": {
        paymentStatus: PAYMENT_STATUS.COMPLETED
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('find list of deposit payment (filter WAITING payment)', done => {
    const body = {
      "filter": {
        paymentStatus: PAYMENT_STATUS.WAITING
      },
      "skip": 0,
      "limit": 20,
      "order": {
        "key": "createdAt",
        "value": "desc"
      }
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        done();
      });
  });

  it('staff get list of deposit payment by startDate', done => {
    const body = {
      startDate: moment().subtract(5, 'day').toDate()
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });

  it('staff get list of deposit payment by endDate', done => {
    const body = {
      endDate: moment().add(5, 'day').toDate()
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/find`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });

  it('user get list of deposit payment by startDate', done => {
    const body = {
      startDate: moment().subtract(5, 'day').toDate()
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/user/depositHistory`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });

  it('user get list of deposit payment by endDate', done => {
    const body = {
      endDate: moment().add(5, 'day').toDate()
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/user/depositHistory`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });

  it('user get list of deposit payment', done => {
    const body = {};
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/user/depositHistory`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });

  it('add reward point for user', done => {
    let rewardAmount = 100000;
    const body = {
      id: userId,
      amount: rewardAmount
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/${Model.modelName}/addRewardPointForUser`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        let oldReward = 0;

        for (let i = 0; i < userData.wallets.length; i++) {
          const wallet = userData.wallets[i];
          if (wallet.walletType === "RewardWallet") {
            oldReward = wallet.balance;
            break;
          }
        }

        TestFunctions.loginUser().then((newUserData) => {
          let newReward = 0;
          for (let i = 0; i < newUserData.wallets.length; i++) {
            const wallet = newUserData.wallets[i];
            if (wallet.walletType === "RewardWallet") {
              newReward = wallet.balance;
              break;
            }
          }
  
          //bảo đảm phải thêm đúng lượng điểm
          expect(newReward).to.equal(oldReward * 1 + rewardAmount * 1);
          done();
        });

      });
  });
  
  //TODO

  // it('update payment Ref (if Ref is empty)', done => {
  //   const body = {
  //     id: paymentId,
  //     data: {
  //       paymentRef: "sample ref"
  //     }
  //   };

  //   chai
  //     .request(`0.0.0.0:${process.env.PORT}`)
  //     .post(`/${Model.modelName}/updateById`)
  //     .set("Authorization", `Bearer ${staffToken}`)
  //     .send(body)
  //     .end((err, res) => {
  //       if (err) {
  //         console.error(err);
  //       }
  //       checkResponseStatus(res, 200);
  //       done();
  //     });
  // });

  // it('delete payment method', done => {
  //   const body = {
  //     id: paymentId
  //   };

  //   chai
  //     .request(`0.0.0.0:${process.env.PORT}`)
  //     .post(`/${Model.modelName}/deleteById`)
  //     .set("Authorization", `Bearer ${staffToken}`)
  //     .send(body)
  //     .end((err, res) => {
  //       if (err) {
  //         console.error(err);
  //       }
  //       checkResponseStatus(res, 200);
  //       done();
  //     });
  // });
  it('export excel history deposit payment of user', done => {
    const body = {
      id: userId
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentDepositTransaction/exportExcelHistory`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });
  it('export excel history deposit payment of month', done => {
    const body = {
      startDate: faker.date.future().toString(),
      endDate: faker.date.future().toString(),
    };
    chai
      .request(`0.0.0.0:${process.env.PORT}`)
      .post(`/PaymentDepositTransaction/exportSalesToExcel`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body)
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
        checkResponseStatus(res, 200);
        //bảo đảm phải có lịch sử (vì các case ở trên đã tạo ra cho user này)
        expect(res.body.data.length).to.not.equal(0);
        done();
      });
  });

})