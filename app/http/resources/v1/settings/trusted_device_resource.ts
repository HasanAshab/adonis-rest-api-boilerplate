import BaseJsonResource from '#resources/base_json_resource'

export default class TrustedDeviceResource extends BaseJsonResource {
  serialize() {
    return {
      id: this.resource.id,
      type: this.resource.type,
      vendor: this.resource.vendor,
      model: this.resource.model,
      ipAddress: this.resource.$extras.pivot_ip_address,
      lastLoggedAt: this.resource.$extras.pivot_last_logged_at.toRelative(),
      links: {
        remove: this.makeUrl('v1.trustedDevices.remove'),
      },
    }
  }
}
