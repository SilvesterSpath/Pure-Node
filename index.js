/*
 * Primary file for the API
 *
 */

// Dependencies
require('dotenv').config({ path: './.env' });
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// Declare the app
const app = {};

// Init function
app.init = (callback) => {
  // Start the server
  server.init();

  // Start the workers
  workers.init();

  // Start the CLI, but make sure its starts last
  setTimeout(() => {
    cli.init();
    callback();
  }, 50);
};

// Self incoking only if required directly (not when its being exported)
if (require.main === module) {
  app.init(() => {});
}

console.log('process.env.TEST:', process.env.TEST);

// Export the app
module.exports = app;
