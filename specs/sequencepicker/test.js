const expect = require('chai').expect;

const authCookies = JSON.parse(Buffer.from(process.env.AUTH_COOKIES, 'base64').toString());

function firstOf(maybeArray, defaultValue=null) {
  return Array.isArray(maybeArray) ? (maybeArray.length ? maybeArray[0] : defaultValue) : maybeArray;
}

function isActuallyVisible(selector) {
  if (!browser.isExisting(selector)) return false;
  if (!firstOf(browser.isVisibleWithinViewport(selector), false)) return false;
  // chromedriver sometimes crashes when we do this. Not sure why.
  if (browser.desiredCapabilities.browserName !== 'chrome') {
    const {width, height} = firstOf(browser.getElementSize(selector), {});
    return width > 0 && height > 0;
  }
  return true;
}

function setAuthCookies() {
  // Firefox won't let us set cookies before we're on the page, or on the wrong origin, so we have
  // to do it on app.mixmax.com. Chrome sometimes lets us set cookies anywhere, which makes more
  // sense because we specify the domain along with the cookie data. It's inconsistent, though, so
  // we always go to app.mixmax.com for reliability.
  browser.url('https://app.mixmax.com');
  for (let cookie of authCookies) {
    // The cookies must specify a domain without a leading dot, as Firefox sees this as a different
    // domain than the current domain, and rejects it as a security error. When we give Chrome a
    // cookie without the leading dot, it doesn't appear to apply the cookies correctly to our
    // domains.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1415828
    // See also: https://github.com/w3c/webdriver/issues/1143
    if (browser.desiredCapabilities.browserName === 'firefox') {
      cookie.domain = cookie.domain.replace(/^\./, '');
    }
    browser.setCookie(cookie);
  }
}

describe('sequence picker', function() {
  // Let webdriver handle timeouts.
  this.timeout(0);

  /*beforeEach(function() {
    // Clear all cookies before each test.
    browser.deleteCookie();
  });

  afterEach(function() {
    // Navigate to a blank page to clear any page state.
    browser.url('about:blank');
  });*/

  it('should show a login button', function() {
    browser.url('http://localhost:9000/examples/sequencepicker/index.html');
    browser.waitForVisible('.js-mixmax-sequence-picker-button-iframe', 15000);
    expect(isActuallyVisible('.js-mixmax-sequence-picker-button-iframe')).to.be.ok;
    const buttonFrame = browser.element('.js-mixmax-sequence-picker-button-iframe').value;
    browser.frame(buttonFrame);
    browser.click('.js-btn-add-to-sequence');
    browser.frame();
    browser.waitForVisible('.js-mixmax-sequence-picker-iframe', 5000);
    expect(isActuallyVisible('.js-mixmax-sequence-picker-iframe')).to.be.ok;
    const pickerFrame = browser.element('.js-mixmax-sequence-picker-iframe').value;
    browser.frame(pickerFrame);
    browser.waitForVisible('.js-login', 5000);
    // Make sure the login button shows.
    expect(isActuallyVisible('.js-login')).to.be.ok;
  });

  it('should show a sequence item', function() {
    setAuthCookies();
    browser.url('http://localhost:9000/examples/sequencepicker/index.html');
    browser.waitForVisible('.js-mixmax-sequence-picker-button-iframe', 15000);
    const buttonFrame = browser.element('.js-mixmax-sequence-picker-button-iframe').value;
    browser.frame(buttonFrame);
    browser.click('.js-btn-add-to-sequence');
    browser.frame();
    browser.waitForVisible('.js-mixmax-sequence-picker-iframe', 5000);
    expect(isActuallyVisible('.js-mixmax-sequence-picker-iframe')).to.be.ok;
    const pickerFrame = browser.element('.js-mixmax-sequence-picker-iframe').value;
    browser.frame(pickerFrame);
    browser.waitForVisible('.js-sequence-item', 5000);
    expect(isActuallyVisible('.js-sequence-item')).to.be.ok;
    // Make sure there isn't a login button.
    expect(isActuallyVisible('.js-login')).to.not.be.ok;
  });
});
