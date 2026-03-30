export default {
  paths: ['tests/features/**/*.feature'],
  import: ['tests/step-definitions/**/*.js'],
  format: ['progress', 'allure-cucumberjs/reporter'],
  formatOptions: {
    resultsDir: 'reports/allure-results',
  },
};

