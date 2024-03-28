import { JsonResource } from 'adonis-api-resource'

export default class TwoFactorSettingsResource extends JsonResource {
  serialize() {
    return {
      enabled: this.resource.hasEnabledTwoFactorAuth(),
      method: this.resource.twoFactorMethod,
    }
  }
}
