var config = require("../config");
var _ = require('lodash');
var cheerio = require('cheerio');
var shortid = require('shortid');
var api = require('../api');
var Autolinker = require('autolinker');
var sanitizeHtml = require("sanitize-html");

var Message = require('../dal/Models/Message').Message;
var typeorm = require('typeorm');
var db  = require('../dal/db');

var ScanHelper = require("../routes/ScanHelper");
var LinkProcessor = require("./link").Link;

async function process(user, message, body)
{
    var result = {
        html: body,
        safe: true,
        links: []
    };

    if (message.skipLink) {
        return result;
    }

    var html = sanitizeHtml(body, { allowedTags: false,
        allowedAttributes: false});

    html = Autolinker.link( html, { 
        email: false,
        phone: false,
        stripPrefix: false } );

    var $ = cheerio.load(html, { 
        decodeEntities: false
    });
    
    var promises = [];

    var selector = "a";

    if(user.company.unsubscribe){
        selector += ":not(:icontains(\"unsubscribe\"))";
    }

    var links = $(selector);
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

            if(promises.length < config.maxLinksForBackground){
                
                var anchor = $(httpAnchor);

                var href = anchor.attr('href');

                if(href && base && !href.startsWith('http')){
    
                    var separator = "";
    
                    if(!href.startsWith("/") && !base.endsWith("/")){
                        separator = "/"
                    }
    
                    href = base + separator + href;
                }

                var background = (promises.length <= config.maxLinksForBackground);
                var sandbox = user.sandBox || (user.type == config.userTypes.Personal && moment().isAfter(moment(user.expiration_date)));
    
                if(user.company){
                    sandbox = user.company.sandbox;
                }
    
                var skip = !background && !sandbox;
    
                if (href && href.startsWith('http')) {
                    
                    var promise = new Promise(async function(resolve){
                            
                        if(!skip){

                            const processor = new LinkProcessor(href, user, message);

                            let result = await processor.generate();
                            
                            if (result && result.link) {

                                var domain = config;
        
                                if(user.company && user.company.domain){
                                    domain = user.company.domain;
                                }
        
                                var linkUrl = domain.shortUrl + result.link.short_id;
                                var originalUrl = anchor.attr('href');
                                var allLinks = $("a[href^='" + originalUrl +"']");
    
                                allLinks.attr("href", linkUrl);
        
                                //emails with too many links are not sent to background
                                if(background){
                                    if(user.enablRealTime || user.enableFilter){

                                        let res = await processor.scan();        
                                        
                                        if(res && res.phish == false && !sandbox){
                                            allLinks.attr("href", originalUrl);
                                        }
                                                
                                            resolve(res);
                                            return;
                                        }
        
                                        api.sendTopicMessage(result.link);
                                    }
                            }
                            else{
                                resolve(result);	
                            }
                        }
                            
                        var dummy = {
                            phish: false,
                            skipped: true
                        };
    
                        resolve(dummy);
                    });
    
                    promises.push(promise);	
                }
            }
        });
    }

    var results = await Promise.all(promises);

    var safe = false;

    var scannedResults = _.filter(results, function(promiseResult){
        return promiseResult &&  promiseResult.phish == false && !promiseResult.skipped;
    });

    var maxlength = promises.length < config.maxLinksForBackground ? promises.length : config.maxLinksForBackground;

    safe = scannedResults.length == maxlength;
    console.log(message.short_id + " All message links are safe: " + safe);
    result.safe = safe;
    result.html = $.html();
    result.links = results;

    if(!result.safe)
    {
        message.message_status = db.references.findOne("messageStatuses", config.messageStatuses.CREDENTAL_THEFT);
        var connection = await typeorm.getConnection();
        var repo = connection.getRepository(Message);
        await repo.save(message);
    }

    return result;
}

module.exports = {
    process: process
}