const { MongoClient, ObjectID } = require('mongodb');

const debug = require('debug')('app:disciplineController');

function disciplineController(disciplineService, nav) {
  function getById(req, res) {
    const url = 'mongodb://localhost:27017';
    const dbName = 'fitnetApp';
    const { id } = req.params;

    // IFFE
    (async function mongo() {
      let client = new MongoClient(url);
      try {
        client = await MongoClient.connect(url);
        debug('Connected to DB Server! Yeah');
        const db = client.db(dbName);
        const collection = await db.collection('disciplines');
        const discipline = await collection.findOne({ _id: new ObjectID(id) });
        // get data from service (which calles external API)
        discipline.details = await disciplineService.getDisciplineById(discipline.id);

        // debug(discipline.toArray());
        res.render('disciplineView',
          {
            nav,
            title: 'Fitenss Network in Tel Aviv',
            discipline
          });
      } catch (err) {
        debug(err.stack);
      }
      client.close();
    }());
  }

  function middleware(req, res, next) {
    // req.user.roles ...or req.user.admin... 
    //  if (req.user) {
    next();
    // } else {
    //     res.redirect('/fitnet'); // todo: change to '/'
    // }
  }

  function get(req, res) {
    const url = 'mongodb://localhost:27017';
    const dbName = 'fitnetApp';
    // IFFE((){ }())
    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url);
        debug('Connected to the server');

        const db = client.db(dbName);
        const collection = await db.collection('disciplines');
        const disciplines = await collection.find().toArray();
        res.render('disciplineListView',
          {
            nav,
            title: 'Fitenss Network in Tel Aviv',
            disciplines
          });
      } catch (err) {
        debug(err.stack);
      }
      client.close();
    }());
  }
  //   const url = 'mongodb://localhost:27017';
  //   const dbName = 'fitnetApp';

  //   //IFFE((){ }())
  //   (async function mongo() {
  //     let client;
  //     try {
  //       client = await MongoClient.connect(url);
  //       debug('Connected to the server');

  //       const db = client.db(dbName);
  //       const collection = await db.collection('disciplines');
  //       const disciplines = await collection.find().toArray();
  //       res.render('disciplineListView',
  //         {
  //           nav,
  //           title: 'Fitenss Network in Tel Aviv',
  //           disciplines
  //         });

  //     } catch (err) {
  //       debug(err.stack);
  //     }
  //     client.close();
  //   }());
  // }
  // eslint-disable-next-line max-len
  return { get, getById, middleware }; // REVEALING MODULE PATTERN. return function that return object with functions
}

module.exports = disciplineController;
