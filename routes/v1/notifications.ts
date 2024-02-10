import Route from '@ioc:Adonis/Core/Route'

//Endpoints for notification management
Route.group(() => {
  Route.get('/', 'NotificationsController.index')
  Route.get('/unread-count', 'NotificationsController.unreadCount')
  Route.patch('/read/all', 'NotificationsController.markAllAsRead').as('markAsRead.all')
  Route.patch('/:id/read', 'NotificationsController.markAsRead').as('markAsRead')
  Route.get('/:id', 'NotificationsController.show').as('show')
  Route.delete('/:id', 'NotificationsController.delete').as('delete')
})
  .as('notifications')
  .middleware(['auth', 'verified'])
