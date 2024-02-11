import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'


export default class CreateNotificationTypeValidator extends Validator {
  public schema = schema.create({
    type: schema.string([ 
      rules.alphaNum(),
      rules.unique({
        table: 'notification_types',
        column: 'type',
      }),
      rules.maxLength(
        Config.get('app.constraints.notificationType.type.maxLength')
      )
    ]),
    name: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.name.minLength'),
        Config.get('app.constraints.notificationType.name.maxLength')
      )
    ]),
    groupName: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.groupName.minLength'),
        Config.get('app.constraints.notificationType.groupName.maxLength')
      )
    ]),
    description: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.description.minLength'),
        Config.get('app.constraints.notificationType.description.maxLength')
      )
    ])
  })
}