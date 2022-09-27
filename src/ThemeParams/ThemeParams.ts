import {ThemeParams as ThemeParamsInterface} from './types';
import {RGBExtColor} from '../colors';
import {createJSONStructParser, parseJSONParamAsOptRGBExt} from '../parsing';

/**
 * Extracts theme information from specified JSON.
 */
const extractFromJSON = createJSONStructParser({
  backgroundColor: ['bg_color', parseJSONParamAsOptRGBExt],
  buttonColor: ['button_color', parseJSONParamAsOptRGBExt],
  buttonTextColor: ['button_text_color', parseJSONParamAsOptRGBExt],
  hintColor: ['hint_color', parseJSONParamAsOptRGBExt],
  linkColor: ['link_color', parseJSONParamAsOptRGBExt],
  secondaryBackgroundColor: ['secondary_bg_color', parseJSONParamAsOptRGBExt],
  textColor: ['text_color', parseJSONParamAsOptRGBExt],
});

export class ThemeParams {
  /**
   * Returns empty instance of ThemeParams.
   */
  static empty(): ThemeParams {
    return new ThemeParams('', {}, {});
  }

  /**
   * Creates new ThemeParams instance from raw representation of theme params.
   * @param jString - raw representation of theme params (JSON string).
   */
  static fromJSONString(jString: string): ThemeParams {
    return new ThemeParams(jString, JSON.parse(jString), extractFromJSON(jString));
  }

  /**
   * Creates new ThemeParams instance from raw representation of theme params.
   * @param json - raw representation of theme params (JSON).
   */
  static fromJSON(json: Record<string, unknown>): ThemeParams {
    return new ThemeParams(JSON.stringify(json), json, extractFromJSON(json));
  }

  constructor(
    /**
     * Raw representation of parsed string.
     */
    public raw: string,
    /**
     * Value which is unsafe to use. May contain values not specified in
     * current instance. This value is useful in case, Telegram native
     * application was updated, but this library is not up-to-date.
     */
    public unsafe: Record<string, unknown>,
    /**
     * Parameters parsed from special init param.
     */
    private params: ThemeParamsInterface,
  ) {
  }

  /**
   * Background color in the #RRGGBB format.
   */
  get backgroundColor(): RGBExtColor | undefined {
    return this.params.backgroundColor;
  }

  /**
   * Button color in the #RRGGBB format.
   */
  get buttonColor(): RGBExtColor | undefined {
    return this.params.buttonColor;
  }

  /**
   * Button text color in the #RRGGBB format.
   */
  get buttonTextColor(): RGBExtColor | undefined {
    return this.params.buttonTextColor;
  }

  /**
   * Hint text color in the #RRGGBB format.
   */
  get hintColor(): RGBExtColor | undefined {
    return this.params.hintColor;
  }

  /**
   * Link color in the #RRGGBB format.
   */
  get linkColor(): RGBExtColor | undefined {
    return this.params.linkColor;
  }

  /**
   * Secondary background color in the #RRGGBB format.
   * @since WebApp version 6.1+
   */
  get secondaryBackgroundColor(): RGBExtColor | undefined {
    return this.params.secondaryBackgroundColor;
  }

  /**
   * Main text color in the #RRGGBB format.
   */
  get textColor(): RGBExtColor | undefined {
    return this.params.textColor;
  }
}