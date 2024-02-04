import Route from '@ioc:Adonis/Core/Route'

//Endpoints for notification management

Route.group(() => {
 Route.get('/', 'NotificationController.index')
 Route.get('/:rawNotification', 'NotificationController.show')
 Route.get('/unread-count', 'NotificationController.unreadCount')
 Route.patch('/read/all', 'NotificationController.markAsRead').as('markAsRead.all')
 Route.patch('/:id/read', 'NotificationController.markAsRead').as('markAsRead')
 Route.delete('/:id', 'NotificationController.delete').as('delete')
})
.prefix('notification')
.as('notification')
.middleware(['auth', 'verified'])

