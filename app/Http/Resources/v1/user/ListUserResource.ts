import JsonResource from "./json_resource";

export default class ListUserResource extends JsonResource {
  serialize() {
    return {
      profile: {
        id: this.resource.id,
        username: this.resource.username,
      },
      links: {
        avatar: this.resource.avatarUrl()      
      }
    }
  }
}