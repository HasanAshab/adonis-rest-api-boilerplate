import router from '@adonisjs/core/services/router'

// Endpoints for user management

router.group(() => {
  router.group(() => {
    router.get('/', 'UsersController.profile')
    router.delete('/', 'UsersController.delete')
    router.patch('/', 'UsersController.updateProfile')
    router.patch('/password', 'UsersController.changePassword')
    router.patch('/phone-number', 'UsersController.changePhoneNumber')
    router.delete('/phone-number', 'UsersController.removePhoneNumber')
  }).prefix('me')

  router.get('/:username', 'UsersController.show').as('show')

  router.group(() => {
    router.get('/', 'UsersController.index')
    router.patch('/:id/admin', 'UsersController.makeAdmin').as('makeAdmin')
    router.delete('/:id', 'UsersController.deleteById').as('delete')
  }).middleware('roles:admin')
})
  .as('users')
  .middleware(['auth', 'verified'])
