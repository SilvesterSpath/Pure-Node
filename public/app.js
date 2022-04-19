/*
 * Frontend logic for the Application
 */

// Container for the frontend application
const app = {};

// Config
app.config = {
  sessionToken: false,
};

// AJAX Client (for the resful API)
app.client = {};

// Interface for making API calls
app.client.request = (
  headers,
  path,
  method,
  queryStringObject,
  payload,
  callback
) => {
  // Set defaults
  headers = typeof headers == 'object' && headers !== null ? headers : {};
  path = typeof path == 'string' ? path : '/';
  method =
    typeof method == 'string' &&
    ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1
      ? method.toUpperCase()
      : 'GET';
  queryStringObject =
    typeof queryStringObject == 'object' && queryStringObject != null
      ? queryStringObject
      : {};
  payload = typeof payload == 'object' && payload != null ? payload : {};
  callback = typeof callback == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  let requestUrl = path + '?';
  let count = 0;
  for (const item in queryStringObject) {
    // this for loop only for the sake of counting the items in the queryStringObject
    if (queryStringObject.hasOwnProperty(item)) {
      count++;
      // If at least one query string parameter has already been added, prepend new ones with an ampersand
      if (count > 1) {
        requestUrl += '&';
      }
      requestUrl += item + '=' + queryStringObject[item];
    }
  }

  // Form the http request as a JSON type
  const xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-type', 'application/json');

  // For each header sent, add it to the request
  for (const item in headers) {
    if (headers.hasOwnProperty(item)) {
      xhr.setRequestHeader(item, headers[item]);
    }
  }

  // If there is a current session set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseReturned = xhr.responseText;

      // Callback if requested
      if (callback) {
        try {
          const parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  };

  // Send the payload as JSON
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};

// Bind the logout button
app.bindLogoutButton = () => {
  document.getElementById('logoutButton').addEventListener('click', (e) => {
    console.log('logout');
    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();
  });
};

// Log the user out then redirect them
app.logUserOut = (redirectUser) => {
  // Set redirectUser to default to true
  redirectUser = typeof redirectUser == 'boolean' ? redirectUser : true;

  // Get the current token id
  const tokenId =
    typeof app.config.sessionToken.id == 'string'
      ? app.config.sessionToken.id
      : false;

  // Send the current token to the tokens endpoint to delete it
  const queryStringObject = {
    id: tokenId,
  };

  app.client.request(
    undefined,
    'api/tokens',
    'DELETE',
    queryStringObject,
    undefined,
    (statusCode, responsePayload) => {
      // Set the app.config token as false
      app.setSessionToken(false);

      // Send the user to the logged out page
      if (redirectUser) {
        window.location = '/session/deleted';
      }
    }
  );
};

// Bind the forms
app.bindForms = () => {
  if (document.querySelector('form')) {
    const allForms = document.querySelectorAll('form');

    allForms.forEach((i) =>
      i.addEventListener('submit', (e) => {
        /* const form = document.querySelector('form'); */
        // Stop it from submitting
        e.preventDefault();
        const formId = i.id;
        const path = i.action;
        let method = i.method.toUpperCase(); //this is very important because in the HTMLFormElement the method is !!!lowercase!!!

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector('#' + formId + ' .formError').style.display =
          'hidden';

        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector(`#${formId} .formSuccess`)) {
          document.querySelector(`#${formId} .formSuccess`).style.display =
            'none';
        }

        // Turn the inputs into a payload
        const payload = {};
        const elements = i.elements;
        for (let i = 0; i < elements.length; i++) {
          console.log(elements[i]);
          if (elements[i].type !== 'submit') {
            // Determine class of element and set value accordingly
            const classOfElement =
              typeof elements[i].classList.value == 'string' &&
              elements[i].classList.value.length > 0
                ? elements[i].classList.value
                : '';
            const valueOfElement =
              elements[i].type == 'checkbox' &&
              classOfElement.indexOf('multiselect') == -1
                ? elements[i].checked
                : classOfElement.indexOf('intval') == -1
                ? elements[i].value
                : parseInt(elements[i].value);
            const elementIsChecked = elements[i].checked;
            // Override the method of the form if the input's name is '_method'
            let nameOfElement = elements[i].name;
            console.log('nameOfElement', nameOfElement);
            if (nameOfElement == 'httpmethod') {
              payload.method = valueOfElement;
            }
            if (nameOfElement == '_method') {
              method = valueOfElement;
            } else {
              // Create a payload field named "method" if the elements name is actually httpmethod

              // If the element has the class 'multiselect' add its value(s) as array elements
              if (classOfElement.indexOf('multiselect') > -1) {
                if (elementIsChecked) {
                  payload[nameOfElement] =
                    typeof payload[nameOfElement] == 'object' &&
                    payload[nameOfElement] instanceof Array
                      ? payload[nameOfElement]
                      : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[elements[i].name] = valueOfElement;
              }
            }
            console.log('payload', payload);
          }
        }

        // If the method is DELETE, the payload should be a queryStringObject instead
        const queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
        app.client.request(
          undefined,
          path,
          method,
          queryStringObject,
          payload,
          (statusCode, responsePayload) => {
            // Display an error on the form if needed
            if (statusCode !== 200) {
              // Try to get the error from the api, or set a default error message
              const error =
                typeof responsePayload.Error == 'string'
                  ? responsePayload.Error
                  : 'An error has occured, please try again';

              // Set the formError field with error text
              document.querySelector('#' + formId + ' .formError').innerHTML =
                error;

              // Show (unhide) the form error field on the form
              document.querySelector(
                '#' + formId + ' .formError'
              ).style.display = 'block';
            } else {
              // If successful, send to form response processor
              app.formResponseProcessor(formId, payload, responsePayload);
            }
          }
        );
      })
    );
  }
};

// Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  const functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if (formId == 'accountCreate') {
    console.log('The acocuntCreate form was successfully submitted');
    // @TODO Do something here now that the account has been created successfully
    // Take the phone and password, and use it to log the user in
    const newPayload = {
      phone: requestPayload.phone,
      password: requestPayload.password,
    };

    // Call the API to log in the user
    app.client.request(
      undefined,
      'api/tokens',
      'POST',
      undefined,
      newPayload,
      (newStatusCode, newResponsePayload) => {
        // Display an error on the form if needed
        if (newStatusCode !== 200) {
          // Set the formError field with the error text
          document.querySelector('#' + formId + ' .formError').innerHTML =
            'Sorry, an error occured. Please try again.';
          // Show (unhide) the form error field on the form
          document.querySelector('#' + formId + ' .formError').style.display =
            'block';
        } else {
          // If successful, set the token and redirect the user
          app.setSessionToken(newResponsePayload);
          window.location = '/checks/all';
        }
      }
    );
  }
  // If login was successful, set the token in localstorage and redirect the user
  if (formId == 'sessionCreate') {
    app.setSessionToken(responsePayload);
    window.location = '/checks/all';
  }

  // If form saved successfully and they have success messages, show them
  const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
  if (formsWithSuccessMessages.indexOf(formId) > -1) {
    document.querySelector('#' + formId + ' .formSuccess').style.display =
      'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if (formId == 'accountEdit3') {
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // If the user just created a new check successfully, redirect back to the dashboard
  if (formId == 'checksCreate') {
    window.location = '/checks/all';
  }
};

// Get the session token from localStorage and set it in the app.config object
app.getSessionToken = () => {
  const tokenString = localStorage.getItem('token');
  if (typeof tokenString == 'string') {
    try {
      const token = JSON.parse(tokenString); // this creates an object from the string
      app.config.sessionToken = token;
      if (typeof token == 'object') {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (error) {
      console.log(error.message);
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = (add) => {
  const body = document.querySelector('body');
  if (add) {
    body.classList.add('loggedIn');
    console.log('loggedIn');
  } else {
    body.classList.remove('loggedIn');
    console.log('loggedOut');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = (token) => {
  app.config.sessionToken = token;
  const tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);
  if (typeof token == 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = (callback) => {
  const currentToken =
    typeof app.config.sessionToken == 'object'
      ? app.config.sessionToken
      : false;
  console.log(currentToken);
  if (currentToken) {
    // Update the token with a new expiration
    const payload = {
      id: currentToken.id,
      extend: true,
    };
    app.client.request(
      undefined,
      'api/tokens',
      'PUT',
      undefined,
      payload,
      (statusCode, responsePayload) => {
        // Display an error on the form if needed
        if (statusCode == 200) {
          // Get the new token details
          const queryStringObject = { id: currentToken.id };
          app.client.request(
            undefined,
            'api/tokens',
            'GET',
            queryStringObject,
            undefined,
            (statusCode, responsePayload) => {
              // Display an error on the form if needed
              if (statusCode == 200) {
                app.setSessionToken(responsePayload);
                callback(false);
              } else {
                app.setSessionToken(false);
                callback(true);
              }
            }
          );
        } else {
          app.setSessionToken(false);
          callback(true);
        }
      }
    );
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Load data on the page
app.loadDataOnPage = () => {
  // Get the current page from the body class
  const bodyClass = document.querySelector('body').classList;
  const primaryClass = typeof bodyClass == 'object' ? bodyClass[0] : false;

  // Logic for account settings page
  if (primaryClass == 'accountEdit') {
    app.loadAccountEditPage();
  }
};

// Load the account edit page specifically
app.loadAccountEditPage = () => {
  // Get the phone number from the current token, or log the user out if none is there
  const phone =
    typeof app.config.sessionToken.phone == 'string'
      ? app.config.sessionToken.phone
      : false;

  if (phone) {
    // Fetch the user data
    const queryStringObject = {
      phone: phone,
    };
    app.client.request(
      undefined,
      'api/users',
      'GET',
      queryStringObject,
      undefined,
      (statusCode, responsePayload) => {
        console.log(statusCode);
        if (statusCode == 200) {
          // Put the data into the forms as values where needed
          document.querySelector('#accountEdit1 .firstNameInput').value =
            responsePayload.firstName;
          document.querySelector('#accountEdit1 .lastNameInput').value =
            responsePayload.lastName;
          document.querySelector('#accountEdit1 .displayPhoneInput').value =
            responsePayload.phone;
          // Put the hidden phone field into both forms
          let hiddenPhoneInputs = document.querySelectorAll(
            'input.hiddenPhoneNumberInput'
          );

          for (let i = 0; i < hiddenPhoneInputs.length; i++) {
            hiddenPhoneInputs[i].value = responsePayload.phone;
          }
        } else {
          // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
          app.logUserOut();
        }
      }
    );
  } else {
    app.logUserOut();
  }
};

// Loop to renew token often
app.tokenRenewalLoop = () => {
  setInterval(() => {
    app.renewToken((err) => {
      if (!err) {
        console.log('Token renewed successfuly @ ' + Date.now());
      }
    });
  }, 1000 * 60);
};

// Init (bootstrapping)
app.init = () => {
  // Bind all form submission
  app.bindForms();

  // Bind logout button
  app.bindLogoutButton();

  // Get the token from localastorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();
};

// Call this init processor after the window loads
window.onload = () => {
  app.init();
};
