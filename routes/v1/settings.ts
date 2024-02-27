import router from '@adonisjs/core/services/router'

// User settings managenent
router.group(() => {
  router.group(() => {
    router.get('/', 'SettingsController.twoFactorAuth')
    router.post('/', 'SettingsController.enableTwoFactorAuth')
    router.delete('/', 'SettingsController.disableTwoFactorAuth')
    router.patch('/method', 'SettingsController.updateTwoFactorAuthMethod')
    router.get('/qr-code', 'SettingsController.twoFactorAuthQrCode')
    router.get('/recovery-codes', 'SettingsController.recoveryCodes')
    router.post('/recovery-codes', 'SettingsController.generateRecoveryCodes')
  })
  .prefix('two-factor-auth')

  router.group(() => {
    router.get('/', 'SettingsController.notificationPreference')
    router.patch('/', 'SettingsController.updateNotificationPreference')
    router.delete('/email-subscription', 'SettingsController.unsubscribeEmailNotification')
    router.post('/email-subscription', 'SettingsController.resubscribeEmailNotification')
  })
  .prefix('notification-preferences')
})
.middleware(['auth', 'verified'])


// App settings managenent
/* await Router.middleware(["auth", "roles:admin"]).group(() => {
    Router.get("/app", "getAppSettings");
    Router.patch("/app", "updateAppSettings");
  });
  */
