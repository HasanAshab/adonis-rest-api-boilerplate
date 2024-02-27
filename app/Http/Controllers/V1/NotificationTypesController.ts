import type { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'
import NotificationType from '#app/Models/NotificationType'
import CreateNotificationTypeValidator from '#app/Http/Validators/V1/NotificationType/CreateNotificationTypeValidator'
import UpdateNotificationTypeValidator from '#app/Http/Validators/V1/NotificationType/UpdateNotificationTypeValidator'
import NotificationTypeCollection from '#app/Http/Resources/v1/NotificationType/NotificationTypeCollection'


export default class NotificationTypesController {
  public async index() {
    return NotificationTypeCollection.make(await NotificationType.all())
  }
  
  public async store({ request, response }: HttpContext) {
    const data = await request.validate(CreateNotificationTypeValidator)
    return response.created(await NotificationType.create(data))
  }

  @bind()
  public show({ params }: HttpContext, notificationType: NotificationType) {
    return notificationType
  }
  
  public async update({ request, params }: HttpContext) {
    const data = await request.validate(UpdateNotificationTypeValidator)
    await NotificationType.updateOrFail(params.id, data)
    
    return 'Notification type updated!'
  }
  
  public async delete({ response, params }: HttpContext) {
    await NotificationType.deleteOrFail(params.id)
    response.noContent()
  }
}