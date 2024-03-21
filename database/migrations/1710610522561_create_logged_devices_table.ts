import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'logged_devices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('type').nullable()
      table.string('vendor').nullable()
      table.string('model').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
