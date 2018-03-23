import Environment from '/utils/Environment';


/**
 * Converts any `.mixmax-embedded-calendar` elements to embedded calendars.
 */
export default function load() {
  const slots = document.querySelectorAll('.mixmax-embedded-calendar');
  slots.forEach(renderEmbeddedCalendar);
}

/**
 * Converts the specified element to an embedded calendar.
 *
 * Accepts the following `data` attributes:
 * - {String} data-user-calendar-link - The user's root calendar link.
 * - {String} [data-calendar-link] - A meeting type's link.
 * - {String} [data-width] - A CSS `width` value to be used for the generated iframe.
 * - {String} [data-height] - A CSS `height` value to be used for the generated iframe. The height
 *   must be at least 580px.
 */
function renderEmbeddedCalendar(el) {
  const userCalLink = el.getAttribute('data-user-calendar-link');
  if (!userCalLink) {
    throw new Error('Missing required `data-user-calendar-link` attribute for Mixmax calendar.');
  }

  const calLink = el.getAttribute('data-calendar-link');
  const width = el.getAttribute('data-width') || '100%';
  const height = el.getAttribute('data-height') || '580px';

  /**
   * Ensure that the height is large enough that we can show the entire booking form with margin at
   * the bottom.
   */
  if (height.endsWith('px')) {
    const heightAsNum = parseInt(height.split('px')[0], 10);
    if (heightAsNum < 580) throw new Error('Mixmax calendar height must be at least 580px.');
  }

  const encodedVersion = encodeURIComponent(Environment.version);
  const src = `${Environment.calendarUrl}/${userCalLink}/${calLink}?sdkV=${encodedVersion}`;

  /**
   * Replace the element with a div so that we know what we know what we're being wrapped by and
   * clean up the configuration specified by the widget's host.
   */
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<iframe
      frameBorder="0"
      style="width: ${width}; height: ${height};"
      src="${src}"
    ></iframe>`;
  el.parentNode.insertBefore(wrapper, el);
  el.parentNode.removeChild(el);
}
