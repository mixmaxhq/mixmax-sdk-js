/**
 * This class is used to model the lifecycle of an event emitted by an `EventEmitter`. Specifically,
 * it tracks whether the event's default action should be taken and gives event listeners a way to
 * prevent the default action from being taken.
 *
 * It's intended to be passed as the first argument to listeners for a given event, if the SDK
 * needs to track the lifecycle of that event. Other arguments should be passed separately. Then,
 * after the event has been emitted, the SDK can decide whether to take the default action:
 *
 *   const event = new Event();
 *   emitter.emit('foo', event, otherArg);
 *   if (!event.isDefaultPrevented) takeDefaultAction();
 */
export default class Event {
  constructor() {
    this._isDefaultPrevented = false;
  }

  /**
   * Call this method to inform the SDK that it should not take the default action after all
   * listeners have been called.
   */
  preventDefault() {
    this._isDefaultPrevented = true;
  }

  /**
   * @return {Boolean} `true` if the default has been prevented, `false` otherwise.
   */
  get isDefaultPrevented() {
    return this._isDefaultPrevented;
  }
}
