import { copyFile, unlink } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

export default class DocsGenerate extends BaseCommand {
  static commandName = 'docs:generate'
  static description = 'Generate swagger docs yaml'
  
  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  async run() {
    const Router = await this.app.container.make('router')
    Router.commit()
    await AutoSwagger.default.writeFile(Router.toJSON(), swagger)
    await copyFile(
      app.makePath('swagger.yml'),
      app.makePath('build/swagger.yml')
    )
    await unlink(app.makePath('swagger.json'))
  }
}