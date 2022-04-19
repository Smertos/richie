import { ConfigAccount } from './config-account';
import { ConfigBot } from './config-bot';
import { ConfigTwitchCommon } from './config-twitch-common';

export class ConfigRoot {
  account: ConfigAccount = new ConfigAccount();
  authCallbackHost: string = 'localhost';
  authCallbackPort: number = 8999;
  bots: Array<ConfigBot> = [];
  twitchCommon: ConfigTwitchCommon = new ConfigTwitchCommon();
}
