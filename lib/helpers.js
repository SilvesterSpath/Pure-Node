/*
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const path = require('path');
const fs = require('fs');
const { type } = require('os');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
  if (typeof str == 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const object = JSON.parse(str);
    return object;
  } catch (error) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (length) => {
  length = typeof length == 'number' && length > 0 ? length : false;

  if (length) {
    // Define all the possible characters
    const possibleCharacters = 'abcdefghijklmnopqrstvwxyz0123456789';

    // Start the final string
    let str = '';
    for (i = 1; i <= length; i++) {
      // Get a random character from the possibleCharacters string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );

      // Append this character to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;
  } else {
    return false;
  }
};

// Send an SMS message via Twillio
helpers.sendTwilioSMS = (phone, msg, callback) => {
  console.log(phone, msg);
  // Validate the parameters
  phone =
    typeof phone === 'string' && phone.trim().length == 9
      ? phone.trim()
      : false;
  msg =
    typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length < 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    // Configure the request payload
    const payload = {
      From: config.twilio.fromPhone,
      To: '+36' + phone,
      Body: msg,
    };

    // Stringify the payload
    const stringPayload = new URLSearchParams({
      From: `${config.twilio.fromPhone}`,
      To: `+36${phone}`,
      Body: `${msg}`,
    }).toString();
    console.log(stringPayload);

    // Configure the request details
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path:
        '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      auth: config.twilio.accountSid + ':' + config.twilio.authToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
      },
    };

    // Instantiate the requrest object
    const req = https.request(requestDetails, (res) => {
      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback('Status code returned was ' + status);
      }
    });

    // Bind to the error event so it doesn't get thown
    req.on('error', (e) => {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request (this would actually send the request off)
    req.end();
  } else {
    callback('Given parameters were missing or invalid');
  }
};

// Get the string content of a template
helpers.getTemplate = (templateName, data, callback) => {
  templateName =
    typeof templateName == 'string' && templateName.length > 0
      ? templateName
      : false;
  data = typeof data == 'object' && data !== null ? data : {};
  if (templateName) {
    const templatedDir = path.join(__dirname, '/../templates/');
    fs.readFile(templatedDir + templateName + '.html', 'utf-8', (err, str) => {
      if (!err && str && str.length > 0) {
        // Do the interpolation on the string
        const finalStr = helpers.interpolate(str, data);
        callback(false, finalStr);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('The template name was not valid');
  }
};

// Add the universal header and footer to a string, and pass provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof str == 'string' && str.length > 0 ? str : '';
  data = typeof data == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, (err, footerString) => {
        if (!err && footerString) {
          // Add the templates together
          const fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Footer template not found');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  str = typeof str == 'string' && str.length > 0 ? str : '';
  data = typeof data == 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global"
  for (const item in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(item)) {
      data['global.' + item] = config.templateGlobals[item];
    }
  }

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (const item in data) {
    if (data.hasOwnProperty(item) && typeof data[item] == 'string') {
      const replace = data[item];
      const find = `{${item}}`;
      str = str.replace(find, replace);
    }
  }
  return str;
};

// Export module
module.exports = helpers;
