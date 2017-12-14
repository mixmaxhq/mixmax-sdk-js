/**
 * The Mixmax Analytics JS SDK. See documentation at http://developer.mixmax.com
 */

let userId;

export function init(initUserId) {
  userId = initUserId;
}

/**
 * Triggers an action
 */
export function track(action) {
  if (!userId) {
    // eslint-disable-next-line no-console
    console.warn('Called Mixmax.analytics.track() without having first called Mixmax.analytics.init(). Ignoring event.');
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', `https://links-local.mixmax.com/analytics/${userId}/event`, true /* async */);

  // We need to use regular form encoding to prevent the CORS preflight which would
  // just add 2x the HTTP requests.
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  // Include the cookies (this is how we identify the user).
  xhr.withCredentials = true;

  xhr.send(`event=${encodeURIComponent(action)}`);
}
