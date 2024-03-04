import client from '#ioc/client'

client.addPaths({
  'verify': '/email/verify/:id/:token',
  'password.reset': '/password/reset/:id/:token',
})

//TODO
import JsonResource from '../res_dev/json_resource.js'
import ResourceCollection from '../res_dev/resource_collection.js'
globalThis.JsonResource = JsonResource
globalThis.ResourceCollection = ResourceCollection



import User from '#models/user'
import Contact from '#models/contact'
import db from '@adonisjs/lucid/services/db'
import NotificationService from '#services/notification_service'
import OptInNotification from '#notifications/opt_in_notification'


(async () => {
  const user = await User.firstOrFail()
  
  log(
    await user.createToken('foo', { device_id: 32 })
    )
})

async () => {
 //MQ.evW90TaKoojN4E-bunByOW8D6rTIuRh68qaJ7rlG3uJVDUIDTCQBYKAAPkN4
  const user = await User.factory().create()
    //const user = await User.firstOrFail()


await user.initNotificationPreference()
  await user.disableNotification(1, 'email')
  
  
  log(
//  await user.related('notificationPreferences').query().pojo()
  )
  return;
return log((await user.createToken()).token)
  await user.syncNotificationPreference({
    [1]: {
      email: true,
      app: true
    }
  })
  

    await user.syncNotificationPreference()
    
  const notif = new OptInNotification()
  notif.notificationType = 'announcement'
  log(await notif.via(user))
  
//log((await user.createToken()).token)
//MQ.Kf6_q3-Ea4MkmqQxbNo7xCpqg3NFIRw8dA88vSdr8Fu0OkmHSEHnpAvXtOa0
  //const c =  await Contact.search('project')

  //const c =  await Contact.query().where('search_vector', '@@', DB.raw("to_tsquery('project')")).select('subject', 'message').pojo()
  //log(c)
}


