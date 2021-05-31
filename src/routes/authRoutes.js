// console.log(arguments)


const express = require('express');
const { MongoClient } = require('mongodb');
const passport = require('passport');
const debug = require('debug')('app:authRoutes');
const authRouter = express.Router();
const authController = require('../controllers/authController')

function router(nav) {
  authRouter.route('/signUp') // it doesn,t have the page but it does generates response
    .post((req, res) => {
      const { username, password } = req.body;
      const dbName = 'fitnetApp';
      const url = 'mongodb://localhost:27017';

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected to the server');
          const db = client.db(dbName);
          const collection = db.collection('users');// create a new collection by using it
          const user = { username, password };
          const results = await collection.insertOne(user); // insert single element
          debug(results);
          req.login(results.ops[0], () => { // ?,()=>?|results.ops[0] - user that was created in db.
            res.redirect('/auth/profile'); // every time i reset the browser  -the cookie goes away, user details are stored in cookies.
          });
        } catch (err) {
          debug(err);
        }
        client.close();
      }());
      // debug(req.body);
      // req.login(req.body, () => { // ?,()=>?
      //   res.redirect('/auth/profile');
      // });
      // res.json(req.body);// just send json response back
    });

  authRouter.route('/profile')
    .all((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/fitnet');
      }
    }) // middlwear if user = ok - next (going to .get((req...json,,,)))
    .get((req, res) => {
      res.json(req.user);
    });

  authRouter.route('/signIn')
    .get((req, res) => {
      res.render('signIn',
        {
          nav, title: 'Sign In'
        });
    })
    .post(passport.authenticate('local',
      {
        successRedirect: '/auth/profile',
        failureRedirect: '/fitnet' // todo: change /fitnet to /
      }));

  // todo: check the syntax
  authRouter.route('/signOut')
    .get((req, res) => {
      req.logOut();
      res.redirect('/fitnet'); // check if this call is correct 
    });

  // get links from pdf file and print them out
  authRouter.route('/links')
    .get((req, res) => {
      const { getLinksFromPDF } = authController()

      var result = getLinksFromPDF()
      console.log(result)
      res.render('links', { nav, 'title': 'Get links from PDF file' })
    })
  return authRouter;
}

module.exports = router;
