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
      links: {
        self: this.makeUrl('v1.contact.show')
        close: this.when(this.resource.status === 'opened', () => {
          return this.makeUrl('v1.contact.close')
        })
        reopen: this.when(this.resource.status === 'closed', () => {
          return this.makeUrl('v1.contact.reopen')
        })
        delete: this.makeUrl('v1.contact.delete')
      }
    }
  }
}
