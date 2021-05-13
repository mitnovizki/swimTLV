const Cipher = require("./Cipher").Cipher;
const Hash = require("./Hash").Hash;
const CipherIV = require("./CipherIV").CipherIV;
const CryptoMethods = { Cipher, CipherIV, Hash }

class Factory {

    constructor(type) {
        if (type)
            this.create(type);
    }

    create(method) {
        const cryptoMethodCreator = CryptoMethods[method];
        return new cryptoMethodCreator();
    }
}
module.exports = { Factory };
