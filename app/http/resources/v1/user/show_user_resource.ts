//import JsonResource from '@samer/api-resource/resources/json_resource'

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
