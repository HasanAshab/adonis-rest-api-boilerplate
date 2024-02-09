import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Settings from 'App/Models/Settings'
import UpdateNotificationPreferenceValidator from 'App/Http/Validators/v1/settings/UpdateNotificationPreferenceValidator'
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";

export default class SettingsController {
  async index({ auth }: HttpContextContract) {
    await auth.user!.load('settings')
    return auth.user!.settings
  }

  async setupNotificationPreference({ request, auth }: HttpContextContract) {
    const notificationPreference = await request.validate(setNotificationPreference)
    await auth.user!.related('settings').query().update({ notificationPreference })
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
