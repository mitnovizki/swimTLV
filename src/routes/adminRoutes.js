const express = require('express');

const { MongoClient } = require('mongodb');

const adminRouter = express.Router();
const disciplines = [
  {
    title: 'swimming', price: '47$', outdoords: 'yes', quote: 'lala'
  },
  {
    title: 'running', price: '27$', outdoords: 'yes', quote: 'I do not run to add days to my life, I run to add life to my days'
  },
  {
    title: 'kung fu', price: '42$', outdoords: 'yes', quote: '"I fear not the man who has practiced 10,000 kicks once, but i fear the man who has practiced one kick 10,000 times" -Bruce Lee'
  },
  {
    title: 'cycling', price: '17$', outdoords: 'yes', quote: '“It never gets easier, you just get faster” – Greg LeMond'
  },
  {
    title: 'hand stand', price: '27$', outdoords: 'no', quote: 'Dont let anybody work hareder then you do'
  }
];

const debug = require('debug')('app:adminRoutes');

function router(nav) {
  adminRouter.route('/')
    .get((req, res) => {
      const url = 'mongodb://localhost:27017';
      const dbName = 'fitnetApp';

      (async function mongo() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected to the server');

          const db = client.db(dbName);
          const response = await db.collection('disciplines')
            .insertMany(disciplines);// kinda like a table (collection)
          res.json(response);// send back json object
        } catch (err) {
          debug(err.stack);
        }
        client.close();
      }());
    });
  return adminRouter;
}

module.exports = router;
