/**
 * Config source: https://git.io/JOdi5
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import env from '#start/env/index'
import { AllyConfig } from "@adonisjs/ally";
import { defineConfig } from "@adonisjs/ally";
import { services } from "@adonisjs/ally";

/*
|--------------------------------------------------------------------------
| Ally Config
|--------------------------------------------------------------------------
|
| The `AllyConfig` relies on the `SocialProviders` interface which is
| defined inside `contracts/ally.ts` file.
|
*/
const allyConfig = defineConfig({
  /*
    |--------------------------------------------------------------------------
    | Google driver
    |--------------------------------------------------------------------------
    */
  google: drivers.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:8000/api/v1/auth/social/callback/google',
  }),

  /*
  |--------------------------------------------------------------------------
  | Facebook driver
  |--------------------------------------------------------------------------
  */
  facebook: drivers.facebook({
    clientId: env.get('FACEBOOK_CLIENT_ID'),
    clientSecret: env.get('FACEBOOK_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:8000/api/v1/auth/social/callback/facebook',
  }),
})

export default allyConfig


declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> { }
}
