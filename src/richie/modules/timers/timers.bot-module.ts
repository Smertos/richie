import { Bot } from 'richie/bot';
import { BotModule, BotModuleId, TBotModuleInfo } from 'richie/modules/api';
import { AddTimerCommand } from './add-timer.command';

export class TimersBotModule extends BotModule {
  static readonly moduleInfo: Readonly<TBotModuleInfo> = {
    description: 'Provides ways to work with timers',
    id: BotModuleId.Test,
    name: 'timers-module',
    namePretty: 'Timers Module'
  };

  constructor(protected bot: Bot) {
    super(bot, TimersBotModule.moduleInfo, {
      ...BotModule.defaultModuleSettings
    });
  }

  override async load(): Promise<void> {
    await super.load();

    await this.bot.messageTimerManager.loadSavedTimers();

    await this.addCommand(new AddTimerCommand(this.bot));
  }
}

