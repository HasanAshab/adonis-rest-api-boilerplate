import Route from '@ioc:Adonis/Core/Route'

// Endpoints for user management

Route.group(() => {
  Route.get('/', 'UserController.index')
  Route.patch('/:id/make-admin', 'UserController.makeAdmin')
})
// .middleware(["auth", "roles:admin"]);

Route.group(() => {
  Route.group(() => {
    Route.get('/', 'UserController.profile')
    Route.patch('/', 'UserController.updateProfile')
    Route.patch('/password', 'UserController.changePassword')
    Route.patch('/phone-number', 'UserController.changePhoneNumber')
  }).prefix('me')

  Route.get('/:username', 'UserController.show').as('users.show')
  Route.delete('/:id', 'UserController.delete')
}).middleware('auth', 'verified')
