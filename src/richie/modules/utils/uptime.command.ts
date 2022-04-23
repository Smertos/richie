import { intervalToDuration, formatDuration } from 'date-fns';
import { Bot } from 'richie/bot';
import { Command } from 'richie/models';

export class UptimeCommand extends Command {
  constructor(bot: Bot) {
    super('uptime', bot);
  }

  override async execute(user: string, args: Array<string>): Promise<void> {
    const currentStream = await this.bot.apiClient.streams.getStreamByUserId(this.bot.channelOwnerUserId);

    if (!currentStream) {
      const responseMessage = this.bot.i18n.t('modules.utils.commands.uptime.response', { context: 'no-stream' });
      await this.bot.chatClient.say(this.bot.botConfig.channelName, responseMessage);

      return;
    }

    const streamDuration = intervalToDuration({
      end: new Date(),
      start: currentStream.startDate
    });
    const streamDurationFormatted = formatDuration(streamDuration, { locale: this.bot.dateFnsLocale });

    const responseMessage = this.bot.i18n.t('modules.utils.commands.uptime.response', { streamDurationFormatted });
    await this.bot.chatClient.say(this.bot.botConfig.channelName, responseMessage);
  }
}

