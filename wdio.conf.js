/* global browser */

const detonate = require('detonate-object');

exports.config = {
  specs: [
    './specs/**/*.js'
  ],
  maxInstances: 1,
  capabilities: Array.from(detonate({
    name: 'SDK Tests',
    build: process.env.TRAVIS_BUILD_NUMBER,
    $each: [{
      platform: {$each: [
        'OS X 10.9',
        'macOS 10.12',
        'Windows 10',
        'Windows 8.1'
      ]},
      $each: [{
        browserName: 'chrome',
        // Support the last two chrome versions.
        version: {$each: latestVersions(0, 2)}
      }, {
        browserName: 'firefox',
        // Support the last two firefox versions, and explictly support FF 45.
        version: {$each: ['45', ...latestVersions(0, 2)]}
      }]
    }, {
      browserName: 'safari',
      // Support the last two safari versions.
      $each: [{
        version: '10.0',
        platform: 'OS X 10.11'
      }, {
        version: '11.0',
        platform: 'macOS 10.12'
      }]
    }, {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10.0'
    }, {
      platform: 'Windows 10',
      $each: [{
        browserName: 'internet explorer',
        version: '11.103'
      }, {
        browserName: 'MicrosoftEdge',
        version: {$each: ['13.14393', '15.15063']}
      }]
    }]
  })),
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  deprecationWarnings: true,
  bail: 0,
  baseUrl: 'http://localhost:9000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['sauce'],
  // services: ['selenium-standalone'],
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
    // We have Travis setup and teardown the sauce connect tunnel for us.
    sauceConnect: true,
    // Save screenshots when an error occurs.
    screenshotPath: './errorShots/'
    // Add user and key credentials to sauce-creds.json to avoid them being accidentally committed.
  }, require('./sauce-creds.json'));
}

function* range(start, end, skip=1) {
  for (let i = start; i < end; i += skip) {
    yield i;
  }
}

function latestVersions(start, end, skip) {
  return Array.from(range(start, end, skip)).map((value) => value ? `latest-${value}` : 'latest');
}
