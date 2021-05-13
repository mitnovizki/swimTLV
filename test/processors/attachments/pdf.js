var Base = require("./Base").Base;
var Autolinker = require('autolinker');
var cheerio = require('cheerio');
const PDFExtract = require('pdf.js-extract').PDFExtract;
var _ = require('lodash');


class Pdf extends Base {

    async process() {
        var that = this;

        var pdfExtract = new PDFExtract();
        let buffer = new Buffer.from(that.attachment.bytes);

        var promises = [];
        var data = await pdfExtract.extractBuffer(buffer, { normalizeWhitespace: true });

        promises.push(this.processPdf(data, that));
        promises.push(this.processText(data, that));
        try {
            await Promise.all(promises);
        } catch (err) {
            console.error(that.attachment.trace + "Error occurred while processing PDF attachment. Error: " + err);
        }

    }

    async processPdf(data, that) {

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
                            that.attachment.addLink(urlS);
                        }
                    });
                }
                else {
                    if (!isEmail.test(url)) {
                        that.attachment.addLink(url);
                    }
                };
                resolve();
            }))
        });
        try {
            await Promise.all(promises);
        }
        catch (err) {
            console.error(that.attachment.trace + " Error occured while fetching links from PDF attachment. Error: " + err);
        }

    }

    async processText(data, that) {

        var text;

        data.pages.forEach(page => {
            var lines = PDFExtract.utils.pageToLines(page);
            var rows = PDFExtract.utils.extractTextRows(lines);
            text = rows.map(function (row) {
                return row.join('');
            }).join("\n");
        });

        if (text) {
            var html = Autolinker.link(text, {
                email: false,
                phone: false,
                stripPrefix: false
            });


            var $ = cheerio.load(html, {
                decodeEntities: false
            });
            var links = $('a');
            var baseHolder = $('base');
            var base;
            var promises = [];
            if (baseHolder && baseHolder.length) {
                base = baseHolder.attr("href");
            }
            if (links && links.length) {
                var linkList = _.uniqBy(links, (e) => {
                    return $(e).attr('href');
                });
                linkList.forEach((httpAnchor) => {
                    promises.push(new Promise(async (resolve) => {
                        var anchor = $(httpAnchor);
                        var href = anchor.attr('href');
                        if (base && !href.startsWith('http')) {
                            var separator = "";
                            if (!href.startsWith("/") && !base.endsWith("/")) {
                                separator = "/"
                            }
                            href = base + separator + href;
                        }
                        that.attachment.addLink(href);
                        resolve();
                    }))

                });
            };
        }
    }
}

module.exports = {
    handler: Pdf
}