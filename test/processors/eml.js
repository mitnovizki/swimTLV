var fs = require('fs-extra');
var environmentFactory = require('../environment/Factory').Factory;
var path = require('path');
var config = require("../config");
var Autolinker = require('autolinker');
var os = require('os');

var bodyProcessor = require('./body');
var Attachment = require("./attachments/Attachment").Attachment;


var LinkProcessor = require("./link").Link;

if (os.platform() == 'win32') {  
    if (os.arch() == 'ia32') {
        var chilkat = require('@chilkat/ck-node12-win-ia32');
    } else {
        var chilkat = require('@chilkat/ck-node12-win64');
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        var chilkat = require('@chilkat/ck-node12-arm');
    } else if (os.arch() == 'x86') {
        var chilkat = require('@chilkat/ck-node12-linux32');
    } else {
        var chilkat = require('@chilkat/ck-node12-linux64');
    }
} else if (os.platform() == 'darwin') {
    var chilkat = require('@chilkat/ck-node12-macosx');
}

async function uploadDirectory(directory, onUpload){
    var promise = new Promise((resolve) => {
        fs.readdir(directory, function (err, files) {
            if(err){
                console.error("Unable to iterate " + directory + ": " + err);
                resolve();
                return;
            }

            files.forEach((fileName) => {

                var fullFileName = path.join(directory, fileName);

                fs.stat(fullFileName, (err, file) => {
                    if(file && file.isDirectory()){
                        uploadDirectory(fullFileName, onUpload);
                    }
                    else
                    {
                        if(onUpload){
                            onUpload(fullFileName);
                        }
                    }
                });
            });

            resolve();
        });
    });

    var result = await promise;
    return result;
}



async function process(mime, message){


    try
    {
        if(!message.short_id){
            return;
        }
    
        var sourceFolder = 'screens/' + message.short_id;
       
        var filename = "index.eml";
        await fs.ensureDir(sourceFolder);
    
        var factory = new environmentFactory();
        var local = factory.getProviderByName("Local");
    
        await local.upload(sourceFolder, filename, "text/eml", mime, false, message.short_id) ;
    
        var email = new chilkat.Email();
        
        var success;
        
        var fullFolder = path.join(global.__basedir, sourceFolder);
        var basePath = path.join(global.__basedir, "screens");

        var partsSubdir = "parts";

        success = email.LoadEml(path.join(sourceFolder, filename));

        if (success !== true) {
            console.log(message.short_id + " Unable to load the eml: " + email.LastErrorText);
            return;
        }

        const processBody = new Promise(async (resolve) => {
            let body = email.Body;

            if (email.HasHtmlBody() == true) {
    
                body = email.GetHtmlBody();
                var htmlFilename = "index.html";
    
                success = email.UnpackHtml(sourceFolder, htmlFilename, partsSubdir);
    
                if (success !== true) {
                    console.log(message.short_id + " Unable to save the eml:" + email.LastErrorText);
                }
    
            } else {
                if (email.HasPlainTextBody() == true) {
    
                    body = email.GetPlainTextBody();
    
                    var filename = "index.html";
    
                    var html = "<html><hed><title>" + email.Subject + "</title></hed><body><pre>" + email.GetPlainTextBody() + "</pre></body></html>";
    
                    var html = Autolinker.link(html, {
                        email: false,
                        phone: false,
                        stripPrefix: false
                    });
    
                    await local.upload(sourceFolder, filename, "text/html", html);
                }
            }

            let result = await bodyProcessor.process(message.user, message, body);

            if(!result.safe){
                email.SetHtmlBody(result.html);
            }

            result.mime = email.GetMime();
            resolve(result);
        });

        const processAttachments = new Promise(async (resolve) => {
            
            let i = 0;
            let numAttach = email.NumAttachments;
    
            let attachmentPromises = [];
    
            console.log(message.short_id + " Number of attachments = " + numAttach);
    
            while (i < numAttach) {

                let buf = email.GetAttachmentData(i);
                let filename = email.GetAttachmentFilename(i);
    
                let bytes = Uint8Array.from(Buffer.from(buf));
                let attachment = new Attachment(filename, bytes, message.user, message);
                await attachment.process();

                email.SetAttachmentFilename(i, attachment.name);

                i = i+1;
            }

            let results = await Promise.all(attachmentPromises);

            resolve();
        });

        let processors = await Promise.all([
            processBody, 
            processAttachments]);

        if(email.NumAttachments > 0){
            
            email.OverwriteExisting = true;
            
            var savingAttachmentsResult = email.SaveAllAttachments(path.join(fullFolder, partsSubdir));

            if (savingAttachmentsResult !== true) {
                console.error(message.short_id + " Saving attachments failed. + " + email.LastErrorText);
            }
            else
            {
                console.log(message.short_id + " Saving attachments (" + email.NumAttachments + ") result: " + savingAttachmentsResult);
            }
        }



        if(factory.providerName != "Local"){
    
            var promises = [];

            
            await uploadDirectory(fullFolder, (fullPath) => {

                var promise = new Promise(async (resolve) => {
                    
                    try
                    {
                        var newFileName = fullPath.replace(basePath, "").split("\\").join("/").replace("/", "");
                        await factory.environment.uploadFile(config.screenshotsBucket, fullPath, newFileName, false);
                        console.log(message.short_id + " " + newFileName + " uploaded to storage.");
                    }
                    catch(e)
                    {
                        console.error(message.short_id + " Unable to upload to storage: " + fullPath +": " + e);
                    }

                    resolve();
                });    
    
                promises.push(promise);
            });


            await Promise.all(promises);
            console.log(message.short_id + " Cleanup folder, folder count: " + promises.length + ".");
           // fs.removeSync(fullFolder);     
        }

        return processors;
       
    }
    catch(err)
    {
        console.error(message.short_id + " Unable to save & upload message: " + err.message + ".")
    }

    
}

module.exports = {
    process: process,
    uploadDirectory: uploadDirectory
}