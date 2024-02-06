import Client from '@ioc:Adonis/Addons/Client'

Client.addPaths({
  'verify.success': '/email/verify/success',
  'password.reset': '/password/reset/:id/:token',
  'auth.social.success': '/login/social/:provider/success/:token',
  'auth.social.finalStep': '/login/social/:provider/final-step/:externalId}/:token?fields=:fields',
})

//TODO
import JsonResource from '../res_dev/json_resource' 
import ResourceCollection from '../res_dev/resource_collection' 
globalThis.JsonResource = JsonResource
globalThis.ResourceCollection = ResourceCollection
globalThis.log = console.log




import User from 'App/Models/User'
import NotificationFactory from 'Database/factories/NotificationFactory'

import Contact from 'App/Models/Contact'
import DB from '@ioc:Adonis/Lucid/Database' 

const dummyData = [
  { subject: "Meeting Request", message: "Hello, let's schedule a meeting to discuss the upcoming project." },
  { subject: "Important Update", message: "Please be informed that there is an important update regarding our services." },
  { subject: "Interview Confirmation", message: "This is to confirm your interview scheduled for next week. Be prepared!" },
  { subject: "Product Inquiry", message: "I'm interested in learning more about your latest product. Can you provide details?" },
  { subject: "Project Collaboration", message: "I believe our companies can collaborate on an exciting project. Let's explore the possibilities." },
  { subject: "Feedback Request", message: "We value your opinion. Please share your feedback about our recent services." },
  { subject: "Urgent Matter", message: "An urgent matter requires your attention. Please get back to us at your earliest convenience." },
  { subject: "Networking Opportunity", message: "Join us for a networking event next month. It's a great opportunity to connect with industry professionals." },
  { subject: "Payment Reminder", message: "Friendly reminder: your payment is due by the end of the week. Please ensure timely payment." },
  { subject: "Thank You Note", message: "Thank you for your collaboration. We appreciate your contributions to the project." }
];

//Contact.query().delete().then(log)

(async () => {
  
//MQ.3saV0THmVNcn0cQMa_QGj4SWJaD9N_03CXJmKZuo750Akw61Rml0UyTglzis
  //const user = await User.factory().create()
  
  //log(await user.createToken())
  
  //await NotificationFactory.new().count(6).belongsTo(user).create()
  //await NotificationFactory.new().count(3).belongsTo(user).betweenLastYear().create()
  //dummyData.forEach(d => Contact.factory().create(d).then(log) )

//const c =  await Contact.search('project')

//const c =  await Contact.query().where('search_vector', '@@', DB.raw("to_tsquery('project')")).select('subject', 'message').pojo()
//log(c)
})()