import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'login_sessions'

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
        .integer('access_token_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('auth_access_tokens')
        .onDelete('CASCADE')
      table
        .string('login_device_id')
        .notNullable()
        .references('id')
        .inTable('login_devices')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}