import router from '@adonisjs/core/services/router'

const NotificationTypesController = () => import("#app/http/controllers/v1/notification_types_controller")

// Endpoints for notification type management
router.group(() => {
  router.get('/', [NotificationTypesController, 'index'])
  router.get('/:id', [NotificationTypesController, 'show']).as('show')

  router.group(() => {
    router.post('/', [NotificationTypesController, 'store'])
    router.patch('/:id', [NotificationTypesController, 'update'])
    router.delete('/:id', [NotificationTypesController, 'delete'])
  })
  .middleware('roles:admin')
})
.as('notificationTypes')
.middleware(['auth', 'verified'])
