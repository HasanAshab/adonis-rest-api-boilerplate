import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('two_factor_secret').nullable()
      table.enum('two_factor_method', ['app', 'sms', 'call']).nullable()
      table.text('two_factor_recovery_codes').nullable()
    })
  }

  public async down () {
    this.schema.dropColumn('two_factor_secret')
    this.schema.dropColumn('two_factor_method')
    this.schema.dropColumn('two_factor_recovery_codes')
  }
}
