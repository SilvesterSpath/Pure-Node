/*
 * Worker related tasks
 *
 */

// Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
const _logs = require('./logs');
const util = require('util');
const debug = util.debuglog('workers');

// Instantiate the workers object
const workers = {};

// Lookup all the checks, get their data, send to a validator
workers.gatherAllChecks = () => {
  // Get all the checks
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((i) => {
        // Read in the check data
        _data.read('checks', i, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // Pass it to the checkValidator, and let that function continue or log error as needed
            workers.validateCheckdata(originalCheckData);
          } else {
            debug("Error reading one of the check's data");
          }
        });
      });
    } else {
      debug('Error: Could not find any checks to process');
    }
  });
};

// Sanity-check the check-data
workers.validateCheckdata = (originalCheckData) => {
  originalCheckData =
    typeof originalCheckData == 'object' && originalCheckData !== null
      ? originalCheckData
      : {};
  originalCheckData.id =
    typeof originalCheckData.id == 'string' &&
    originalCheckData.id.trim().length == 10
      ? originalCheckData.id.trim()
      : false;
  originalCheckData.phone =
    typeof originalCheckData.phone == 'string' &&
    originalCheckData.phone.trim().length == 5
      ? originalCheckData.phone.trim()
      : false;
  originalCheckData.protocol =
    typeof originalCheckData.protocol == 'string' &&
    ['http', 'https'].indexOf(originalCheckData.protocol) > -1
      ? originalCheckData.protocol
      : false;
  originalCheckData.url =
    typeof originalCheckData.url == 'string' &&
    originalCheckData.url.trim().length > 0
      ? originalCheckData.url.trim()
      : false;
  originalCheckData.method =
    typeof originalCheckData.method == 'string' &&
    ['GET', 'PUT', 'POST', 'DELETE'].indexOf(originalCheckData.method) > -1
      ? originalCheckData.method
      : false;
  originalCheckData.successCodes =
    typeof originalCheckData.successCodes == 'object' &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0
      ? originalCheckData.successCodes
      : false;
  originalCheckData.timeoutSeconds =
    typeof originalCheckData.timeoutSeconds == 'number' &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5
      ? originalCheckData.timeoutSeconds
      : false;

  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state =
    typeof originalCheckData.state == 'string' &&
    ['up', 'down'].indexOf(originalCheckData.state) > -1
      ? originalCheckData.state
      : 'down';
  // The last checked data will be a number eventually
  originalCheckData.lastChecked =
    typeof originalCheckData.lastChecked == 'number' &&
    originalCheckData.lastChecked > 0
      ? originalCheckData.lastChecked
      : false;

  // If all the checks pass, pass the data along to the next step in the process

  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    debug('Error: One of the checks is not properly formatted. Skipping it');
  }
};

// Perform the check, send the originalCheckData and the outcome of the check process, to the next step in the process
workers.performCheck = (originalCheckData) => {
  // Prepare the initial check outcome
  const checkOutcome = {
    error: false,
    responseCode: false,
  };

  // Mark that the outcome has not been sent yet
  let outcomeSent = false;

  // Parse the hostname and the path out of the original check data
  const parsedUrl = url.parse(
    originalCheckData.protocol + '://' + originalCheckData.url,
    true
  );
  /* debug('parsedUrl: ', parsedUrl); */
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path; // We are using path and not 'pathname' because we want the full query string

  // Constructing the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ':',
    hostname: hostName,
    method: originalCheckData.method,
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  // Instantiate the requrest object (using either the http or https module)
  const _moduleToUse = originalCheckData.protocol == 'http' ? http : https; // These are the modules (http, https) assign up

  const req = _moduleToUse.request(requestDetails, (res) => {
    // Grab the status of the sent request
    const status = res.statusCode;

    // Update the checkOutcome and pass the data along
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error', (e) => {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = {
      error: true,
      value: e,
    };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout event
  req.on('timeout', (e) => {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = {
      error: true,
      value: 'timeout',
    };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // End the request (which is the same thing as sending a request)
  req.end();
};

// Process the check outcome and update the checkdata as needed and trigger an alert to the user if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one if the check changes from the default down to up)(we only alert when the check changes from what we saw earlier)

workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // Decide if the check is considered up or down
  const state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? 'up'
      : 'down';

  // Decide if an alert is warrented (checked before and changed after last check)
  const alertWarranted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // Log the outcome of the check
  const timeOfCheck = Date.now();
  workers.log(
    originalCheckData,
    checkOutcome,
    state,
    alertWarranted,
    timeOfCheck
  );

  // Update the checkdata
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = timeOfCheck;

  // Save the updates
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // Send the new check data to the next phase in the process if needed
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        debug('Checkoutcome has not changed, no alert needed');
      }
    } else {
      debug("Can't update the check");
    }
  });
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  helpers.sendTwilioSMS(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      debug(
        `Success: User was alerted to a status change in their check, via SMS: ${msg}`
      );
    } else {
      debug(
        "Couldn't send sms alert to user who had a state change in their check"
      );
    }
  });
};

// Log the informations to a file
workers.log = (
  originalCheckData,
  checkOutcome,
  state,
  alertWarranted,
  timeOfCheck
) => {
  // Form the log data
  const logData = {
    check: originalCheckData,
    outcome: checkOutcome,
    state: state,
    alert: alertWarranted,
    time: timeOfCheck,
  };

  // Convert it to a string
  const logString = JSON.stringify(logData);

  // Determine the name of the logfile
  const logFileName = originalCheckData.id;

  // Append the log  string to the file
  /* _data.create('logs', logFileName, logString, (err) => {}); */
  _logs.append(logFileName, logString, (err) => {
    if (!err) {
      debug('Logging to file succeeded');
    } else {
      debug('Logging to file failed');
    }
  });
};

// Timer to execute the worker-process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// Rotate (aka compress) the log files
workers.rotateLogs = () => {
  // List all the (non compressed) log files
  _logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach((i) => {
        // Compress the data to a different file
        const logId = i.replace('.log', '');
        const newFileId = logId + '-' + Date.now();
        _logs.compress(logId, newFileId, (err) => {
          if (!err) {
            // Truncate the log (emptying out to the compressed file)
            _logs.truncate(logId, (err) => {
              if (!err) {
                debug('Success truncating logFile');
              } else {
                debug('Error truncating logFile');
              }
            });
          } else {
            debug(`Error compressing one of the log files: ${err}`);
          }
        });
      });
    } else {
      debug('Error : could not find any logs to rotate');
    }
  });
};

// Timer to execute the log-rotation process once per day
workers.logRotationLoop = () => {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};
// Init script
workers.init = () => {
  // Send to console in yellow
  console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

  // Execute all the checks immediately
  workers.gatherAllChecks();

  // Call a loop so the checks will execute later on
  workers.loop();

  // Compress all the logs immediately
  workers.rotateLogs();

  // Call the compression loops so logs will be compressed later on
  workers.logRotationLoop();
};

// Export the module
module.exports = workers;
