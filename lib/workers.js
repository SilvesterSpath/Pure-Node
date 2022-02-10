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
            console.log("Error reading one of the check's data");
          }
        });
      });
    } else {
      console.log('Error: Could not find any checks to process');
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
    originalCheckData.id.trim().length == 20
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
    console.log(
      'Error: One of the checks is not properly formatted. Skipping it'
    );
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
  const outcomeSent = false;

  // Parse the hostname and the path out of the original check data
  const parsedUrl = url.parse(
    originalCheckData.protocol + '://' + originalCheckData.url,
    true
  );
  console.log('parsedUrl: ', parsedUrl);
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
    checkOutcome.statusCode = status;
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
};

// Timer to execute the worker-process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// Init script
workers.init = () => {
  // Execute all the checks immediately
  workers.gatherAllChecks();

  // Call a loop so the checks will execute later on
  workers.loop();
};

// Export the module
module.exports = workers;
