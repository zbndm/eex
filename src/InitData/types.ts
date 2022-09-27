/**
 * Describes user information.
 * @see https://core.telegram.org/bots/webapps#webappuser
 */
export interface User {
  id: number;
  isBot?: boolean;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
}

/**
 * Describes chat information.
 * @see https://core.telegram.org/bots/webapps#webappchat
 */
export interface Chat {
  id: number;
  type: string;
  title: string;
  username?: string;
  photoUrl?: string;
}

/**
 * Describes parsed initial data sent from TWA application. You can
 * find specification for all the parameters in the official documentation:
 * @see https://core.telegram.org/bots/webapps#webappinitdata
 */
export interface InitData {
  queryId?: string;
  receiver?: User;
  user?: User;
  chat?: Chat;
  startParam?: string;
  canSendAfter?: Date;
  authDate: Date;
  hash: string;
}