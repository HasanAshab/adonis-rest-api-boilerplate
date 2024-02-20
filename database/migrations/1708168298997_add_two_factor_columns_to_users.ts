import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { TwoFactorMethod } from '@ioc:Adonis/Addons/Auth/TwoFactor'


export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('two_factor_enabled').defaultTo(true)
      table.enum('two_factor_method', TwoFactorMethod.names()).nullable()
      table.string('two_factor_secret').nullable()
      table.text('two_factor_recovery_codes').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('two_factor_enabled')
      table.dropColumn('two_factor_method')
      table.dropColumn('two_factor_secret')
      table.dropColumn('two_factor_recovery_codes')
    })
  }
}
