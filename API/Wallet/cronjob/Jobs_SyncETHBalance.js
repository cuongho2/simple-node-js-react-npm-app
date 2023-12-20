/**
 * Created by A on 7/18/17.
 */
"use strict";
const WalletJobs = require("../cronjob/WalletJobs");

const promise1 = new Promise((resolve) => {
  WalletJobs.checkAllTransactionHistory().then(() => {
    resolve("checkAllTransactionHistory done");
  });
});

const promise2 = new Promise((resolve) => {
  WalletJobs.checkAllTransactionHistory().then(() => {
    resolve("checkAllTransactionHistory done");
  });
});

Promise.all([promise1, promise2]).then((values) => {
  console.log(values);
  process.exit([200]);
});