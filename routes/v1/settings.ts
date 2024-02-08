import Route from '@ioc:Adonis/Core/Route'

// User settings managenent
Route.group(() => {
  Route.get('/', 'SettingsController.index')
  Route.patch('/notification-preference', 'SettingsController.setupNotificationPreference')
}).middleware(['auth', 'verified'])

// App settings managenent
/* await Router.middleware(["auth", "roles:admin"]).group(() => {
    Router.get("/app", "getAppSettings");
    Router.patch("/app", "updateAppSettings");
  });
  */
