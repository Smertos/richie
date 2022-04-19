import { Bot } from 'richie/bot';
import { BotModule, BotModuleId, TBotModuleInfo } from 'richie/modules/api';
import { TestCommand } from './test.command';

export class TestBotModule extends BotModule {
  static readonly moduleInfo: Readonly<TBotModuleInfo> = {
    description: 'Used for testing command system',
    id: BotModuleId.Test,
    name: 'test-module',
    namePretty: 'Test Module'
  };

  constructor(protected bot: Bot) {
    super(bot, TestBotModule.moduleInfo, {
      ...BotModule.defaultModuleSettings
    });
  }

  override async load(): Promise<void> {
    await super.load();

    await this.addCommand(new TestCommand(this.bot));
  }
}
