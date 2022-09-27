/**
 * An error which is thrown in case, WebView does not contain some specific
 * parameter.
 */
export class ParameterMissingError extends Error {
  constructor(paramName: string) {
    super(`WebView parameter "${paramName}" is missing.`);
    Object.setPrototypeOf(this, ParameterMissingError.prototype)
  }
}

