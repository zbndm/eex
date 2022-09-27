import {WebView} from './WebView';
import {WebApp} from './WebApp';

/**
 * Create global instance of WebView.
 */
export let webView = WebView.empty();

/**
 * Create global instance of WebApp.
 */
export let webApp = WebApp.empty(webView);

/**
 * Main Telegram Web Apps function which initializes main system components.
 * After calling this function, usage of WebView and WebApp becomes allowed.
 */
export function init() {
  // Initialize web view and web app.
  webView.init();
  webApp.init();

  // const w = window as any;
  //
  // w.WebApp = webApp;
  // w.WebView = webView;
  //
  // console.log(w.WebApp);
  // console.log(w.WebView);
}