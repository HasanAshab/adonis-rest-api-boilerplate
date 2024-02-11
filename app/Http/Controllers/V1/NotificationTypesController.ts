import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationType from 'App/Models/NotificationType'
import CreateNotificationTypeValidator from 'App/Http/Validators/V1/NotificationType/CreateNotificationTypeValidator'
import UpdateNotificationTypeValidator from 'App/Http/Validators/V1/NotificationType/UpdateNotificationTypeValidator'
import NotificationTypeResource from 'App/Http/Resources/v1/NotificationType/NotificationTypeResource'

export default class NotificationTypesController {
  public async index() {
    return NotificationTypeCollection.make(await NotificationType.all())
  }
  
  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateNotificationTypeValidator)
    await NotificationType.create(data)
    
    return response.created('Notification type created!')
  }

  public show({ params }: HttpContextContract) {
    return NotificationType.findOrFail(params.type)
  }
  
  public async update({ request, params }: HttpContextContract) {
    const data = await request.validate(UpdateNotificationTypeValidator)
    await NotificationType.updateOrFail(params.type, data)
    
    return 'Notification type updated!'
  }
  
  public async delete({ response, params }: HttpContextContract) {
    await NotificationType.deleteOrFail(params.type)
    response.noContent()
  }
}
