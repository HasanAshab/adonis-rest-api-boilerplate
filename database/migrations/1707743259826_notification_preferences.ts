import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_preferences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('notification_type_id')
        .unsigned()
        .references('id')
        .inTable('notification_types')
        .onDelete('CASCADE')
      table.specificType('channels', 'TEXT[]').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
