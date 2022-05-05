/*
 * Test runner
 */

// Application logic for the test runner
_app = {};

// Container for the test
_app.tests = {};

// Add on the unit tests
_app.tests.unit = require('./unit');

// Count the tests
_app.countTests = () => {
  let counter = 0;
  for (const i in _app.tests) {
    for (const j in _app.tests[i]) {
      counter++;
    }
  }

  return counter;
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
        // Call the test (between the () are the done function)
        try {
          testValue(() => {
            // If it calls back without throwing, then it succeded, so log it in green
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
  console.log('---------END TEST REPORT--------');
};

// Run the test
_app.runTests();
