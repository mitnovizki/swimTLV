var config = require("../config");
var _ = require('lodash');
var addrs = require("email-addresses");

var Message = require('../dal/Models/Message').Message;
var typeorm = require('typeorm');
var db = require('../dal/db');
var os = require('os');

var impostorProcessor = require('./impostor');
var bodyProcessor = require('./body');
var shortid = require('shortid');

const BlacklistedIP = require("../dal/Models/BlacklistedIP").BlacklistedIP;
const WhitelistedIP = require("../dal/Models/WhitelistedIP").WhitelistedIP;

const ipRangeCheck = require("ip-range-check");

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

async function process(user, providerId, mimeMessage, processBody, messType, messStatus, isReported, messageBrand) {
    var result = {
        message_status: {
            name: config.messageStatuses.SAFE,
        },
        skipped: true
    }

    var mime = new chilkat.Mime();

    if (mime) {
        var parsingStatus = mime.LoadMime(mimeMessage);

        if (!parsingStatus) {
            console.error("Unable to parse mime message: " + mimeMessage);
            return result;
        }

        var messageId = mime.GetHeaderField("message-id");

        var connection = await typeorm.getConnection();
        var repo = connection.getRepository(Message);

        var exists = await repo.findOne({
            where: {
                message_id: messageId
            }
        });

        if (exists) {
            if (isReported && exists.message_status && exists.message_status.name) {
                const trainingStatus = [config.messageStatuses.TRAINING_FAILED, config.messageStatuses.TRAINING_IGNORED,
                config.messageStatuses.TRAINING_SENT];
                const protectedStatus = {}
                protectedStatus[config.messageStatuses.SAFE] = config.messageStatuses.SAFE_TRAINING_REPORTED;
                protectedStatus[config.messageStatuses.CREDENTAL_THEFT] = config.messageStatuses.PHISHING_TRAINING_REPORTED;
                protectedStatus[config.messageStatuses.IMPOSTOR] = config.messageStatuses.IMPOSTOR_TRAINING_REPORTED;
                if (trainingStatus.indexOf(exists.message_status.name) > -1) {
                    await connection.createQueryBuilder()
                        .update(Message)
                        .set({ message_status: db.references.findOne("messageStatuses", config.messageStatuses.TRAINING_REPORTED).id })
                        .where({ id: exists.id })
                        .execute();
                }
                else if (protectedStatus[exists.message_status.name]) {
                    await connection.createQueryBuilder()
                        .update(Message)
                        .set({ message_status: db.references.findOne("messageStatuses", protectedStatus[exists.message_status.name]).id })
                        .where({ id: exists.id })
                        .execute();
                }
            }

            console.error(user.email_address + ": Already processed: " + messageId);
            return result;
        }

        var fromAddress = mime.GetHeaderField("from");

        if (fromAddress) {
            var fromParsed = addrs.parseFrom(mime.GetHeaderField("from"));

            if (fromParsed && fromParsed.length > 0) {
                fromAddress = fromParsed[0].address;
            }
        }

        var toList = addrs.parseAddressList(mime.GetHeaderField("to"));
        var ccList = addrs.parseAddressList(mime.GetHeaderField("cc"));
        var bccList = addrs.parseAddressList(mime.GetHeaderField("bcc"));
        var recipientList = _.concat(_.compact(toList), _.compact(ccList), _.compact(bccList)).map(x => x.address);
        var recipientListString = recipientList.join(", ");

        if (user.oauth_provider.name == config.google.NAME 
            && recipientList.length && 
                recipientList.includes(fromAddress)) { // the from email address also in to, to prevent undo send
                console.log(recipientListString + ': STOP - From email in To: ' + mime.GetHeaderField('Subject'));
            return result;
        }

        var message_short_id = shortid.generate();
        
   
        console.log(recipientListString + ': processing email: ' + mime.GetHeaderField('Subject') + ", message_short_id: " + message_short_id);

        var messageType = (messType ? messType : "EXTERNAL");
        var messagStatus = (messStatus ? messStatus : "SAFE");
        var messageBrand = (messageBrand ? messageBrand : null);
        var message = new Message(
            user.id + "_" + mime.GetHeaderField("message-id"),
            message_short_id,
            mime.GetHeaderField("subject"),
            mime.GetHeaderField("from"),
            mime.GetHeaderField("to"),
            mime.GetHeaderField("cc"),
            db.references.findOne("messageTypes", config.messageTypes[messageType]),
            db.references.findOne("messageStatuses", config.messageStatuses[messagStatus]),
            messageBrand
        );

        message.provider_id = providerId;
        message.last_folder = "inbox";
        message.user = user;

        await repo.save(message);

        if (messageType.indexOf("TRAINING") > -1) {
            return message;
        }

        const approvedQ = "SELECT `Approved`.`id` FROM `approved_email_address` `Approved` WHERE `email_address` = ? AND (`companyId` IS NULL OR `companyId` = ?);";
        const blacklistedQ = "SELECT `Blacklisted`.`id` FROM `blacklisted_email_address` `Blacklisted` WHERE `email_address` = ? AND (`companyId` IS NULL OR `companyId` = ?);";
        const BLWLParams = [fromAddress, user.company.id];
        const BLWLCheck = await Promise.all([
            connection.manager.query(approvedQ, BLWLParams), 
            connection.manager.query(blacklistedQ, BLWLParams)
        ]);
        var approved = BLWLCheck[0];
        var blacklistedEmail = BLWLCheck[1];

        if (approved.length) {
            console.log(message_short_id + " Sender is whitelisted: " + fromAddress);
            message.whitelisted = true;
        }

        if (blacklistedEmail.length) {
            console.log(message_short_id + " Sender is blacklisted: " + fromAddress);
            message.message_status = db.references.findOne("messageStatuses", config.messageStatuses.BLACKLIST)
            await repo.save(message);
            message.skipped = false;
            message.new_mime = mime.GetMime();
            return message;
        }

        // extract IPs from recieved header and check for ip whitelist/blacklist
        let rawReceivedHeaderString = '';
        const groupIP = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/g;
        for (let i = 0; i < mime.NumHeaderFields; i++) {
            if (mime.GetHeaderFieldName(i) == "Received") {
                rawReceivedHeaderString += mime.GetHeaderFieldValue(i);
            }
        }
        const ipMatches = rawReceivedHeaderString.match(groupIP);

        if (ipMatches && ipMatches.length) {
            const companyIPwhitelist = connection.getRepository(WhitelistedIP)
                .createQueryBuilder()
                .select("ip", "ip")
                .where("companyId = :companyId", { companyId: user.company.id })
                .getRawMany();

            const companyIPblacklist = connection.getRepository(BlacklistedIP)
                .createQueryBuilder()
                .select("ip", "ip")
                .where("companyId = :companyId", { companyId: user.company.id })
                .getRawMany();

            const IPList = await Promise.all([companyIPwhitelist, companyIPblacklist]);
            const mappedWhitelist = IPList[0].map(y => y.ip);
            const mappedBlacklist = IPList[1].map(y => y.ip);

            let whitelistedIP, blacklistedIP;
            if (mappedWhitelist.length || mappedBlacklist.length) {
                ipMatches.forEach(ipToMatch => {

                    const isWhitelisted = ipRangeCheck(ipToMatch, mappedWhitelist)
                    const isBlacklisted = ipRangeCheck(ipToMatch, mappedBlacklist)

                    if (isWhitelisted) {
                        console.log(message_short_id + " IP is whitelisted: " + ipToMatch);
                        whitelistedIP = true;
                    }
                    else if (isBlacklisted) {
                        console.log(message_short_id + " IP is blacklisted: " + ipToMatch);
                        blacklistedIP = true;
                    }
                });

                if (whitelistedIP) {
                    message.skipLink = true;
                    return message;
                }
                else if (blacklistedIP) {
                    message.message_status = db.references.findOne("messageStatuses", config.messageStatuses.BLACKLIST);
                    message.skipLink = true;
                    message.skip = false;
                    message.new_mime = mime.GetMime();
                    await repo.save(message);
                    return message;
                }
            }
        }

        if (!message.whitelisted && user.company.check_impostor) {
            message = await impostorProcessor.process(user, message, mime);
        }

        if (processBody) {
            await processMimeBody(user, mime, message);
        }

        message.new_mime = mime.GetMime();

        return message;
    }

    return result;
}

async function processMimeBody(user, mime, message) {
    if (mime.NumParts > 0) {
        for (i = 0; i < mime.NumParts; i++) {

            var part = mime.GetPart(i);

            switch(part.Disposition){
                case "attachment":
                    var bytes = part.GetBodyBinary();

                break;
                default:
                    if (part.ContentType == 'text/html' && part.Disposition != "attachment") {
                        var html = part.GetBodyDecoded();
        
                        var body = await bodyProcessor.process(user, message, html);
                        part.SetBody(body.html);
                        return message;
                    }
                    
        
                    if (part.NumParts > 0) {
                        var res = await processMimeBody(user, part, message);
                        return res;
                    }
            }   
        }
    }
    else {
        var html = mime.GetBodyDecoded();

        var body = await bodyProcessor.process(user, message, html);

        if (mime.ContentType == 'text/html') {
            mime.SetBody(body.html);
        }
        else {
            var htmlMime = new chilkat.Mime();
            htmlMime.ContentType = 'text/html; charset=UTF-8'
            htmlMime.SetBody(body.html);

            mime.ConvertToMultipartAlt();
            mime.AppendPart(htmlMime);
        }

        return message;
    }
};


async function getBody(mimeMessage) {

    var parsingStatus = mime.LoadMime(mimeMessage);

    if (parsingStatus) {
        if (mime.NumParts == 0) {
            return mime.GetBodyDecoded();
        }

        for (i = 0; i < mime.NumParts; i++) {

            var part = mime.GetPart(i);

            if (part.ContentType == 'text/html' && part.Disposition != "attachment") {
                return part.GetBodyDecoded();

            }

            if (part.NumParts > 0) {
                var rec = await getBody(part);
                return rec;
            }
        }
    }

    return null;
}

module.exports = {
    process: process,
    getBody: getBody
}