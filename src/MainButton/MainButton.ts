import {MAIN_BUTTON_PRESSED_EVENT, WebView} from '../WebView';
import {RGBExtColor} from '../colors';

export interface MainButtonOptions {
  /**
   * Current button color.
   */
  color?: RGBExtColor;
  /**
   * Current button text.
   *
   * @default "CONTINUE"
   */
  text?: string;
  /**
   * Current button text color.
   */
  textColor?: string;
  /**
   * Shows whether the button is visible.
   *
   * @default false
   */
  isVisible?: boolean;
  /**
   * Shows whether the button is active.
   *
   * @default true
   */
  isActive?: boolean;
  /**
   * Shows whether the button is displaying a loading indicator.
   */
  isProgressVisible?: boolean;
}

/**
 * This object controls the main button, which is displayed at the bottom
 * of the Web App in the Telegram interface.
 * @see https://core.telegram.org/bots/webapps#mainbutton
 */
export class MainButton {
  private _color: RGBExtColor;
  private _textColor: RGBExtColor;
  private _isActive: boolean;
  private _isVisible: boolean;
  private _isProgressVisible: boolean;
  private _text: string;

  constructor(
    private webView: WebView,
    options: MainButtonOptions = {},
  ) {
    const {
      isActive = true,
      isProgressVisible = false,
      isVisible = false,
      text = 'CONTINUE',
      color = '#2481cc',
      textColor = '#ffffff',
    } = options;
    this._color = color;
    this._isActive = isActive;
    this._isProgressVisible = isProgressVisible;
    this._isVisible = isVisible;
    this._text = text;
    this._textColor = textColor;
  }

  /**
   * Syncs current button state with native application.
   *
   * @private
   */
  private sync(): void {
    this.webView.postEvent('web_app_setup_main_button', {
      is_visible: this.isVisible,
      is_active: this.isActive,
      is_progress_visible: this.isProgressVisible,
      text: this.text,
      color: this.color,
      text_color: this.textColor,
    });
  }

  /**
   * Updates current button visibility state.
   *
   * @param visible - should button be visible.
   * @private
   */
  private setVisibility(visible: boolean): this {
    if (this.isVisible !== visible) {
      this._isVisible = visible;
      this.sync();
    }
    return this;
  }

  /**
   * Updates current progress visibility.
   *
   * @param visible - should progress be visible.
   * @private
   */
  private setProgressVisibility(visible: boolean): this {
    if (this.isProgressVisible !== visible) {
      this._isProgressVisible = visible;
      this.sync();
    }
    return this;
  }

  /**
   * Updates current button active state.
   *
   * @private
   * @param active - should button be active.
   * @see sync
   */
  private setActive(active: boolean): this {
    if (this.isActive !== active) {
      this._isActive = active;
      this.sync();
    }
    return this;
  }

  /**
   * Current button color.
   */
  get color(): RGBExtColor {
    return this._color;
  }

  /**
   * A method to disable the button.
   *
   * @see setActive
   */
  disable(): this {
    this.setActive(false);

    return this;
  }

  /**
   * A method to enable the button.
   *
   * @see setActive
   */
  enable(): this {
    this.setActive(true);

    return this;
  }

  /**
   * A method to hide the button.
   *
   * @see setVisibility
   */
  hide(): this {
    this.setVisibility(false);

    return this;
  }

  /**
   * A method to hide the loading indicator.
   * 
   * @see setProgressVisibility
   */
  hideProgress(): this {
    this.setProgressVisibility(false);

    return this;
  }

  /**
   * Shows whether the button is active.
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Shows whether the button is displaying a loading indicator.
   */
  get isProgressVisible(): boolean {
    return this._isProgressVisible;
  }

  /**
   * Shows whether the button is visible.
   */
  get isVisible(): boolean {
    return this._isVisible;
  }

  /**
   * Adds onclick listener.
   * @param listener - listener to call.
   */
  onClick(listener: () => void) {
    this.webView.on(MAIN_BUTTON_PRESSED_EVENT, listener);
  }

  /**
   * Remove onclick event listener.
   * @param listener - listener to call.
   */
  offClick(listener: () => void) {
    this.webView.off(MAIN_BUTTON_PRESSED_EVENT, listener);
  }

  /**
   * A method to set the button text.
   *
   * @param text - text to set.
   * @throws {Error} Text has incorrect length.
   * @see sync
   */
  setText(text: string): this {
    const trimmed = text.trim();

    if (trimmed.length === 0 || trimmed.length > 64) {
      throw new Error(`Text has incorrect length: ${trimmed.length}`);
    }
    if (trimmed !== this.text) {
      this._text = trimmed;
      this.sync();
    }
    return this;
  }

  /**
   * Updates current button color.
   *
   * @see sync
   * @param color - target color.
   */
  setColor(color: RGBExtColor): this {
    if (this.color !== color) {
      this._color = color;
      this.sync();
    }
    return this;
  }

  /**
   * Updates current button text color.
   *
   * @see sync
   * @param color - target color.
   */
  setTextColor(color: RGBExtColor): this {
    if (this.textColor !== color) {
      this._textColor = color;
      this.sync();
    }
    return this;
  }

  /**
   * A method to make the button visible.
   * Note that opening the Web App from the attachment menu hides the main
   * button until the user interacts with the Web App interface.
   *
   * @see setVisibility
   */
  show(): this {
    this.setVisibility(true);

    return this;
  }

  /**
   * A method to show a loading indicator on the button.
   * It is recommended to display loading progress if the action tied to the
   * button may take a long time.
   *
   * @see setProgressVisibility
   */
  showProgress(): this {
    this.setProgressVisibility(true);

    return this;
  }

  /**
   * Current button text.
   */
  get text(): string {
    return this._text;
  }

  /**
   * Current button text color.
   */
  get textColor(): RGBExtColor {
    return this._textColor;
  }
}