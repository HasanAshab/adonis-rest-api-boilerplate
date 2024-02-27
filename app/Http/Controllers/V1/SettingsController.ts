import type { HttpContext } from '@adonisjs/core/http'
import User from '#app/Models/User'
import Token from '#app/Models/Token'
import TwoFactorAuthService from '#app/Services/Auth/TwoFactor/TwoFactorAuthService'
import NotificationService from '#app/Services/NotificationService'
import TwoFactorAuthMethodValidator from "#app/Http/Validators/V1/Settings/TwoFactorAuthMethodValidator";
import UpdateNotificationPreferenceValidator from "#app/Http/Validators/V1/Settings/UpdateNotificationPreferenceValidator";
//import UpdateAppSettingsValidator from "App/Http/Validators/v1/settings/UpdateAppSettingsValidator";
import EmailUnsubscriptionValidator from "#app/Http/Validators/V1/Settings/EmailUnsubscriptionValidator";
import EmailResubscriptionValidator from "#app/Http/Validators/V1/Settings/EmailResubscriptionValidator";
import NotificationPreferenceCollection from '#app/Http/Resources/v1/Settings/NotificationPreferenceCollection'
import TwoFactorSettingsResource from '#app/Http/Resources/v1/Settings/TwoFactorSettingsResource'


export default class SettingsController {
  //todo
  constructor(
    private readonly twoFactorAuthService = new TwoFactorAuthService,
    private readonly notificationService = new NotificationService
  ) {}
  
  public async twoFactorAuth({ auth }: HttpContext) {
    return TwoFactorSettingsResource.make(auth.user!)
  }
  
  public async enableTwoFactorAuth({ request, auth }: HttpContext) {
    const { method } = await request.validate(TwoFactorAuthMethodValidator)
    await this.twoFactorAuthService.enable(auth.user!, method)
    return 'Two-Factor Authentication enabled!'
  }
  
  public async disableTwoFactorAuth({ auth }: HttpContext) {
    await this.twoFactorAuthService.disable(auth.user!)
    return 'Two-Factor Authentication disabled!'
  }
  
  public async updateTwoFactorAuthMethod({ request, auth }: HttpContext) {
    const { method } = await request.validate(TwoFactorAuthMethodValidator)
    await this.twoFactorAuthService.changeMethod(auth.user!, method)
    return 'Two-Factor Authentication method changed!'
  }

  public async twoFactorAuthQrCode({ auth }: HttpContext) {
    return {
      data: await auth.user!.twoFactorQrCodeSvg()
    }
  }

  public recoveryCodes({ auth }: HttpContext) {
    return auth.user!.recoveryCodes()
  }
  
  public generateRecoveryCodes({ auth }: HttpContext) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  public async notificationPreference({ auth: { user } }: HttpContext) {
    await user!.load('notificationPreferences')
    return NotificationPreferenceCollection.make(user!.notificationPreferences)
  }

  public async updateNotificationPreference({ request, auth }: HttpContext) {
    const validator = await UpdateNotificationPreferenceValidator()
    const preferences = await request.validate(validator)
    await auth.user!.syncNotificationPreference(preferences)
    return 'Settings saved!'
  }

  public async unsubscribeEmailNotification({ request }: HttpContext) {
    const { id, token, notificationType: notificationTypeName } = await request.validate(EmailUnsubscriptionValidator)
    const user = await User.findOrFail(id)
    const notificationType = await NotificationType.findByOrFail('name', notificationTypeName)
    
    await Token.verify(
      'email_unsubscription',
      this.notificationService.emailUnsubscriptionTokenKey(user, notificationTypeName),
      token
    )
    await user.disableNotification(notificationType.id, 'email')
    const resubscribtionToken = await this.notificationService.emailResubscriptionToken(user, notificationTypeName)
    
    return { 
      message: 'Email unsubscribed!',
      data: { resubscriptionToken }
    }
  }
  

  public async resubscribeEmailNotification({ request }: HttpContext) {
    const { id, token, notificationType: notificationTypeName } = await request.validate(EmailResubscriptionValidator)
    const user = await User.findOrFail(id)
    const notificationType = await NotificationType.findByOrFail('name', notificationTypeName)
    
    await Token.verify(
      'email_resubscription',
      this.notificationService.emailResubscriptionTokenKey(user, notificationTypeName),
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
