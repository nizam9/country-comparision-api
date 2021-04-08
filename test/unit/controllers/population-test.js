const app = require('../../../src/server.js');
const config = require('../../../src/config');
const request = require('supertest');
const sinon = require('sinon');
require('chai').should();

const populationHelper = require('../../../src/lib/population-helper');
const mockPopulation = require('../../fixtures/data/mock-population.json');

describe('Population endpoint tests', () => {
  let sandbox;
  beforeEach(function beforeEach() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function afterEach() {
    sandbox.restore();
  });

  describe('get population', function getPopulation() {
    const endpointUrl = config.routes.controllerRootUrl + '/v1/population/India/2015-04-07/';
    console.log(endpointUrl , 'endpointUrl')
    it('should return a population details', function handleGettingPopulation(done) {
      sandbox.stub(populationHelper, 'getPopulation').returns(mockPopulation);

      request(app)
      .get(`${endpointUrl}`)
      .set('accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        res.body.should.be.an.array;
        res.body.should.eql(mockPopulation);
        return done();
      });
    });

    it('should return empty array if no population details found', function handleNoPopulationFound(done) {
      sandbox.stub(populationHelper, 'getPopulation').returns([]);

      request(app)
      .get(`${endpointUrl}`)
      .set('accept', 'application/json')
      .expect(200, [])
      .end(err => {
        if (err) {
          return done(err);
        }
        return done();
      });
    });

    it('should return 500 if there is error in fetching population', function handleErrorGettingPopulationn(done) {
      const error = new Error('fake error');
      sandbox.stub(populationHelper, 'getPopulation').throws(error);

      request(app)
      .get(`${endpointUrl}`)
      .set('accept', 'application/json')
      .expect(500)
      .end(err => {
        if (err) {
          return done(err);
        }
        return done();
      });
    });
  });
});
