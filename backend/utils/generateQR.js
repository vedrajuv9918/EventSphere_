const QRCode = require("qrcode");

exports.generateQRBase64 = async (text) => {
  return await QRCode.toDataURL(text);
};
