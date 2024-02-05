//import JsonResource from "@samer/api-resource/resources/json_resource";

export default abstract class ListContactResource extends JsonResource {
  serialize() {
    return {
      id: this.resource.id,
      email: this.resource.email,
      subject: this.resource.subject,
      message: this.resource.message.substring(0, 30),
      status: this.resource.status,
      createdAt: this.resource.createdAt.toRelative()
    }
  }
}
