// Loads .env before any step definition or hook is imported.
import './config/env.js';

export default {
  paths: ['tests/features/**/*.feature'],
  import: ['tests/step-definitions/**/*.js'],
  format: ['progress', 'summary', 'allure-cucumberjs/reporter'],
  formatOptions: {
    resultsDir: 'reports/allure-results',
  },
};

