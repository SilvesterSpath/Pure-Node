/*
 * CLI related tasks
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');

class _events extends events {}
const e = new _events();

// Instantiate the CLI module object
const cli = {};

// Input processor
cli.processInput = (str) => {
  str = typeof str == 'string' && str.trim().length > 0 ? str.trim() : false;

  // Only process the input if the user actually wrote something, otherwise ignore
  if (str) {
    // Codify the unique strings that indentify the unique questions allowed to be asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info',
    ];

    // Go through the possible input and emit an event when a match is found
    let matchFound = false;
    const counter = 0;
    uniqueInputs.some((item) => {
      if (str.toLowerCase().indexOf(item) > -1) {
        matchFound = true;

        // Emit an event matching the unique input, and include the full string given by the user
        e.emit(item, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log('Try again');
    }
  }
};

// Init script
cli.init = () => {
  // Send the start message to the console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', `The CLI is running`);

  // Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>:',
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', (str) => {
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', () => {
    process.exit(0);
  });
};

// Export module
module.exports = cli;