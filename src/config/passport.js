const passport = require('passport'); // check passport strategy

require('./strategies/local.strategy')();// ?executing this?

module.exports = function passportConfig(app) {
  app.use(passport.initialize()); // create login as well // todo: learn more about it
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  }); // stores user in session
  passport.deserializeUser((user, done) => {
    // find usr by id here use mongo
    done(null, user);
  }); // retrieves user from the session
};
