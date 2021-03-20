
const PDFExtract = require('pdf.js-extract').PDFExtract;

var path = require('path')
var fs = require('fs')
var baseDir = path.join(__dirname, '/.data/')
var file = 'javascript'
var buffer

class Pdf {

  async process(pdfFile) {
    const pdfExtract = new PDFExtract();
    // var that = this;

    //@TODO: fs -read file
    //Store file in bytes array
    //Read from bytes


    // let buffer = new Buffer.from(that.attachment.bytes);
    if (pdfFile) {
      buffer = new Buffer.from(pdfFile);
    }

    if (!pdfFile) {

      var pdfFile = fs.readFile(baseDir + '/' + file + '.pdf', 'utf-8', function (err, data) {
        if (data) {
          buffer = new Buffer.from(pdfFile);
        }
        else if (err) {
          console.log(`error occurred while reading from ... ${err}`)
        } else {
          // console.log(data)
          return data
        }
      })
    }

    // let buffer = new Buffer.from(that.attachment.bytes);

    //@TODO: make a promisify function  | only when buffer is ready - start process

    var promises = [];


    try {
      var extractedData = await pdfExtract.extractBuffer(buffer, { normalizeWhitespace: true });
    } catch (error) {
      console.log('Error:::::', error)
    }

    //add more file types to process
    // // // promises.push(this.processPdf(data));

    promises.push(new Promise(async (resolve) => {
      this.processPdf(extractedData)
      resolve()
    }))

    try {
      await Promise.all(promises);
    } catch (err) {
      console.error("Error occurred while processing PDF attachment. Error: " + err);
    }

  }
  async processPdf(data) {

    console.log('_____________________________________________________________________________________')

    var links = data.pages.map(function (pageObject) {
      // console.log('page object:', pageObject)
      return pageObject.links;
    });
    console.log(links)
    console.log('_____________________________________________________________________________________')


    //to find and remove email adress (including mailto: as optional part of email)
    var regex = /^(mailto:)?(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var isEmail = new RegExp(regex);

    var linkList = links.filter(function (link) {
      return link != null && link != undefined && link.length > 0;
    });
    // console.log(linkList)

    var promises = [];

    linkList.forEach(url => {
      //TODO: collect urls to file
      //that.attachment.addLink(url);
      promises.push(new Promise(async (resolve) => {
        var splitted = url.toString().split(',');
        if (splitted && splitted.length > 1) {
          splitted.forEach(urlS => {
            if (!isEmail.test(urlS)) {
              // that.attachment.addLink(urlS);
              // attachment.addLink(urlS);
              //@TODO: output result to file
              // console.log(urlS)
              // console.log('-_-_-_-_-_-_-_-_')
            }
          });
        }
        else {
          if (!isEmail.test(url)) {
            // console.log(url)
            // console.log('@#@#@#@#@#@@#@#@#')
            // that.attachment.addLink(url);
          }
        };
        resolve();
      }))
    });
    try {
      await Promise.all(promises);
    }
    catch (err) {
      console.error(" Error occurred while fetching links from PDF attachment. Error: " + err);
    }
  }
}

module.exports = {
  handler: Pdf
}