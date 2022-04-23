import { Bot } from 'richie/bot';
import { Command } from 'richie/models';

export class CommandManager {
  private registeredCommands: Record<string, Command> = {};

  constructor(public bot: Bot) { }

  onCommand(user: string, commandSlug: string, commandArgs: Array<string>): void {
    const command = this.registeredCommands[commandSlug];

    if (command && command.isEnabled) {
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
