var path = require('path');
var _ = require('lodash');
const typeorm = require('typeorm');
const shortid = require('shortid');
const core = require('../../core');
const config = require('../../config');
const db = require("../../dal/db");
const processorFactory = require('./Factory').Factory;
const LinkProcessor = require('../link').Link;
const Model = require('../../dal/Models/Attachment').Attachment;
const Message = require('../../dal/Models/Message').Message;
const emojiRegex = require('emoji-regex');

class Attachment
{

    constructor(name, bytes, user, message){

        let recursiveDotClean = function (value){

            if(value && value.endsWith(".")){
                return recursiveDotClean(value.slice(0, -1))
            }

            return value;
        }


        this.suspitious = false;

        const short_id = shortid.generate();

        const regex = emojiRegex();
        const emoji = regex.exec(name);

        let newName = recursiveDotClean(name);
        this.suspitious = newName != name ||( emoji && emoji.length > 0 );
        name = newName;
        
        if(name && name.startsWith(".")){
            name = short_id + name;
            this.suspitious = true;
        }
    
        this.name = path.normalize(name);
        this.bytes = bytes;

        if(message){
            this.trace = message.short_id + " - " + name;
        }

        var ext = path.extname(name).toLowerCase().replace(".", "");

        if(ext == "htm"){
            ext = "html";
        }
        else if(ext == "xls"){
            ext = "xlsx";
        }

        if(name && name.toLowerCase().indexOf("audio") > 0 && ext == "html"){
            this.suspitious = true;
        }

        this.user = user;
        this.message = message;

        this.extension = ext;
        this.links = [];
        this.shortId = short_id;
    }

    supported(){
        switch(this.extension){
            case "html":
            case "xlsx":
            case "pdf":
            case "doc":
            case "docx":
            case "ppt":
            case "pptx":
                return true;
                break;
            default:
                return false;
        }
    }

    addLink(link) {
        if(!link){
            return;
        }

        if(Array.isArray(link)){
            var linksFlatterned = _.flattenDeep(link);

            linksFlatterned.forEach(l => {
                this.addLink(l);
            });

            return;
        }

        if(!this.links.includes(link)){
            this.links.push(link);
        }        
    }

    async create(){

        

        var connection = await typeorm.getConnection();
        var repo = connection.getRepository(Model);

        var model = new Model(this.name, this.shortId, this.extension);

        model.user = this.user;
        model.message = this.message;

        await repo.save(model);
        this.model = model;
    }

    async process(){
        
        let results = [];

        let result = {
            links: results,
            safe: true
        }

        if(!this.supported()){
            return result;
        }
        
        try{

            await this.create();

            if(this.extension == "html"){
    
                console.log(this.message.short_id + " - " + this.model.short_id + " scanning inline attachment: " + this.name);
    
                let linkProcessor = new LinkProcessor(this.name, 
                    this.user, 
                    this.message, 
                    this.model);
                
                let link = await linkProcessor.generate();
                linkProcessor.setContent(new Buffer.from(this.bytes).toString('utf8'));
                let res = await linkProcessor.scan();

                if(!res.phish && this.suspitious){
                    res.phish = true;
                }
    
                if(res.phish){
                    results.push(res);
                }
            }
    
            if(results.length == 0){
                let promises = [];
    
                console.log(this.message.short_id + " - " + this.model.short_id + " scanning attachment: " + this.name);
                
                const factory = new processorFactory();
                let processor = factory.create(this);
                await processor.process();
        
                console.log(this.message.short_id + " - " + this.model.short_id + " links found: " + JSON.stringify(this.links));
    
                _.take(this.links, 2).forEach((url) => {
                    promises.push(new Promise(async (resolve) => {
                        
                        let linkProcessor = new LinkProcessor(url, 
                            this.user, 
                            this.message, 
                            this.model);
        
                        let link = await linkProcessor.generate();
                        let res = await linkProcessor.scan();

                        resolve(res);
                    }));
                });
        
                results = await Promise.all(promises);
            }
    
            var phished = _.filter(results, function(promiseResult){
                return promiseResult &&  promiseResult.phish && !promiseResult.skipped;
            }).length > 0;
            
    
            if(phished){
                console.log(this.message.short_id + " - " + this.model.short_id + " phishing in attachment : " + this.name);
                this.message.message_status = db.references.findOne("messageStatuses", config.messageStatuses.ATTACHMENT);
                var connection = await typeorm.getConnection();
                var repo = connection.getRepository(Message);
                await repo.save(this.message);
            }
    
            result = {
                links: results,
                safe: !phished
            }
        }
        catch(e)
        {
            console.error(this.message.short_id + " - " + ((this.model) ? this.model.short_id : "") + " error processing attachment : " + this.name + ":" + JSON.stringify(e));
        }

        

        return result;
    }
}

module.exports = { Attachment };