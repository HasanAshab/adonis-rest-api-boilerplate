import Config from '@ioc:Adonis/Core/Config'
import { schema } from '@ioc:Adonis/Core/Validator'
import NotificationType from 'App/Models/NotificationType'
import { reduce } from 'lodash'


export default class NotificationService {
  public channels() {
    return Object.keys(Config.get('notification.channels'))
  }
  
  public defaultChannelPreferences(enabled = true) {
    return this.channels().reduce((channelPreference, channel) => {
      channelPreference[channel] = enabled
      return channelPreference
    }, {})
  }
  
  public async preferenceValidator() {
    const channels = this.channels()
    const notificationTypesId = await NotificationType.pluck('id')
  
    const schemaDefinition = reduce(notificationTypesId, (accumulator, id) => {
      const channelPreferenceSchema = reduce(channels, (schemaAccumulator, channel) => {
        schemaAccumulator[channel] = schema.boolean()
        return schemaAccumulator
      }, {})
    
      accumulator[id] = schema.object.optional().members(channelPreferenceSchema)
      return accumulator
    }, {})

    return {
      schema: schema.create(schemaDefinition),
      messages: Config.get('validator.customMessages')
    }
  }
}