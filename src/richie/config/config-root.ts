import { ConfigAccount } from './config-account';
import { ConfigBot } from './config-bot';

export class ConfigRoot {
  account: ConfigAccount = new ConfigAccount();
  authCallbackHost: string = 'localhost';
  authCallbackPort: number = 8999;
  bots: Array<ConfigBot> = [];
}
