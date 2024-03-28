import BaseJsonResource from '#resources/base_json_resource'

export default class TwoFactorSettingsResource extends BaseJsonResource {
  serialize() {
    return {
      enabled: this.resource.hasEnabledTwoFactorAuth(),
      method: this.resource.twoFactorMethod,
    }
  }
}
