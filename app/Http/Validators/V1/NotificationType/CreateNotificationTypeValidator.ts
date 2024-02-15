import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'


export default class CreateNotificationTypeValidator extends Validator {
  public schema = schema.create({
    name: schema.string([ 
      rules.regex(Config.get('app.constraints.notificationType.pattern')),
      rules.unique({
        table: 'notification_types',
        column: 'name',
      }),
      rules.maxLength(
        Config.get('app.constraints.notificationType.name.maxLength')
      )
    ]),
    displayText: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.notificationType.displayText.minLength'),
        Config.get('app.constraints.notificationType.displayText.maxLength')
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