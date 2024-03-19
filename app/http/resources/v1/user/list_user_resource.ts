//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class ListUserResource extends JsonResource {
  serialize() {
    return {
      id: this.resource.id,
      username: this.resource.username,
      links: {
        self: this.makeUrl('v1.users.show'),
        avatar: this.resource.avatarUrl(),
        makeAdmin: this.makeUrl('v1.users.makeAdmin'),
        delete: this.makeUrl('v1.users.delete'),
      },
    }
  }
}
