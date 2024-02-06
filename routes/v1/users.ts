import Route from '@ioc:Adonis/Core/Route'

// Endpoints for user management


Route.group(() => {
  Route.get('/:username', 'UserController.show').as('show')
  
  Route.group(() => {
    Route.get('/', 'UserController.profile')
    Route.delete('/', 'UserController.delete')
    Route.patch('/', 'UserController.updateProfile')
    Route.patch('/password', 'UserController.changePassword')
    Route.patch('/phone-number', 'UserController.changePhoneNumber')
  })
  .prefix('me')

  Route.group(() => {
    Route.get('/', 'UserController.index')
    Route.patch('/:id/make-admin', 'UserController.makeAdmin').as('makeAdmin')
    Route.delete('/:id', 'UserController.deleteById').as('delete')
  })
//  .middleware("roles:admin");
  
   
})
.as('users')
//.middleware(['auth', 'verified'])