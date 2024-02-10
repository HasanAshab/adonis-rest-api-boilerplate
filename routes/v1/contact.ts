import Route from '@ioc:Adonis/Core/Route'

// Endpoints for contact
Route.group(() => {
  Route.post('/', 'ContactsController.store')

  Route.group(() => {
    Route.get('/', 'ContactsController.index')
    Route.get('/suggest', 'ContactsController.suggest')
    Route.get('/search', 'ContactsController.search')
    Route.get('/:id', 'ContactsController.show').as('show')
    Route.patch('/:id/close', 'ContactsController.close').as('close')
    Route.patch('/:id/reopen', 'ContactsController.reopen').as('reopen')
    Route.delete('/:id', 'ContactsController.delete').as('delete')
  })
    .prefix('/inquiries')
    .middleware(['auth', 'roles:admin'])
}).as('contact')
