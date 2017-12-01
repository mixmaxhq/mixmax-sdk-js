class Environment {
  get() {
    if (window.location.hostname === 'localhost') return Environment.LOCAL;
    else return Environment.PRODUCTION;
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

  get composeUrl() {
    // Not sure how to toggle a local vs. production environment.
    // Will leave it to the developer to temporarily edit the source for now.
    return 'https://compose.mixmax.com';
  }
}

// When running from a client's website or Cloudfront.
Environment.PRODUCTION = 'production';

// When running off localhost.
Environment.LOCAL = 'local';

export default new Environment();
