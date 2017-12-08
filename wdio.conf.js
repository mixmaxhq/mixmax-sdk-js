const isTravis = process.env.TRAVIS === 'true';

exports.config = {
  specs: [
    './specs/**/*.js'
  ],
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    version: 43,
    name: 'Chrome Selenium tests',
    build: process.env.TRAVIS_BUILD_NUMBER
  }],
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  deprecationWarnings: true,
  bail: 0,
  screenshotPath: './errorShots/',
  baseUrl: 'http://localhost:9000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: isTravis ? [] : ['sauce'],
  sauceConnect: !isTravis,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  },
};
