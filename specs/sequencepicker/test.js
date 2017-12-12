/* eslint no-console: off */
/* global document */
const expect = require('chai').expect;
const hasOwn = Object.prototype.hasOwnProperty;

const authCookies = JSON.parse(Buffer.from(process.env.AUTH_COOKIES, 'base64').toString());

function firstOf(maybeArray, defaultValue=null) {
  return Array.isArray(maybeArray) ? (maybeArray.length ? maybeArray[0] : defaultValue) : maybeArray;
}

function anyOf(maybeArray, defaultValue=false) {
  return Array.isArray(maybeArray) ? (maybeArray.length ? maybeArray.some((v) => v) : defaultValue) : maybeArray;
}

browser.addCommand('waitForReallyVisible', (selector, ms) => {
  const errorMsg = `element ("${selector}") still not really visible after ${ms}ms`;
  browser.waitUntil(function reallyVisible() {
    const res = browser.isVisibleWithinViewport(selector);
    if (hasOwn.call(res, 'column') && hasOwn.call(res, 'line')) {
      // An error occurred, but webdriver didn't report it. Assume it was because we didn't find the
      // element.
      return false;
    }
    return anyOf(res);
  }, ms, errorMsg);
});

browser.addCommand('enterFrame', (selector) => {
  const frame = $(selector).value;
  browser.frame(frame);
});

// Click with polyfill.
browser.addCommand('polyClick', (selector) => {
  if (['chrome', 'firefox'].includes(browser.desiredCapabilities.browserName)) {
    browser.click(selector);
  } else {
    browser.execute(function(selector) {
      document.querySelector(selector).click();
    }, selector);
  }
});

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
  for (const cookie of authCookies) {
    // The cookies must specify a domain without a leading dot, as newer versions of Firefox see
    // this as a different domain than the current domain, and rejects it as a security error. When
    // we give other browsers or older versions of Firefox a cookie without the leading dot, they
    // doesn't appear to apply the cookies correctly to our domains.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1415828
    // See also: https://github.com/w3c/webdriver/issues/1143
    if (browser.desiredCapabilities.browserName === 'firefox') {
      try {
        browser.setCookie(cookie);
      } catch (err) {
        // Assume the error is a security error, and retry without the leading dot.
        if (cookie.domain && cookie.domain.startsWith('.')) {
          const altCookie = Object.assign({}, cookie, {
            domain: cookie.domain.replace(/^\./, '')
          });
          browser.setCookie(altCookie);
        }
      }
    } else {
      browser.setCookie(cookie);
    }
  }
}

describe('sequence picker', function() {
  // Let webdriver handle timeouts.
  this.timeout(0);

  afterEach(function() {
    // Clear state between tests.
    try {
      browser.url('https://app.mixmax.com');
      browser.deleteCookie();
      browser.url('about:blank');
    } catch (err) {
      // Webdriver doesn't handle errors here correctly, so we at least log the error:
      // https://github.com/webdriverio/webdriverio/issues/2494
      console.error('afterEach clear state error', (err && err.stack) || err);
      throw err;
    }
  });

  it('should show a login button', function() {
    browser.url('http://localhost:9000/examples/sequencepicker/index.html');
    browser.waitForReallyVisible('.js-mixmax-sequence-picker-button-iframe', 15000);
    browser.enterFrame('.js-mixmax-sequence-picker-button-iframe');
    browser.waitForReallyVisible('.js-btn-add-to-sequence', 5000);
    browser.polyClick('.js-btn-add-to-sequence');
    browser.frame();
    browser.waitForReallyVisible('.js-mixmax-sequence-picker-iframe', 5000);
    expect(isActuallyVisible('.js-mixmax-sequence-picker-iframe')).to.be.ok;
    browser.enterFrame('.js-mixmax-sequence-picker-iframe');
    browser.waitForReallyVisible('.js-login', 5000);
    // Make sure the login button shows.
    expect(isActuallyVisible('.js-login')).to.be.ok;
    browser.frame();
  });

  it('should show a sequence item', function() {
    setAuthCookies();
    browser.url('http://localhost:9000/examples/sequencepicker/index.html');
    browser.waitForReallyVisible('.js-mixmax-sequence-picker-button-iframe', 15000);
    browser.enterFrame('.js-mixmax-sequence-picker-button-iframe');
    browser.waitForReallyVisible('.js-btn-add-to-sequence', 5000);
    browser.polyClick('.js-btn-add-to-sequence');
    browser.frame();
    browser.waitForReallyVisible('.js-mixmax-sequence-picker-iframe', 5000);
    expect(isActuallyVisible('.js-mixmax-sequence-picker-iframe')).to.be.ok;
    browser.enterFrame('.js-mixmax-sequence-picker-iframe');
    browser.waitForReallyVisible('.js-sequence-item', 5000);
    expect(isActuallyVisible('.js-sequence-item')).to.be.ok;
    // Make sure there isn't a login button.
    expect(isActuallyVisible('.js-login')).to.not.be.ok;
    browser.frame();
  });
});
