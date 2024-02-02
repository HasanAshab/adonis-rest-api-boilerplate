import Route from '@ioc:Adonis/Core/Route'

// Endpoints for contact
Route.group(() => {
  Route.post('/', 'ContactController.store').middleware(['auth', 'roles:admin'])

  Route.group(() => {
    Route.get('/', 'ContactController.index')
    Route.get('/suggest', 'ContactController.suggest')
    Route.get('/search', 'ContactController.search')
    Route.get('/:rawContact', 'ContactController.show')
    Route.delete('/:id', 'ContactController.delete')
    Route.patch('/:id/status', 'ContactController.updateStatus')
  }).prefix('/inquiries')
})
// .middleware(['auth', 'roles:admin'])
