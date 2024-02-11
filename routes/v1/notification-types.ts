import Route from '@ioc:Adonis/Core/Route'

//Endpoints for notification type management

Route.group(() => {
  Route.get('/', 'NotificationTypesController.index')
  Route.get('/:type', 'NotificationTypesController.show').as('show')

  Route.group(() => {
    Route.patch('/', 'NotificationTypesController.update')
    Route.delete('/', 'NotificationTypesController.delete')
  })
  .prefix(':type')
  .middleware('roles:admin')
})
.as('notificationTypes')
.middleware(['auth', 'verified'])
