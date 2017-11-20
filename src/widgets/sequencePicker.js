import Environment from '/utils/Environment';
import { once } from '/utils/functions';

// Polyfill for IE11.
import { Promise } from 'es6-promise';

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
  const dropdown = sequenceButton.querySelector('.js-mixmax-dropdown-sequences');
  const iframeReadyToReceive = new Promise((resolve) => {
    window.addEventListener('message', (e) => {
      if (e.source !== iframe.contentWindow) return;

      switch (e.data.method) {
        case 'readyToReceiveRecipients':
          resolve();
          break;
        case 'sequenceSelected':
          dropdown.classList.remove('mixmax-opened');
          break;
      }
    });
  });

  let latestRecipients;
  sequenceButton.addEventListener('click', () => {
    dropdown.classList.add('mixmax-opened');

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

const closeFlyoutsOnClick = once(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.js-mixmax-add-to-sequence-wrapper')) {
      document.querySelectorAll('.js-mixmax-dropdown-sequences').forEach((dropdown) => {
        dropdown.classList.remove('mixmax-opened');
      });
    }
  });
});

export default function load() {
  const buttons = document.querySelectorAll('.mixmax-add-sequence-recipients-button');
  if (buttons.length) {
    buttons.forEach(renderAddSequenceRecipientsButton);
    closeFlyoutsOnClick();
  }
}

