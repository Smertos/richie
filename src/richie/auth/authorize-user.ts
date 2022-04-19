import { MakeOptional } from '@d-fischer/shared-utils';
import express from 'express';
import { Request, Response } from 'express/ts4.0';
import { Passport } from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { ConfigRoot } from 'richie/config';
import winston from 'winston';
import { AuthCacheModel } from './auth-cache.model';
import { getAllScopes } from './scopes';

class TwitchOAuth2Strategy extends OAuth2Strategy {
  static readonly strategyName: string = 'twitch';

  constructor(
    options: Omit<OAuth2Strategy.StrategyOptions, 'authorizationURL' | 'tokenURL'>,
    verify: OAuth2Strategy.VerifyFunction
  ) {
    super({
      ...options,
      authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
      tokenURL: 'https://id.twitch.tv/oauth2/token',
    }, verify);

    this.name = TwitchOAuth2Strategy.strategyName;

    this._oauth2.setAuthMethod('Bearer');
    this._oauth2.useAuthorizationHeaderforGET(true);
  }
}

const callbackRoute = '/callback';
const loginRoute = '/login';

export async function authorizeUser(config: ConfigRoot, logger: winston.Logger): Promise<AuthCacheModel> {
  const { authCallbackHost, authCallbackPort, twitchCommon } = config;

  const authClientProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const authClientBaseURL = `${authClientProtocol}://${authCallbackHost}:${authCallbackPort}`;
  const callbackURL = `${authClientBaseURL}${callbackRoute}`;
  const loginURL = `${authClientBaseURL}${loginRoute}`;

  return new Promise((resolve) => {
    const app = express();
    const server = app.listen(authCallbackPort, authCallbackHost);
    const passport = new Passport();

    const oauthStrategy = new TwitchOAuth2Strategy({
      callbackURL,
      clientID: twitchCommon.clientId,
      clientSecret: twitchCommon.clientSecret,
      scope: getAllScopes()
    }, (accessToken: string, refreshToken: string) => {
      const newTokenData = new AuthCacheModel();
      newTokenData.accessToken = accessToken;
      newTokenData.refreshToken = refreshToken;

      server.close();

      resolve(newTokenData);
    });

    passport.use(oauthStrategy);

    app.get(loginRoute, passport.authenticate(TwitchOAuth2Strategy.strategyName));

    app.get(
      callbackRoute,
      passport.authenticate(TwitchOAuth2Strategy.strategyName, { failureRedirect: '/login' }),
      (request: Request, response: Response) => {
        response.end('Login is successful, you can close this browser tab');
      }
    );

    logger.info('Authorization required. Go to %s and login with bot account', loginURL);
  });

}
