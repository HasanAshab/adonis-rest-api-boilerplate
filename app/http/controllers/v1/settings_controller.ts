import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import User from '#models/user'
import Token from '#models/token'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import NotificationService from '#services/notification_service'
import LoginActivityCollection from '#resources/v1/settings/login_activity/login_activity_collection'
import TwoFactorSettingsResource from '#resources/v1/settings/two_factor_settings_resource'
import TrustedDeviceResource from '#resources/v1/settings/trusted_device_resource'
import NotificationPreferenceCollection from '#resources/v1/settings/notification_preference_collection'
import {
  showLoginActivitiesValidator,
  twoFactorAuthMethodValidator,
  updateNotificationPreferenceValidator,
  emailUnsubscriptionValidator,
  emailResubscriptionValidator,
} from '#validators/v1/settings_validator'

@inject()
export default class SettingsController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly notificationService: NotificationService
  ) {}

  async loginActivities({ auth, request }: HttpContext) {
    await auth.user.load('loggedDevices')
    return LoginActivityCollection.make(auth.user!.loggedDevices, request.deviceId())
  }

  async twoFactorAuth({ auth }: HttpContext) {
    return TwoFactorSettingsResource.make(auth.user!)
  }

  async enableTwoFactorAuth({ request, auth: { user } }: HttpContext) {
    const { method } = await request.validateUsing(twoFactorAuthMethodValidator)
    await this.twoFactorAuthService.enable(user!, method)
    return 'Two-Factor Authentication enabled!'
  }

  async disableTwoFactorAuth({ auth }: HttpContext) {
    await this.twoFactorAuthService.disable(auth.user!)
    return 'Two-Factor Authentication disabled!'
  }

  async updateTwoFactorAuthMethod({ request, auth }: HttpContext) {
    const { method } = await request.validateUsing(twoFactorAuthMethodValidator)
    await this.twoFactorAuthService.changeMethod(auth.user!, method)
    return 'Two-Factor Authentication method changed!'
  }

  async twoFactorAuthQrCode({ auth }: HttpContext) {
    return {
      data: await auth.user!.twoFactorQrCodeSvg(),
    }
  }

  recoveryCodes({ auth }: HttpContext) {
    return auth.user!.recoveryCodes()
  }

  generateRecoveryCodes({ auth }: HttpContext) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }
  
  async trustedDevices({ auth }: HttpContext) {
    await auth.user!.load('trustedDevices')
    return TrustedDeviceResource.collection(auth.user!.trustedDevices)
  }
  
  async removeTrustedDevice({ response, params, auth }: HttpContext) {
    await auth.user!.distrustDevice(params.id)
    response.noContent()
  }

  async notificationPreference({ auth: { user } }: HttpContext) {
    await user!.load('notificationPreferences')
    return NotificationPreferenceCollection.make(user!.notificationPreferences)
  }

  async updateNotificationPreference({ request, auth }: HttpContext) {
    const validator = await updateNotificationPreferenceValidator()
    const preferences = await request.validateUsing(validator)
    await auth.user!.syncNotificationPreference(preferences)
    return 'Settings saved!'
  }

  async unsubscribeEmailNotification({ request }: HttpContext) {
    const {
      id,
      token,
      notificationType: notificationTypeName,
    } = await request.validateUsing(emailUnsubscriptionValidator)
    const user = await User.findOrFail(id)
    const notificationType = await NotificationType.findByOrFail('name', notificationTypeName)

    await Token.verify(
      'email_unsubscription',
      this.notificationService.emailUnsubscriptionTokenKey(user, notificationTypeName),
      token
    )
    await user.disableNotification(notificationType.id, 'email')
    const resubscribtionToken = await this.notificationService.emailResubscriptionToken(
      user,
      notificationTypeName
    )

    return {
      message: 'Email unsubscribed!',
      data: { resubscriptionToken },
    }
  }

  async resubscribeEmailNotification({ request }: HttpContext) {
    const {
      id,
      token,
      notificationType: notificationTypeName,
    } = await request.validateUsing(emailResubscriptionValidator)
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
