import { ApiClient } from '@twurple/api';
import { ChatClient, PrivateMessage } from '@twurple/chat';
import { EventSubChannelBanEvent, EventSubMiddleware, EventSubSubscription } from '@twurple/eventsub';
import { Locale } from 'date-fns';
import { i18n } from 'i18next';
import { Connection } from 'typeorm';
import winston from 'winston';
import { AuthService } from './auth';
import { ConfigBot } from './config';
import { BotModuleManager, CommandManager, MessageTimerManager } from './managers';
import { Command } from './models';

export class Bot {
  private hasSentStartupMessage: boolean = false;

  public readonly botModuleManager: BotModuleManager;
  public readonly commandManager: CommandManager;
  public readonly messageTimerManager: MessageTimerManager;

  channelOwnerUserId: string = '0';
  dateFnsLocale?: Locale;
  ircChannelName: string;
  subscriptions: Array<EventSubSubscription> = [];

  constructor(
    public apiClient: ApiClient,
    public authService: AuthService,
    public botConfig: ConfigBot,
    public chatClient: ChatClient,
    public dbConnection: Connection,
    public eventSubMiddleware: EventSubMiddleware,
    public i18n: i18n,
    public logger: winston.Logger
  ) {
    if (!authService.clientAuthProvider) {
      logger.warn(
        'authProvider is undefined, bot for channel \'%s\' will start in read-only mode :|',
        botConfig.channelName
      );
    }

    this.botModuleManager = new BotModuleManager(this);
    this.commandManager = new CommandManager(this);
    this.messageTimerManager = new MessageTimerManager(this);

    this.ircChannelName = '#' + botConfig.channelName;

    this.chatClient.onAuthenticationFailure(this.onFailedToAuthenticate);
    this.chatClient.onJoin(this.onChannelJoin);
    this.chatClient.onMessage(this.onMessage);
  }

  onChannelJoin = async (channel: string): Promise<void> => {
    if (channel !== this.ircChannelName) {
      return;
    }

    if (!this.hasSentStartupMessage) {
      const startupMessage = this.i18n.t('app.startup-message');
      await this.chatClient.say(this.botConfig.channelName, startupMessage);

      this.hasSentStartupMessage = true;
    }
  };

  onFailedToAuthenticate = async (channel: string): Promise<void> => {
    if (channel !== this.ircChannelName) {
      return;
    }

    this.logger.error('Failed to authenticate for channel %s', this.botConfig.channelName);
  };

  onMessage = (channel: string, user: string, message: string, _event: PrivateMessage) => {
    if (channel !== this.ircChannelName) {
      return;
    }

    this.logger.debug(`<${user}>: ${message}`);

    if (message && message.startsWith(Command.prefix)) {
      const [commandSlug, ...commandArgs] = message.slice(1).split(' ');

      this.commandManager.onCommand(user, commandSlug, commandArgs);
    }
  };

  async panic(message: string): Promise<void> {
    console.error(`PANIC: ${message}`);
    await this.destroy();
  }

  async start(): Promise<void> {
    // Load date locale for bot
    try {
      this.dateFnsLocale = await import(`date-fns/locale/${this.botConfig.locale}`);
    } catch (error) {
      await this.panic(`Failed to find date-fns locale '${this.botConfig.locale}'`);

      return;
    }

    await this.botModuleManager.init();

    const channelOwner = await this.apiClient.users.getUserByName(this.botConfig.channelName);

    if (!channelOwner) {
      await this.panic(`Couldn't find user with name '${this.botConfig.channelName}'`);

      return;
    }

    this.channelOwnerUserId = channelOwner.id;

    // const sub = await this.eventSubMiddleware.subscribeToChannelBanEvents(this.channelOwnerUserId, (event: EventSubChannelBanEvent) => {
    //   console.log(event);
    // });

    // this.subscriptions.push(sub);

    this.logger.info('Started bot for channel %s', this.botConfig.channelName);
  }

  async destroy(): Promise<void> {
    this.logger.info('Shutting down bot for channel %s', this.botConfig.channelName);

    if (this.chatClient.isConnected) {
      const shutdownMessage = this.i18n.t('app.shutdown-message');
      await this.chatClient.say(this.botConfig.channelName, shutdownMessage);
    }

    for (const subscription of this.subscriptions) {
      await subscription.stop();
    }

    await this.botModuleManager.destroy();
  }
}
