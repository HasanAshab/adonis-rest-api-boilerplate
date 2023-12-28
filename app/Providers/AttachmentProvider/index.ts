import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AttachmentProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton("Adonis/Mongoose/Plugin/Attachable", () => {
      return {
        ...require('./Attachable'),
        ...require('./Attachment')
      }
    });
  }
}
