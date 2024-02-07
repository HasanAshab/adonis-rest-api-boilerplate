//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class UserProfileResource extends JsonResource {
  public serialize() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      username: this.resource.username,
      email: this.resource.email,
      phoneNumber: this.resource.phoneNumber,
      username: this.resource.username,
      role: this.resource.role,
      links: {
        avatar: this.resource.avatarUrl()
      }
    }
  }
}
