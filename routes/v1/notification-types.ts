import type Router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


const NotificationTypesController = () => import("#controllers/v1/notification_types_controller")

// Endpoints for notification type management

export default function notificationTypeRoutes(router: Router) {
router.group(() => {
  router.get('/', [NotificationTypesController, 'index'])
  router.get('/:id', [NotificationTypesController, 'show']).as('show')

  router.group(() => {
    router.post('/', [NotificationTypesController, 'store'])
    router.patch('/:id', [NotificationTypesController, 'update'])
    router.delete('/:id', [NotificationTypesController, 'delete'])
  })
  .use(middleware.roles('admin'))
})
.as('notificationTypes')
.use([
  middleware.auth(),
  middleware.verified()
])
}