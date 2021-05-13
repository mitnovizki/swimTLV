const AdmZip = require("adm-zip");
const Base = require("./Base").Base;
const parser = require("xml2json");

class PPTX extends Base {
    async process() {
        try {
            const buff = new Buffer.from(this.attachment.bytes);
            const zip = new AdmZip(buff);
            const zipEntries = zip.getEntries();

            zipEntries
                .filter(entry => entry.entryName.match(/^ppt\/slides\/_rels\//))
                .forEach(entry => {
                    const json = JSON.parse(parser.toJson(entry.getData()));

                    if (json && json.Relationships && json.Relationships.Relationship && json.Relationships.Relationship.length) {
                        json.Relationships.Relationship
                            .filter(item => item.Type == "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink")
                            .forEach(item => this.attachment.addLink(item.Target));
                    }
                });
        } catch (err) {
            console.log("Error Reading PPTX file: " + err);
        }
    }
}

module.exports = { handler: PPTX }