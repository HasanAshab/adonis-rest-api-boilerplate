import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'
import { reduce } from 'lodash'
import NotificationType from '#app/models/notification_type'
import NotificationService from '#app/services/notification_service'


export default async function UpdateNotificationPreferenceValidator() {
  const notificationService = new NotificationService
  const channels = notificationService.channels()
  const notificationTypesId = await NotificationType.pluck('id')

  const schemaDefinition = reduce(notificationTypesId, (accumulator, id) => {
    const channelPreferenceSchema = reduce(channels, (schemaAccumulator, channel) => {
      schemaAccumulator[channel] = vine.boolean()
      return schemaAccumulator
    }, {})
  
    accumulator[id] = vine.object.optional().members(channelPreferenceSchema)
    return accumulator
  }, {})

  return class extends Validator {
    public schema = vine.create(schemaDefinition)
  }
}
