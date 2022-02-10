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
  } else {
    console.log('Error: One of the checks is not properly formatted');
  }
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
