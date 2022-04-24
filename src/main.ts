import { NestFactory } from '@nestjs/core';
import { EventSubMiddleware } from '@twurple/eventsub';
import dotenv from 'dotenv';
import { mkdir } from 'fs/promises';
import { WinstonLogger } from 'nest-winston';
import { APP_PORT, EVENTSUB_MIDDLEWARE } from './bot.consts';
import { BotManager } from './bot.manager';
import { BotModule } from './bot.module';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

// Load environment variables from .env
dotenv.config();

async function startRichie(): Promise<void> {
  // Ensure used paths exist
  await mkdir('./cache', { recursive: true });

  const expressApp = express();
  const expressAdapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(BotModule, expressAdapter, {
    logger: ['warn', 'error']
  });

  await app.init();

  app.enableShutdownHooks();

  // Use app's logger for nestjs
  const logger = app.get(WinstonLogger);
  app.useLogger(logger);

  // Use special middleware to provide callback endpoint for twitch's eventsub
  const eventSubMiddleware = app.get<EventSubMiddleware>(EVENTSUB_MIDDLEWARE);
  eventSubMiddleware.apply(expressApp);

  await app.get(BotManager).start();

  await app.listen(APP_PORT, process.env.LOCAL_HOSTNAME, async () => {
    await eventSubMiddleware.markAsReady();

    const isProduction = process.env.ENVIRONMENT !== 'development';
    const scheme = isProduction ? 'https' : 'http';

    logger.log(`API started at ${scheme}://${process.env.PUBLIC_HOSTNAME}/api`);
  });
}

void startRichie();
