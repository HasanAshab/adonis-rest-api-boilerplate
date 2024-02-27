/**
 * Config source: https://git.io/JfefW
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import env from '#start/env/index'
import { defineConfig } from "@adonisjs/core/hash";
import { drivers } from "@adonisjs/core/hash";

/*
|--------------------------------------------------------------------------
| Hash Config
|--------------------------------------------------------------------------
|
| The `HashConfig` relies on the `HashList` interface which is
| defined inside `contracts` directory.
|
*/
export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default hasher
  |--------------------------------------------------------------------------
  |
  | By default we make use of the argon hasher to hash values. However, feel
  | free to change the default value
  |
  */
  default: env.get('HASH_DRIVER', 'bcrypt'),

  list: {
    /*
    |--------------------------------------------------------------------------
    | scrypt
    |--------------------------------------------------------------------------
    |
    | Scrypt mapping uses the Node.js inbuilt crypto module for creating
    | hashes.
    |
    | We are using the default configuration recommended within the Node.js
    | documentation.
    | https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
    |
    */
    'scrypt': drivers.scrypt({
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
      saltSize: 16,
      keyLength: 64,
      maxMemory: 32 * 1024 * 1024,
    }),

    /*
    |--------------------------------------------------------------------------
    | Argon
    |--------------------------------------------------------------------------
    |
    | Argon mapping uses the `argon2` driver to hash values.
    |
    | Make sure you install the underlying dependency for this driver to work.
    | https://www.npmjs.com/package/phc-argon2.
    |
    | npm install phc-argon2
    |
    */
    'argon': drivers.argon2({
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    }),

    /*
    |--------------------------------------------------------------------------
    | Bcrypt
    |--------------------------------------------------------------------------
    |
    | Bcrypt mapping uses the `bcrypt` driver to hash values.
    |
    | Make sure you install the underlying dependency for this driver to work.
    | https://www.npmjs.com/package/phc-bcrypt.
    |
    | npm install phc-bcrypt
    |
    */
    'bcrypt': drivers.bcrypt({
      rounds: 10,
    }),

    /*
    |--------------------------------------------------------------------------
    | Bcrypt Node
    |--------------------------------------------------------------------------
    |
    | Bcrypt Node mapping uses the bcryptjs pkg under the hood to hash values.
    |
    | Make sure you install the underlying dependency for this driver to work.
    | https://www.npmjs.com/package/bcryptjs.
    |
    | npm install bcryptjs
    |
    */
    'bcrypt-node': {
      driver: 'bcrypt-node',
      rounds: 1,
    },
  },
})


declare module '@adonisjs/core/types' {
  export interface HashersList extends InferHashers<typeof hashConfig> { }
}
