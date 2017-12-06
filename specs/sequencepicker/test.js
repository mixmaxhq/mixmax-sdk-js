const assert = require('assert');

describe('homepage', function() {
  it('should have a title', function() {
    browser.url('https://mixmax.com');
    const title = browser.getTitle();
    assert.equal(title, 'Email tracking, scheduling, templates, send later, and surveys for Gmail | Mixmax');
  });
});
