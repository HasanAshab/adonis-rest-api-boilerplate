//import JsonResource from '@samer/api-resource/resources/json_resource'
import { DateTime } from 'luxon'

export default class LoginActivityResource extends JsonResource {
  constructor(protected resource: Record<string, any>, protected deviceId: number) {
    super(resource)
  }
  
  serialize() {
    return {
      id: this.resource.id,
      type: this.resource.type,
      vendor: this.resource.vendor,
      model: this.resource.model,
      ipAddress: this.resource.$extras.pivot_ip_address,
      lastLoggedAt: DateTime
        .fromJSDate(this.resource.$extras.pivot_last_logged_at)
        .toRelative(),
      isCurrentDevice: this.resource.id === this.deviceId
    }
  }
}
