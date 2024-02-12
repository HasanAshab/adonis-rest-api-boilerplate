import Route from '@ioc:Adonis/Core/Route'

//Endpoints for notification type management

Route.group(() => {
  Route.get('/', 'NotificationTypesController.index')
  Route.get('/:id', 'NotificationTypesController.show').as('show')

  Route.group(() => {
    Route.patch('/:id', 'NotificationTypesController.update')
    Route.delete('/:id', 'NotificationTypesController.delete')
  })
  .middleware('roles:admin')
})
.as('notificationTypes')
.middleware(['auth', 'verified'])
