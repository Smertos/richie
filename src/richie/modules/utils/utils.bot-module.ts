import { Bot } from 'richie/bot';
import { BotModule, BotModuleId, TBotModuleInfo } from 'richie/modules/api';
import { UptimeCommand } from './uptime.command';

export class UtilsBotModule extends BotModule {
  static readonly moduleInfo: Readonly<TBotModuleInfo> = {
    description: 'Various useful/utilitarian commands',
    id: BotModuleId.Utils,
    name: 'utils-module',
    namePretty: 'Utils Module'
  };

  constructor(protected bot: Bot) {
    super(bot, UtilsBotModule.moduleInfo, {
      ...BotModule.defaultModuleSettings
    });
  }

  override async load(): Promise<void> {
    await super.load();

    await this.addCommand(new UptimeCommand(this.bot));
  }
}
