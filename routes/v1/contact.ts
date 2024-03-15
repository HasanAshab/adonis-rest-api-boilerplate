import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ContactsController = () => import("#controllers/v1/contacts_controller")

// Endpoints for contact
export default function contactRoutes() {
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
      .use([
        middleware.auth(),
        middleware.roles('admin')
      ])
  }).as('contact')
}