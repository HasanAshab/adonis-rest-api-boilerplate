import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class FactorySeedDatabase extends BaseCommand {
  static commandName = 'db:seedFactory'
  static options: CommandOptions = { startApp: true }

  @args.string()
  declare modelPath: string

  @args.string()
  declare count: string

  async run() {
    const { default: Model } = await import(this.modelPath)
    await Model.factory().count(Number.parseInt(this.count)).create()
    this.logger.success('Seeded successfully!')
  }
}
