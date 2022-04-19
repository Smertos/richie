import { Inject, Injectable } from '@nestjs/common';
import { AccessToken, ClientCredentialsAuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { APP_CONFIG, WINSTON_LOGGER } from 'bot.consts';
import { ConfigRoot } from 'richie/config';
import { loadAndDeserializeJson, saveAndSerializeJson } from 'richie/utils';
import winston from 'winston';
import { AuthCacheModel } from './auth-cache.model';
import { authorizeUser } from './authorize-user';

@Injectable()
export class AuthService {
  private readonly cachePath: string = './cache/auth.json';

  private cache: AuthCacheModel = new AuthCacheModel();

  appAuthProvider: ClientCredentialsAuthProvider;
  clientAuthProvider?: RefreshingAuthProvider;

  constructor(
    @Inject(WINSTON_LOGGER) private logger: winston.Logger,
    @Inject(APP_CONFIG) config: ConfigRoot
  ) {
    this.appAuthProvider = new ClientCredentialsAuthProvider(
      config.twitchCommon.clientId,
      config.twitchCommon.clientSecret
    );
  }

  async loadTokenData(): Promise<AuthCacheModel | undefined> {
    try {
      return await loadAndDeserializeJson(this.cachePath, AuthCacheModel);
    } catch (error) {
      this.logger.warn('Failed to load auth cache');

      return undefined;
    }
  }

  onTokenRefresh = async (newTokenData: AccessToken): Promise<void> => {
    try {
      const newCache = AuthCacheModel.fromTokenData(newTokenData);

      await saveAndSerializeJson(this.cachePath, newCache);
    } catch (error) {
      this.logger.error('Failed to save new auth cache');
    }
  };

  async setup(config: ConfigRoot): Promise<void> {
    const { twitchCommon } = config;
    const { clientId, clientSecret } = twitchCommon;

    const loadedCache = await this.loadTokenData();

    if (loadedCache) {
      this.cache = loadedCache;
    }

    const authProvider = new RefreshingAuthProvider(
      {
        clientId,
        clientSecret,
        onRefresh: this.onTokenRefresh
      },
      this.cache
    );

    try {
      await authProvider.refresh();
    } catch (error) {
      this.logger.warn('Poop! Bad auth cache, gotta reauthorize');

      const newTokenData = await authorizeUser(config, this.logger);
      await this.onTokenRefresh(newTokenData);
    }

    this.clientAuthProvider = authProvider;
  }

  get accessToken(): string {
    return this.cache.accessToken;
  }
}
