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
app.init = () => {
  // Start the server
  server.init();

  // Start the workers
  workers.init();

  // Start the CLI, but make sure its starts last
  setTimeout(() => {
    cli.init();
  }, 50);
};

// Execute that function
app.init();

console.log('process.env.TEST:', process.env.TEST);

// Export the app
module.exports = app;
