import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('key').index()
      table.string('type')
      table.jsonb('data').nullable()
      table.string('secret')
      table.timestamp('expires_at', { useTz: true })
    });
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
