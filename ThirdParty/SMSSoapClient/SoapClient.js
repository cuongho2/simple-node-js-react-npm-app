var soap = require('strong-soap').soap;

const SMS_URL_REQUEST = process.env.SMS_URL_REQUEST || 'http://soapurl.com';

async function initClient() {
  return new Promise((resolve, reject) => {
    var options = {};
    soap.createClient(SMS_URL_REQUEST, options, function (err, client) {
      resolve(client);
    });
  })
}

module.exports = {
  initClient,
};
