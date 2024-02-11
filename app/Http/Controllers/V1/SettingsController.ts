import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Settings from 'App/Models/Settings'
import NotificationService from 'App/Services/NotificationService'
import UpdateNotificationPreferenceValidator from 'App/Http/Validators/V1/Settings/UpdateNotificationPreferenceValidator'
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";

export default class SettingsController {
  async index({ auth }: HttpContextContract) {
    await auth.user!.load('settings')
    return auth.user!.settings
  }

  async updateNotificationPreference({ request, auth }: HttpContextContract, notificationService = new NotificationService) {
    const schema = await notificationService.notificationPreferenceSchema()
    const preference = await request.validate({ schema })
    
    await auth.user!
      .related('settings')
      .query()
      .update({ 
        notificationPreference: notificationService.formatPreference(preference)
      })
    
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
