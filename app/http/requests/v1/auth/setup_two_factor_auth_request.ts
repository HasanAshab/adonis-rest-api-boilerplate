import { AuthenticRequest } from '~/core/express'
import Validator from 'validator'
import Config from '#config'
import { ISettings, twoFactorAuthMethods } from '~/app/models/settings'

interface SetupTwoFactorAuthRequest {
  body: {
    enable: boolean
    method?: ISettings['twoFactorAuth']['method']
  }
}

class SetupTwoFactorAuthRequest extends AuthenticRequest {
  static rules() {
    return {
      enable: Validator.boolean().default(true),
      method: Validator.string().valid(...twoFactorAuthMethods),
    }
  }
}

export default SetupTwoFactorAuthRequest
