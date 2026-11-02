const fs = require('fs');
const results = JSON.parse(fs.readFileSync('tests/reports/test-results.json', 'utf8'));

function findA11yErrors(suite) {
  if (suite.specs) {
    suite.specs.forEach(spec => {
      if (spec.title.includes('A11Y')) {
        spec.tests.forEach(test => {
          test.results.forEach(res => {
            if (res.error) {
              console.log('===', spec.title, '===');
              console.log(res.error.message);
            }
          });
        });
      }
    });
  }
  if (suite.suites) suite.suites.forEach(findA11yErrors);
}

findA11yErrors(results);
