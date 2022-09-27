import {WebApp} from '../WebApp';
import {BACK_BUTTON_PRESSED_EVENT, WebView} from '../WebView';

/**
 * This object controls the back button, which can be displayed in the header
 * of the Web App in the Telegram interface.
 * @see https://core.telegram.org/bots/webapps#backbutton
 */
export class BackButton {
  constructor(
    private webView: WebView,
    private webApp: WebApp,
    private _isVisible = false,
  ) {
  }

  /**
   *
   * @since WebApp version 6.1+
   * @see requireVersion
   * @private
   */
  private setVisible(visible: boolean) {
    this.webApp.requireVersion('6.1');

    this._isVisible = visible;
    this.webView.postEvent('web_app_setup_back_button', {
      is_visible: visible,
    });
  }

  /**
   * A method to hide the button.
   * @see setVisible
   */
  hide() {
    this.setVisible(false);
  }

  /**
   * Shows whether the button is visible.
   */
  get isVisible() {
    return this._isVisible;
  }

  /**
   * Adds new listener to button click event.
   * @param listener
   */
  onClick(listener: () => void) {
    this.webView.on(BACK_BUTTON_PRESSED_EVENT, listener);
  }

  /**
   * Removes listener from button click event.
   * @param listener
   */
  offClick(listener: () => void) {
    this.webView.off(BACK_BUTTON_PRESSED_EVENT, listener);
  }

  /**
   * A method to make the button active and visible.
   * @see setVisible
   */
  show() {
    this.setVisible(true);
  }
}