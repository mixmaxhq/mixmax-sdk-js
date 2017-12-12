const detonate = require('detonate-object');

const runLocally = false;

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
      // Support two latest versions of chrome and firefox.
      browserName: {$each: ['chrome', 'firefox']},
      version: {$each: latestVersions(0, 2)}
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
        version: '11'
      }, {
        browserName: 'MicrosoftEdge',
        version: {$each: ['13', '15']}
      }]
    }, {
      // Explicitly support FF 45 for external integration testing.
      platform: 'linux',
      browserName: 'firefox',
      version: '45'
    }]
  })),
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  deprecationWarnings: false,
  bail: 0,
  baseUrl: 'http://localhost:9000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: runLocally ? ['selenium-standalone'] : ['sauce'],
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
    sauceConnect: !runLocally,
    // Save screenshots when an error occurs.
    screenshotPath: './errorShots/'
    // Add user and key credentials to sauce-creds.json to avoid them being accidentally committed.
  }, runLocally ? {} : require('./sauce-creds.json'));
}

function* range(start, end, skip=1) {
  for (let i = start; i < end; i += skip) {
    yield i;
  }
}

function latestVersions(start, end, skip) {
  return Array.from(range(start, end, skip)).map((value) => value ? `latest-${value}` : 'latest');
}
