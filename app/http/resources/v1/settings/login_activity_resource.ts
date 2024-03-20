//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class LoginActivityResource extends JsonResource {
  serialize() {
    const resource = this.resource.serialize()
    return {
      id: resource.id,
      type: resource.type,
      vendor: resource.vendor,
      model: resource.model,
      ipAddress: resource.ip,
      lastLoggedAt: resource.lastLoggedAt
    }
  }
}
