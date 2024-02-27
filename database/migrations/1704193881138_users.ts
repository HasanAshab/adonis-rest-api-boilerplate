import Config from '@ioc:Adonis/Core/Config'
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', Config.get('app.user.name.maxLength')).nullable()
      table.string('username', Config.get('app.user.username.maxLength')).unique().nullable().index()
      table.string('email').unique().nullable().index()
      table.string('phone_number').nullable()
      table.enum('role', ['user', 'admin']).notNullable()
      table.boolean('verified').notNullable()
      table.string('password').nullable()
      table.json('avatar').nullable()

      table.string('social_provider').nullable()
      table.string('social_id').nullable()
      table.string('social_avatar_url').nullable()
      
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
