var config = require('../config.js');
const key = config['secretKey'];
const algorithm = config['cryptoAlgorithm'];
const crypto = require('crypto');

class Cipher {

  constructor() {
    this.algorithm = algorithm;
    this.key = key;
  }

  async encrypt(dataToEncrypt) {
    var encryptedData;
    var cipher = crypto.createCipher(algorithm, key);
    var encryptedData = null;
    encryptedData = cipher.update(dataToEncrypt, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
  }

  async decrypt(dataToDecrypt) {
    var decryptedData = null;
    var decipher = crypto.createDecipher(algorithm, key);
    decryptedData = decipher.update(dataToDecrypt, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
  }
}
module.exports = { Cipher }

