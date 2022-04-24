import { Inject, Injectable } from '@nestjs/common';
import { AccessToken, ClientCredentialsAuthProvider, RefreshingAuthProvider } from '@twurple/auth';
import { WINSTON_LOGGER } from 'bot.consts';
import { loadAndDeserializeJson, saveAndSerializeJson } from 'richie/utils';
import winston from 'winston';
import { AuthCacheModel } from './auth-cache.model';
import { authorizeUser } from './authorize-user';

@Injectable()
export class AuthService {
  private readonly cachePath: string = './cache/auth.json';

  private cache?: AuthCacheModel;

  appAuthProvider: ClientCredentialsAuthProvider;
  clientAuthProvider?: RefreshingAuthProvider;

  constructor(@Inject(WINSTON_LOGGER) private logger: winston.Logger) {
    this.appAuthProvider = new ClientCredentialsAuthProvider(
      process.env.TWITCH_CLIENT_ID,
      process.env.TWITCH_CLIENT_SECRET
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

  onTokenRefresh = async (newTokenData: AccessToken | AuthCacheModel): Promise<void> => {
    try {
      this.cache = AuthCacheModel.fromTokenData(newTokenData);

      await saveAndSerializeJson(this.cachePath, this.cache);
    } catch (error) {
      this.logger.error('Failed to save new auth cache');
    }
  };

  makeClientAuthProvider(authCache: AuthCacheModel): RefreshingAuthProvider {
    return new RefreshingAuthProvider(
      {
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        onRefresh: this.onTokenRefresh
      },
      authCache
    );
  }

  async setup(): Promise<void> {
    const loadedCache = await this.loadTokenData();

    for (let attempts = 0; attempts < 3; attempts++) {
      if (loadedCache) {
        this.cache = loadedCache
      } else {
        this.cache = await authorizeUser(this.logger);

        await this.onTokenRefresh(this.cache);
      }

      try {
        const authProvider = this.makeClientAuthProvider(this.cache || loadedCache);
        await authProvider.refresh();

        this.clientAuthProvider = authProvider;
        break;
      } catch (error) {
        this.logger.warn('Poop! Bad auth cache, gotta reauthorize');
      }
    }
  }
}
