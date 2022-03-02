/*
 * Primary file for the API
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const dotenv = require('dotenv').config({ path: './.env' });

// Declare the app
const app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();

  // Start the workers
  workers.init();
};

// Execute that function
app.init();

console.log('process.env.TEST:', process.env.TEST);

// Export the app
module.exports = app;
