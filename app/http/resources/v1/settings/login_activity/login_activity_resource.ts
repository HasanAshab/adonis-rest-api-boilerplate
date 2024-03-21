//import JsonResource from '@samer/api-resource/resources/json_resource'
import { DateTime } from 'luxon'

export default class LoginActivityResource extends JsonResource {
  constructor(protected resource: Record<string, any>, protected deviceId: number) {
    super(resource)
  }
  
  isCurrentDevice() {
    return this.resource.id === this.deviceId
  }
  
  lastLoggedAt() {
    if(this.isCurrentDevice()) {
      return 'Now'
    }
    return DateTime
      .fromJSDate(this.resource.$extras.pivot_last_logged_at)
      .toRelative()
  }
  
  serialize() {
    return {
      id: this.resource.id,
      type: this.resource.type,
      vendor: this.resource.vendor,
      model: this.resource.model,
      ipAddress: this.resource.$extras.pivot_ip_address,
      lastLoggedAt: this.lastLoggedAt(),
      isCurrentDevice: this.isCurrentDevice(),
      links: {
        logout: this.makeUrl('v1.logout.device', { deviceId: this.deviceId })
      }
    }
  }
}
