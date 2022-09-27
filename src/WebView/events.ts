import {ThemeParams} from '../ThemeParams';

/**
 * User clicked back button.
 *
 * @since WebApp version 6.1+
 */
export const BACK_BUTTON_PRESSED_EVENT = 'back_button_pressed';

/**
 * Request to update application style.
 */
export const SET_CUSTOM_STYLE_EVENT = 'set_custom_style';

/**
 * Occurs when the Settings item in context menu is pressed.
 * eventHandler receives no parameters.
 * FIXME: We dont know how to imitate.
 *
 * @since WebApp version 6.1+
 */
export const SETTINGS_BUTTON_PRESSED_EVENT = 'settings_button_pressed';

/**
 * Occurs whenever theme settings are changed in the user's Telegram app
 * (including switching to night mode).
 */
export const THEME_CHANGED_EVENT = 'theme_changed';

export const VIEWPORT_CHANGED_EVENT = 'viewport_changed';

export const INVOICE_CLOSED_EVENT = 'invoice_closed';

/**
 * User clicked main button.
 */
export const MAIN_BUTTON_PRESSED_EVENT = 'main_button_pressed';

/**
 * Popup was closed.
 */
export const POPUP_CLOSED_EVENT = 'popup_closed';

/**
 * List of events with their params.
 */
export interface WebViewEventsMap {
  [BACK_BUTTON_PRESSED_EVENT]: [];
  [MAIN_BUTTON_PRESSED_EVENT]: [];
  [SET_CUSTOM_STYLE_EVENT]: (
    /**
     * 'style' tag inner HTML.
     */
    html: string
  ) => void;
  [SETTINGS_BUTTON_PRESSED_EVENT]: never;
  [THEME_CHANGED_EVENT]: (
    /**
     * New theme params information.
     */
    theme: ThemeParams
  ) => void;
  [VIEWPORT_CHANGED_EVENT]: (
    /**
     * Viewport height.
     */
    height: number,
    /**
     * Is application fully expanded.
     */
    isExpanded: boolean,
    /**
     * Is viewport stable
     */
    isStateStable: boolean
  ) => void;
  [INVOICE_CLOSED_EVENT]: never;
  [POPUP_CLOSED_EVENT]: (
    /**
     * Button identifier. Will be undefined in case, popup was closed with
     * outside click or via left top close button.
     */
    buttonId: string | undefined
  ) => void;
}
