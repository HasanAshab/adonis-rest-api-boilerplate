import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import config from '@adonisjs/core/services/config'


export default class CreateNotificationTypeValidator extends Validator {
  public schema = vine.create({
    name: vine.string([ 
      rules.regex(config.get('app.constraints.notificationType.pattern')),
      rules.unique({
        table: 'notification_types',
        column: 'name',
      }),
      rules.maxLength(
        config.get('app.constraints.notificationType.name.maxLength')
      )
    ]),
    displayText: vine.string([
      rules.lengthRange(
        config.get('app.constraints.notificationType.displayText.minLength'),
        config.get('app.constraints.notificationType.displayText.maxLength')
      )
    ]),
    groupName: vine.string([
      rules.lengthRange(
        config.get('app.constraints.notificationType.groupName.minLength'),
        config.get('app.constraints.notificationType.groupName.maxLength')
      )
    ]),
    description: vine.string([
      rules.lengthRange(
        config.get('app.constraints.notificationType.description.minLength'),
        config.get('app.constraints.notificationType.description.maxLength')
      )
    ])
  })
}