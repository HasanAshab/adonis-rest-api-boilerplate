import router from '@adonisjs/core/services/router'

const ContactsController = () => import("#app/http/controllers/v1/contacts_controller")

// Endpoints for contact
router.group(() => {
  router.post('/', [ContactsController, 'store'])

  router.group(() => {
    router.get('/', [ContactsController, 'index'])
    router.get('/suggest', [ContactsController, 'suggest'])
    router.get('/search', [ContactsController, 'search'])
    router.get('/:id', [ContactsController, 'show']).as('show')
    router.patch('/:id/status', [ContactsController, 'updateStatus']).as('update.status')
    router.delete('/:id', [ContactsController, 'delete']).as('delete')
  })
    .prefix('/inquiries')
    .middleware(['auth', 'roles:admin'])
}).as('contact')
