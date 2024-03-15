import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


const NotificationsController = () => import("#controllers/v1/notifications_controller")

// Endpoints for notification management
export default function notificationRoutes() {
router.group(() => {
  router.get('/', [NotificationsController, 'index'])
  router.get('/unread-count', [NotificationsController, 'unreadCount'])
  router.patch('/read', [NotificationsController, 'markAllAsRead']).as('markAsRead.all')
  router.patch('/:id/read', [NotificationsController, 'markAsRead']).as('markAsRead')
  router.get('/:id', [NotificationsController, 'show']).as('show')
  router.delete('/:id', [NotificationsController, 'delete']).as('delete')
})
.as('notifications')
.use([
  middleware.auth(),
  middleware.verified()
])
}