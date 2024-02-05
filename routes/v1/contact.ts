import Route from '@ioc:Adonis/Core/Route'

// Endpoints for contact
Route.post('/', 'ContactController.store')

Route.group(() => {
  Route.get('/', 'ContactController.index')
  Route.get('/suggest', 'ContactController.suggest')
  Route.get('/search', 'ContactController.search')
  Route.get('/:id', 'ContactController.show')
  Route.delete('/:id', 'ContactController.delete')
  Route.patch('/:id/status', 'ContactController.updateStatus')
})
.prefix('/inquiries')
.middleware(['auth', 'roles:admin'])
