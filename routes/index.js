const express = require('express');
const router  = express.Router();
const STATES  = require('../models/states');
const HOUSING = require('../models/housing');
const ensureLogin    = require("connect-ensure-login");
const User    = require('../models/User');

/* GET home page */
router.get('/', (req, res, next) => {
  if (req.user) {
    STATES.find().sort({name:1}).then(states => {
      if (!states) {
        return res.status(404).render('not-found');
      }
    res.render('index', {states, user: req.user});
    })
  .catch(next);
}
  else {
    STATES.find().sort({name:1}).then(states => {
      if (!states) {
        return res.status(404).render('not-found');
      }
    res.render('index', {states});
    })
  .catch(next);
  }
});

//StateRoutes
router.get('/:state', (req, res, next) => {
  const stateAcronym = req.params.state;

  if (req.user) {
  HOUSING.find({state: stateAcronym}).then(house => {
    if (!house) {
      return res.status(404).render('not-found');
    }

    STATES.find().sort({name:1}).then(states => {
      if (!states) {
        return res.status(404).render('not-found');
      }
    res.render('houses/houses', {house, states, user: req.user});
    });
  })
  .catch(next);
}
  else {
    HOUSING.find({state: stateAcronym}).then(house => {
      if (!house) {
        return res.status(404).render('not-found');
      }
  
      STATES.find().sort({name:1}).then(states => {
        if (!states) {
          return res.status(404).render('not-found');
        }
      res.render('houses/houses', {house, states});
      });
    })
    .catch(next);
  }
});

module.exports = router;
