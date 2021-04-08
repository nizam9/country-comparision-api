'use strict';

const countriesController = require('./countries.controller');
const populationController = require('./population.controllers');


function routes(app, rootUrl) {
  // include api version number
  let fullRootUrl = rootUrl + '/v1';

  /**
    * @apiVersion 1.0.0
    * @api {get} /countries
    * @apiGroup Countries
    * @apiName Get list of all countries
    * @apiDescription Returns an array of country names
    *
    * @apiSampleRequest /api/v1/countries
    *
    * @apiSuccess {json} Array of all country names
    * @apiSuccessExample {json} Success-Response:
    *   HTTP/1.1 200 OK
    *   [
    *     "Afghanistan",
    *     "AFRICA",
    *     "Albania",
    *     ...
    *   ]
    *
    * @apiError (Error 500) InternalServerError Returned if there was a server error
    */
  app.get({ url: fullRootUrl + '/countries' }, countriesController.getCountries);

  /**
    * @apiVersion 1.0.0
    * @api {get} /population
    * @apiGroup population
    * @apiName fetch population by countryname and date
    * @apiDescription Returns an array of data with date, population and country
    * @apiSampleRequest /api/v1/population/Brazil,India,China/2018-12-24/-1
    * @params countries , date , sort
    * @apiSuccess {json} Array of all population details
    * @apiSuccessExample {json} Success-Response:
    *   HTTP/1.1 200 OK
    * [{
        "total_population": {
            "date": "2018-12-24",
            "population": 1365613479,
            "country": "India"
        }
    * }]
    *
    * @apiError (Error 500) InternalServerError Returned if there was a server error
    */
   
  app.get({ url: fullRootUrl + '/population/:countries/:date/:sort' },populationController.getPopulation);
  app.get({ url: fullRootUrl + '/population/:countries/:date' },populationController.getPopulation);
  app.get({ url: fullRootUrl + '/population/:countries' },populationController.getPopulation);

  /**
   * 
   * Sample request urls
   * 1. http://localhost:3000/api/v1/countries
   * 2. http://localhost:3000/api/v1/population/Brazil,Bhutan,Nepal,India/2016-04-07/-1
   * 3. http://localhost:3000/api/v1/population/Brazil,Bhutan,Nepal,India/2016-04-07
   * 4. http://localhost:3000/api/v1/population/Brazil,Bhutan,Nepal,India
   */
}

module.exports = {
  routes: routes
};
