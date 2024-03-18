import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import User from '#models/user'
import Token from '#models/token'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import NotificationService from '#services/notification_service'
import NotificationPreferenceCollection from '#resources/v1/settings/notification_preference_collection'
import TwoFactorSettingsResource from '#resources/v1/settings/two_factor_settings_resource'
import { 
  twoFactorAuthMethodValidator,
  updateNotificationPreferenceValidator,
  emailUnsubscriptionValidator,
  emailResubscriptionValidator
} from "#validators/v1/settings_validator";


@inject()
export default class SettingsController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly notificationService: NotificationService
  ) {}
  
  public async loginActivities({ auth, request }: HttpContext) {
    return auth.user.related('loginActivities').query().preload('device')

    await auth.user!.load('loginActivities')
    return auth.user!.loginActivities
  }
  
  public async twoFactorAuth({ auth }: HttpContext) {
    return TwoFactorSettingsResource.make(auth.user!)
  }
  
  public async enableTwoFactorAuth({ request, auth: { user } }: HttpContext) {
    const { method } = await request.validateUsing(twoFactorAuthMethodValidator)
    await this.twoFactorAuthService.enable(user!, method)
    return 'Two-Factor Authentication enabled!'
  }
  
  public async disableTwoFactorAuth({ auth }: HttpContext) {
    await this.twoFactorAuthService.disable(auth.user!)
    return 'Two-Factor Authentication disabled!'
  }
  
  public async updateTwoFactorAuthMethod({ request, auth }: HttpContext) {
    const { method } = await request.validateUsing(twoFactorAuthMethodValidator)
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
    const validator = await updateNotificationPreferenceValidator()
    const preferences = await request.validateUsing(validator)
    await auth.user!.syncNotificationPreference(preferences)
    return 'Settings saved!'
  }

  public async unsubscribeEmailNotification({ request }: HttpContext) {
    const { id, token, notificationType: notificationTypeName } = await request.validateUsing(emailUnsubscriptionValidator)
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
    const { id, token, notificationType: notificationTypeName } = await request.validateUsing(emailResubscriptionValidator)
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
}
