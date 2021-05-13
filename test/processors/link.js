const ScanHelper = require("../routes/ScanHelper");
const shortid = require('shortid');
const api = require('../api');
const config = require("../config");

class Link
{
    constructor(url, user, message, attachment){
        this.url = url;
        this.user = user;
        this.message = message;
        this.link = null;
        this.attachment = attachment;
    }

    async generate(){

        let that = this;

        let promise = new Promise(function (resolve){

            let generateCallback = function(result){
                resolve(result);
            };

            const link_short_id = shortid.generate();
            console.log(that.message.short_id + " Message generating link: (" + that.url + ")" + link_short_id + ((that.attachment && that.attachment.name) ? " from " + that.attachment.name : ""));

            api.generateLink(that.user, 
                that.url, 
                config.sources.EMAIL, 
                that.message,
                generateCallback,
                link_short_id, 
                0, 
                that.attachment);
            return;
        });

        let result = await promise;
        
        this.link = result.link;

        return result;
    }

    async scan(){

        let that = this;
        
        let promise = new Promise(function(resolve){
                            
            ScanHelper.scanLink(that.link, function(res){
                resolve(res);
            });
        });

        let result = await promise;

        return promise;
    }

    setContent(content){
        this.link.content = content;
    }

    async process(){
        await this.generate();
        let result = await this.scan();

        return result;
    }
}

module.exports = { Link };