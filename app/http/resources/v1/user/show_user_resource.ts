import BaseJsonResource from '#resources/base_json_resource'

export default class ShowUserResource extends BaseJsonResource<UserDocument> {
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
