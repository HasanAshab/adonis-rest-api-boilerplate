import { JsonResource } from 'adonis-api-resource'
import LoginActivityResource from '#resources/v1/settings/login_activity/login_activity_resource'

export default class LoginActivityCollection extends ResourceCollection<LoginActivityResource> {
  protected collects = LoginActivityResource

  constructor(
    protected readonly resources: Array<Record<string, any>>,
    protected deviceId: string
  ) {
    super(resources)
  }

  protected makeResource(resource: Record<string, any>) {
    return this.collects.make(resource, this.deviceId)
  }
}
