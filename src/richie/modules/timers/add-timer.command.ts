import { Bot } from 'richie/bot';
import { Command } from 'richie/models';

export class AddTimerCommand extends Command {
  private static readonly command: string = 'add-timer';

  constructor(bot: Bot) {
    super(AddTimerCommand.command, bot, {
      isAdminOnly: true,
      usageArgs: ['<period-seconds>', '<message>']
    });
  }

  override async execute(_user: string, args: Array<string>): Promise<void> {
    if (args.length < 2) {
      await this.bot.chatClient.say(this.bot.botConfig.channelName, this.usage);

      return;
    }

    const [period, ...messageParts] = args;
    const periodSeconds = parseInt(period);
    const fullMessage = messageParts.join(' ');

    const createdTimer = await this.bot.messageTimerManager.addTimer(fullMessage, periodSeconds);

    const responseMessage = this.bot.i18n.t('modules.timers.commands.add-timer.response', { timerId: createdTimer.id });
    await this.bot.chatClient.say(this.bot.botConfig.channelName, responseMessage);
  }
}
