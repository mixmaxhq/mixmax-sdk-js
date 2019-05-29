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
    // Edit source to toggle local vs. production assets.
    return `https://sdk.mixmax.com/v${this.version}`;
  }

  get composeUrl() {
    // Edit source to toggle local vs. production compose.
    return 'https://compose.mixmax.com';
  }

  get calendarUrl() {
    // Edit source to toggle local vs. production calendar.
    return 'https://cal.mixmax.com';
  }
}

// When running from a client's website or Cloudfront.
Environment.PRODUCTION = 'production';

// When running off localhost.
Environment.LOCAL = 'local';

export default new Environment();
