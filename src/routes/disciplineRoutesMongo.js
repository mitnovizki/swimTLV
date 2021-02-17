const express = require('express');

const disciplineRouter = express.Router();

const disciplineController = require('../controllers/disciplineController');

const disciplineService = require('../services/disciplineService');

function router(nav) {
  // todo: user the folowing code section to only allow authorized users to log in

  // passing service to controller
  const { get, getById, middleware } = disciplineController(disciplineService, nav);

  disciplineRouter.use(middleware);

  disciplineRouter.route('/')
    .get(get);

  disciplineRouter.route('/:id')// find dsicipline by id
    .get(getById);

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
