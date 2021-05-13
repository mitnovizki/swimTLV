var Base = require("./Base").Base;

class Dummy extends Base{
    process(){
        this.attachment.addLink("test dummy");
    }
}

module.exports = { handler: Dummy }