//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class ListUserResource extends JsonResource {
  public serialize() {
    return {
      profile: {
        id: this.resource.id,
        username: this.resource.username,
      },
      links: {
        avatar: this.resource.avatarUrl(),
      }
    }
  }
}
