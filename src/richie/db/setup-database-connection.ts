import { createConnection, Connection, getConnectionOptions } from 'typeorm';
import { Logger } from 'winston';
import * as entities from './entities';

const entitiesList: Array<Function> = Object.values(entities);

export async function setupDatabaseConnection(logger: Logger): Promise<Connection> {
  const dbConnectionOptions = await getConnectionOptions();
  const dbConnection = await createConnection({
    ...dbConnectionOptions,
    entities: entitiesList
  });

  logger.info('Connected to database');

  return dbConnection;
}
