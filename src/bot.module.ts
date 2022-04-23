import { Module, Provider } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiClient } from '@twurple/api';
import { ChatClient } from '@twurple/chat';
import { EventSubMiddleware } from '@twurple/eventsub';
import { WinstonLogger } from 'nest-winston';
import { connect } from 'ngrok';
import { AuthService } from 'richie/auth';
import { ConfigBot, ConfigRoot, loadConfig } from 'richie/config';
import { setupDatabaseConnection } from 'richie/db';
import { setupI18n } from 'richie/i18n';
import { setupChatClientLogger, setupWinstonLogger } from 'richie/logging';
import { apiModules } from 'richie/modules';
import winston from 'winston';
import { APP_CONFIG, AUTH_SERVICE, DB_CONNECTION, EVENTSUB_MIDDLEWARE, HTTP_SERVER, I18N, TWITCH_API_CLIENT, TWITCH_CHAT_CLIENT, WINSTON_LOGGER } from './bot.consts';
import { BotManager } from './bot.manager';

const manualProviders: Array<Provider> = [
  {
    provide: WINSTON_LOGGER,
    useFactory: setupWinstonLogger
  },
  {
    provide: I18N,
    useFactory: setupI18n
  },
  {
    inject: [WINSTON_LOGGER],
    provide: DB_CONNECTION,
    useFactory: setupDatabaseConnection
  },
  {
    inject: [WINSTON_LOGGER],
    provide: WinstonLogger,
    useFactory: (logger: winston.Logger) => new WinstonLogger(logger)
  },
  {
    inject: [HttpAdapterHost],
    provide: HTTP_SERVER,
    useFactory: (httpAdapterHost: HttpAdapterHost) => {
      return httpAdapterHost.httpAdapter.getHttpServer();
    }
  },
  {
    inject: [WINSTON_LOGGER],
    provide: APP_CONFIG,
    useFactory: (logger: winston.Logger) => loadConfig(logger)
  },
  {
    inject: [WINSTON_LOGGER, APP_CONFIG],
    provide: AUTH_SERVICE,
    useFactory: async (logger: winston.Logger, config: ConfigRoot) => {
      const authService = new AuthService(logger);
      await authService.setup(config);

      return authService;
    }
  },
  {
    inject: [WINSTON_LOGGER, APP_CONFIG, AUTH_SERVICE],
    provide: TWITCH_CHAT_CLIENT,
    useFactory: async (logger: winston.Logger, config: ConfigRoot, authService: AuthService) => {
      const channelNames = config.bots.map((channelConfig: ConfigBot) => channelConfig.channelName);

      const chatClient = new ChatClient({
        authProvider: authService.clientAuthProvider,
        botLevel: 'none',
        channels: channelNames,
        logger: setupChatClientLogger(logger),
        webSocket: true
      });

      return chatClient;
    }
  },
  {
    inject: [WINSTON_LOGGER, AUTH_SERVICE],
    provide: TWITCH_API_CLIENT,
    useFactory: (logger: winston.Logger, authService: AuthService) => {
      return new ApiClient({
        authProvider: authService.appAuthProvider,
        logger: setupChatClientLogger(logger)
      });
    }
  },
  {
    inject: [TWITCH_API_CLIENT],
    provide: EVENTSUB_MIDDLEWARE,
    useFactory: async (apiClient: ApiClient) => {
      const isDevelopment = process.env.ENVIRONMENT === 'development';
      const hostName = isDevelopment
        ? await connect({ addr: +process.env.APP_PORT }).then(url => url.replace(/^https?:\/\/|\/$/, ''))
        : process.env.PUBLIC_HOSTNAME;

      console.log('hostname:', hostName);

      return new EventSubMiddleware({
        apiClient,
        hostName,
        pathPrefix: '/eventsub',
        secret: process.env.EVENTSUB_SECRET
      });
    }
  },
];

@Module({
  imports: [
    ...apiModules
  ],
  providers: [
    ...manualProviders,
    AuthService,
    BotManager
  ]
})
export class BotModule { }
