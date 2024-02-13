import Config from '@ioc:Adonis/Core/Config'
import { schema } from '@ioc:Adonis/Core/Validator'
import NotificationType from 'App/Models/NotificationType'
import { reduce } from 'lodash'


export default class NotificationService {
  public channels() {
    return Object.keys(Config.get('notification.channels'))
  }
  
  public async defaultPrefrence() {
    const channels = this.channels()
    const types = await this.notificationTypes()
    return reduce(types, (accumulator, type) => {
      accumulator[type] = reduce(channels, (preferenceAccumulator, channel) => {
        preferenceAccumulator[channel] = true
        return preferenceAccumulator
      }, {})
    
      return accumulator
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