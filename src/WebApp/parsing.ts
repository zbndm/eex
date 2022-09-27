import {ThemeParams} from '../ThemeParams';
import {
  createSearchParamsSchemaParser,
  parseSearchParamAsString,
  SearchParamsParser,
} from '../parsing';
import {InitData} from '../InitData';

/**
 * Parses value as web app init data.
 * @param value - parameter value.
 */
const parseInitData: SearchParamsParser<InitData> = value => {
  return InitData.fromRaw(parseSearchParamAsString(value));
};

/**
 * Parses value as web app theme params.
 * @param value - parameter value.
 */
const parseThemeParams: SearchParamsParser<ThemeParams> = value => {
  return ThemeParams.fromJSONString(parseSearchParamAsString(value));
};

/**
 * Extracts WebApp meta information from specified search params.
 */
export const extractWebAppMeta = createSearchParamsSchemaParser({
  initData: ['tgWebAppData', parseInitData],
  platform: ['tgWebAppPlatform', parseSearchParamAsString],
  version: ['tgWebAppVersion', parseSearchParamAsString],
  themeParams: ['tgWebAppThemeParams', parseThemeParams],
});
