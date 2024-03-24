import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'

const notificationTypeSchema = vine.object({
  name: vine
    .string()
    .regex(config.get('app.constraints.notificationType.pattern'))
    .maxLength(config.get('app.constraints.notificationType.name.maxLength'))
    .minLength(config.get('app.constraints.notificationType.name.minLength'))
    .unique('notification_types.name'),

  displayText: vine
    .string()
    .maxLength(config.get('app.constraints.notificationType.displayText.maxLength'))
    .minLength(config.get('app.constraints.notificationType.displayText.minLength')),

  groupName: vine
    .string()
    .maxLength(config.get('app.constraints.notificationType.groupName.maxLength'))
    .minLength(config.get('app.constraints.notificationType.groupName.minLength')),

  description: vine
    .string()
    .maxLength(config.get('app.constraints.notificationType.description.maxLength'))
    .minLength(config.get('app.constraints.notificationType.description.minLength')),
})

export const createNotificationTypeValidator = vine.compile(notificationTypeSchema.clone())

export const updateNotificationTypeValidator = vine.compile(
  notificationTypeSchema.clone().optional()
)
