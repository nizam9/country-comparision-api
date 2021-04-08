'use strict';

const co = require('co');
const errors = require('restify-errors');
const fetch = require('node-fetch');
const config = require('../../config');



exports.getPopulation = co.wrap(function* getPopulation(req, res, next) {

    /**
     * @params
     * queryList: is an array , it holds the list of countries to be searched for
     * sort: pass the value `1` to sort data in ASC and pass `-1` to sort data in DESC
     * date: fetch population of countries for the given date and if no date is provided pick current date
     * Validation is handled for the params and fallback is provided
     */
  
     /**
      * when we have users in our database and want to show users country details:
      * 1. Using existing service , we can acheive by getting the usersCountry in params from webapp.
      *  (UI might have the usersInfo stored from logintoken)
      * 2. fetch the users country from DB and append in query param
      */
    const queryList = (req.params.countries.length) ? req.params.countries.split(',') : [];
    const date = req.params.date || new Date().toISOString().slice(0, 10);
    const sort = req.params.sort || -1;
  
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
     * @description fetchPopulation func will be the first that gets called on hitting population API , 
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
         * 2. The result is stored in a variable `result` and iretared to insert country name into the result.
         *    country field is not a part of population api response , so it is being added by us for maintaining
         *    the mapping consistant when we do sorting. 
         * 3. next sorting is done based on the sort value provided in param else in DESC order
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