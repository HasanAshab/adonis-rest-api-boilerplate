import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Settings from 'App/Models/Settings'
import NotificationService from 'App/Services/NotificationService'
import UpdateNotificationPreferenceValidator from 'App/Http/Validators/V1/Settings/UpdateNotificationPreferenceValidator'
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";

export default class SettingsController {
  //TODO
  constructor(private readonly notificationService = new NotificationService) {}
  
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
  
  public async notificationPreference({ auth }: HttpContextContract) {
    const preference = await this.notificationService.preferenceOf(auth.user!)
    return { data: preference }
  }

  public async updateNotificationPreference({ request, auth }: HttpContextContract) {
    const schema = await this.notificationService.preferenceValidationSchema()
    const notificationPreference = await request.validate({ schema })
    
    await auth.user!
      .related('settings')
      .query()
      .update({ notificationPreference })
    
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
