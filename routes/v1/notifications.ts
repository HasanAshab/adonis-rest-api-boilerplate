import router from '@adonisjs/core/services/router'

//Endpoints for notification management
router.group(() => {
  router.get('/', 'NotificationsController.index')
  router.get('/unread-count', 'NotificationsController.unreadCount')
  router.patch('/read', 'NotificationsController.markAllAsRead').as('markAsRead.all')
  router.patch('/:id/read', 'NotificationsController.markAsRead').as('markAsRead')
  router.get('/:id', 'NotificationsController.show').as('show')
  router.delete('/:id', 'NotificationsController.delete').as('delete')
})
  .as('notifications')
  .middleware(['auth', 'verified'])
