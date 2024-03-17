import { BaseSchema } from "@adonisjs/lucid/schema";

export default class Notifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.json('data').notNullable()
      table
        .integer('notifiable_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamps()
      table.timestamp('read_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
