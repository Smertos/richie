import { Inject, Injectable } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { ChatClient } from '@twurple/chat';
import { EventSubMiddleware } from '@twurple/eventsub';
import i18next from 'i18next';
import { AuthService } from 'richie/auth';
import { Bot } from 'richie/bot';
import { ConfigRoot } from 'richie/config';
import { Connection } from 'typeorm';
import winston from 'winston';
import { APP_CONFIG, AUTH_SERVICE, DB_CONNECTION, EVENTSUB_MIDDLEWARE, TWITCH_API_CLIENT, TWITCH_CHAT_CLIENT, WINSTON_LOGGER } from './bot.consts';

@Injectable()
export class BotManager {
  private readonly bots: Map<string, Bot> = new Map<string, Bot>();

  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    @Inject(TWITCH_API_CLIENT) private apiClient: ApiClient,
    @Inject(TWITCH_CHAT_CLIENT) private chatClient: ChatClient,
    @Inject(APP_CONFIG) private config: ConfigRoot,
    @Inject(DB_CONNECTION) private dbConnection: Connection,
    @Inject(EVENTSUB_MIDDLEWARE) private eventSubMiddleware: EventSubMiddleware,
    @Inject(WINSTON_LOGGER) private logger: winston.Logger,
  ) { }

  async destroy(): Promise<void> {
    for (const bot of this.bots.values()) {
      await bot.destroy();
    }
  }

  getBot(channelName: string): Bot | undefined {
    return this.bots.get(channelName);
  }

  async start(): Promise<void> {
    for (const botConfig of this.config.bots) {
      const i18nClone = i18next.cloneInstance({
        lng: botConfig.locale
      });

      const bot = new Bot(
        this.apiClient,
        this.authService,
        botConfig,
        this.chatClient,
        this.dbConnection,
        this.eventSubMiddleware,
        i18nClone,
        this.logger
      );

      await bot.start();

      this.bots.set(botConfig.channelName, bot);
    }
  }

  // Will be called by NestJS
  async onApplicationShutdown(): Promise<void> {
    this.logger.info('Gracefully shutting down...');

    for (const bot of this.bots.values()) {
      await bot.destroy();
    }

    if (this.chatClient) {
      await this.chatClient.quit();
    }

    await this.dbConnection.close();

    this.logger.info('bye-bye :)');
  }
}
