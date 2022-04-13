/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define handlers
const handlers = {};

/*
 * HTML Handlers
 *
 */

// Index handler
handlers.index = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'GET') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Uptime Monitoring',
      'head.description':
        "We offer simple uptime monitoring for HTTP/HTTPS sites of all kind. When your site goes down, we'll send you a text to let you know",
      'body.class': 'index',
    };

    // Read in a template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          str,
          templateData,
          (err, newFullString) => {
            if (!err && newFullString) {
              // Return that page as Html
              callback(200, newFullString, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html'); // 405 Method is not allowed
  }
};

// Create Account handler
handlers.accountCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'GET') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only takes a few seconds',
      'body.class': 'accountCreate',
    };

    // Read in a template as a string
    helpers.getTemplate('accountCreate', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          str,
          templateData,
          (err, newFullString) => {
            if (!err && newFullString) {
              // Return that page as Html
              callback(200, newFullString, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html'); // 405 Method is not allowed
  }
};

// Create New Session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'GET') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Login to your Account',
      'head.description':
        'Please enter your phone number and password to acces you account',
      'body.class': 'sessionCreate',
    };

    // Read in a template as a string
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          str,
          templateData,
          (err, newFullString) => {
            if (!err && newFullString) {
              // Return that page as Html
              callback(200, newFullString, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html'); // 405 Method is not allowed
  }
};

// Session has been deleted
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'GET') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Logged Out',
      'head.description': 'You have been logged out of your account',
      'body.class': 'sessionDeleted',
    };

    // Read in a template as a string
    helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          str,
          templateData,
          (err, newFullString) => {
            if (!err && newFullString) {
              // Return that page as Html
              callback(200, newFullString, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html'); // 405 Method is not allowed
  }
};

// Edit your account
handlers.accountEdit = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'GET') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Settings',
      'body.class': 'accountEdit',
    };

    // Read in a template as a string
    helpers.getTemplate('accountEdit', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          str,
          templateData,
          (err, newFullString) => {
            if (!err && newFullString) {
              // Return that page as Html
              callback(200, newFullString, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html'); // 405 Method is not allowed
  }
};

// Account has been deleted
handlers.accountDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'GET') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Deleted',
      'head.description': 'Your account has been deleted',
      'body.class': 'accountDeleted',
    };

    // Read in a template as a string
    helpers.getTemplate('accountDeleted', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(
          str,
          templateData,
          (err, newFullString) => {
            if (!err && newFullString) {
              // Return that page as Html
              callback(200, newFullString, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          }
        );
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html'); // 405 Method is not allowed
  }
};

// Favicon handler
handlers.favicon = (data, callback) => {
  // Reject any request that isn't GET
  if (data.method == 'GET') {
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data) {
        // Callback the data
        callback(200, data, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets
handlers.public = (data, callback) => {
  // Reject any request that isn't GET
  if (data.method == 'GET') {
    // Get the filename being requested
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          // Determine the content type (default to plain text)
          let contentType = 'plain';

          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }
          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }
          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }
          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }
          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};

/*
 * JSON API Handlers
 *
 */

// Sample handler
handlers.sample = (data, callback) => {
  // Callback an http status code, and a payload object
  callback(406, { name: 'sample handler' });
};

// Data handler
handlers.data = (data, callback) => {
  callback(200, { data: data.payload });
};

// Users (so called  blanked handler)
handlers.users = (data, callback) => {
  const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Require data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.POST = (data, callback) => {
  // Check that all required fields are filled out
  const firstName =
    typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length === 5
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == 'boolean' &&
    data.payload.tosAgreement == true
      ? true
      : false;
  console.log(firstName, lastName, phone, password, tosAgreement);

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesnt already exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };

          // Store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create the user' });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the users's password" });
        }
      } else {
        // User already exists
        callback(400, { Error: 'A user with that phone already exists!' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

// Users - GET
// Required data: phone
// Optional data: none
handlers._users.GET = (data, callback) => {
  // Check that the phone number is valid
  const phone =
    typeof data.queryString.phone == 'string' &&
    data.queryString.phone.trim().length == 5
      ? data.queryString.phone.trim()
      : false;
  console.log(phone);
  if (phone) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, (err, storedUserData) => {
          if (!err && storedUserData) {
            // Remove the hashed password from the storedUserData object before returning it to the requester
            delete storedUserData.hashedPassword;
            callback(200, storedUserData);
          } else {
            callback(404, { Error: 'User not found 1' });
          }
        });
      } else {
        callback(403, {
          Error: 'Missing required token in header or token is invalid',
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing phone number1' });
  }
};

// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.PUT = (data, callback) => {
  // Check for the required phone field
  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length == 5
      ? data.payload.phone.trim()
      : false;
  // Check for the optional fields
  const firstName =
    typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Get the token from the headers
      const token =
        typeof data.headers.token == 'string' ? data.headers.token : false;

      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, (err, storedUserData) => {
            if (!err && storedUserData) {
              // Update the fields necessary
              if (firstName) {
                storedUserData.firstName = firstName;
              }
              if (lastName) {
                storedUserData.lastName = lastName;
              }
              if (password) {
                storedUserData.hashedPassword = helpers.hash(password);
              }

              // Store the new updates
              _data.update('users', phone, storedUserData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: 'Could not update the user' });
                }
              });
            } else {
              callback(400, { Error: 'The specified user does not exists' });
            }
          });
        } else {
          callback(403, {
            Error: 'Missing required token in header or token is invalid',
          });
        }
      });
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing phone number2' });
  }
};

// Users - DELETE
// Required field:  phone
// Optional field: none
handlers._users.DELETE = (data, callback) => {
  console.log(data.queryString);
  // Check for the user by the phone number
  const phone =
    typeof data.queryString.phone == 'string' &&
    data.queryString.phone.trim().length == 5
      ? data.queryString.phone.trim()
      : false;
  if (phone) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, (err, storedUserData) => {
          if (!err && storedUserData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                // Delete the checks associated with the user
                const userChecks =
                  typeof storedUserData.checks === 'object' &&
                  storedUserData.checks instanceof Array
                    ? storedUserData.checks
                    : [];
                const checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  const deletionErrors = false;
                  // Loop through  the checks
                  userChecks.forEach((i) => {
                    // Delete the check
                    _data.delete('checks', i, (err) => {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {
                            Error:
                              'Errors encountered while attempting to delete the checks',
                          });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                console.log(err);
                callback(500, { Error: 'Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { Error: 'User not found 2' });
          }
        });
      } else {
        callback(403, {
          Error: 'Missing required token in header or token is invalid',
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing phone number3' });
  }
};

// Tokens (so called  blanked handler)
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens POST
// Required data: phone, password
// Optional data: none
handlers._tokens.POST = (data, callback) => {
  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length === 5
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (phone && password) {
    // Lookup the user who matches that phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password and compare to the stored password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // Create a new token with a random name. Set expiration date 1 hour
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          // Store token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: 'Could not create the token' });
            }
          });
        } else {
          callback(400, { Error: 'Password did not match' });
        }
      } else {
        callback(400, { Error: 'User not found 3' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field(s)' });
  }
};

// Tokens GET
// Required data: id
// Optional data: none
handlers._tokens.GET = (data, callback) => {
  // Check that the id is valid
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length == 20
      ? data.queryString.id.trim()
      : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { Error: 'Token not found' });
      }
    });
  } else {
    callback(400, { Error: 'Missing phone number4' });
  }
};

// Tokens PUT
// Required data : id, extend
// Optional data : none
handlers._tokens.PUT = (data, callback) => {
  console.log(data.payload.id);

  const id =
    typeof data.payload.id == 'string' && data.payload.id.trim().length == 20
      ? data.payload.id
      : 'false';

  const extend =
    typeof data.payload.extend == 'boolean' && data.payload.extend == true
      ? true
      : 'false';
  if (id && extend) {
    // Lookup the token in order to get the expiration date
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 3600;

          // Store the new updates
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not update token's expiration" });
            }
          });
        } else {
          callback(400, {
            Error: 'Token already expired and cannot be extended',
          });
        }
      } else {
        callback(400, { Error: 'Specified token does not exists' });
      }
    });
  } else {
    callback(400, {
      Error: 'Missing required field(s) or field(s) are invalid',
    });
  }
};

// Tokens DELETE
// Required data: id
// Optional data: none
handlers._tokens.DELETE = (data, callback) => {
  // Check for the token by the id number
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length == 20
      ? data.queryString.id.trim()
      : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, storedTokenData) => {
      if (!err && storedTokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            console.log(err);
            callback(500, { Error: 'Could not delete the specified token' });
          }
        });
      } else {
        callback(400, { Error: 'Token not found' });
      }
    });
  } else {
    callback(400, { Error: 'Missing id number' });
  }
};

// Verify if a given token_id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Look up the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Checks
handlers.checks = (data, callback) => {
  const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.POST = (data, callback) => {
  // Validate inputs
  const protocol =
    typeof data.payload.protocol == 'string' &&
    ['https', 'http'].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url == 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.method == 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  const successCodes =
    typeof data.payload.successCodes == 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;
  console.log(protocol, url, method, successCodes, timeoutSeconds);
  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;

    // Lookup the user by reading the token
    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;

        // Lookup the user data
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            const userChecks =
              typeof userData.checks == 'object' &&
              userData.checks instanceof Array
                ? userData.checks
                : [];

            // Verify that the user has less than the number of max-checks-per-user
            if (userChecks.length < config.maxChecks) {
              // Create a random id for the check
              const checkId = helpers.createRandomString(10);

              // Create the check object, and include the user's phone
              const checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeoutSeconds: timeoutSeconds,
              };

              // Save the object
              _data.create('checks', checkId, checkObject, (err) => {
                if (!err) {
                  // Add the checkId to the user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // Save the new user data
                  _data.update('users', userPhone, userData, (err) => {
                    if (!err) {
                      // Return the data about the new check
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        Error: 'Could not update the user data',
                      });
                    }
                  });
                } else {
                  callback(500, { Error: 'Could not create the new check' });
                }
              });
            } else {
              callback(400, {
                Error: `Maximum number of checks has been reached (${config.maxChecks})`,
              });
            }
          } else {
            callback(400, { Error: "The user doesn't exist" });
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: 'Missing required inputs, or inputs are invalid' });
  }
};

// Checks GET
// Required data: id
// Optional data: none
handlers._checks.GET = (data, callback) => {
  // Check that the id is valid
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length == 10
      ? data.queryString.id.trim()
      : false;

  if (id) {
    3;
    // Lookup the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // Get the token from the header
        const token =
          typeof data.headers.token == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // Return the checkData
              callback(200, checkData);
            } else {
              callback(403, {
                Error: 'Missing required token in header or token is invalid',
              });
            }
          }
        );
      } else {
        callback(404, { Error: 'Check does not exists' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required id from the url' });
  }
};

// Checks - PUT
// Required data: id
// Optional data: protocol, url, method, successCodes, timeoutSeconds, (one must be sent)
handlers._checks.PUT = (data, callback) => {
  // Check for the required field
  const id =
    typeof data.payload.id === 'string' && data.payload.id.trim().length == 10
      ? data.payload.id.trim()
      : false;

  // Check for the optional fields
  const protocol =
    typeof data.payload.protocol == 'string' &&
    ['https', 'http'].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url == 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.method == 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  const successCodes =
    typeof data.payload.successCodes == 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;
  console.log(protocol, url, method, successCodes, timeoutSeconds);
  // Check to make sure id is valid
  if (id) {
    // Check to make sure one or more optional fields has been sent
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          // Get the token from the headers
          const token =
            typeof data.headers.token === 'string' ? data.headers.token : false;
          //Verify that the given token is valid and belongs to the user who created the check
          handlers._tokens.verifyToken(
            token,
            checkData.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                // Update the check where necessary
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }
                // Store the updates
                _data.update('checks', id, checkData, (err) => {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, { Error: 'Could not update the check' });
                  }
                });
              } else {
                callback(403);
              }
            }
          );
        } else {
          callback(400, { Error: 'Check ID did not exists' });
        }
      });
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

// Checks - DELETE
// Required data: id
// Optional data: none
handlers._checks.DELETE = (data, callback) => {
  // Check for the token by the id number
  const id =
    typeof data.queryString.id == 'string' &&
    data.queryString.id.trim().length == 10
      ? data.queryString.id.trim()
      : false;
  if (id) {
    // Lookup the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // Get the token from the headers
        const token =
          typeof data.headers.token == 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // Delete the checkdata
              _data.delete('checks', id, (err) => {
                if (!err) {
                  // Lookup the user
                  _data.read(
                    'users',
                    checkData.userPhone,
                    (err, storedUserData) => {
                      if (!err && storedUserData) {
                        const userChecks =
                          typeof storedUserData.checks == 'object' &&
                          storedUserData.checks instanceof Array
                            ? storedUserData.checks
                            : [];
                        // Remove the deleted check reference from the list of checks
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // Re-save the users data
                          _data.update(
                            'users',
                            checkData.userPhone,
                            storedUserData,
                            (err) => {
                              if (!err) {
                                callback(200);
                              } else {
                                callback(500, {
                                  Error:
                                    'Could not update the specified userData',
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            Error:
                              'Could not find the check on the users object',
                          });
                        }
                      } else {
                        callback(500, {
                          Error: 'User not found, so check could not delete',
                        });
                      }
                    }
                  );
                } else {
                  callback(500, { Error: 'Could not delete the checkData' });
                }
              });
            } else {
              callback(403, {
                Error: 'Missing required token in header or token is invalid',
              });
            }
          }
        );
      } else {
        callback(400, { Error: 'Specified check ID  does not exists' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field (ID)' });
  }
};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;
