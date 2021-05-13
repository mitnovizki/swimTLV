var stringSimilarity = require('string-similarity');
var _ = require('lodash');
var addrs = require("email-addresses");
const tldjs = require('tldjs');
var config = require('../config');
var db = require('../dal/db');
var typeorm = require('typeorm');
var Message = require('../dal/Models/Message').Message;
var User = require('../dal/Models/User').User;
const Alias = require("../dal/Models/References").Alias;
const Acquaintances = require("../dal/Models/Acquaintances").Acquaintances;
const api = require("../api");


async function checkAllDomain(domainUsers, user, fromParsed, message_short_id)
{
    const connection = await typeorm.getConnection();
    const userAcquaintances = await connection.getRepository(Acquaintances)
        .createQueryBuilder()
        .select("email_address", "email_address")
        .addSelect("name", "display_name")
        .where("userId = :id", { id: user.id })
        .cache(3600000)
        .getRawMany();

    if (fromParsed.name) {
        // const familiarContacts = domainUsers.concat(userAcquaintances);
        var names = _.transform(domainUsers, (result, domainUser) => {
            if (domainUser.email_address && !(domainUser.email_address.toLowerCase() == user.email_address.toLowerCase())) {
                if (domainUser.display_name) {
                    result.push(domainUser.display_name.toLowerCase());
                }

            }
            return true;
        }, []);

        var lcaseName = fromParsed.name.toLowerCase();

        if (lcaseName && names && names.length > 0) {
            var similar = stringSimilarity.findBestMatch(lcaseName, names);

            var threshHold = 0.8;

            console.log(message_short_id + " Impostor check by email address - Sender: " + fromParsed.name +
                "<" + fromParsed.address + ">. Matching sender's name: " + fromParsed.name + " to: " +
                names.join(", ") + ". Match: " + similar.bestMatch.rating + ".");

            if (similar.bestMatch.rating >= threshHold) {
                var similarName = names[similar.bestMatchIndex];

                var similarUser = _.find(domainUsers, (domainUser) => {
                    return domainUser.display_name && domainUser.display_name.toLowerCase() == similarName;
                });
                let aliases = [];
                if (similarUser) {
                    aliases = await connection.getRepository(Alias)
                        .createQueryBuilder()
                        .select("alias", "email_address")
                        .where("userId = :id", { id: similarUser.id })
                        .cache("alias.userid" +similarUser.id, 60000 * 60 * 24)
                        .getRawMany();
                }
                const safeEmails = aliases.concat(userAcquaintances);
                const addressesToCheck = safeEmails.map(x => x.email_address.toLowerCase());
                if (similarUser) {
                    addressesToCheck.push(similarUser.email_address.toLowerCase());
                }
                
                return !addressesToCheck.includes(fromParsed.address.toLowerCase());
            }
        }
    }

    return false;
}

async function checkEmailAddress(domainUsers, fromParsed, message_short_id)
{
    if(fromParsed.domain){
        var domains = await getLocalDomains(domainUsers);
        
        var threshHold = 0.9;
        
        var lcaseName = fromParsed.domain.toLowerCase();
        if(lcaseName && domains && domains.length > 0){
            
            var match = stringSimilarity.findBestMatch(lcaseName, domains);

            console.log(message_short_id + " Impostor check by domain - Sender: " + fromParsed.name +
                "<" + fromParsed.address + ">. Matching sender's domain: " + fromParsed.domain +
                " to: " + domains.join(", ") + ". Match: " + match.bestMatch.rating + ".");

            return match.bestMatch.rating < 1 && match.bestMatch.rating >= threshHold;
        }
    
    }

    return false;
}

async function getDomainUsers(connection, user){

    let domainUsers = []
        
    if(user.company.cross_impostor){
            let domainUsersSql = "SELECT id, email_address, display_name, hasMailbox FROM  `user` u ";
            domainUsersSql += " INNER JOIN (SELECT DISTINCT companyId FROM user_companies_company ucc2 INNER JOIN (SELECT userId FROM user_companies_company ucc INNER JOIN `user` u ON ucc.userId = u.id AND u.email_address NOT LIKE '%cyberfish.io%' AND ucc.companyId = ?) uss ON ucc2.userId = uss.userId) cc ON u.companyId = cc.companyId";
            domainUsers = await connection.manager.query(domainUsersSql, [user.company.id]);
    
    }else{

            domainUsers = await connection.getRepository(User)
            .createQueryBuilder()
            .select("email_address", "email_address")
            .addSelect("id", "id")
            .addSelect("display_name", "display_name")
            .addSelect("hasMailbox", "hasMailbox")
            .where("companyId = :id", { id: user.company.id })
            .cache(3600000)
            .getRawMany();
    }

    return domainUsers;
}

async function getLocalDomains(domainUsers){
    var domains = _.transform(domainUsers, (result, domainUser) => {
        var domain = addrs.parseOneAddress(domainUser.email_address);

        var lowerDomain = domain.domain.toLowerCase();

        if(domain && !_.find(result, (item) => {
            return item == lowerDomain
        })){
            result.push(lowerDomain);
        }
       
        return true;
    }, []);

    return domains;
}

async function checkReplyTo(fromParsed, replyToParsed, domainUsers, user, trace){

    if(user.company.replyto)
    {
        var fromTrace = "";
        var replyToTrace = "";

        if(fromParsed){
            fromTrace = fromParsed.name + "<" + fromParsed.address +">"
        }

        if(replyToParsed){
            replyToTrace = replyToParsed.name + "<" + replyToParsed.address +">"
        }

        /*

        if(replyToParsed.name == null){
            replyToParsed.name = fromParsed.name;
        }

        */

        console.log(trace + " Impostor replyto: From:" + fromTrace + "ReplyTo:" + replyToTrace);

        if(fromParsed && fromParsed.name && replyToParsed && replyToParsed.name){

            var fromDomain = fromParsed.domain.toLowerCase();
            var replyToDomain = replyToParsed.domain.toLowerCase();

            var fromTld = tldjs.getDomain(fromDomain);
            var replyToTld = tldjs.getDomain(replyToDomain);

            var domains = await getLocalDomains(domainUsers);

            var approved = _.findIndex(domains, (domain) => {
                return domain == replyToDomain || domain == replyToTld
            });

            if(approved == -1){

                var subdoMainsMatch = (fromTld != null) && (fromTld == replyToTld);

                if(!subdoMainsMatch && replyToTld){
                    subdoMainsMatch = await api.checkSubDomain(replyToTld, replyToDomain, user);
                }
    
                var domainsMatch = (fromDomain == replyToDomain) || subdoMainsMatch;
    
                return (fromParsed.name.trim().toLowerCase() == replyToParsed.name.trim().toLowerCase()) && !domainsMatch;
            }
        }
    }

    return false;
}

async function process(user, message, mime)
{
    if(!mime.GetHeaderField("from")){
        return message;
    }

    const message_short_id = message.short_id;

    if(!user.company.multiple_impostor){
        var to = addrs.parseAddressList(mime.GetHeaderField("to"));
        var cc = addrs.parseAddressList(mime.GetHeaderField("cc"));
    
        if(to.length + cc.length > 1){
            console.log(message_short_id + " Impostor check skipped - multiple recipients: To:" + mime.GetHeaderField("to") + "CC:" + mime.GetHeaderField("cc"));
            return message;
        }
    }
    
    var fromParsed = addrs.parseFrom(mime.GetHeaderField("from"));
    var replyTo = addrs.parseFrom(mime.GetHeaderField("reply-to"));

    if(fromParsed && fromParsed.length > 0){

        var connection = await typeorm.getConnection();

        var parsed = fromParsed[0];

        var replyToParsed;

        if(replyTo && replyTo.length > 0){
            replyToParsed = replyTo[0];
        }

        var domainUsers = await getDomainUsers(connection, user);

        var match = _.find(domainUsers, function(u){
            if(parsed.address && parsed.name){
                return u.email_address.toLowerCase() == parsed.address.toLowerCase() && u.display_name.toLowerCase() == parsed.name.toLowerCase()
            }

            return false;
        });
        

        if(match){
            console.log(message_short_id + " Impostor check skipped - user matches domain user");
            return message;
        }

        var check = await Promise.all([
            checkEmailAddress(domainUsers, parsed, message_short_id),
            checkAllDomain(domainUsers, user, parsed, message_short_id),
            checkReplyTo(parsed, replyToParsed, domainUsers, user, message_short_id)
        ]);
    
        console.log(message_short_id + " Impostor check results - EmailAddress: " + check[0] + ", Domain: " + check[1] + ". ReplyTo:" + check[2]);
        
        var detected = _.find(check, (result) => { return result});
    
        if(detected)
        {
            message.message_status = db.references.findOne("messageStatuses", config.messageStatuses.IMPOSTOR);
            
            var repo = connection.getRepository(Message);
    
            await repo.save(message);
        }
    }

    return message;
}

module.exports = {
    process: process
}