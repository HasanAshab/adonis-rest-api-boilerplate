import router from '@adonisjs/core/services/router'

const UsersController = () => import("#app/http/controllers/v1/users_controller")

// Endpoints for user management
router.group(() => {
  // Routes related to the authenticated user
  router.group(() => {
    router.get('/', [UsersController, 'profile'])
    router.delete('/', [UsersController, 'delete'])
    router.patch('/', [UsersController, 'updateProfile'])
    router.patch('/password', [UsersController, 'changePassword'])
    router.patch('/phone-number', [UsersController, 'changePhoneNumber'])
    router.delete('/phone-number', [UsersController, 'removePhoneNumber'])
  }).prefix('me')

  // Routes for showing a specific user
  router.get('/:username', [UsersController, 'show']).as('show')

  // Routes for managing users
  router.group(() => {
    router.get('/', [UsersController, 'index'])
    router.patch('/:id/admin', [UsersController, 'makeAdmin']).as('makeAdmin')
    router.delete('/:id', [UsersController, 'deleteById']).as('delete')
  }).middleware('roles:admin')
})
  .as('users')
  .middleware(['auth', 'verified'])
