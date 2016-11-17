// TODO(jeff): Transpile this.
/* jshint esnext:true */

/**
 * The Mixmax App JS SDK. See documentation at http://sdk.mixmax.com
 *
 * This should be modularized/made a UMD module.
 */
(function(root) {
  var Mixmax = {
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

  function loadCSS() {
    return new Promise((resolve) => {
      var css = document.createElement('link');
      css.setAttribute('rel', 'stylesheet');
      css.setAttribute('type', 'text/css');
      css.setAttribute('href', '../../src/v1/mixmax.css');
      css.onload = resolve;
      document.head.appendChild(css);
    });
  }

  function renderAddSequenceRecipientsButton(button) {
    var getRecipientsFunction = window[button.getAttribute('data-recipients-function')];

    // TODO(jeff): Have the user log in, then auto-redirect to the sequence picker.
    var iframeUrl = 'https://compose.mixmax.com/sequence/picker?user=jeff%40mixmax.com';
    var sequenceButton = document.createElement('div');
    sequenceButton.className = 'mixmax-add-to-sequence-wrapper  js-mixmax-add-to-sequence-wrapper';
    sequenceButton.innerHTML = `
      <div class="btn  mixmax-btn-add-to-sequence  js-mixmax-add-to-sequence" tabindex="0">Add to Mixmax Sequence</div>
      <div class="mixmax-dropdown-sequences  js-mixmax-dropdown-sequences">
        <iframe class="mixmax-sequence-picker-iframe  js-mixmax-sequence-picker-iframe" src="${iframeUrl}"/>
      </div>
    `;

    sequenceButton.addEventListener('click', () => {
      sequenceButton.querySelector('.js-mixmax-dropdown-sequences').classList.toggle('mixmax-opened');

      getRecipientsFunction((recipients) => {
        sequenceButton.querySelector('.js-mixmax-sequence-picker-iframe').contentWindow.postMessage({
          method: 'recipientsSelected',
          payload: recipients
        }, '*');
      });
    });

    button.parentNode.insertBefore(sequenceButton, button);
    button.parentNode.removeChild(button);
  }

  function closeFlyoutsOnClick() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.js-mixmax-add-to-sequence-wrapper')) {
        document.querySelectorAll('.js-mixmax-dropdown-sequences').forEach((dropdown) => {
          dropdown.classList.remove('mixmax-opened');
        });
      }
    });
  }

  Promise.all([
    loadCSS(),
    new Promise((resolve) => window.addEventListener('DOMContentLoaded', resolve))
  ]).then(() => {
    document.querySelectorAll('.mixmax-add-sequence-recipients-button')
      .forEach(renderAddSequenceRecipientsButton);

    closeFlyoutsOnClick();
  });

  root.Mixmax = Mixmax;
})(window);