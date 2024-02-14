/* global Office */
/**
 * The Mixmax App JS SDK. See documentation at http://sdk.mixmax.com
 */

/**
 * Call this when the user is finished with the app editor window. Pass the parameters
 * that are to be used to create an app instance.
 */
export function done(params) {
  if (window['Office'] && Office.context && Office.context.ui && Office.context.ui.messageParent) {
    // We're in outlook; send the message there
    Office.context.ui.messageParent(JSON.stringify(params));
  } else if (window.opener) {
    window.opener.postMessage({
      method: 'done',
      payload: params
    }, '*' /* Could be to the app dashboard or to a composer */ );
  }

  window.close();
}

/**
 * Cancels this editor window. Just closes the window.
 */
export function cancel() {
  window.close();
}
