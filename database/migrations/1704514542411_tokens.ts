import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('key').notNullable().index()
      table.string('type').notNullable()
      table.boolean('one_time').notNullable().defaultTo(false)
      table.jsonb('data').nullable()
      table.string('secret').notNullable()
      table.timestamp('expires_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
