import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Config from '@ioc:Adonis/Core/Config'


export default class extends BaseSchema {
  protected tableName = 'notification_types'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('type', Config.get('app.constraints.notificationType.type.maxLength')).unique().notNullable()
      table.string('name', Config.get('app.constraints.notificationType.name.maxLength')).notNullable()
      table.string('group_name', Config.get('app.constraints.notificationType.groupName.maxLength')).notNullable()
      table.string('description', Config.get('app.constraints.notificationType.description.maxLength')).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
