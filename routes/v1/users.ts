import Route from '@ioc:Adonis/Core/Route'

// Endpoints for user management

Route.group(() => {
  Route.group(() => {
    Route.get('/', 'UsersController.profile')
    Route.delete('/', 'UsersController.delete')
    Route.patch('/', 'UsersController.updateProfile')
    Route.patch('/password', 'UsersController.changePassword')
    Route.patch('/phone-number', 'UsersController.changePhoneNumber')
    Route.delete('/phone-number', 'UsersController.removePhoneNumber')
  }).prefix('me')

  Route.get('/:username', 'UsersController.show').as('show')

  Route.group(() => {
    Route.get('/', 'UsersController.index')
    Route.patch('/:id/admin', 'UsersController.makeAdmin').as('makeAdmin')
    Route.delete('/:id', 'UsersController.deleteById').as('delete')
  }).middleware('roles:admin')
})
  .as('users')
  .middleware(['auth', 'verified'])
