import { JsonResource } from 'adonis-api-resource'

export default class ShowUserResource extends JsonResource<UserDocument> {
  serialize() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      username: this.resource.username,
      role: this.resource.role,
      links: {
        avatar: this.resource.avatarUrl(),
      },
    }
  }
}
