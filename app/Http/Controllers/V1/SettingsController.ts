import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Settings from 'App/Models/Settings'
import UpdateNotificationPreferenceValidator from "App/Http/Validators/V1/Settings/UpdateNotificationPreferenceValidator";
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";
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
