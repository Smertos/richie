// Says NodeJS & ProcessEnv are unused, which is not true
/* eslint-disable */

namespace NodeJS {
  interface ProcessEnv {
    ENVIRONMENT: string;
    EVENTSUB_SECRET: string;
    LOCAL_HOSTNAME: string;
    PUBLIC_AUTH_PORT: string;
    PUBLIC_HOSTNAME: string;
    TWITCH_CLIENT_ID: string;
    TWITCH_CLIENT_SECRET: string;
  }
}
