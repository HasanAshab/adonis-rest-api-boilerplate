import { BaseCommand } from "@adonisjs/core/ace";
import { args } from "@adonisjs/core/ace";
//import Cache from 'cache'

export default class ClearCache extends BaseCommand {
  public static commandName = 'clear:cache'
  public static settings = { loadApp: true }

  @args.string()
  declare driver: string

  public async run() {
    await Cache.driver(this.driver).flush()
    this.logger.success('Cache cleared successfully!')
  }
}
