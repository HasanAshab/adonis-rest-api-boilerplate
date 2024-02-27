import Validator from '#app/Http/Validators/Validator'
import { schema, rules } from '@adonisjs/validator'
import Config from '@ioc:Adonis/Core/Config'


export default class UpdateNotificationTypeValidator extends Validator {
  public schema = schema.create({
    name: schema.string.optional([ 
      rules.regex(/^[a-zA-Z0-9_-]+$/),
      rules.unique({
        table: 'notification_types',
        column: 'name',
      }),
      rules.maxLength(
        Config.get('app.constraints.notificationType.name.maxLength')
      )
    ]),
    displayText: schema.string.optional([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.displayText.minLength'),
        Config.get('app.constraints.notificationType.displayText.maxLength')
      )
    ]),
    groupName: schema.string.optional([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.groupName.minLength'),
        Config.get('app.constraints.notificationType.groupName.maxLength')
      )
    ]),
    description: schema.string.optional([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.description.minLength'),
        Config.get('app.constraints.notificationType.description.maxLength')
      )
    ])
  })
}