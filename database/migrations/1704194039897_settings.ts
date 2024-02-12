import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().index().references('users.id').onDelete('CASCADE')

      table.json('two_factor_auth').defaultTo({
        enabled: false,
        method: 'sms',
        secret: null
      })

      table.json('notification_preference').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
