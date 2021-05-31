var Base = require("./Base").Base;
var cheerio = require('cheerio');
var Autolinker = require('autolinker');
var sanitizeHtml = require('sanitize-html');
var _ = require('lodash');

class Html extends Base{
    process(){
        
        var body = new Buffer.from(this.attachment.bytes).toString('utf8');

        var html = sanitizeHtml(body, { allowedTags: false,
            allowedAttributes: false});

        html = Autolinker.link(html , { 
            email: false,
            phone: false,
            stripPrefix: false } );
    
        var $ = cheerio.load(html, { 
            decodeEntities: false
        });

        var links = $('a');
        var baseHolder =  $('base');

        var base;

        if(baseHolder && baseHolder.length){
            base = baseHolder.attr("href");
        }     

        if(links && links.length){

            var distinctiveLinks = _.uniqBy(links, (e) => { 
                return $(e).attr('href');
            });

            distinctiveLinks.forEach((httpAnchor) => {
                var anchor = $(httpAnchor);

                var href = anchor.attr('href');

                if(base && !href.startsWith('http')){
    
                    var separator = "";
    
                    if(!href.startsWith("/") && !base.endsWith("/")){
                        separator = "/"
                    }
    
                    href = base + separator + href;
                }

                this.attachment.addLink(href);
            });

        }

    }
}

module.exports = { handler: Html }