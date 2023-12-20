var QRCode = require("qrcode");
const crypto = require("crypto");

function makeQRHash(text) {
  const key = "thisiskey";

  return crypto
    .createHmac("sha256", key)
    .update(text)
    .digest("hex");
}

async function createQRCode(code, qrColor = "") {
  let __code = code + "";
  return new Promise((resolve, reject) => {
    try {
      var opts = {
        errorCorrectionLevel: "H",
        type: "image/jpeg",
        quality: 0.3,
        margin: 1,
        color: {
          dark: qrColor ? qrColor : "#000000",
          light: "#FFFFFF"
        }
      };

      let encodeString = makeQRHash(__code);

      let fileName = encodeString;

      let path = "images/" + fileName + ".jpeg";

      QRCode.toFile(path, __code, opts, function(err) {
        resolve(path);
      });
    } catch (e) {
      console.error(e)
      reject(undefined);
    }
  });
}

module.exports = {
  createQRCode,
};
