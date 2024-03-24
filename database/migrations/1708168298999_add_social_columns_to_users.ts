import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('social_provider').nullable()
      table.string('social_id').nullable()
      table.string('social_avatar_url').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('social_provider')
      table.dropColumn('social_id')
      table.dropColumn('social_avatar_url')
    })
  }
}
