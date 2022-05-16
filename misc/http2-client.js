/*
 * Example HTTP2 client
 */

// Dependencies
const http2 = require('http2');

// Create a client
const client = http2.connect('http://localhost:6000');

// Create a request (and some configuration)
const req = client.request({
  ':path': '/',
});

// When a message is received, add the pieces together until you reach the end
let str = '';
req.on('data', (chunk) => {
  str += chunk;
});

// When the message ends, log it out
req.on('end', () => {
  console.log(str);
});

// End the requres
req.end();
