import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trusted_devices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .string('logged_device_id')
        .notNullable()
        .references('id')
        .inTable('logged_devices')
        .onDelete('CASCADE')
      table.string('ip_address').notNullable()
      table.timestamp('last_logged_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
