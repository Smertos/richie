export const enum BotModuleId {
  Default = 'DEFAULT',
  Test = 'TEST',
  Timers = 'TIMERS',
  Utils = 'UTILS'
}

export type TBotModuleInfo = {
  description?: string;
  id: BotModuleId;
  name: string;
  namePretty?: string;
};

export type TBotModuleSettings = {
  enabledByDefault: boolean;
};
