import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'login_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('ip')
      table
        .integer('access_token_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('auth_access_tokens')
        .onDelete('CASCADE')
      table
        .string('device_id')
        .notNullable()
        .references('id')
        .inTable('login_devices')
        .onDelete('CASCADE')
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}