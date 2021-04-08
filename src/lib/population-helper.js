'use strict';

const population = [
    {
        "total_population": {
            "date": "2015-04-07",
            "population": 1307389314,
            "country": "India"
        }
    }
]

exports.getPopulation = function getPopulation() {
    // using mock data for now
    return population;
};
