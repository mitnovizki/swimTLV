var Base = require("./Base").Base;
const XLSXParser = require("XLSX");

class XLSX extends Base {
    async process() {
        try {
            let allLinks = [];
            const workbook = XLSXParser.read(this.attachment.bytes, { type: "buffer" });

            if (workbook.Sheets) {
                const actualSheets = Object.values(workbook.Sheets);
                for (let sheet of actualSheets) {
                    const links = Object.values(sheet) // sheet properties including styles and cells
                        .filter(item => item.hasOwnProperty("l")) // cells with links 
                        .map(cell => cell.l.display || cell.l.Target); // display property contains properly parsed IDN, Target shows standard domain names

                    allLinks = allLinks.concat(links);
                }
            }
            
            allLinks.forEach(item => this.attachment.addLink(item));
        }
        catch (err) {
            console.log("Error Reading XLSX/XLS file: " + err);
        }
    }
}

module.exports = { handler: XLSX }