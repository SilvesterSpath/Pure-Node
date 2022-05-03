/*
 * Primary file for the API
 *
 */

// Dependencies
require('dotenv').config({ path: './.env' });
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebugging = require('./lib/exampleDebugging');

// Declare the app
const app = {};

// Init function
app.init = () => {
  // Start the server
  debugger;
  server.init();
  debugger;

  // Start the workers
  debugger;
  workers.init();
  debugger;

  // Start the CLI, but make sure its starts last
  debugger;
  setTimeout(() => {
    cli.init();
    debugger;
  }, 50);
  debugger;

  // Set foo at 1
  debugger;
  let foo = 1;
  console.log('Just assigned 1 to foo');
  debugger;

  // Increment foo
  foo++;
  console.log('Just incremented foo');
  debugger;

  // Square foo
  foo *= foo;
  console.log('Just squared foo');
  debugger;

  // Convert too a string
  foo = foo.toString();
  console.log('Just converted foo to string');
  debugger;

  // Call the init script that will throw
  exampleDebugging.init();
  console.log('Just called the library');
  debugger;
};

// Execute that function
app.init();

console.log('process.env.TEST:', process.env.TEST);

// Export the app
module.exports = app;
