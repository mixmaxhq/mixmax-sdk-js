/**
 * The Mixmax App SDK. See documentation at http://sdk.mixmax.com
 */
window.Mixmax = {
  /**
   * When finished with this app window. Sends app parameters to the opener window.
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
