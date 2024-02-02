import Client from '@ioc:Adonis/Addons/Client'

Client.addPaths({
  'verify.success': '/email/verify/success',
  'password.reset': '/password/reset/:id/:token',
  'auth.social.success': '/login/social/:provider/success/:token',
  'auth.social.finalStep': '/login/social/:provider/final-step/:externalId}/:token?fields=:fields',
})
