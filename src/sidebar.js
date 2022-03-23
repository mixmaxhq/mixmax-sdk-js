/**
 * The Mixmax Sidebar SDK. See documentation at https://developer.mixmax.com/docs/sidebars.
 */

import EventEmitter from 'eventemitter3';

import Event from '/utils/Event';
import Host from '/utils/Host';

class Sidebar extends EventEmitter {
  constructor() {
    super();

    Host.on('heartbeat', () => {
      Host.send('heartbeat');
    });

    Host.on('contactSelected', (contact) =>
      this.emit('contactSelected', contact)
    );

    Host.on('clear', () => this.emit('clear'));
  }
}

export default new Sidebar();
