class Environment {
  get() {
    if (window.location.hostname === 'localhost') return Environment.LOCAL;
    else return Environment.PRODUCTION;
  }

  is(env) {
    if (!env) throw new Error('No environment passed to `Environment.is()`');
    return this.get() === env;
  }

  get assetsUrl() {
    if (this.is(Environment.PRODUCTION)) {
      // The version is substituted in at build time.
      return 'https://d1xa36cy0xt122.cloudfront.net/v{{VERSION}}';
    } else {
      return 'http://localhost:9000/dist';
    }
  }
}

// When running from a client's website or Cloudfront.
Environment.PRODUCTION = 'production';

// When running off localhost.
Environment.LOCAL = 'local';

export default new Environment();