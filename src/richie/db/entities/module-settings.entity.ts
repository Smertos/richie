import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { BotModuleId, TBotModuleSettings } from 'richie/modules/api/types';

@Entity()
export class ModuleSettingsEntity extends BaseEntity {

  @PrimaryColumn()
  botChannel: string;

  @PrimaryColumn()
  moduleId: BotModuleId;

  @Column()
  moduleSettings: string;

  constructor(
    botChannel: string,
    moduleId: BotModuleId,
    moduleSettings: TBotModuleSettings
  ) {
    super();

    this.botChannel = botChannel;
    this.moduleId = moduleId;
    this.moduleSettings = JSON.stringify(moduleSettings);
  }

  toModuleSettings<Settings extends TBotModuleSettings>(): Settings {
    return JSON.parse(this.moduleSettings);
  }
}
