var config = require('../config.js');
const key = config['secretKey'];
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
//const key = secreto//crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const hashes = crypto.getHashes();//['DSA', 'DSA-SHA', 'DSA-SHA1', ...]

class Hash {
    // constructor(algorithm, keyName)
    constructor() {
        this.algorithm = "sha256";//= attributes.algorithm 
        this.key = config[attributes.key]
        this.vector = attributes.vector
    }

    async encrypt(value) {
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(value);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }

    async decrypt(value) {
        let iv = Buffer.from(value.iv, 'hex');
        let encryptedText = Buffer.from(value.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
module.exports = { Hash }

