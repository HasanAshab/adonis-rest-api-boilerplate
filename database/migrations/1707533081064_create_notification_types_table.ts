import config from '@adonisjs/core/services/config'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .string('name', config.get('app.constraints.notificationType.name.maxLength'))
        .unique()
        .notNullable()
      table
        .string(
          'display_text',
          config.get('app.constraints.notificationType.displayText.maxLength')
        )
        .notNullable()
      table
        .string('group_name', config.get('app.constraints.notificationType.groupName.maxLength'))
        .notNullable()
      table
        .string('description', config.get('app.constraints.notificationType.description.maxLength'))
        .notNullable()
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
