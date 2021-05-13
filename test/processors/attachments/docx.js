var Base = require("./Base").Base;
const htmlProcessor = require("./html").handler;
const mammoth = require("mammoth");


class Docx extends Base {
    async process() {
        try {
            const conversion = await mammoth.convertToHtml({ buffer: this.attachment.bytes });

            if (conversion.value) {
                this.attachment.bytes = Uint8Array.from(Buffer.from(conversion.value));
                const processor = new htmlProcessor(this.attachment);
                return processor.process();
            }
        }
        catch (err) {
            console.log("Error Reading DOCX file: " + err);
        }
    }
}

module.exports = { handler: Docx }