import Route from '@ioc:Adonis/Core/Route'

// User settings managenent
Route.group(() => {
  Route.get('/two-factor', 'SettingsController.twoFactor')
  
  Route.group(() => {
    Route.get('/', 'SettingsController.notificationPreference')
    Route.patch('/', 'SettingsController.updateNotificationPreference')
    Route.post('/email-unsubscribe', 'SettingsController.unsubscribeEmail')
    Route.post('/email-resubscribe', 'SettingsController.resubscribeEmail')
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
