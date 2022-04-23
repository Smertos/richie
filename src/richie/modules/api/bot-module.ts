import { Bot } from 'richie/bot';
import { ModuleSettingsEntity } from 'richie/db/entities';
import { Command } from 'richie/models';
import { TBotModuleInfo, TBotModuleSettings } from './types';

export class BotModule<Settings extends TBotModuleSettings = TBotModuleSettings> {
  static readonly defaultModuleSettings: TBotModuleSettings = {
    enabledByDefault: false
  };

  readonly info: Readonly<TBotModuleInfo>;

  commands: Array<Command> = [];
  isEnabled: boolean = false;
  settings: Settings;

  constructor(protected bot: Bot, moduleInfo: TBotModuleInfo, moduleSettings: Settings) {
    this.info = moduleInfo;
    this.settings = moduleSettings;
  }

  async addCommand(command: Command): Promise<void> {
    this.commands.push(command);

    if (this.isEnabled) {
      await this.bot.commandManager.registerCommand(command);
    }
  }

  async load(): Promise<void> {
    await this.loadSettings();

    for (const command of this.commands) {
      await this.bot.commandManager.registerCommand(command);
    }

    this.isEnabled = true;
  }

  async loadSettings(): Promise<void> {
    const botChannel = this.bot.botConfig.channelName;
    const moduleId = this.info.id;

    const settingsEntity = await ModuleSettingsEntity.findOne({ botChannel, moduleId });

    if (settingsEntity) {
      this.settings = settingsEntity.toModuleSettings();
    }
  }

  async saveSettings(): Promise<void> {
    const settingsEntity = new ModuleSettingsEntity(this.bot.botConfig.channelName, this.info.id, this.settings);

    await settingsEntity.save();
  }

  async unload(): Promise<void> {
    this.isEnabled = true;

    for (const command of this.commands) {
      await this.bot.commandManager.unregisterCommand(command);
    }

    await this.saveSettings();
  }
}
