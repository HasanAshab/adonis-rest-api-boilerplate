import Route from '@ioc:Adonis/Core/Route'

//Endpoints for notification management
Route.group(() => {
  Route.get('/', 'NotificationController.index')
  Route.get('/unread-count', 'NotificationController.unreadCount')
  Route.patch('/read/all', 'NotificationController.markAllAsRead').as('markAsRead.all')
  Route.patch('/:id/read', 'NotificationController.markAsRead').as('markAsRead')
  Route.get('/:id', 'NotificationController.show')
  Route.delete('/:id', 'NotificationController.delete').as('delete')
})
.as('notifications')
.middleware(['auth', 'verified'])

