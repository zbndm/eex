/**
 * An error which is usually thrown in case, `postEvent` was attempted to be
 * called, but WebView had no valid way of doing that.
 */
export class ApplicationNotReadyError extends Error {
  constructor() {
    super('Application is not available.');
    Object.setPrototypeOf(this, ApplicationNotReadyError.prototype);
  }
}
