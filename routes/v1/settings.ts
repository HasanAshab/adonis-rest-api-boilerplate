import Route from '@ioc:Adonis/Core/Route'

// User settings managenent
Route.group(() => {
  Route.group(() => {
    Route.get('/', 'SettingsController.twoFactorAuth')
    Route.post('/', 'SettingsController.enableTwoFactorAuth')
    Route.delete('/', 'SettingsController.disableTwoFactorAuth')
    Route.get('/method', 'SettingsController.twoFactorAuthMethod')
    Route.patch('/method', 'SettingsController.updateTwoFactorAuthMethod')
    Route.get('/recovery-codes', 'SettingsController.recoveryCodes')
    Route.post('/recovery-codes', 'SettingsController.generateRecoveryCodes')
  })
  .prefix('two-factor-auth')

  Route.group(() => {
    Route.get('/', 'SettingsController.notificationPreference')
    Route.patch('/', 'SettingsController.updateNotificationPreference')
    Route.delete('/email-subscription', 'SettingsController.unsubscribeEmail')
    Route.post('/email-subscription', 'SettingsController.resubscribeEmail')
  })
  .prefix('notification-preference')
})
.middleware(['auth', 'verified'])


// App settings managenent
/* await Router.middleware(["auth", "roles:admin"]).group(() => {
    Router.get("/app", "getAppSettings");
    Router.patch("/app", "updateAppSettings");
  });
  */
