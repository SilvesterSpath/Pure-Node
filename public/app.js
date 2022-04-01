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
  const requestUrl = path + '?';
  const count = 0;
  for (const item in queryStringObject) {
    // this for loop only for the sake of counting the items in the queryStringObject
    if (queryStringObject.hasOwnProperty(item)) {
      count++;
      // If at least one query string parameter has already been added, prepend new ones with an ampersand
      if (counter > 1) {
        requestUrl += '&';
      }
      requestUrl += itme + queryStringObject[item];
    }
  }

  // Form the http request as a JSON type
  const xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

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
