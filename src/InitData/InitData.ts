import {Chat, InitData as InitDataInterface, User} from './types';
import {parseQueryString} from '../url';
import {extractInitData} from './utils';

/**
 * Represents class which is responsible for communication with WebApps init
 * data.
 */
export class InitData {
  /**
   * Attempts to create InitData instance from their its raw representation.
   * @param raw - init data in raw format (query string).
   * @see parseInitData
   */
  static fromRaw(raw: string): InitData {
    return new InitData(raw, parseQueryString(raw), extractInitData(raw));
  }

  /**
   * Creates new empty instance of InitData.
   */
  static empty(): InitData {
    return new InitData('', {}, {authDate: new Date(0), hash: ''});
  }

  constructor(
    /**
     * Raw representation of init data (query string).
     */
    public raw: string,
    /**
     * Unsafe representation of init data. This field is useful in case,
     * some new updates appeared in Telegram Web Apps, but this library version
     * is not up-to-date.
     */
    public unsafe: Record<string, unknown>,
    /**
     * Raw init data parameters.
     */
    private params: InitDataInterface,
  ) {
  }

  /**
   * @see InitDataInterface.authDate
   */
  get authDate(): Date {
    return this.params.authDate;
  }

  /**
   * @see InitDataInterface.canSendAfter
   */
  get canSendAfter(): Date | undefined {
    return this.params.canSendAfter;
  }

  /**
   * @see InitDataInterface.chat
   */
  get chat(): Chat | undefined {
    return this.params.chat;
  }

  /**
   * @see InitDataInterface.hash
   */
  get hash(): string {
    return this.params.hash;
  }

  /**
   * @see InitDataInterface.queryId
   */
  get queryId(): string | undefined {
    return this.params.queryId;
  }

  /**
   * @see InitDataInterface.receiver
   */
  get receiver(): User | undefined {
    return this.params.receiver;
  }

  /**
   * @see InitDataInterface.startParam
   */
  get startParam(): string | undefined {
    return this.params.startParam;
  }

  /**
   * @see InitDataInterface.user
   */
  get user(): User | undefined {
    return this.params.user;
  }
}