const Base = require("./Base").Base;

class PPT extends Base {
    async process() {
        try {
            const bodyUTF8 = new Buffer.from(this.attachment.bytes).toString("utf8");
            const bodyUTF16 = new Buffer.from(this.attachment.bytes).toString("utf16le").replace(/\0/g, " ");
            const url = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
            const matchedUTF8 = bodyUTF8.match(url);
            const matchedUTF16 = bodyUTF16.match(url);
            const allLinks = matchedUTF8.concat(matchedUTF16);
            const cleanLinks = allLinks.filter(item => !item.match(/^http:\/\/schemas.openxmlformats.org\//)).map(item => item.split(/[\u0001-\u001A]|\0/)[0]);
            const set = new Set(cleanLinks);
            set.forEach(item => this.attachment.addLink(item));
        } catch (err) {
            console.log("Error Reading PPT file: " + err);
        }
    }
}

module.exports = { handler: PPT }