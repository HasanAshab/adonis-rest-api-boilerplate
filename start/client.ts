import client from '#ioc/client'

client.addPaths({
  'verify': '/email/verify/:id/:token',
  'password.reset': '/password/reset/:id/:token',
})



import User from '#models/user'
import Contact from '#models/contact'
import db from '@adonisjs/lucid/services/db'
import NotificationService from '#services/notification_service'
import OptInNotification from '#notifications/opt_in_notification'

/*
  log(
    await Contact.query().search('yoo')
)
*/



/*
import { testValidator } from '#validators/v1/auth/register_validator'


const schema = {
  type: 'object',
  properties: {}
}

const proxy = new Proxy({}, {
  get(target, prop, receiver) {
    schema.properties[prop] = { required: false }
  }
})

try {
await testValidator.validate(proxy)
} catch{}

try {
  await testValidator.validate({email: {}})
}
catch(e) {
  log(e)
  e.messages.forEach(message => {
    schema.properties[message.field].required = true
  })
}

log(schema)
*/