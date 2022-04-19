import { NestFactory } from '@nestjs/core';
import { EventSubChannelUpdateEvent, EventSubMiddleware } from '@twurple/eventsub';
import { EVENTSUB_MIDDLEWARE } from 'bot.consts';
import dotenv from 'dotenv';
import { mkdir } from 'fs/promises';
import { WinstonLogger } from 'nest-winston';
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

  const appPort = +process.env.APP_PORT;
  await app.listen(appPort, async () => {
    await eventSubMiddleware.markAsReady();

    logger.log(`API started at http://127.0.0.1:${appPort}`);
  });
}

void startRichie();
