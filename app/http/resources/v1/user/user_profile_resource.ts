import { JsonResource } from 'adonis-api-resource'

export default class UserProfileResource extends JsonResource {
  serialize() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      username: this.resource.username,
      email: this.resource.email,
      phoneNumber: this.resource.phoneNumber,
      username: this.resource.username,
      role: this.resource.role,
      links: {
        avatar: this.resource.avatarUrl(),
      },
    }
  }
}
