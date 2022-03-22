import EventEmitter from 'eventemitter3';

/**
 * This class represents the window embedding this window, called the SDK "host", and permits the
 * SDK to communicate with the host.
 */
class Host extends EventEmitter {
  constructor() {
    super();

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
    window.parent.postMessage({ method, payload }, '*');
  }

  _onMessage(e) {
    // Security.
    if (!/^https:\/\/(.+\.)?mixmax.com$/.test(e.origin)) return;

    // Safety belts.
    if (!e.data) return;

    this.emit(e.data.method, e.data.payload);
  }
}

export default new Host();
