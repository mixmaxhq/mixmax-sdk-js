/**
 * The Mixmax App JS SDK. See documentation at http://sdk.mixmax.com
 */
window.Mixmax = {
  /**
   * Call this when the user is finished with the app editor window. Pass the app parameters that
   * be used to create an app instance.
   */
  done: function(params) {
    if (!window.opener) return;

    window.opener.postMessage({
      method: 'done',
      payload: params
    }, '*' /* Could be to the app dashboard or to compose */ );

    window.close();
  },

  /**
   * Cancels this editor window. Just closes the window.
   */
  cancel: function() {
    window.close();
  }
};
