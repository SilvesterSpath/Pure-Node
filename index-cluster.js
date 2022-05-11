/*
 * Primary file for the API
 *
 */

// Dependencies
require('dotenv').config({ path: './.env' });
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const os = require('os');
const cluster = require('cluster');

// Declare the app
const app = {};

// Init function
app.init = (callback) => {
  // If we're on the master thread, start the backgound workers and the CLI
  if (cluster.isMaster) {
    // Start the workers
    workers.init();

    // Start the CLI, but make sure its starts last
    setTimeout(() => {
      cli.init();
      callback();
    }, 50);

    // Fork the process (it will run the hole file multiple times but it will now run it in fork mode, so the 'else' will run)
    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else {
    // If we are not on the master thread start the HTTP server
    server.init();
  }
};

// Self incoking only if required directly (not when its being exported)
if (require.main === module) {
  app.init(() => {});
}

console.log('process.env.TEST:', process.env.TEST);

// Export the app
module.exports = app;
