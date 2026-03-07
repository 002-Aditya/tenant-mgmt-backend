const formidable = require("formidable");
const CryptoJS = require("crypto-js");
const logger = require("./logger");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      logger.error("Decryption failed: Invalid data");
      return null;
    }
    return JSON.parse(decryptedText);
  } catch (e) {
    logger.error("Error decrypting data:", e);
    return null;
  }
};

const parseFormData = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      try {
        let raw = Array.isArray(fields.updateMap) ? fields.updateMap[0] : fields.updateMap;
        const decrypted = decryptData(raw);
        if (!decrypted) return reject(new Error("Failed to decrypt data"));
        fields.updateMap = decrypted;
      } catch (e) {
        return reject(new Error(`Failed to process form data: ${e.message}`));
      }
      resolve({ fields, files });
    });
  })
}

module.exports = { parseFormData };