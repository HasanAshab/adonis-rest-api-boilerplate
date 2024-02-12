import Config from '@ioc:Adonis/Core/Config'
import { schema } from '@ioc:Adonis/Core/Validator'
import NotificationType from 'App/Models/NotificationType'
import { DateTime } from 'luxon'
import { reduce } from 'lodash'

export default class NotificationService {
  public notificationTypes() {
    return NotificationType.pluck('type')
  }
  
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
    const types = await this.notificationTypes()
  
    const schemaDefinition = reduce(types, (accumulator, type) => {
      const typeSchema = reduce(channels, (schemaAccumulator, channel) => {
        schemaAccumulator[channel] = schema.boolean()
        return schemaAccumulator
      }, {})
    
      accumulator[type] = schema.object().members(typeSchema)
      return accumulator
    }, {})

    return {
      schema: schema.create(schemaDefinition),
      messages: Config.get('validator.customMessages')
    }
  }

  public unread(user: User) {
    return user.related('notifications').query().whereNull('readAt')
  }
  
  public markAsRead(user: User, id?: number) {
    return this.unread(user)
      .when(id, query => query.whereUid(id))
      .updateOrFail({
        readAt: DateTime.local(),
      })
  }
}