'use strict';

const config = require('./config');
const restify = require('restify');
const plugins = require('restify-plugins');
const argv = require('yargs').argv;

const logger = require('./lib/logger')();

/**
 * The following code can be used for scalability , when we have 1000's of requests coming to our server ,
 * we can make use of vertical scaling (creating master, worker processes depending on no. of cpu cores in a machine) 
 * 
 * const OS = require('os');
const cluster = require('cluster');

const cpus = OS.cpus().length;
console.log(cpus, 'cpuscpus');
if (cluster.isMaster) {
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  require('./server.js') // call main file
}
 */



let port = argv.port || process.env.PORT || config.port || 3000;
let environment = process.env.NODE_ENV || 'dev';

let pjson = require('../package.json');
let app = restify.createServer({
  name: pjson.name,
  version: pjson.version,
  log: logger
});
app.pre(restify.pre.sanitizePath());

app.acceptable = config.accept;
app.use(plugins.acceptParser(app.acceptable));
app.use(plugins.authorizationParser());
app.use(plugins.queryParser());
app.use(plugins.bodyParser());
app.use(plugins.requestLogger());

// Bootstrap routes
require('./routes')(app);

app.on('after', plugins.auditLogger({
  log: logger
}));

// Start listening
app.listen(port, () => {
  logger.info('Country Comparison API ' + environment + ' started listening on ' + port);
});

// Log exception and exit the process if an unhandled exception occurs.
// Don't exit on error if in env=test
if (process.env.NODE_ENV !== 'test') {
  process.on('uncaughtException', (err) => {
    /* eslint-disable no-console */
    console.error('Unhandled exception. Exiting process.' + err);
    /* eslint-enable no-console */
    logger.fatal('Unhandled exception. Exiting process.' + err);
    process.exit(1);
  });
}
// Expose
module.exports = app;
