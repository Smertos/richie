import { loadAndDeserializeJson } from 'richie/utils';
import { Logger } from 'winston';
import { ConfigRoot } from './config-root';

export async function loadConfig(logger: Logger): Promise<ConfigRoot> {
  const configPath = './config.json';

  try {
    return await loadAndDeserializeJson(configPath, ConfigRoot);
  } catch (error) {
    logger.error('Config file is not found at \'%s\'', configPath);

    throw error;
  }
}
