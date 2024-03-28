import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ContactsController = () => import('#controllers/v1/contacts_controller')

// Endpoints for contact
export default function contactRoutes() {
  router.group(() => {
    router.post('/', [ContactsController, 'store'])

    router
      .group(() => {
        router.get('/', [ContactsController, 'index'])
        router.get('/autocomplete-search', [ContactsController, 'autocompleteSearch'])
        router.get('/:id', [ContactsController, 'show']).as('v1.contact.show')
        router
          .patch('/:id/status', [ContactsController, 'updateStatus'])
          .as('v1.contact.update.status')
        router.delete('/:id', [ContactsController, 'delete']).as('v1.contact.delete')
      })
      .prefix('/inquiries')
      .use([middleware.auth(), middleware.roles('admin')])
  })
}
