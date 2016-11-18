// TODO(jeff): Transpile this.
/* jshint esnext:true */

/**
 * The Mixmax App JS SDK. See documentation at http://sdk.mixmax.com
 */
window.Mixmax = {
  connect: function() {
    return new Promise((resolve, reject) => {
      var width = 475;
      var height = 688;
      var left = (screen.width / 2) - (width / 2);
      var top = (screen.height / 2) - (height / 2);

      // TODO(jeff): Pass client ID etc. Or probably just redirect server-side.
      var site = 'Test Site';

      var url = `https://app-local.mixmax.com/oauth?site=${encodeURIComponent(site)}`;
      var win = window.open(url, null /* No title */, `location=yes,toolbar=no,status=no,menubar=no,` +
        `width=${width},height=${height},top=${top},left=${left}`);

      window.addEventListener('message', function onConnected(event) {
        if (event.source !== win) return;
        if (event.data && (event.data.method === 'loginFinished')) {
          window.removeEventListener('message', onConnected);

          // The window also closes itself after sending this message. But making sure to close it
          // and then waiting a turn of the event loop before responding means that it won't flash
          // if this page decides to show an alert in response to an error.
          win.close();

          setTimeout(() => {
            var err = event.data.payload.err;
            var result = event.data.payload.result;
            if (!err) resolve(result);
            else reject(err);
          }, 0);
        }
      });
    });
  },

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
