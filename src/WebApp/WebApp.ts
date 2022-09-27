import {extractWebAppMeta} from './parsing';
import {ColorScheme, SettableColorKey, Version} from './types';
import {InitData} from '../InitData';
import {compareVersions} from '../utils';
import {
  POPUP_CLOSED_EVENT, THEME_CHANGED_EVENT, VIEWPORT_CHANGED_EVENT,
  WebView,
} from '../WebView';
import {formatURL} from '../url';
import {ThemeParams} from '../ThemeParams';
import {AnyRGBColor, isColorDark, RGBColor, toRGBExt} from '../colors';
import {toThemeParamsKey} from './utils';
import {PopupParams} from '../PopupParams';
import {BackButton} from '../BackButton';
import {HapticFeedback} from '../HapticFeedback';
import {MainButton} from '../MainButton';

/**
 * Represents main WebApp's class.
 * @see https://core.telegram.org/bots/webapps#initializing-web-apps
 */
export class WebApp {
  /**
   * Creates new empty instance of WebApp.
   */
  static empty(webView: WebView): WebApp {
    return new WebApp(webView);
  }

  private _isClosingConfirmationEnabled = false;
  private _isExpanded = false;
  private _isPopupOpened = false;
  private _headerColor: SettableColorKey = 'bg_color';
  private _backgroundColor: SettableColorKey | RGBColor = 'bg_color';
  private _viewportHeight: number;
  private _viewportStableHeight: number;

  /**
   * An object for controlling the main button, which is displayed at the
   * bottom of the Web App in the Telegram interface.
   */
  mainButton: MainButton;

  /**
   * Current Web App platform.
   */
  platform: string;

  /**
   * An object containing the current theme settings used in the Telegram app.
   */
  theme: ThemeParams;

  /**
   * Current Web App version.
   */
  version: string;

  /**
   * Web application init data.
   */
  initData: InitData;

  constructor(private webView: WebView) {
    const theme = ThemeParams.empty();

    this.backButton = new BackButton(webView, this);
    this.initData = InitData.empty();
    this.haptic = new HapticFeedback(webView, this);
    this.mainButton = new MainButton(this.webView, {
      textColor: theme.buttonTextColor,
      color: theme.buttonColor,
    });
    this.platform = 'unknown';
    this.theme = ThemeParams.empty();
    this.version = '6.0';
    this._viewportStableHeight = 0;
    this._viewportHeight = 0;
  }

  /**
   * Updates current status of closing confirmation request.
   * @since WebApp version 6.2+
   * @see requireVersion
   */
  private setClosingConfirmationEnabled(enabled: boolean) {
    this.requireVersion('6.2');
    this._isClosingConfirmationEnabled = enabled;
    this.webView.postEvent('web_app_setup_closing_behavior', {
      need_confirmation: enabled,
    });
  }

  /**
   * Returns current native application background color.
   */
  get backgroundColor(): string | undefined {
    return this._backgroundColor === 'bg_color' ||
    this._backgroundColor === 'secondary_bg_color'
      ? this.theme[toThemeParamsKey(this._backgroundColor)]
      : this._backgroundColor;
  }

  /**
   * An object for controlling the back button which can be displayed in the
   * header of the Web App in the Telegram interface.
   */
  backButton: BackButton;

  /**
   * The color scheme currently used in the Telegram app.
   */
  get colorScheme(): ColorScheme {
    const bgColor = this.theme.backgroundColor;

    return bgColor === undefined
      ? 'dark'
      : isColorDark(bgColor) ? 'dark' : 'light';
  }

  /**
   * A method that closes the Web App.
   */
  close() {
    this.webView.postEvent('web_app_close');
  }

  /**
   * A method that disables the confirmation dialog while the user is trying
   * to close the Web App.
   * @see setClosingConfirmationEnabled
   */
  disableClosingConfirmation() {
    this.setClosingConfirmationEnabled(false);
  }

  /**
   * A method that enables a confirmation dialog while the user is trying to
   * close the Web App.
   * @see setClosingConfirmationEnabled
   */
  enableClosingConfirmation() {
    this.setClosingConfirmationEnabled(true);
  }

  /**
   * A method that expands the Web App to the maximum available height. To
   * find out if the Web App is expanded to the maximum height, refer to the
   * value of the `isExpanded`.
   * @see isExpanded
   */
  expand() {
    this.webView.postEvent('web_app_expand');
  }

  /**
   * Returns current native application header color.
   */
  get headerColor(): string | undefined {
    return this.theme[toThemeParamsKey(this._headerColor)];
  }

  /**
   * An object for controlling haptic feedback.
   */
  haptic: HapticFeedback;

  /**
   * `true`, if the confirmation dialog is enabled while the user is trying to
   * close the Web App.
   */
  get isClosingConfirmationEnabled(): boolean {
    return this._isClosingConfirmationEnabled;
  }

  /**
   * `true`, if the Web App is expanded to the maximum available height.
   * `false`, if the Web App occupies part of the screen and can be expanded
   * to the full height using `expand` method.
   * @see expand
   */
  get isExpanded(): boolean {
    return this._isExpanded;
  }

  /**
   * Return true in case, passed version is more than or equal to current
   * WebApp version.
   * TODO: Should we check if current version and compared version has
   *  incorrect format (symbols)?
   * @param version - compared version.
   */
  isVersionAtLeast(version: Version): boolean {
    return compareVersions(this.version, version) >= 0;
  }

  /**
   * Starts initialization process which gets required data from current
   * web view.
   * @see loadFromSearchParams
   */
  init() {
    // Get all required WebApp parameters.
    const {
      version,
      platform,
      initData,
      themeParams,
    } = extractWebAppMeta(this.webView.initParams);

    this.platform = platform;
    this.version = version;
    this.initData = initData;
    this._viewportHeight = window.innerHeight; // TODO: Should use main button height?
    this._viewportStableHeight = window.innerHeight; // TODO: Should use main button height?
    this.theme = themeParams;
    // TODO: Detect expansion? Should probably always be true on tdesktop.
    this._isExpanded = false;

    // Update Main button info.
    const buttonColor = themeParams.buttonColor;
    const buttonTextColor = themeParams.buttonTextColor;

    if (buttonColor !== undefined) {
      this.mainButton.setColor(buttonColor);
    }

    if (buttonTextColor !== undefined) {
      this.mainButton.setTextColor(buttonTextColor);
    }

    // Add event listener which will update popup open status.
    this.webView.on(POPUP_CLOSED_EVENT, () => this._isPopupOpened = false);

    // Add event listener which will listen to theme changes.
    this.webView.on(THEME_CHANGED_EVENT, theme => this.theme = theme);

    // Add event listener which will listen to viewport changes.
    this.webView.on(VIEWPORT_CHANGED_EVENT, (height, isExpanded, isStable) => {
      this._viewportHeight = height;
      this._isExpanded = isExpanded;

      if (isStable) {
        this._viewportStableHeight = height;
      }
    });
  }

  /**
   * A method that opens a link in an external browser. The Web App will not
   * be closed.
   *
   * Note that this method can be called only in response to the user
   * interaction with the Web App interface (e.g. click inside the Web App
   * or on the main button)
   * @see formatURL
   * @param url - URL to be opened.
   */
  openLink(url: string) {
    const formattedURL = formatURL(url);

    // In case, current version is 6.1+, open link with special native
    // application event.
    // TODO: No mention about version in docs.
    if (this.isVersionAtLeast('6.1')) {
      this.webView.postEvent('web_app_open_link', {url: formattedURL});
    }
    // Otherwise, do it in legacy way.
    else {
      window.open(formattedURL, '_blank');
    }
  }

  /**
   * A method that opens a telegram link inside Telegram app. The Web App
   * will be closed.
   * @see formatURL
   * @param url - URL to be opened.
   * @throws {Error} URL has not allowed hostname.
   * @since WebApp version 6.1+
   */
  openTelegramLink(url: string) {
    const {hostname, pathname, search} = new URL(formatURL(url));

    // We allow opening links with the only 1 hostname.
    if (hostname !== 't.me') {
      throw new Error(
        `URL has not allowed hostname: ${hostname}. Only "t.me" is allowed`,
      );
    }

    // In case, current version is 6.1+ or we are currently in iframe, open
    // link with special native application event.
    // TODO: Is it correct that calling of this method is allowed in case
    //  it is iframe or v6.1+? Code was taken from source, but no mention in
    //  docs.
    if (this.webView.isIframe || this.isVersionAtLeast('6.1')) {
      this.webView.postEvent('web_app_open_tg_link', {
        url: pathname + search,
      });
    }
    // Otherwise, do it in legacy way.
    else {
      window.location.href = url;
    }
  }

  /**
   * TODO: Check docs.
   * FIXME: Implement
   * A method that opens an invoice using the link url. The Web App will
   * receive the event invoiceClosed when the invoice is closed. If an optional
   * callback parameter was passed, the callback function will be called and
   * the invoice status will be passed as the first argument.
   * @since Bot API 6.1+
   * @param url
   */
  openInvoice(url: string) {
    throw new Error('not implemented');
  }

  /**
   * A method that informs the Telegram app that the Web App is ready to be
   * displayed.
   *
   * It is recommended to call this method as early as possible, as soon as
   * all essential interface elements are loaded. Once this method is called,
   * the loading placeholder is hidden and the Web App is shown.
   *
   * If the method is not called, the placeholder will be hidden only when
   * the page is fully loaded.
   */
  ready() {
    this.webView.postEvent('web_app_ready');
  }

  /**
   * Checks if current version satisfies minimum (passed) version.
   * @param version - version number.
   * @throws {Error} Version of WebApp does not support this method.
   */
  requireVersion(version: Version) {
    if (!this.isVersionAtLeast(version)) {
      throw new Error(`Version "${version}" of WebApp does not support this method.`);
    }
  }

  /**
   * A method used to send data to the bot. When this method is called, a
   * service message is sent to the bot containing the data of the
   * length up to 4096 bytes, and the Web App is closed. See the field
   * `web_app_data` in the class Message.
   *
   * This method is only available for Web Apps launched via a Keyboard button.
   *
   * @param data - data to send to bot.
   * @throws {Error} data has incorrect size.
   */
  sendData(data: string) {
    // Firstly, compute passed text size in bytes.
    const size = new Blob([data]).size;
    if (size === 0 || size > 4096) {
      throw new Error(`Passed data has incorrect size: ${size}`);
    }
    this.webView.postEvent('web_app_data_send', {data: data});
  }

  /**
   * FIXME: Implement
   * A method that shows a native popup described by the params argument.
   * Promise will be resolved when popup is closed. Resolved value will
   * have an identifier of pressed button in case, it some of them was clicked.
   *
   * In case, user clicked outside of popup, or top right popup close button
   * was clicked, `null` will be returned.
   *
   * TODO: Currently, application crashes in case, some parameters are
   *  incorrect. That's why we should check everything.
   *
   * @param params - popup parameters.
   * @since WebApp version 6.2+
   * @see requireVersion
   * @throws {Error} Popup is already opened.
   */
  showPopup(params: PopupParams): Promise<string | null> {
    this.requireVersion('6.2');

    // Don't allow opening several popups.
    if (this._isPopupOpened) {
      throw new Error('Popup is already opened.');
    }

    // Format all required parameters.
    const message = params.message.trim();
    const title = (params.title || '').trim();
    const buttons = params.buttons || [];

    // Check title.
    if (title.length > 64) {
      throw new Error(`Title has incorrect size: ${title.length}`);
    }

    // Check message.
    if (message.length === 0 || message.length > 256) {
      throw new Error(`Message has incorrect size: ${message.length}`);
    }

    // Check buttons.
    if (buttons.length > 3) {
      throw new Error(`Buttons have incorrect size: ${buttons.length}`);
    }

    // Append button in case, there are no buttons passed.
    if (buttons.length === 0) {
      buttons.push({type: 'close'});
    } else {
      // Otherwise, check all the buttons.
      buttons.forEach(b => {
        const {id = ''} = b;

        // Check button ID.
        if (id.length > 64) {
          throw new Error(`Button ID has incorrect size: ${id}`);
        }

        switch (b.type) {
          case undefined:
          case 'default':
          case 'destructive':
            if (b.text.length > 64) {
              const type = b.type || 'default';
              throw new Error(`Button text with type "${type}" has incorrect size: ${b.text.length}`);
            }
            break;
        }
        b.id = id;
      });
    }

    // Update popup opened status.
    this._isPopupOpened = true;

    return new Promise<string | null>(res => {
      const listener = (buttonId: string | undefined) => {
        // Remove event listener.
        this.webView.off(POPUP_CLOSED_EVENT, listener);

        // Resolve promise.
        res(buttonId === undefined ? null : buttonId);
      };

      this.webView.on(POPUP_CLOSED_EVENT, listener);
      this.webView.postEvent('web_app_open_popup', {title, message, buttons});
    });
  }

  /**
   * A method that shows message in a simple alert with a 'Close' button.
   * Promise will be resolved when popup is closed.
   *
   * @param message - message to display.
   * @since WebApp version 6.2+
   * @see showPopup
   */
  async showAlert(message: string): Promise<void> {
    await this.showPopup({message, buttons: [{type: 'close'}]});
  }

  /**
   * A method that shows message in a simple confirmation window with 'OK'
   * and 'Cancel' buttons. Promise will be resolved when popup is closed.
   * Resolved value will be `true` in case, user pressed 'OK` button. The
   * result will be `false` otherwise.
   *
   * @param message - message to display.
   * @since WebApp version 6.2+
   * @see showPopup
   */
  async showConfirm(message: string): Promise<boolean> {
    return this
      .showPopup({
        message,
        buttons: [{type: 'ok', id: 'ok'}, {type: 'cancel'}],
      })
      .then(id => id === 'ok');
  }

  /**
   * Updates current application background color.
   *
   * @param color - settable color key or color description in known RGB
   * format.
   * @since WebApp version 6.1+
   * @see requireVersion
   * @see toRGBExt
   */
  setBackgroundColor(color: SettableColorKey | AnyRGBColor) {
    this.requireVersion('6.1');

    // In case, passed color has some RGB format, we should convert it
    // to #RGB.
    if (color !== 'bg_color' && color !== 'secondary_bg_color') {
      // Convert passed value to expected #RRGGBB format.
      color = toRGBExt(color);
    }

    // Don't do anything in case, color is the same.
    if (this._backgroundColor === color) {
      return;
    }

    // Override current background color key.
    this._backgroundColor = color;

    // Notify native application about updating current background color.
    this.webView.postEvent('web_app_set_background_color', {color});
  }

  /**
   * Updates current application header color.
   * @param color - settable color key.
   * @see requireVersion
   * @since WebApp version 6.1+
   */
  setHeaderColor(color: SettableColorKey) {
    this.requireVersion('6.1');

    // Don't do anything in case, color is the same.
    if (this._headerColor === color) {
      return;
    }

    // Override current header color key.
    this._headerColor = color;

    // Notify native application about updating current header color.
    this.webView.postEvent('web_app_set_header_color', {color_key: color});
  }

  /**
   * The current height of the visible area of the Web App.
   *
   * The application can display just the top part of the Web App, with its
   * lower part remaining outside the screen area. From this position, the
   * user can "pull" the Web App to its maximum height, while the bot can do
   * the same by calling `expand` method. As the position of the Web App
   * changes, the current height value of the visible area will be updated in
   * real time.
   *
   * Please note that the refresh rate of this value is not sufficient to
   * smoothly follow the lower border of the window. It should not be used
   * to pin interface elements to the bottom of the visible area. It's more
   * appropriate to use the value of the viewportStableHeight field for
   * this purpose.
   *
   * @see expand
   * @see viewportStableHeight
   */
  get viewportHeight(): number {
    return this._viewportHeight;
  }

  /**
   * The height of the visible area of the Web App in its last stable state.
   *
   * The application can display just the top part of the Web App, with its
   * lower part remaining outside the screen area. From this position,
   * the user can "pull" the Web App to its maximum height, while the bot can
   * do the same by calling `expand` method.
   *
   * Unlike the value of `viewportHeight`, the value of `viewportStableHeight`
   * does not change as the position of the Web App changes with user
   * gestures or during animations. The value of `viewportStableHeight`
   * will be updated after all gestures and animations are completed and
   * the Web App reaches its final size.
   *
   * @see expand
   * @see viewportHeight
   */
  get viewportStableHeight(): number {
    return this._viewportStableHeight;
  }
}