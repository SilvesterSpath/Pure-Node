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

// Input handlers
e.on('man', (str) => {
  cli.responders.help();
});

e.on('help', (str) => {
  cli.responders.help();
});

e.on('exit', (str) => {
  cli.responders.exit();
});

e.on('stats', (str) => {
  cli.responders.stats();
});

e.on('list users', (str) => {
  cli.responders.listUsers();
});

e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});

e.on('list checks', (str) => {
  cli.responders.listChecks(str);
});

e.on('more check info', (str) => {
  cli.responders.moreCheckInfo(str);
});

e.on('list logs', (str) => {
  cli.responders.listLogs();
});

e.on('more log info', (str) => {
  cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};

// Help / Man
// We don't need the 'string', because we don't need more information
cli.responders.help = () => {
  const commands = {
    exit: 'Kill the CLI (and the application)',
    man: 'This help page',
    help: 'Alias to "man" command',
    stats: 'Get statistics on the op system',
    'list users': 'Show all registered users',
    'more user info --(userId)': 'Show details of a specific user',
    'list checks --up --down':
      'Show a list of all the active checks in the system. The flags are optional',
    'more check info --(checkId)': 'Show details of a specified check',
    'list logs': 'Show a list of all the log files available',
    'more log info --(fileName)': 'Show details of a specified log file',
  };

  // Show a header for the help page that is as wide as the screen
};

// Exit
cli.responders.exit = () => {
  process.exit(0);
};

// Stats
cli.responders.stats = () => {
  console.log('You asked for stats');
};

// List users
cli.responders.listUsers = () => {
  console.log('You asked to list users');
};

// More user info
cli.responders.moreUserInfo = (str) => {
  console.log('You asked for more user info', str);
};

// List Checks
cli.responders.listChecks = (str) => {
  console.log('You asked to list checks', str);
};

// More check info
cli.responders.moreCheckInfo = (str) => {
  console.log('You asked for more check info', str);
};

// List logs
cli.responders.listLogs = () => {
  console.log('You asked to list logs');
};

// More logs info
cli.responders.moreLogInfo = (str) => {
  console.log('You asked for more log info', str);
};

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
    let counter = 0;
    uniqueInputs.some((item) => {
      if (str.toLowerCase().indexOf(item) > -1) {
        matchFound = true;

        // Emit an event matching the unique input, and include the full string given by the user
        e.emit(item, str);
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
