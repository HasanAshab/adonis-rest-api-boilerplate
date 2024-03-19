import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
//import Cache from 'cache'

export default class ClearCache extends BaseCommand {
  static commandName = 'clear:cache'
  static options: CommandOptions = { startApp: true }

  @args.string()
  declare driver: string

  async run() {
    await Cache.driver(this.driver).flush()
    this.logger.success('Cache cleared successfully!')
  }
}
