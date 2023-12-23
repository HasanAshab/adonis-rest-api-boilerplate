/**
 * Config source: https://git.io/JY0mp
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import type { AuthConfig } from '@ioc:Adonis/Addons/Auth'
import Env from "@ioc:Adonis/Core/Env";

/*
|--------------------------------------------------------------------------
| Authentication Mapping
|--------------------------------------------------------------------------
|
| List of available authentication mapping. You must first define them
| inside the `contracts/auth.ts` file before mentioning them here.
|
*/
const authConfig: AuthConfig = {
  guard: 'api',
  guards: {
    api: {
      driver: "jwt",
      publicKey: Env.get('JWT_PUBLIC_KEY', '').replace(/\\n/g, '\n'),
      privateKey: Env.get('JWT_PRIVATE_KEY', '').replace(/\\n/g, '\n'),
      persistJwt: false,
      jwtDefaultExpire: '30d',
      refreshTokenDefaultExpire: '30d',
      tokenProvider: {
        type: 'api',
        driver: 'mongo',
        table: 'jwt_tokens',
        foreignKey: 'user_id'
      },
      provider: {
        driver: "mongo",
        uids: ["email"],
        model: () => import('App/Models/User')
      }
    },
  },
}

export default authConfig
