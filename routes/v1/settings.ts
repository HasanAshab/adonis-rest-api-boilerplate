import Route from '@ioc:Adonis/Core/Route'

// User settings managenent
Route.group(() => {
  Route.get('/', 'SettingsController.index')
  Route.get('/two-factor-auth', 'SettingsController.twoFactorAuth')
  Route.get('/notification-preference', 'SettingsController.notificationPreference')
  Route.patch('/notification-preference', 'SettingsController.updateNotificationPreference')
})
.middleware(['auth', 'verified'])

// App settings managenent
/* await Router.middleware(["auth", "roles:admin"]).group(() => {
    Router.get("/app", "getAppSettings");
    Router.patch("/app", "updateAppSettings");
  });
  */
