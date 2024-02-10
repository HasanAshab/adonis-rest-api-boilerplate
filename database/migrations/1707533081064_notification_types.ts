import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'notification_types'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type').unique().notNullable()
      table.string('name').notNullable()
      table.string('description').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
