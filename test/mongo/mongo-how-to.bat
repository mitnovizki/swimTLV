Queens - iMac: mongo king$ mongo

> show dbs
admin      0.000GB
config     0.000GB
fitnetApp  0.000GB
local      0.000GB

> use fitnetApp

> document = { 'coach': 'Aimee', 'field': 'swimming' }
{ "coach" : "Aimee", "field" : "swimming" }


> db.coaches.insertOne(document)
{
"acknowledged" : true,
  "insertedId" : ObjectId("60b5e638da075e1da3b15592")
}
> document = { 'coach': 'Marissa', 'field': 'swimming' }
{ "coach" : "Alena", "field" : "swimming" }

 db.coaches.insertOne(document)

> db.coaches.find().pretty()
{
        "_id" : ObjectId("60b5e638da075e1da3b15592"),
        "coach" : "Marissa",
        "field" : "swimming"
}
{
        "_id" : ObjectId("60b5e7d9da075e1da3b15593"),
        "coach" : "Alena",
        "field" : "swimming"
}

> db.users.find().pretty()
{
        "_id" : ObjectId("6043cdfbdf035407c9d36489"),
        "username" : "am",
        "password" : "am"
}
{
        "_id" : ObjectId("6043ce56d6d1de07f834bd51"),
        "username" : "am",
        "password" : "am"
}
{
        "_id" : ObjectId("604f33d7d7354d7ddf2ff772"),
        "username" : "fitnetadmin",
        "password" : "123"
}
{
        "_id" : ObjectId("604f34e9d7354d7ddf2ff773"),
        "username" : "fitnetadmin",
        "password" : "123"
}
> db.users.find({"username":"am"}).pretty()
{
        "_id" : ObjectId("6043cdfbdf035407c9d36489"),
        "username" : "am",
        "password" : "am"
}
{
        "_id" : ObjectId("6043ce56d6d1de07f834bd51"),
        "username" : "am",
        "password" : "am"
}
 
> db.disciplines.find({"price":"27$"},{"title":1}).pretty()

{ "_id" : ObjectId("604f3552d7354d7ddf2ff775"), "title" : "running" }
{ "_id" : ObjectId("604f3552d7354d7ddf2ff778"), "title" : "hand stand" }
{ "_id" : ObjectId("604f3667522a787e795f5079"), "title" : "running" }
{ "_id" : ObjectId("604f3667522a787e795f507c"), "title" : "hand stand" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a3f"), "title" : "running" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a42"), "title" : "hand stand" }


> db.disciplines.find({"price":"27$"},{"title":0}).pretty()


'only title'

> db.disciplines.find({},{"title":1}).pretty()
{ "_id" : ObjectId("604f3552d7354d7ddf2ff774"), "title" : "swimming" }
{ "_id" : ObjectId("604f3552d7354d7ddf2ff775"), "title" : "running" }
{ "_id" : ObjectId("604f3552d7354d7ddf2ff776"), "title" : "kung fu" }
{ "_id" : ObjectId("604f3552d7354d7ddf2ff777"), "title" : "cycling" }
{ "_id" : ObjectId("604f3552d7354d7ddf2ff778"), "title" : "hand stand" }
{ "_id" : ObjectId("604f3667522a787e795f5078"), "title" : "swimming" }
{ "_id" : ObjectId("604f3667522a787e795f5079"), "title" : "running" }
{ "_id" : ObjectId("604f3667522a787e795f507a"), "title" : "kung fu" }
{ "_id" : ObjectId("604f3667522a787e795f507b"), "title" : "cycling" }
{ "_id" : ObjectId("604f3667522a787e795f507c"), "title" : "hand stand" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a3e"), "title" : "swimming" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a3f"), "title" : "running" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a40"), "title" : "kung fu" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a41"), "title" : "cycling" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a42"), "title" : "hand stand" }

> db.disciplines.find({'title':{'$regex':'sw'}}).pretty()
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff774"),
        "title" : "swimming",
        "price" : "47$",
        "outdoords" : "yes",
        "quote" : "lala"
}
{
        "_id" : ObjectId("604f3667522a787e795f5078"),
        "title" : "swimming",
        "price" : "47$",
        "outdoords" : "yes",
        "quote" : "lala"
}
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a3e"),
        "title" : "swimming",
        "price" : "47$",
        "outdoords" : "yes",
        "quote" : "lala"
}


--SORT DESC--
> db.disciplines.find({},{'title':1, 'price':1}).pretty().sort({'price':-1})
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff774"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604f3667522a787e795f5078"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a3e"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff776"),
        "title" : "kung fu",
        "price" : "42$"
}
{
        "_id" : ObjectId("604f3667522a787e795f507a"),
        "title" : "kung fu",
        "price" : "42$"
}
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a40"),
        "title" : "kung fu",
        "price" : "42$"
}
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff775"),
        "title" : "running",
        "price" : "27$"
}
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff778"),
        "title" : "hand stand",
        "price" : "27$"
}
{
        "_id" : ObjectId("604f3667522a787e795f5079"),
        "title" : "running",
        "price" : "27$"
}
{
        "_id" : ObjectId("604f3667522a787e795f507c"),
        "title" : "hand stand",
        "price" : "27$"
}
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a3f"),
        "title" : "running",
        "price" : "27$"
}
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a42"),
        "title" : "hand stand",
        "price" : "27$"
}
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff777"),
        "title" : "cycling",
        "price" : "17$"
}
{
        "_id" : ObjectId("604f3667522a787e795f507b"),
        "title" : "cycling",
        "price" : "17$"
}
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a41"),
        "title" : "cycling",
        "price" : "17$"
}
> 
---LIMIT---
> db.disciplines.find({},{'title':1, 'price':1}).pretty().sort({'price':-1}).limit(3)
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a3e"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604f3667522a787e795f5078"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff774"),
        "title" : "swimming",
        "price" : "47$"
}
> 

---SKIP---
b.disciplines.find({},{'title':1, 'price':1}).pretty().sort({'price':-1}).limit(3).skip(1)
{
        "_id" : ObjectId("604fc3fd8fe76085c11b1a3e"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604f3552d7354d7ddf2ff774"),
        "title" : "swimming",
        "price" : "47$"
}
{
        "_id" : ObjectId("604f3667522a787e795f507a"),
        "title" : "kung fu",
        "price" : "42$"
}
> 


---COUNT---
> db.disciplines.find({},{'title':1, 'price':1}).pretty().count()
15
> 
--- $LTE <= || >= ---
db.disciplines.find({'price':{'$lte':30}},{'title':1}).pretty()


---$all---
> db.disciplines.find({"title":{$all:["swimming", "running"]}},{"title":1}).pretty()

---$in---
> db.disciplines.find({"title":{$in:["kung fu", "running"]}},{"title":1}).pretty()
{ "_id" : ObjectId("604f3552d7354d7ddf2ff775"), "title" : "running" }
{ "_id" : ObjectId("604f3552d7354d7ddf2ff776"), "title" : "kung fu" }
{ "_id" : ObjectId("604f3667522a787e795f5079"), "title" : "running" }
{ "_id" : ObjectId("604f3667522a787e795f507a"), "title" : "kung fu" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a3f"), "title" : "running" }
{ "_id" : ObjectId("604fc3fd8fe76085c11b1a40"), "title" : "kung fu" }
> 

---UPDATE DOCUMENT---
---$set $unset $inc--

---DELETE DOCUMENT---




















































