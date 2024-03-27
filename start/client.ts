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

/*
  log(
    await Contact.query().search('yoo')
)
*/
