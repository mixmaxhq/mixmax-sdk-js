import EventEmitter from 'eventemitter3';

/**
 * This class represents the window embedding this window, called the SDK "host", and permits the
 * SDK to communicate with the host.
 */
class Host extends EventEmitter {
  constructor() {
    super();

    this._hostOrigin = null;
    this._messageQueue = [];

    window.addEventListener('message', this._onMessage.bind(this));
  }

  /**
   * Sends a message to the host.
   *
   * @param {String} method - The name of the message.
   * @param {Any} payload - The data to send to the host. This is anything that can be serialized
   *   over `window.postMessage`, including primitive types, but it's strongly recommended that
   *   you wrap primitive data in an `Object` so that you can later pass additional data without
   *   having to change existing message listeners.
   */
  send(method, payload) {
    this._messageQueue.push({ method, payload });
    this._maybeFlushMessages();
  }

  _onMessage(e) {
    // Security.
    if (!/^https:\/\/(.+\.)?mixmax.com$/.test(e.origin)) return;

    // Safety belts.
    if (!e.data) return;

    switch (e.data.method) {
      // Handle internal methods first.
      case 'setOrigin':
        // Let the Mixmax host tell us its origin vs. hardcoding app.mixmax.com (that might change
        // in the future).
        this._setHostOrigin(e.data.payload.origin);
        break;

      // Proxy all other methods to the application.
      default:
        this.emit(e.data.method, e.data.payload);
        break;
    }
  }

  _maybeFlushMessages() {
    // Wait until the Mixmax host has told us its origin before messaging, so that we can lock
    // the target origin, for security reasons.
    if (!this._hostOrigin) return;

    this._messageQueue.forEach((message) => {
      window.parent.postMessage(message, this._hostOrigin);
    });
    this._messageQueue = [];
  }

  _setHostOrigin(origin) {
    if (this._hostOrigin) throw new Error('Host origin is already set');

    this._hostOrigin = origin;
    this._maybeFlushMessages();
  }
}

export default new Host();
