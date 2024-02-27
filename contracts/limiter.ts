/**
 * Contract source: https://bit.ly/3IPyj8d
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type defineConfig from '../config/limiter.js'

declare module '@adonisjs/limiter/build/services/index' {
  type Config = (typeof defineConfig)['stores']

  /**
   * Compute limiter stores from the config file
   */
  export interface LimiterStores extends Config {}
}
