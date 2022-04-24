import express from 'express';
import { Request, Response } from 'express/ts4.0';
import { Passport } from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { APP_AUTH_PORT } from 'bot.consts';
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

export async function authorizeUser(logger: winston.Logger): Promise<AuthCacheModel> {
  const authClientProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const authClientBaseURL = `${authClientProtocol}://${process.env.PUBLIC_HOSTNAME}:${APP_AUTH_PORT}`;
  const callbackURL = `${authClientBaseURL}${callbackRoute}`;
  const loginURL = `${authClientBaseURL}${loginRoute}`;

  return new Promise((resolve) => {
    const app = express();
    const server = app.listen(APP_AUTH_PORT, process.env.PUBLIC_HOSTNAME);
    const passport = new Passport();

    const oauthStrategy = new TwitchOAuth2Strategy({
      callbackURL,
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      scope: getAllScopes()
    }, (accessToken: string, refreshToken: string) => {
      const newTokenData = new AuthCacheModel();
      newTokenData.accessToken = accessToken;
      newTokenData.refreshToken = refreshToken;
      newTokenData.scope = getAllScopes();

      server.close();

      resolve(newTokenData);
    });

    passport.use(oauthStrategy);

    app.get(loginRoute, passport.authenticate(TwitchOAuth2Strategy.strategyName));

    app.get(
      callbackRoute,
      passport.authenticate(TwitchOAuth2Strategy.strategyName, { failureRedirect: loginRoute }),
      (_request: Request, response: Response) => {
        response.write('Login is successful, you can close this browser tab');
        response.end();
      }
    );

    logger.info('Authorization required. Go to %s and login with bot account', loginURL);
  });

}
