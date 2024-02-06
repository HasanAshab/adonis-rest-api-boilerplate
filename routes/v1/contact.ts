import Route from '@ioc:Adonis/Core/Route'

// Endpoints for contact
Route.group(() => {
  Route.post('/', 'ContactController.store')
  
  Route.group(() => {
    Route.get('/', 'ContactController.index')
    Route.get('/suggest', 'ContactController.suggest')
    Route.get('/search', 'ContactController.search')
    Route.get('/:id', 'ContactController.show').as('show')
    Route.patch('/:id/close', 'ContactController.close').as('close')
    Route.patch('/:id/reopen', 'ContactController.reopen').as('reopen')
    Route.delete('/:id', 'ContactController.delete').as('delete')
  })
  .prefix('/inquiries')
  .middleware(['auth', 'roles:admin'])
})
.as('contact')