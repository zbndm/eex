import {Chat, InitData, User} from './types';
import {
  createJSONStructParser, createSearchParamsSchemaParser,
  parseJSONParamAsInt,
  parseJSONParamAsOptBool,
  parseJSONParamAsOptString,
  parseJSONParamAsString, parseSearchParamAsDate, parseSearchParamAsOptDate,
  parseSearchParamAsOptString, parseSearchParamAsString,
} from '../parsing';

/**
 * Returns minimum, default and empty init data information.
 */
export function getEmptyInitData(): InitData {
  return {authDate: new Date(), hash: ''};
}

/**
 * Parses string as User. In case, value is null, returns null.
 */
const parseUser = createJSONStructParser<User>({
  id: ['id', parseJSONParamAsInt],
  isBot: ['is_bot', parseJSONParamAsOptBool],
  firstName: ['first_name', parseJSONParamAsString],
  lastName: ['last_name', parseJSONParamAsOptString],
  username: ['username', parseJSONParamAsOptString],
  languageCode: ['language_code', parseJSONParamAsOptString],
  isPremium: ['is_premium', parseJSONParamAsOptBool],
  photoUrl: ['photo_url', parseJSONParamAsOptString],
}, true);

/**
 * Parses string as Chat. In case, value is null, returns null.
 */
const parseChat = createJSONStructParser<Chat>({
  id: ['id', parseJSONParamAsInt],
  title: ['title', parseJSONParamAsString],
  type: ['type', parseJSONParamAsString],
  username: ['username', parseJSONParamAsOptString],
  photoUrl: ['photo_url', parseJSONParamAsOptString],
}, true);

/**
 * Extract init data from query string or URLSearchParams.
 * @see createSearchParamsSchemaParser
 */
export const extractInitData = createSearchParamsSchemaParser({
  queryId: ['query_id', parseSearchParamAsOptString],
  user: ['user', parseUser],
  receiver: ['receiver', parseUser],
  chat: ['chat', parseChat],
  startParam: ['start_param', parseSearchParamAsOptString],
  canSendAfter: ['can_send_after', parseSearchParamAsOptDate],
  authDate: ['auth_date', parseSearchParamAsDate],
  hash: ['hash', parseSearchParamAsString],
});
