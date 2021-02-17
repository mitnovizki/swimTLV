const passport = require('passport');
const { Strategy } = require('passport-local');// this file is only going to tell passport about the strategy it is using
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:local.strategy');

module.exports = function localStrategy() {
  passport.use(new Strategy(
    {
      usernameField: 'username', // strategy is going to pull them out of body
      passwordField: 'password'
      // eslint-disable-next-line max-len
    }, (username, password, done) => { // strategy is calling function and pass u, p and done callback
      // todo: create user in db

      const url = 'mongodb://localhost:27017';
      const dbName = 'fitnetApp';
      (async function mongo() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected successfully to the DB');
          const db = client.db(dbName);
          const collection = db.collection('users');

          const user = await collection.findOne({ username });
          if (user.username && user.password === password) {
            done(null, user); //  authRouths will redirect you to user profile page in case of sccss
          } else {
            done(null, false);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err.stack);
        }
        client.close();
      }());
      // // const user = { username, password };
      // // done(null, user);
    }
  ));
};
