import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'
import NotificationType from '#models/notification_type'
import NotificationService from '#app/services/notification_service'
import { TwoFactorMethod } from '@ioc:adonis/addons/auth/two_factor'


export const emailResubscriptionValidator = vine.compile(
  vine.object({
    id: vine.number(),
    token: vine.string(),
    notificationType: vine.string()
  })
)


export const emailUnsubscriptionValidator = vine.compile(
  vine.object({
    id: vine.number(),
    token: vine.string(),
    notificationType: vine.string()
  })
)


export const twoFactorAuthMethodValidator = vine.compile(
  vine.object({
    method: vine.enum(TwoFactorMethod.names())
  })
)


export async function updateNotificationPreferenceValidator() {
  const notificationService = new NotificationService
  const channels = notificationService.channels()
  const notificationTypesId = await NotificationType.pluck('id')

  const schemaDefinition = reduce(notificationTypesId, (accumulator, id) => {
    const channelPreferenceSchema = reduce(channels, (schemaAccumulator, channel) => {
      schemaAccumulator[channel] = vine.boolean()
      return schemaAccumulator
    }, {})
  
    accumulator[id] = vine.object(channelPreferenceSchema).optional()
    return accumulator
  }, {})

  return vine.compile(vine.object(schemaDefinition))
}

