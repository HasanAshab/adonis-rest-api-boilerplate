import emitter from '@adonisjs/core/services/emitter'
import Registered from '#events/registered'

emitter.listen(Registered, [
  () => import('#listeners/send_email_verification_mail'),
  () => import('#listeners/send_new_user_joined_notification_to_admins')
])