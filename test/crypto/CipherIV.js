var config = require('../config.js');
var algorithm = config['algorith'];
const key = config['secretKey'];
const crypto = require('crypto');
//const key = secreto//crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const hashes = crypto.getHashes();//['DSA', 'DSA-SHA', 'DSA-SHA1', ...]

class CipherIV {
    constructor() {
        this.algorithm = algorithm;
        this.key = key;
        this.iv = iv;
    }


    async encrypt(value) {
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(this.key), this.iv);
        let encrypted = cipher.update(value);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }

    async decrypt(value) {
        let iv = Buffer.from(value.iv, 'hex');
        let encryptedText = Buffer.from(value.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv(algorithm,Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
module.exports = {CipherIV }

