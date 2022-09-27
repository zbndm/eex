import {EventEmitter} from '../EventEmitter';
import {
  EventData,
  extractFulfilledInitParams,
  extractMessageEventData,
  hasExternal,
  hasProxy,
} from './utils';
import {ApplicationNotReadyError} from './errors';
import {
  BACK_BUTTON_PRESSED_EVENT, MAIN_BUTTON_PRESSED_EVENT,
  POPUP_CLOSED_EVENT,
  SET_CUSTOM_STYLE_EVENT, THEME_CHANGED_EVENT, VIEWPORT_CHANGED_EVENT,
  WebViewEventsMap,
} from './events';
import {isIframe} from '../utils';
import {isRecord} from '../validation';
import {ThemeParams} from '../ThemeParams';

/**
 * Parent iframe source which is allowed to receive our messages.
 * TODO: Target should be 'https://web.telegram.org'. This value is set for
 *  test purposes.
 */
const TRUSTED_PARENT_IFRAME_TARGET = '*';

/**
 * The main purpose of this class is to provide special layer between parent
 * device and current application. It can send and receive events, return
 * initial application parameters and much more.
 */
export class WebView {
  /**
   * Creates new empty instance of WebView.
   */
  static empty(): WebView {
    return new WebView(new URLSearchParams(), false, false);
  }

  /**
   * Event emitter which allows binding and unbinding events listening.
   * @private
   */
  private ee = new EventEmitter<WebViewEventsMap>();

  constructor(
    /**
     * Current application init params.
     */
    public initParams: URLSearchParams,
    /**
     * States that current environment is iframe.
     */
    public isIframe: boolean,
    /**
     * Is debug currently enabled.
     */
    public debug: boolean,
  ) {
  }

  /**
   * Internal window 'message' event handler which parses incoming event and
   * notifies all bound event listeners.
   * @param event - received event.
   * @private
   */
  private onMessage = (event: MessageEvent): void => {
    // Reject events from non-parent sources.
    if (event.source !== window.parent || typeof event.data !== 'string') {
      // TODO: Add logging when parent is unknown, or event has unexpected
      //  type.
      return;
    }

    // Extracted event data.
    let ed: EventData;
    try {
      ed = extractMessageEventData(event.data);
    } catch (e) {
      // TODO: Add error logging.
      return;
    }

    // Prepare data before sending to handlers.
    this.processEvent(ed.type, ed.data);
  };

  /**
   * Prepares event data before passing it to listeners.
   * @param type - event name.
   * @param data - event data.
   * @throws {TypeError} Data has unexpected format for event.
   * @private
   */
  private processEvent = (type: string, data: unknown) => {
    // At this point, for known events we can prepare data before passing
    // it to event listeners.
    switch (type) {
      case VIEWPORT_CHANGED_EVENT:
        if (
          isRecord(data) &&
          typeof data.height === 'number' &&
          typeof data.is_expanded === 'boolean' &&
          typeof data.is_state_stable === 'boolean'
        ) {
          return this.emit(
            type, data.height, data.is_expanded, data.is_state_stable,
          );
        }
        break;

      case THEME_CHANGED_EVENT:
        if (isRecord(data) && isRecord(data.theme_params)) {
          return this.emit(type, ThemeParams.fromJSON(data.theme_params));
        }
        break;

      case POPUP_CLOSED_EVENT:
        if (data === undefined) {
          return this.emit(type, data);
        }
        if (isRecord(data) && typeof data.button_id === 'string') {
          return this.emit(type, data.button_id);
        }
        break;

      case SET_CUSTOM_STYLE_EVENT:
        if (typeof data === 'string') {
          return this.emit(type, data);
        }
        break;

      case MAIN_BUTTON_PRESSED_EVENT:
      case BACK_BUTTON_PRESSED_EVENT:
        return this.emit(type);

      // All other event listeners will receive unknown type of data.
      default:
        return this.emitUnsafe(type, data);
    }

    throw new TypeError(
      `Unable to emit event "${type}". Data has unexpected format`,
    );
  };

  /**
   * Emits event.
   * @see EventEmitter.emit
   */
  emit = this.ee.emit.bind(this.ee);

  /**
   * Emits event in unsafe mode.
   * @see EventEmitter.emitUnsafe
   */
  emitUnsafe = this.ee.emitUnsafe.bind(this.ee);

  /**
   * Initializes this instance of WebView extracting required parameters
   * from `window` object and assigning them to current instance. This function
   * should be called only once as long as it affects session storage.
   */
  init() {
    // Extract init params from current window location.
    this.initParams = extractFulfilledInitParams(window.location.toString());

    // Set runtime flags.
    this.isIframe = isIframe();
    // this.debug = this.initParams.get('tgWebAppDebug') === 'true';
    this.debug = true; // FIXME

    if (this.debug) {
      this.subscribe((event, ...args) => {
        // TODO: Create function for this.
        console.log(`[Telegram SDK]: Event "${event}" received. Data:`, ...args);
      });
    }

    // In case, we are currently in iframe, it is required to listen to
    // messages, coming from parent source to apply requested changes.
    if (this.isIframe) {
      // Create special style element which is responsible for application
      // style controlled by app source. Add style element ID to find it
      // in DOM a bit faster.
      const styleElement = document.createElement('style');
      styleElement.id = '__tg-iframe-style__';
      document.head.appendChild(styleElement);

      // Listen to events from parent environment.
      window.addEventListener('message', this.onMessage);

      // Add all required listeners. Here we place all listeners that are
      // common between all Telegram technologies (Telegram Games as Web Apps
      // currently).
      this.on(SET_CUSTOM_STYLE_EVENT, html => styleElement.innerHTML = html);

      // Notify parent source, iframe is ready.
      return this.postEvent('iframe_ready');
    }

    // According to source code, there is something strange in handling events
    // from parent source. To make events handling work correctly, we should
    // define some special variables in global scope as long as these
    // "special" platforms (at least tdesktop), are calling events via
    // these global variables.
    // TODO: Can we do something with this?
    const wnd = window as any;

    // For Windows Phone app
    if (!('TelegramGameProxy_receiveEvent' in wnd)) {
      wnd.TelegramGameProxy_receiveEvent = this.processEvent;
    }

    // App backward compatibility
    if (!('TelegramGameProxy' in wnd)) {
      wnd.TelegramGameProxy = {receiveEvent: this.processEvent};
    } else if (!('receiveEvent' in wnd.TelegramGameProxy)) {
      wnd.TelegramGameProxy.receiveEvent = this.processEvent;
    }
  }

  /**
   * Adds new event listener.
   * @see EventEmitter.on
   */
  on = this.ee.on.bind(this.ee);

  /**
   * Removes event listener.
   * @see EventEmitter.off
   */
  off = this.ee.off.bind(this.ee);

  /**
   * Sends event to native application which launched current application.
   * TODO: Add typings for known events.
   * @param event - event name.
   * @param data - data to send. Should be JSON-serializable value.
   * @throws {ApplicationNotReadyError} Function could not determine current
   * environment and possible way to send event.
   */
  postEvent(event: string, data: any = ''): void {
    let postType: string;

    // We are currently in iframe. So, use default algorithm to communicate
    // with parent window.
    if (this.isIframe) {
      // Post message.
      window.parent.postMessage(JSON.stringify({
        eventType: event,
        eventData: data,
      }), TRUSTED_PARENT_IFRAME_TARGET);
      postType = 'postMessage';
    }
    // In case, window has TelegramWebViewProxy, use it.
    else if (hasProxy(window)) {
      window.TelegramWebviewProxy.postEvent(event, JSON.stringify(data));
      postType = 'TelegramWebviewProxy';
    }
    // In case, external notifier exist, use it.
    else if (hasExternal(window)) {
      window.external.notify(JSON.stringify({
        eventType: event,
        eventData: data,
      }));
      postType = 'external.notify';
    } else {
      // Otherwise, application is not ready to post events.
      throw new ApplicationNotReadyError();
    }

    if (this.debug) {
      // TODO: Create function for this.
      console.log(`[Telegram SDK]: postEvent via ${postType}:`, event, data);
    }
  }

  /**
   * Subscribes to any events appearing.
   * @see EventEmitter.subscribe
   */
  subscribe = this.ee.subscribe.bind(this.ee);

  /**
   * Removes listener from list of global event listeners.
   * @see EventEmitter.unsubscribe
   */
  unsubscribe = this.ee.unsubscribe.bind(this.ee);
}
