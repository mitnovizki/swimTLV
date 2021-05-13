
class Factory{
    constructor(){

    }

    create(attachment){

        var type = require("./" + attachment.extension).handler;
        var handler = new type(attachment);
        return handler;
    }
}

module.exports = {Factory};