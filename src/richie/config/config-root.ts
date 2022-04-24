import { ConfigAccount } from './config-account';
import { ConfigBot } from './config-bot';

export class ConfigRoot {
  account: ConfigAccount = new ConfigAccount();
  bots: Array<ConfigBot> = [];
}
