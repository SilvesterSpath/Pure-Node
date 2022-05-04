/*
 * Test runner
 */

// Dependencies
const helpers = require('../lib/helpers');
const assert = require('assert');

// Application logic for the test runner
_app = {};

// Container for the test
_app.tests = {
  unit: {},
};

// Assert that the getNumber function is returning a number
_app.tests.unit['helpers.getNumber should return a number'] = (done) => {
  const val = helpers.getNumber();

  assert.equal(typeof val, 'number');
  done();
};

// Assert that the getNumber function is returning 1
_app.tests.unit['helpers.getNumber should return 1'] = (done) => {
  const val = helpers.getNumber();

  assert.equal(val, 1);
  done();
};

// Assert that the getNumber function is returning 2
_app.tests.unit['helpers.getNumber should return 2'] = (done) => {
  const val = helpers.getNumber();

  assert.equal(val, 2);
  done();
};

// Count the tests
_app.countTests = () => {
  let counter = 0;
  for (const i in _app.tests) {
    for (const j in i) {
      counter++;
    }
  }
  console.log(counter);
  return counter - 1;
};

// Run all the tests, collecting the errors and successes
_app.runTests = () => {
  const errors = [];
  let successes = 0;
  const limit = _app.countTests();
  let counter = 0;

  for (const i in _app.tests) {
    const subTests = _app.tests[i];
    for (const j in subTests) {
      (() => {
        const tempTestName = j;
        const testValue = subTests[j];
        // Call the test
        try {
          testValue(() => {
            // If it calls back without thowing, then it succeded, so log it in green
            console.log('\x1b[32m%s\x1b[0m', tempTestName);
            counter++;
            successes++;
            if (counter == limit) {
              _app.produceTestReport(limit, successes, errors);
            }
          });
        } catch (error) {
          // If it throws than it failed, so log it in red
          errors.push({
            name: j,
            error: error,
          });
          console.log('\x1b[31m%s\x1b[0m', tempTestName);
          counter++;
          if (counter == limit) {
            _app.produceTestReport(limit, successes, errors);
          }
        }
      })();
    }
  }
};

// Produce a test outcome report
_app.produceTestReport = (limit, successes, errors) => {
  console.log('');
  console.log('---------BEGIN TEST REPORT---------');
  console.log('');
  console.log('Total tests: ', limit);
  console.log('Pass: ', successes);
  console.log('Fail: ', errors.length);
  console.log('');

  // If there are errors, print them in detail
  if (errors.length > 0) {
    errors.forEach((item, idx) => {
      console.log('\x1b[31m%s\x1b[0m', `${idx + 1}. Error description:`);
      console.log('Name: ', item.name);
      console.log('Error: ', item.error);
    });
  }

  console.log('');
  console.log('--------END TEST REPORT--------');
};

// Run the test
_app.runTests();
