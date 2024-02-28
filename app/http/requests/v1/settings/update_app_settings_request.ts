import { AuthenticRequest } from '~/core/express'
import Validator from 'validator'
import config from '#config'
import { DeepPartial } from 'utility-types'

interface UpdateAppSettingsRequest {
  body: Record<string, unknown>
}

class UpdateAppSettingsRequest extends AuthenticRequest {
  static rules(obj = config.get()) {
    if (obj === null || typeof obj === 'undefined') return null

    const fields: Record<string, any> = {}
    const type = typeof obj
    if (type !== 'object')
      //@ts-ignore
      return Validator[type]()
    for (const key of Object.keys(obj)) {
      fields[key] = this.rules(obj[key])
    }
    return fields
  }
}

export default UpdateAppSettingsRequest
