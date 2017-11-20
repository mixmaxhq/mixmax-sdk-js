import Environment from '/utils/Environment';
import { once } from '/utils/functions';

// Polyfills for IE11.
import '/utils/polyfills';
import { Promise } from 'es6-promise';

import loadSequencePickers from '/widgets/sequencePicker';

// Utils
const loadCSS = once(() => {
  return new Promise((resolve) => {
    var css = document.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.setAttribute('type', 'text/css');
    css.setAttribute('href', `${Environment.assetsUrl}/widgets.css`);
    css.onload = resolve;
    document.head.appendChild(css);
  });
});

const documentReady = once(() => {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('DOMContentLoaded', resolve);
  });
});

/**
 * Load all widgets.
 *
 * May be called multiple times.
 *
 * Note: even though this is the only export from this file at the present,
 * we must export it as a named, not default, export to support UMD bundling--
 * Rollup will export it as `Mixmax.widgets.default` otherwise.
 *
 * @return {Promise} A promise that resolves when all widgets have been loaded.
 */
export function load() {
  return Promise.all([
    loadCSS(),
    documentReady()
  ]).then(() => {
    loadSequencePickers();
  });
}

// Automatically load the widgets if this file has been loaded directly using a script tag.
// Otherwise, we assume that the developer has loaded this along with other stuff and/or using a
// bundler and leave it to them to load the widgets. Note that we don't complete the file extension
// to support matching on both the minified and unminified scripts.
const loadedDirectly = !!document.querySelector(`script[src^="${Environment.assetsUrl}/widgets.umd."]`);
if (loadedDirectly) {
  load().catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[Mixmax] Could not initialize widgets:', e);
  });
}
