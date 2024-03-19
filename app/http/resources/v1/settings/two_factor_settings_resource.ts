//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class TwoFactorSettingsResource extends JsonResource {
  serialize() {
    return {
      enabled: this.resource.hasEnabledTwoFactorAuth(),
      method: this.resource.twoFactorMethod,
    }
  }
}
