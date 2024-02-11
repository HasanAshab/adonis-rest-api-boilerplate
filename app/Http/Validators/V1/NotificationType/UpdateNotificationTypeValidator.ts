import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'


export default class UpdateNotificationTypeValidator extends Validator {
  public schema = schema.create({
    type: schema.string.optional([ 
      rules.alphaNum(),
      rules.unique({
        table: 'notification_types',
        column: 'type',
      }),
      rules.maxLength(
        Config.get('app.constraints.notificationType.type.maxLength')
      )
    ]),
    name: schema.string.optional([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.name.minLength'),
        Config.get('app.constraints.notificationType.name.maxLength')
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