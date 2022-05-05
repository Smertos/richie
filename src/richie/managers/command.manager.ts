import { Bot } from 'richie/bot';
import { Command } from 'richie/models';

export class CommandManager {
  private registeredCommands: Record<string, Command> = {};

  constructor(public bot: Bot) { }

  async onCommand(user: string, commandSlug: string, commandArgs: Array<string>): Promise<void> {
    const command = this.registeredCommands[commandSlug];

    if (command && command.isEnabled) {
      if (command.options.isAdminOnly && !this.bot.botConfig.admins.includes(user)) {
        const noAccessMessage = this.bot.i18n.t('commands.admin-only');
        await this.bot.chatClient.say(this.bot.botConfig.channelName, noAccessMessage);

        return;
      }

      void command.execute(user, commandArgs);
    }
  }

  async registerCommand(command: Command): Promise<void> {
    if (this.registeredCommands[command.slug]) {
      this.bot.logger.error(`Tried to register '${command.slug}' command twice`);
    } else {
      this.registeredCommands[command.slug] = command;

      await command.enable();
    }
  }

  async unregisterCommand(command: Command): Promise<void> {
    if (this.registeredCommands[command.slug]) {
      await command.disable();

      delete this.registeredCommands[command.slug];
    }
  }
}
