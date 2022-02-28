/*
 * These are server related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};

server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    server.unifiedServer(req, res);
  }
);

// All the server logic for both the http and https server
server.unifiedServer = (req, res) => {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true); // The 'true' means we using the query module as well and making an object from the querystring

  // Get the path from the url
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // this only trimms the slash-es from the beginning and from the end

  // Get the query string as an object
  const queryString = parsedUrl.query;
  console.log(typeof queryString);

  // Get the HTTP method
  const method = req.method.toUpperCase();
  console.log(method);

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload if there is any
  const decoder = new stringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    // request object emits the undecoded data on the 'data' event and append it to the buffer after the decoder decoded it
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to
    // If one is not found use the notFound handler
    const choosendHandler =
      typeof server.router[trimmedPath] !== 'undefined'
        ? server.router[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryString: queryString,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Route the request to the handler specified in the router
    choosendHandler(data, (statusCode, payload, contentType) => {
      // Determine the type of response (fallback to JSON)
      contentType = typeof contentType == 'string' ? contentType : 'json';

      // Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == 'number' ? statusCode : 200;

      // Convert payload to a string
      const payloadString = JSON.stringify(payload); // this is not the payload we received, but the one that the handler sending back to the user

      // Return the response-parts that are content-specific
      const payloadString = '';
      if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        // Use the payload called back by the handler, or default to an empty object
        payload = typeof payload == 'object' ? payload : {};
        // Convert payload to a string
        payloadString = JSON.stringify(payload); // this is not the payload we received, but the handler sending back to the user
      }
      if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof payload == 'string' ? payload : ''; // We only could be able ot write string to the body of the html
      }

      // Return the response-parts that are common to all content-types
      res.writeHead(statusCode); // this function comes with the 'response' object
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red the request path
      if (statusCode == 200) {
        debug(
          '\x1b[32m%s\x1b[0m',
          `${method.toUpperCase()} / ${trimmedPath} ${statusCode}`
        );
      } else {
        debug(
          '\x1b[31m%s\x1b[0m',
          `${method.toUpperCase()} / ${trimmedPath} ${statusCode}`
        );
      }
    });
  });
};

// Define a request router
server.router = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate, // Login
  'session/deleted': handlers.sessionDeleted, // Logout
  'checks/all': handlers.checkList,
  'checks/create': handlers.checksCreate,
  'checks/edit': handlers.checksEdit,
  sample: handlers.sample,
  data: handlers.data,
  ping: handlers.ping,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
};

// Init script
server.init = () => {
  // Start the server, and have it listen on config.PORT
  server.httpServer.listen(config.httpPORT, () => {
    console.log(
      '\x1b[36m%s\x1b[0m',
      `The server is listening on port ${config.httpPORT} in ${config.envName} mode..`
    );
  });
  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPORT, () => {
    console.log(
      '\x1b[35m%s\x1b[0m',
      `The server is listening on port ${config.httpsPORT} in ${config.envName} mode..`
    );
  });
};

// Export the module
module.exports = server;
