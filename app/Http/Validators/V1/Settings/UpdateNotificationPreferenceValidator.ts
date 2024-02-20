import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'
import { reduce } from 'lodash'
import NotificationType from 'App/Models/NotificationType'
import NotificationService from 'App/Services/NotificationService'


export default async function UpdateNotificationPreferenceValidator() {
  const notificationService = new NotificationService
  const channels = notificationService.channels()
  const notificationTypesId = await NotificationType.pluck('id')

  const schemaDefinition = reduce(notificationTypesId, (accumulator, id) => {
    const channelPreferenceSchema = reduce(channels, (schemaAccumulator, channel) => {
      schemaAccumulator[channel] = schema.boolean()
      return schemaAccumulator
    }, {})
  
    accumulator[id] = schema.object.optional().members(channelPreferenceSchema)
    return accumulator
  }, {})

  return class extends Validator {
    public schema = schema.create(schemaDefinition)
  }
}
