import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import config from '@adonisjs/core/services/config'


export default class UpdateNotificationTypeValidator extends Validator {
  public schema = vine.create({
    name: vine.string.optional([ 
      rules.regex(/^[a-zA-Z0-9_-]+$/),
      rules.unique({
        table: 'notification_types',
        column: 'name',
      }),
      rules.maxLength(
        config.get('app.constraints.notificationType.name.maxLength')
      )
    ]),
    displayText: vine.string.optional([
      rules.lengthRange(
        config.get('app.constraints.notificationType.displayText.minLength'),
        config.get('app.constraints.notificationType.displayText.maxLength')
      )
    ]),
    groupName: vine.string.optional([
      rules.lengthRange(
        config.get('app.constraints.notificationType.groupName.minLength'),
        config.get('app.constraints.notificationType.groupName.maxLength')
      )
    ]),
    description: vine.string.optional([
      rules.lengthRange(
        config.get('app.constraints.notificationType.description.minLength'),
        config.get('app.constraints.notificationType.description.maxLength')
      )
    ])
  })
}