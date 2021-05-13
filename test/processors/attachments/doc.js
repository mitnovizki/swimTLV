var Base = require("./Base").Base;

class Doc extends Base {
    async process() {
        try {
            let body = new Buffer.from(this.attachment.bytes).toString();
            if (body.indexOf("HYPERLINK \"") == -1) { // possibly not in english
                body = new Buffer.from(this.attachment.bytes).toString("utf16le");
            }

            const matched = body.match(/HYPERLINK "(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})"/g)

            if (matched) {
                matched.forEach(match => {
                    this.attachment.addLink(match.split("\"")[1]);
                });
            }
            
        } catch (err) {
            console.log("Error Reading DOC file: " + err);
        }
    }
}

module.exports = { handler: Doc }