import { AuthenticRequest } from '~/core/express'
import Validator from 'validator'
import config from '#config'
import { ISettings } from '~/app/models/settings'
import { DeepPartial } from 'utility-types'

interface SetupNotificationPreferenceRequest {
  body: ISettings['notification']
}

class SetupNotificationPreferenceRequest extends AuthenticRequest {
  static rules() {
    const { channels, types } = config.get('notification')
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

export default SetupNotificationPreferenceRequest
