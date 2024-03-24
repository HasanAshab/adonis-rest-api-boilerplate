import { reduce } from 'lodash-es'
import vine from '@vinejs/vine'
import NotificationType from '#models/notification_type'
import NotificationService from '#services/notification_service'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'

export const emailResubscriptionValidator = vine.compile(
  vine.object({
    id: vine.number(),
    token: vine.string(),
    notificationType: vine.string(),
  })
)

export const emailUnsubscriptionValidator = vine.compile(
  vine.object({
    id: vine.number(),
    token: vine.string(),
    notificationType: vine.string(),
  })
)

export const twoFactorAuthMethodValidator = vine.compile(
  vine.object({
    method: vine.enum(twoFactorMethod.names()),
  })
)

export async function updateNotificationPreferenceValidator() {
  const notificationService = new NotificationService()
  const channels = notificationService.channels()
  const notificationTypesId = await NotificationType.pluck('id')

  const schemaDefinition = reduce(
    notificationTypesId,
    (accumulator: Record<string, any>, id) => {
      const channelPreferenceSchema = reduce(
        channels,
        (schemaAccumulator: Record<string, any>, channel) => {
          schemaAccumulator[channel] = vine.boolean()
          return schemaAccumulator
        },
        {}
      )

      accumulator[id] = vine.object(channelPreferenceSchema).optional()
      return accumulator
    },
    {}
  )

  return vine.compile(vine.object(schemaDefinition))
}
