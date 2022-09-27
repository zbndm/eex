// /**
//  * Appends new query parameter to hash.
//  * TODO: This function looks pretty dangerous as long as "addHash" could be
//  *  any string. It means, as a result, malformed URI could be returned (in
//  *  case something is wrong with "addHash").
//  * @param url - base URI to append new hash to.
//  * @param addHash - hash to append.
//  * @return Returns newly created URI.
//  */
// export function urlAppendHashParams(url: string, addHash: string): string {
//   // Detect the beginning of hash part. In case, there is no such part, we could
//   // just add it appending hashtag to its beginning.
//   const hashIdx = url.indexOf('#');
//   if (hashIdx === -1) {
//     return url + '#' + addHash;
//   }
//
//   // Take only hash part.
//   const hash = url.slice(hashIdx + 1);
//
//   // There is no hash part. We just append it to URL. Value example:
//   // https://game.com/#
//   if (hash.length === 0) {
//     return url + addHash;
//   }
//
//   // If we already have query string part, we should append hash param to
//   // this part. Value examples:
//   // https://game.com/#key=value
//   // https://game.com/#path?key=value
//   if (containsQueryString(hash)) {
//     // Detect previous query string part.
//     const qIndex = hash.indexOf('?');
//     if (qIndex >= 0) {
//       // In case, question sign was found, it means, query params could
//       // probably be specified. We should if there is something after this sign.
//       // In case, nothing was found, we will just append "addHash". Otherwise,
//       // we should firstly insert "&".
//       return url + (hash.length - qIndex > 1 ? '&' : '') + addHash
//     }
//     return url + '&' + addHash;
//   }
//   // We can get to this line of code only in case something like this value
//   // was passed:
//   // https://game.com/#path
//   return url + '?' + addHash;
// }
/**
 * Compares 2 versions. Examples of values are: 6.1, 6.1.33, 6
 * Cases:
 * 1. If a > b return 1
 * 2. If a === b return 0
 * 3. If a < b return -1
 * TODO: Should we check if current version and compared version has
 *  incorrect format (symbols)?
 * @param a
 * @param b
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  // Split both of the version by dot.
  const aParts = a.split('.');
  const bParts = b.split('.');

  // Compute maximum length.
  const len = Math.max(aParts.length, bParts.length);

  // Iterate over each part of version and compare them. In case, part is
  // missing, assume its value is equal to 0.
  for (let i = 0; i < len; i++) {
    const aVal = parseInt(aParts[i] || '0');
    const bVal = parseInt(bParts[i] || '0');

    if (aVal === bVal) {
      continue;
    }
    return aVal < bVal ? -1 : 1;
  }
  return 0;
}

/**
 * Returns true in case, current environment is iframe.
 * @see https://stackoverflow.com/a/326076
 */
export function isIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
