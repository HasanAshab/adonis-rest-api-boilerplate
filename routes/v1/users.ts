import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('#controllers/v1/users_controller')

export default function userRoutes() {
  // Endpoints for user management
  router
    .group(() => {
      // Routes related to the authenticated user
      router
        .group(() => {
          router.get('/', [UsersController, 'profile'])
          router.delete('/', [UsersController, 'delete'])
          router.patch('/', [UsersController, 'updateProfile'])
          router.patch('/password', [UsersController, 'changePassword'])
          router.patch('/phone-number', [UsersController, 'changePhoneNumber'])
          router.delete('/phone-number', [UsersController, 'removePhoneNumber'])
        })
        .prefix('me')

      // Routes for showing a specific user
      router.get('/:username', [UsersController, 'show']).as('v1.users.show')

      // Routes for managing users
      router
        .group(() => {
          router.get('/', [UsersController, 'index'])
          router.patch('/:id/admin', [UsersController, 'makeAdmin']).as('v1.users.makeAdmin')
          router.delete('/:id', [UsersController, 'deleteById']).as('v1.users.delete')
        })
        .use(middleware.roles('admin'))
    })
    .use([middleware.auth(), middleware.verified()])
}
