//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class TwoFactorSettingsResource extends JsonResource {
  public serialize() {
    return {
      enabled: this.resource.hasEnabledTwoFactorAuth(),
      method: this.resource.twoFactorMethod
    }
  }
}
