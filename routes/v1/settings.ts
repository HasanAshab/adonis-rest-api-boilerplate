import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


const SettingsController = () => import("#controllers/v1/settings_controller")

// Settings management
export default function settingsRoutes() {
  router.group(() => {
    router.get('/login-activities', [SettingsController, 'loginActivities'])

    // Two-factor authentication settings
    router.group(() => {
      router.get('/', [SettingsController, 'twoFactorAuth'])
      router.post('/', [SettingsController, 'enableTwoFactorAuth'])
      router.delete('/', [SettingsController, 'disableTwoFactorAuth'])
      router.patch('/method', [SettingsController, 'updateTwoFactorAuthMethod'])
      router.get('/qr-code', [SettingsController, 'twoFactorAuthQrCode'])
      router.get('/recovery-codes', [SettingsController, 'recoveryCodes'])
      router.post('/recovery-codes', [SettingsController, 'generateRecoveryCodes'])
    })
      .prefix('two-factor-auth')
  
    // Notification preferences settings
    router.group(() => {
      router.get('/', [SettingsController, 'notificationPreference'])
      router.patch('/', [SettingsController, 'updateNotificationPreference'])
      router.delete('/email-subscription', [SettingsController, 'unsubscribeEmailNotification'])
      router.post('/email-subscription', [SettingsController, 'resubscribeEmailNotification'])
    })
      .prefix('notification-preferences')
  })
  .use([
    middleware.auth(),
    middleware.verified()
  ])
}