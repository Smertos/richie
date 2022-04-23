import { Bot } from 'richie/bot';
import { BotModule, BotModuleId } from 'richie/modules/api';
import { TestBotModule } from 'richie/modules/test';
import { TimersBotModule } from 'richie/modules/timers';
import { UtilsBotModule} from 'richie/modules/utils';

export class BotModuleManager {
  private modules: Partial<Record<BotModuleId, BotModule>> = {};

  constructor(protected bot: Bot) { }

  async destroy(): Promise<void> {
    const modules = Object.values(this.modules);

    for (const module of modules) {
      await this.unloadModule(module);
    }
  }

  async init(): Promise<void> {
    await this.loadModule(new TestBotModule(this.bot));
    await this.loadModule(new TimersBotModule(this.bot));
    await this.loadModule(new UtilsBotModule(this.bot));
  }

  async loadModule(module: BotModule): Promise<void> {
    this.modules[module.info.id] = module;

    await module.load();
  }

  async unloadModule(module: BotModule): Promise<void> {
    await module.unload();

    delete this.modules[module.info.id];
  }
}
