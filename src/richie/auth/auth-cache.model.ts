import type { MakeOptional } from '@d-fischer/shared-utils';
import type { AccessToken } from '@twurple/auth';
import { plainToInstance } from 'class-transformer';

export class AuthCacheModel implements MakeOptional<AccessToken, 'accessToken' | 'scope'> {
  accessToken: string = '';
  expiresIn: number | null = null;
  obtainmentTimestamp: number = 0;
  refreshToken: string | null = null;
  scope: Array<string> = [];

  static fromTokenData(tokenData: AccessToken): AuthCacheModel {
    return plainToInstance(AuthCacheModel, tokenData);
  }
}
