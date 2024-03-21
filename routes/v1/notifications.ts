import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NotificationsController = () => import('#controllers/v1/notifications_controller')

// Endpoints for notification management
export default function notificationRoutes() {
  router
    .group(() => {
      router.get('/', [NotificationsController, 'index'])
      router.get('/unread-count', [NotificationsController, 'unreadCount'])
      router.patch('/read', [NotificationsController, 'markAllAsRead']).as('v1.notificationsmarkAsRead.all')
      router.patch('/:id/read', [NotificationsController, 'markAsRead']).as('v1.notifications.markAsRead')
      router.get('/:id', [NotificationsController, 'show']).as('v1.notifications.show')
      router.delete('/:id', [NotificationsController, 'delete']).as('v1.notifications.delete')
    })
    .use([middleware.auth(), middleware.verified()])
}
