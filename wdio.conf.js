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
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  }
};

const isTravis = process.env.TRAVIS === 'true';

if (isTravis) {
  Object.assign(exports.config, {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    port: 4445
  });

  exports.config.capabilities.forEach((cap) => Object.assign(cap, {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    build: process.env.TRAVIS_BUILD_NUMBER
  }));
} else {
  Object.assign(exports.config, {
    services: ['sauce'],
    sauceConnect: true
  });
}
