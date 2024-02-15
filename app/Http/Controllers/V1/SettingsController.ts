import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Settings from 'App/Models/Settings'
import UpdateNotificationPreferenceValidator from "App/Http/Validators/V1/Settings/UpdateNotificationPreferenceValidator";
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";
import EmailUnsubscriptionValidator from "App/Http/Validators/V1/Settings/EmailUnsubscriptionValidator";
import EmailResubscriptionValidator from "App/Http/Validators/V1/Settings/EmailResubscriptionValidator";
import NotificationPreferenceCollection from 'App/Http/Resources/v1/Settings/NotificationPreferenceCollection'

export default class SettingsController {
  public async index({ auth: { user } }: HttpContextContract) {
    await user!.load('settings')
    return user!.settings
  }
  
  public async twoFactorAuth({ auth: { user } }: HttpContextContract) {
    await user!.load('settings')
    return {
      data: user!.settings.twoFactorAuth
    }
  }
  
  public async notificationPreference({ auth: { user } }: HttpContextContract) {
    await user!.load('notificationPreferences')
    return NotificationPreferenceCollection.make(user!.notificationPreferences)
  }

  public async updateNotificationPreference({ request, auth }: HttpContextContract) {
    const validator = await UpdateNotificationPreferenceValidator()
    const preferences = await request.validate(validator)
    await auth.user!.syncNotificationPreference(preferences)
    return 'Settings saved!'
  }

  //Todo
  public async unsubscribeEmail({ request }: HttpContextContract, notificationService = new NotificationService) {
    const { id, token, notificationType: notificationTypeName } = await request.validate(EmailUnsubscriptionValidator)
    const user = await User.findOrFail(id)
    const notificationType = await NotificationType.findByOrFail('name', notificationTypeName)
    
    await Token.verify(
      notificationService.emailUnsubscriptionTokenKey(user, notificationTypeName),
      'email_unsubscription',
      token
    )
    await user.disableNotification(notificationType.id, 'email')
    const resubscribtionToken = await notificationService.emailResubscriptionToken(user, notificationTypeName)
    
    return { 
      message: 'Email unsubscribed!',
      data: { resubscribtionToken }
    }
  }
  
  //Todo
  public async resubscribeEmail({ request }: HttpContextContract, notificationService = new NotificationService) {
    const { id, token, notificationType: notificationTypeName } = await request.validate(EmailResubscriptionValidator)
    const user = await User.findOrFail(id)
    const notificationType = await NotificationType.findByOrFail('name', notificationTypeName)
    
    await Token.verify(
      notificationService.emailResubscriptionTokenKey(user, notificationTypeName),
      'email_resubscription',
      token
    )
    
    await user.enableNotification(notificationType.id, 'email')
    
    return 'Email re-subscribed!'
  }

  /*
  async getAppSettings() {
    return Config.get();
  }
  async updateAppSettings({ body }: UpdateAppSettingsRequest) {
    Config.set(body);
    return "App Settings updated!";
  }
  */
}
