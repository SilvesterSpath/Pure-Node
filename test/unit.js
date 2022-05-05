/*
 * Unit Tests
 */

// Dependencies
const helpers = require('../lib/helpers');
const assert = require('assert');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('./../lib/exampleDebugging');

// Holder for tests
const unit = {};

// Assert that the getNumber function is returning a number
unit['helpers.getNumber should return a number'] = (done) => {
  const val = helpers.getNumber();

  assert.equal(typeof val, 'number');
  done();
};

// Assert that the getNumber function is returning 1
unit['helpers.getNumber should return 1'] = (done) => {
  const val = helpers.getNumber();

  assert.equal(val, 1);
  done();
};

// Assert that the getNumber function is returning 2
unit['helpers.getNumber should return 2'] = (done) => {
  const val = helpers.getNumber();

  assert.equal(val, 2);
  done();
};

// Logs.list should callback an array and a false error
unit['logs.list should callback false error and array of log names'] = (
  done
) => {
  logs.list(true, (err, data) => {
    // Asserting that error is false
    assert.equal(err, false);

    // Asserting that the data is truty
    assert.ok(data instanceof Array);

    // Asserting that the data array length is greater than 1
    assert.ok(data.length > 1);
    done();
  });
};

// Logs.truncate should not throw if the logId doesn't exists
unit[
  'Logs.truncate should not throw if the logId does not exits. It should callback and error instead'
] = (done) => {
  assert.doesNotThrow(() => {
    logs.truncate('I do not exists', (err) => {
      assert.ok(err);
      done();
    });
  }, TypeError);
};

// exampleDebuggingProblem.init should not throw but it does
unit['exampleDebuggingProblem.init should not throw when called'] = (done) => {
  assert.doesNotThrow(() => {
    exampleDebuggingProblem.init();
    done();
  }, TypeError);
};

// Export the module
module.exports = unit;
