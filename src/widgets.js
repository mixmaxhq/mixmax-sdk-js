import Environment from '/utils/Environment';

// Polyfills for IE11.
import '/utils/polyfills';
import { Promise } from 'es6-promise';

// Main
Promise.all([
  loadCSS(),
  documentReady()
]).then(() => {
  const buttons = document.querySelectorAll('.mixmax-add-sequence-recipients-button');
  if (buttons.length) {
    buttons.forEach(renderAddSequenceRecipientsButton);
    closeFlyoutsOnClick();
  }
}).catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[Mixmax] Could not initialize sequence picker widget:', e);
});


// Utils
function loadCSS() {
  return new Promise((resolve) => {
    var css = document.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', `${Environment.assetsUrl}/widgets.css`);
    css.onload = resolve;
    document.head.appendChild(css);
  });
}

function documentReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('DOMContentLoaded', resolve);
  });
}

function renderAddSequenceRecipientsButton(button) {
  // Load the "add to sequence" button.
  var getRecipientsFunction = window[button.getAttribute('data-recipients-function')];

  var iframeUrl = `${Environment.composeUrl}/sequence/picker`;
  var sequenceButton = document.createElement('div');
  sequenceButton.className = 'mixmax-add-to-sequence-wrapper  js-mixmax-add-to-sequence-wrapper';
  sequenceButton.innerHTML = `
    <div class="mixmax-btn  mixmax-btn-add-to-sequence" tabindex="0">Add to Mixmax Sequence</div>
    <div class="mixmax-dropdown-sequences  js-mixmax-dropdown-sequences">
      <iframe class="mixmax-sequence-picker-iframe  js-mixmax-sequence-picker-iframe" src="${iframeUrl}"/>
    </div>
  `;
  button.parentNode.insertBefore(sequenceButton, button);
  button.parentNode.removeChild(button);


  // Handle clicks on the "add to sequence" button.
  const iframe = sequenceButton.querySelector('.js-mixmax-sequence-picker-iframe');
  const iframeReadyToReceive = new Promise((resolve) => {
    window.addEventListener('message', function messageListener(e) {
      if (e.source !== iframe.contentWindow) return;

      if (e.data.method === 'readyToReceiveRecipients') {
        window.removeEventListener('message', messageListener);
        resolve();
      }
    });
  });

  let latestRecipients;
  sequenceButton.addEventListener('click', () => {
    sequenceButton.querySelector('.js-mixmax-dropdown-sequences').classList.toggle('mixmax-opened');

    getRecipientsFunction((recipients) => {
      latestRecipients = recipients;

      iframeReadyToReceive.then(() => {
        // Always post the latest recipients through, and then unset them, so we don't post multiple
        // batches of recipients through if the user clicks multiple times before the iframe loads.
        if (latestRecipients) {
          iframe.contentWindow.postMessage({
            method: 'recipientsSelected',
            payload: latestRecipients
          }, '*');
          latestRecipients = null;
        }
      });
    });
  });
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

