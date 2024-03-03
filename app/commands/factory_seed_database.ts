import { Command } from 'samer-artisan'
import { model } from 'mongoose'
import DB from 'db'
import DatabaseSeeder from '~/database/seeders/database_seeder'
import { HasFactoryModel } from '~/app/plugins/has_factory'

interface Arguments {
  modelName: string
  count: string
}

export default class FactorySeedDatabase extends Command<Arguments> {
  signature = 'db:seedFactory {modelName} {count}'

  async handle() {
    await DB.connect()
    const { modelName, count } = this.arguments()
    const Model = model<any, HasFactoryModel>(modelName)
    await Model.factory().count(parseInt(count)).create()
    this.info('Seeded successfully!')
  }
}
