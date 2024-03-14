import { BaseCommand } from "@adonisjs/core/ace";
import { args } from "@adonisjs/core/ace";


export default class FactorySeedDatabase extends BaseCommand {
  public static commandName = 'db:seedFactory'
  public static settings = { loadApp: true }

  @args.string()
  declare modelPath: string
  
  @args.string({
    parse: value => parseInt(value)
  })
  declare count: number

  public async run() {
    const { default: Model } = await import(this.modelPath)
    await Model.factory().count(this.count).create()
    this.logger.success('Seeded successfully!')
  }
}
