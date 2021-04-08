'use strict';

const co = require('co');
const errors = require('restify-errors');
const fetch = require('node-fetch');
const config = require('../../config');



exports.getCountries = co.wrap(function* getCountries(req, res, next) {

  /**
   * @description used fetch API to make an http call and get countries data
   *              Convert the data to json and return the data to user
   */
  fetch(`${config.api_host}/countries`)
    .then(response => response.json())
    .then((countries) => {
      res.json(countries);
      return next();
    }).catch((error) => {
      /**
       * In case 3rd party provider is not available , proper error handelling is in place to throw error message to user ,
       * instead of breaking the app
       */
      return next(new errors.InternalServerError(error, 'Server error retrieving countries.'));
    })

});


