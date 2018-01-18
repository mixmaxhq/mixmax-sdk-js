class Environment {
  get() {
    if (window.location.hostname === 'localhost' || /\-local\.mixmax\.com\./.test(window.location.hostname)) {
      return Environment.LOCAL;
    } else {
      return Environment.PRODUCTION;
    }
  }

  is(env) {
    if (!env) throw new Error('No environment passed to `Environment.is()`');
    return this.get() === env;
  }

  get version() {
    // The version is substituted in at build time.
    return '{{VERSION}}';
  }

  get assetsUrl() {
    if (this.is(Environment.PRODUCTION)) {
      return `https://sdk.mixmax.com/v${this.version}`;
    } else {
      return 'http://localhost:9000/dist';
    }
  }

  get analyticsUrl() {
    if (this.is(Environment.PRODUCTION)) {
      return 'https://analytics.mixmaxusercontent.com';
    } else {
      return 'https://files-local.mixmax.com';
    }
  }

  get composeUrl() {
    if (this.is(Environment.PRODUCTION)) {
      return 'https://compose.mixmax.com';
    } else {
      return 'https://compose-local.mixmax.com';
    }
  }
}

// When running from a client's website or Cloudfront.
Environment.PRODUCTION = 'production';

// When running off localhost.
Environment.LOCAL = 'local';

export default new Environment();
