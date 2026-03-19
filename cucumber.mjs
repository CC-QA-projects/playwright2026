export default {
  default: {
    paths: ['tests/features/**/*.feature'],
    import: ['tests/step-definitions/**/*.js'],
    format: ['progress'],
    publishQuiet: true,
  },
};

