// var Base = require("./Base").Base;
// var Autolinker = require('autolinker');
//var cheerio = require('cheerio');
const PDFExtract = require('pdf.js-extract').PDFExtract;

var _ = require('lodash')
var path = require('path')
var fs = require('fs')
var baseDir = path.join(__dirname, '/.data/')
var file = 'javascript'
var buffer

// class Pdf extends Base {
class Pdf {

  async process(attachment) {

    const pdfExtract = new PDFExtract();
    // var that = this;

    //@TODO: fs -read file
    //Store file in bytes array
    //Read from bytes

    if (attachment) {
      buffer = attachment
    }

    if (!attachment) {
      var attachment = fs.readFile(baseDir + '/' + file + '.pdf', 'utf-8', function (err, data) {
        if (data) {
          buffer = new Buffer.from(attachment);
        }
        else if (err) {
          console.log(`error occurred while reading from odf ${err}`)
        } else {
          console.log(typeof (data))

          return data
        }
        console.log('1111111111111')
      })
    }

    // let buffer = new Buffer.from(that.attachment.bytes);

    console.log('444444444444')
    console.log(buffer)
    console.log('555555555555')



    //@TODO: make a promisify function  | only when buffer is ready - start process

    var promises = [];
    var data = await pdfExtract.extractBuffer(buffer, { normalizeWhitespace: true });
    console.log('2222222222222')

    promises.push(this.processPdf(data));
    // promises.push(this.processText(data, that));
    try {
      await Promise.all(promises);
    } catch (err) {
      console.error("Error occurred while processing PDF attachment. Error: " + err);
      // console.error(that.attachment.trace + "Error occurred while processing PDF attachment. Error: " + err);
    }

  }

  // async processPdf(data, that)
  async processPdf(data) {

    var urls = data.pages.map(function (pageObject) {
      return pageObject.links;
    });

    //to find and remove email adress (including mailto: as optional part of email)
    var regex = /^(mailto:)?(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var isEmail = new RegExp(regex);

    var linkList = urls.filter(function (link) {
      return link != null && link != undefined && link.length > 0;
    });

    var promises = [];

    linkList.forEach(url => {

      promises.push(new Promise(async (resolve) => {
        var splited = url.toString().split(',');
        if (splited && splited.length > 1) {
          splited.forEach(urlS => {
            if (!isEmail.test(urlS)) {
              // that.attachment.addLink(urlS);
              // attachment.addLink(urlS);
              //@TODO: output result to file
              console.log(urlS)
              console.log('-_-_-_-_-_-_-_-_')
            }
          });
        }
        else {
          if (!isEmail.test(url)) {
            console.log(url)
            console.log('@#@#@#@#@#@@#@#@#')
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
      // console.error(that.attachment.trace + " Error occurred while fetching links from PDF attachment. Error: " + err);
    }
  }

  // async processText(data, that) {

  //   var text;

  //   data.pages.forEach(page => {
  //     var lines = PDFExtract.utils.pageToLines(page);
  //     var rows = PDFExtract.utils.extractTextRows(lines);
  //     text = rows.map(function (row) {
  //       return row.join('');
  //     }).join("\n");
  //   });

  //   if (text) {
  //     var html = Autolinker.link(text, {
  //       email: false,
  //       phone: false,
  //       stripPrefix: false
  //     });


  //     var $ = cheerio.load(html, {
  //       decodeEntities: false
  //     });
  //     var links = $('a');
  //     var baseHolder = $('base');
  //     var base;
  //     var promises = [];
  //     if (baseHolder && baseHolder.length) {
  //       base = baseHolder.attr("href");
  //     }
  //     if (links && links.length) {
  //       var linkList = _.uniqBy(links, (e) => {
  //         return $(e).attr('href');
  //       });
  //       linkList.forEach((httpAnchor) => {
  //         promises.push(new Promise(async (resolve) => {
  //           var anchor = $(httpAnchor);
  //           var href = anchor.attr('href');
  //           if (base && !href.startsWith('http')) {
  //             var separator = "";
  //             if (!href.startsWith("/") && !base.endsWith("/")) {
  //               separator = "/"
  //             }
  //             href = base + separator + href;
  //           }
  //           that.attachment.addLink(href);
  //           resolve();
  //         }))

  //       });
  //     };
  //   }
  // }
}

module.exports = {
  handler: Pdf
}