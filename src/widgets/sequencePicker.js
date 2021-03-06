import Environment from '/utils/Environment';
import { once } from '/utils/functions';

// Polyfill for IE11.
import { Promise } from 'es6-promise';

function renderAddSequenceRecipientsButton(button) {
  // Load the "add to sequence" button.
  const getRecipientsFunction = window[button.getAttribute('data-recipients-function')];

  const buttonUrl = `${Environment.composeUrl}/sequence/picker/button?version=${encodeURIComponent(Environment.version)}`;
  const pickerUrl = `${Environment.composeUrl}/sequence/picker?version=${encodeURIComponent(Environment.version)}`;
  const sequenceButton = document.createElement('div');
  sequenceButton.className = 'mixmax-add-to-sequence-wrapper  js-mixmax-add-to-sequence-wrapper';
  sequenceButton.innerHTML = `
    <iframe style="display:none;" class="mixmax-sequence-picker-button-iframe js-mixmax-sequence-picker-button-iframe"
      src="${buttonUrl}" scrolling="no" frameborder="0" allowTransparency="true"></iframe>
    <div class="mixmax-dropdown-sequences  js-mixmax-dropdown-sequences">
      <iframe class="mixmax-sequence-picker-iframe  js-mixmax-sequence-picker-iframe" src="${pickerUrl}"/>
    </div>
  `;
  button.parentNode.insertBefore(sequenceButton, button);
  button.parentNode.removeChild(button);


  // Handle clicks on the "add to sequence" button.
  const buttonIframe = sequenceButton.querySelector('.js-mixmax-sequence-picker-button-iframe');
  const pickerIframe = sequenceButton.querySelector('.js-mixmax-sequence-picker-iframe');
  const dropdown = sequenceButton.querySelector('.js-mixmax-dropdown-sequences');

  let setPickerIframeReadyToReceive;
  const pickerIframeReadyToReceive = new Promise((resolve) => setPickerIframeReadyToReceive = resolve);

  let latestRecipients;
  function buttonClicked() {
    dropdown.classList.add('mixmax-opened');

    getRecipientsFunction((recipients) => {
      latestRecipients = recipients;

      pickerIframeReadyToReceive.then(() => {
        // Always post the latest recipients through, and then unset them, so we don't post multiple
        // batches of recipients through if the user clicks multiple times before the iframe loads.
        if (latestRecipients) {
          pickerIframe.contentWindow.postMessage({
            method: 'recipientsSelected',
            payload: latestRecipients
          }, '*');
          latestRecipients = null;
        }
      });
    });
  }

  window.addEventListener('message', (e) => {
    switch (e.source) {
      case buttonIframe.contentWindow:
        switch (e.data.method) {
          case 'click':
            buttonClicked();
            break;
          case 'resize':
            buttonIframe.style.height = e.data.payload.height;
            buttonIframe.style.width = e.data.payload.width;
            // Show the iframe now that it's sized, so the user doesn't see any popping.
            buttonIframe.style.display = 'inline';
            break;
        }
        break;

      case pickerIframe.contentWindow:
        switch (e.data.method) {
          case 'readyToReceiveRecipients':
            setPickerIframeReadyToReceive();
            break;
          case 'sequenceSelected':
            dropdown.classList.remove('mixmax-opened');
            break;
        }
        break;
    }
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

