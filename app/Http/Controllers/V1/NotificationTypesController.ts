import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bind } from '@adonisjs/route-model-binding'
import NotificationType from 'App/Models/NotificationType'
import CreateNotificationTypeValidator from 'App/Http/Validators/V1/NotificationType/CreateNotificationTypeValidator'
import UpdateNotificationTypeValidator from 'App/Http/Validators/V1/NotificationType/UpdateNotificationTypeValidator'
import NotificationTypeCollection from 'App/Http/Resources/v1/NotificationType/NotificationTypeCollection'


export default class NotificationTypesController {
  public async index() {
    return NotificationTypeCollection.make(await NotificationType.all())
  }
  
  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateNotificationTypeValidator)
    return response.created(await NotificationType.create(data))
  }

  @bind()
  public show({ params }: HttpContextContract, notificationType: NotificationType) {
    return notificationType
  }
  
  public async update({ request, params }: HttpContextContract) {
    const data = await request.validate(UpdateNotificationTypeValidator)
    await NotificationType.updateOrFail(params.id, data)
    
    return 'Notification type updated!'
  }
  
  public async delete({ response, params }: HttpContextContract) {
    await NotificationType.deleteOrFail(params.id)
    response.noContent()
  }
}