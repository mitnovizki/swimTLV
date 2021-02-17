const express = require('express');

const disciplineRouter = express.Router();

const sql = require('mssql');
const debug = require('debug')('app:disciplineRoutes');

// const disciplines = [
//   {
//     title: 'swimming', price: '47$', outdoords: 'yes', quote: 'lala'
//   },
//   {
//     title: 'running', price: '27$', outdoords: 'yes', quote: 'I do not run to add days to my life, I run to add life to my days'
//   },
//   {
//     title: 'kung fu', price: '42$', outdoords: 'yes', quote: '"I fear not the man who has practiced 10,000 kicks once, but i fear the man who has practiced one kick 10,000 times" -Bruce Lee'
//   },
//   {
//     title: 'cycling', price: '17$', outdoords: 'yes', quote: '“It never gets easier, you just get faster” – Greg LeMond'
//   },
//   {
//     title: 'hand stand', price: '27$', outdoords: 'no', quote: 'Dont let anybody work hareder then you do'
//   }
// ];

function router(nav) {
  // works //localhost:4000/fitnet
  disciplineRouter.route('/')
    .get((req, res) => {
      (async function query() {
        const request = new sql.Request();
        const result = await request.query('select * from disciplines');
        debug(result);
        res.render('disciplineListView',
          {
            nav,
            title: 'Fitenss Network in Tel Aviv',
            disciplines: result.recordset
          });
      }());// IIFE
    });

  disciplineRouter.route('/:id')
    .all((req, res, next) => {
      (async function query() {
        const { id } = req.params; // old style: req.params.id
        const request = new sql.Request();
        const { recordset } = await request.input('id', sql.Int, id)
          .query('select * from disciplines where id=@id');
        [req.discipline] = recordset; // old is req.discipline = recordset[0]
        next();
      }());
    })
    .get((req, res) => {
      res.render('disciplineView',
        {
          nav,
          title: 'Fitenss Network in Tel Aviv',
          discipline: req.discipline // disciplines[id]
        });
    });

  // works [no middlewear version]
  // disciplineRouter.route('/:id') // localhost/pages/discipline
  // .get((req, res) => {
  //   (async function query() {
  //     const { id } = req.params; // old style: req.params.id
  //     const request = new sql.Request();
  //     const { recordset } = await request.input('id', sql.Int, id).query('select * from disciplines where id=@id');
  //     debug(recordset);
  //     res.render('disciplineView',
  //       {
  //         nav,
  //         title: 'Fitenss Network in Tel Aviv',
  //         discipline: recordset[0] // disciplines[id]
  //       });
  //   }());
  // });

  // workd: old style promise function
  // disciplineRouter.route('/')
  //   .get((req, res) => {
  //     const request = new sql.Request();
  //     request.query('select * from disciplines')
  //       .then((result) => {
  //         debug(result);
  //         res.render('disciplineListView',
  //           {
  //             nav,
  //             title: 'Fitenss Network in Tel Aviv',
  //             disciplines: result.recordset
  //           });
  //       });
  //   });

  disciplineRouter.route('/singleItem')
    .get((req, res) => {
      res.send('single page');
    });

  // doesnt show css
  disciplineRouter.route('/disciplineListView') // localhost/pages/discipline
    .get((req, res) => {
      res.render('index',
        {
          nav,
          title: 'Fitenss Network in Tel Aviv'
        });
    });
  return disciplineRouter;
}
module.exports = router;

// root
// old - works
// app.get('/', (req, res) => {
//   res.render('index',
//     {
//       nav: [{ link: 'x', title: 'Kung Fu' }, { link: 'xxx', title: 'cycling' }],
//       title: 'Fitenss Network in Tel Aviv'
//     });
// });
// app.get('/discipline', (req, res) => {
//   res.render('discipline',
//     {
//       nav: [{ link: 'x', title: 'Kung Fu' }, { link: 'xxx', title: 'cycling' }],
//       title: 'Fitenss Network in Tel Aviv'
//     });
// });
// app.get('/', function (req, res) {
//     res.send('Hello you madafaca');
// })
