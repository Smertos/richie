import { Bot } from 'richie/bot';
import { Command } from 'richie/models';

export class TestCommand extends Command {
  constructor(bot: Bot) {
    super('test', bot);
  }

  override async execute(user: string, _args: Array<string>): Promise<void> {
    const responseMessage = this.bot.i18n.t('modules.test.commands.test.response', { user });
    console.log(responseMessage);
    await this.bot.chatClient.say(this.bot.botConfig.channelName, responseMessage);
  }
}
