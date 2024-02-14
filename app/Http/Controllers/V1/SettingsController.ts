import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Settings from 'App/Models/Settings'
import NotificationService from 'App/Services/NotificationService'
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";
import NotificationPreference from 'App/Models/NotificationPreference'


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
    await user.load('settings')
    return { 
      data: user.settings.notificationPreference 
    }
  }

  //TODO
  public async updateNotificationPreference({ request, auth }: HttpContextContract, notificationService = new NotificationService) {
    const validator = await notificationService.preferenceValidator()
    const preferences = await request.validate(validator)
    await auth.user!.syncNotificationPreference(preferences)
    log(await NotificationPreference.query().pojo())
    return 'Settings saved!'
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
