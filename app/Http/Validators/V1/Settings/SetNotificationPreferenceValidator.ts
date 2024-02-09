import Config from 'Config'
import { DeepPartial } from 'utility-types'


export default class SetNotificationPreferenceValidator {
  static rules() {
    const { channels, types } = Config.get('notification')
    const channelsSchema: Record<string, any> = {}
    const fields: Record<string, any> = {}
    for (const channel of channels) {
      channelsSchema[channel] = Validator.boolean()
    }
    for (const notificationType of types) {
      fields[notificationType] = channelsSchema
    }
    return fields
  }
}