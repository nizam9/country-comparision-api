'use strict';

const co = require('co');
const errors = require('restify-errors');
const countryHelper = require('../../lib/country-helper');
const fetch = require('node-fetch');
const config = require('../../config');

exports.getCountries = co.wrap(function* getCountries(req, res, next) {
  try {

    /**
     * @description used fetch API to make an http call and get countries data
     *              Convert the data to json and return the data to user
     */
    fetch(`${config.api_host}/countries`)
      .then(response => response.json())
      .then((countries) => {
        res.json(countries);
        return next();
      });

  } catch (err) {
    return next(new errors.InternalServerError(err, 'Server error retrieving countries.'));
  }
});


exports.getPopulation = co.wrap(function* getPopulation(req, res, next) {

  /**
   * @params
   * queryList: is an array , it holds the list of countries to be searched for
   * sort: pass the value `1` to sort data in ASC and pass `-1` to sort data in DESC
   * date: fetch population of countries for the given date
   */
  const queryList = req.params.countries.split(',');
  const date = req.params.date;
  const sort = req.params.sort;

  /**
   * @description The func `getPopulation` makes a http call using fetch api and resolves the data.
   * @param country 
   */

  function getPopulation(country) {
    const url = `${config.api_host}/population/${country}/${date}/`;
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => response.json())
        .then((data) => { resolve(data) })
        .catch((error) => {
          /**
           * @description Throw error when we donot receive data from server in the given case or 
           *  if the host is not available for any reason , the below code handels the error instead of breaking the app
           */
          return next(new errors.InternalServerError(error, 'Error in retrieving Population details'));
        })
    })
  }

  /**
   * @description fetchPopulation func will be the first , that gets called on hitting population API , 
   */
  async function fetchPopulation() {
    let req_countries = [];

    /**
     * `req_countries` is an array that stores the promise returned by `getPopulation` func
     *  When we pass multiple countries to compare , we call the func for each country and store the promise in the array
     */
    queryList.forEach((country) => req_countries.push(getPopulation(country)))

    try {
      /**
       * 1. promise.all is used to execute all the promises and return the result at once.
       * 2. The result is stored in a variable `result` and iretared to insert country name into the result
       * country field is not a part of population api response , so it is being added by us for maintaining
       * the mapping consistant when we do sorting. 
       * 3. next sorting is done based on the sort value provided in param
       * 4. modified final data is retruned to user
       */
      const result = await Promise.all(req_countries);
      result.map((row, i) => {
        row.total_population['country'] = queryList[i];
      })
      result.sort(compare);
      res.json(result);
      return next();
    } catch (error) {
      /**
       * @description Throw error when we donot receive data from server in the given case or 
       *  if the host is not available for any reason , the below code handels the error instead of breaking the app
       */
      return next(new errors.InternalServerError(error, 'Error in retrieving Population details'));
    }

  }

  /**
   * Compare func is used to perform sorting 
   * 1 for ASC
   * -1 for DESC
   */

  function compare(a, b) {
    if (sort == 1) {
      return (a.total_population.population - b.total_population.population)
    } else {
      return (b.total_population.population - a.total_population.population)
    }
  }

  fetchPopulation();

})