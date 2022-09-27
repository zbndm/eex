import {sessionStorageGet} from '../sessionStorage';
import {parseHash} from '../url';

/**
 * TODO: Add description.
 */
interface TelegramWebviewProxy {
  postEvent(event: string, data: string): void;
}

/**
 * TODO: Add description.
 */
interface WindowExternal {
  notify(search: string): void;
}

/**
 * Describes extracted event data from its text presentation.
 */
export interface EventData {
  /**
   * Event name.
   */
  type: string;
  /**
   * Event data.
   */
  data: string;
}

/**
 * States that passed value has TelegramWebviewProxy.
 * TODO: We dont know that is TelegramWebviewProxy. This code was taken from
 *  previous source code.
 * @param val - value to check.
 */
export function hasProxy<T>(val: T): val is (T & { TelegramWebviewProxy: TelegramWebviewProxy }) {
  return (val as any).TelegramWebviewProxy !== undefined;
}

/**
 * States that passed value has "external" which could notify native device.
 * TODO: We dont know that is "external" and "notify". This code was taken from
 *  previous source code.
 * @param val - value to check.
 */
export function hasExternal<T>(val: T): val is (T & { external: WindowExternal }) {
  return 'external' in window && typeof (window.external as any).notify === 'function';
}

/**
 * Extracts init params from specified path.
 * @param path - path to extract init params from.
 * @return Returns init data from hash of specified path. In case, path has
 * no hash, path is recognized as hash.
 * @see urlParseHashParams
 */
export function extractInitParams(path: string): URLSearchParams {
  return parseHash(path).query;
}

/**
 * Extracts init params from specified path and applies init params which were
 * previously stored in session storage. Only those fields from session
 * storage are applied which are missing in current in currently parsed init
 * params. It means, current init params fields will not be overwritten, but
 * fulfilled.
 * @param path - path to extract init params from.
 * @return Returns init data from hash of specified
 */
export function extractFulfilledInitParams(path: string): URLSearchParams {
  // Get init params from URL.
  const params = extractInitParams(path);
  // Get stored init params.
  const sessParams = sessionStorageGet('initParams');

  // In case, we have session params, we should fill current init params with
  // missing session params.
  if (sessParams !== null) {
    sessParams.forEach(([k, v]) => {
      if (!params.has(k)) {
        params.set(k, v);
      }
    });
  }
  return params;
}

/**
 * Extracts event data from message event sent from parent source.
 * @param eventData - received event data.
 * @throws {SyntaxError} Passed value is not JSON presented as string.
 * @throws {TypeError} Passed value is JSON, but not an object with expected
 * keys and values. Expected keys are `eventType` and `eventData` which are
 * both strings.
 * @return Extracted event data from its string presentation.
 */
export function extractMessageEventData(eventData: string): EventData {
  const data = JSON.parse(eventData);

  // data should be something like {eventType: string; eventData: string}.
  if (
    typeof data !== 'object' ||
    data === null ||
    Array.isArray(data) ||
    typeof data.eventType !== 'string' ||
    typeof data.eventData !== 'string'
  ) {
    throw new TypeError(`${eventData} does not present JSON object converted to string.`);
  }
  return {type: data.eventType, data: data.eventData};
}
